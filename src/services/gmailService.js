const { google } = require('googleapis');
const { getAuthenticatedClient } = require('./googleAuthService');

/**
 * Helper to get Gmail instance
 */
const getGmailClient = async (googleId) => {
    const auth = await getAuthenticatedClient(googleId);
    return google.gmail({ version: 'v1', auth });
};

/**
 * Fetch list of emails
 */
const getEmails = async (googleId, folder = 'INBOX', maxResults = 25, pageToken = null) => {
    try {
        const gmail = await getGmailClient(googleId);

        // Convert generic folder names to standard Gmail labels
        let labelIds = [folder.toUpperCase()];

        const requestParams = {
            userId: 'me',
            labelIds,
            maxResults
        };

        if (pageToken) {
            requestParams.pageToken = pageToken;
        }

        const response = await gmail.users.messages.list(requestParams);

        const messages = response.data.messages || [];

        // Fetch full details for each message
        const detailedMessages = await Promise.all(messages.map(async (msg) => {
            const msgDetails = await gmail.users.messages.get({
                userId: 'me',
                id: msg.id,
                format: 'full' // Request full email for body parsing
            });

            return parseEmailDetails(msgDetails.data);
        }));

        return {
            emails: detailedMessages,
            nextPageToken: response.data.nextPageToken || null
        };

    } catch (error) {
        console.error('Error fetching emails:', error);
        throw error;
    }
};

/**
 * Fetch a single email by ID with full details
 */
const getEmailById = async (googleId, messageId) => {
    try {
        const gmail = await getGmailClient(googleId);

        const msgDetails = await gmail.users.messages.get({
            userId: 'me',
            id: messageId,
            format: 'full'
        });

        return parseEmailDetails(msgDetails.data);
    } catch (error) {
        console.error(`Error fetching email ${messageId}:`, error);
        throw error;
    }
};

/**
 * Fetch a full conversation thread by its ID
 */
const getThreadById = async (googleId, threadId) => {
    try {
        const gmail = await getGmailClient(googleId);

        const threadDetails = await gmail.users.threads.get({
            userId: 'me',
            id: threadId,
            format: 'full'
        });

        const messages = threadDetails.data.messages || [];
        const parsedMessages = messages.map(msg => parseEmailDetails(msg));

        // Return the latest message's metadata but include all messages
        const lastMessage = parsedMessages[parsedMessages.length - 1];

        return {
            ...lastMessage,
            messages: parsedMessages
        };
    } catch (error) {
        console.error(`Error fetching thread ${threadId}:`, error);
        throw error;
    }
};

/**
 * Send an email
 */
const sendEmail = async (googleId, { to, subject, body, cc, bcc, from, replyToMessageId, threadId } = {}) => {
    try {
        const gmail = await getGmailClient(googleId);

        // Construct standard email headers
        let emailLines = [];

        if (from) {
            emailLines.push(`From: ${from}`);
        }

        emailLines.push(`To: ${to}`);

        if (cc) {
            emailLines.push(`Cc: ${cc}`);
        }

        if (bcc) {
            emailLines.push(`Bcc: ${bcc}`);
        }

        emailLines.push(`Subject: ${subject}`);
        emailLines.push('Content-Type: text/html; charset="UTF-8"');
        emailLines.push('MIME-Version: 1.0');

        if (replyToMessageId) {
            emailLines.push(`In-Reply-To: ${replyToMessageId}`);
            emailLines.push(`References: ${replyToMessageId}`);
        }

        emailLines.push('');
        emailLines.push(body);

        const email = emailLines.join('\r\n');

        // Base64URL encode the email
        const base64EncodedEmail = Buffer.from(email)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        const requestBody = {
            raw: base64EncodedEmail,
        };

        // threadId is separate from In-Reply-To; it groups the message in a Gmail thread
        if (threadId) {
            requestBody.threadId = threadId;
        }

        const response = await gmail.users.messages.send({
            userId: 'me',
            requestBody
        });

        return response.data;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

/**
 * Modify email labels (Archive, Trash, Read/Unread)
 */
const modifyEmail = async (googleId, messageId, action) => {
    try {
        const gmail = await getGmailClient(googleId);

        let addLabelIds = [];
        let removeLabelIds = [];

        switch (action) {
            case 'mark_read':
                removeLabelIds.push('UNREAD');
                break;
            case 'mark_unread':
                addLabelIds.push('UNREAD');
                break;
            case 'archive':
                removeLabelIds.push('INBOX');
                break;
            case 'trash':
                addLabelIds.push('TRASH');
                break;
            default:
                throw new Error('Invalid action');
        }

        const response = await gmail.users.messages.modify({
            userId: 'me',
            id: messageId,
            requestBody: {
                addLabelIds,
                removeLabelIds
            }
        });

        return response.data;
    } catch (error) {
        console.error(`Error modifying email ${messageId}:`, error);
        throw error;
    }
};

/**
 * Delete (trash) an email
 */
const deleteEmail = async (googleId, messageId) => {
    try {
        const gmail = await getGmailClient(googleId);

        const response = await gmail.users.messages.trash({
            userId: 'me',
            id: messageId
        });

        return response.data;
    } catch (error) {
        console.error(`Error deleting email ${messageId}:`, error);
        throw error;
    }
};

/**
 * Specifically reply to a message by its ID.
 * Automatically handles threading and metadata.
 */
const replyToEmail = async (googleId, originalMessageId, { body, to, cc, bcc, subject } = {}) => {
    try {
        // Fetch original to get Message-ID and threadId
        const original = await getEmailById(googleId, originalMessageId);

        if (!original) throw new Error('Original email not found');

        // Prepare reply metadata
        const replyParams = {
            to: to || original.sender.email,
            subject: subject || (original.subject.toLowerCase().startsWith('re:') ? original.subject : `Re: ${original.subject}`),
            body,
            cc,
            bcc,
            replyToMessageId: original.messageIdHeader,
            threadId: original.threadId
        };

        // Reuse sendEmail for the heavy lifting
        return await sendEmail(googleId, replyParams);
    } catch (error) {
        console.error(`Error in replyToEmail service for msg ${originalMessageId}:`, error);
        throw error;
    }
};

/**
 * Internal parsing helper to structure the raw Gmail API format
 */
const parseEmailDetails = (data) => {
    const headers = data.payload.headers;

    const getHeader = (name) => {
        const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
        return header ? header.value : '';
    };

    const subject = getHeader('Subject');
    const from = getHeader('From');
    const to = getHeader('To');
    const cc = getHeader('Cc');
    const bcc = getHeader('Bcc');
    const date = getHeader('Date');
    const messageIdHeader = getHeader('Message-ID') || getHeader('Message-Id');
    const replyTo = getHeader('Reply-To');

    let senderName = '';
    let senderEmail = from;

    if (from.includes('<')) {
        const match = from.match(/(.*)<(.*)>/);
        if (match) {
            senderName = match[1].trim();
            senderEmail = match[2].trim();
        }
    }

    // Recursively find body parts and attachments in nested MIME structures
    let htmlBody = '';
    let plainBody = '';
    const attachments = [];

    const decodeBase64 = (data) => {
        if (!data) return '';
        // Gmail API uses base64url encoding
        const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
        return Buffer.from(base64, 'base64').toString('utf-8');
    };

    const extractParts = (parts) => {
        if (!parts) return;
        for (const part of parts) {
            if (part.parts) {
                // Nested multipart — recurse
                extractParts(part.parts);
            } else if (part.mimeType === 'text/html' && part.body.data) {
                htmlBody = decodeBase64(part.body.data);
            } else if (part.mimeType === 'text/plain' && part.body.data) {
                plainBody = decodeBase64(part.body.data);
            } else if (part.filename && part.filename.length > 0) {
                attachments.push({
                    filename: part.filename,
                    mimeType: part.mimeType,
                    size: part.body.size || 0,
                    attachmentId: part.body.attachmentId || null
                });
            }
        }
    };

    if (data.payload.parts) {
        extractParts(data.payload.parts);
    } else if (data.payload.body && data.payload.body.data) {
        const decoded = decodeBase64(data.payload.body.data);
        if (data.payload.mimeType === 'text/html') {
            htmlBody = decoded;
        } else {
            plainBody = decoded;
        }
    }

    const body = htmlBody || plainBody;

    return {
        id: data.id,
        threadId: data.threadId,
        folder: data.labelIds.find(l => !['UNREAD', 'STARRED', 'IMPORTANT', 'CATEGORY_PERSONAL'].includes(l))?.toLowerCase() || 'inbox',
        isRead: !data.labelIds.includes('UNREAD'),
        isStarred: data.labelIds.includes('STARRED'),
        sender: {
            name: senderName || senderEmail,
            email: senderEmail
        },
        to,
        cc,
        bcc,
        messageIdHeader,
        replyTo,
        subject,
        snippet: data.snippet,
        date: new Date(date).toISOString(),
        body,
        attachments,
        tags: data.labelIds.filter(l => ['CATEGORY_UPDATES', 'CATEGORY_PROMOTIONS', 'CATEGORY_SOCIAL', 'IMPORTANT'].includes(l))
    };
};

module.exports = {
    getEmails,
    getEmailById,
    getThreadById,
    sendEmail,
    modifyEmail,
    deleteEmail,
    replyToEmail
};
