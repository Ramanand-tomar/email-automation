const { google } = require('googleapis');
const { getAuthenticatedClient } = require('./googleAuthService');
const User = require('../models/User');
const Email = require('../models/Email');

/**
 * Helper to get Gmail instance
 */
const getGmailClient = async (googleId) => {
    const auth = await getAuthenticatedClient(googleId);
    return google.gmail({ version: 'v1', auth });
};

/**
 * Fetch list of emails from database
 */
const getEmails = async (googleId, folder = 'inbox', maxResults = 25, page = 1) => {
    try {
        console.log(`[Diagnostic] Fetching emails for googleId: ${googleId}, folder: ${folder}, page: ${page}`);
        const skip = (page - 1) * maxResults;
        
        // Build query
        const query = { googleId };
        
        // Folder/Label filtering
        if (folder.toLowerCase() !== 'all') {
            query.folder = folder.toLowerCase();
        }

        const emails = await Email.find(query)
            .sort({ date: -1 })
            .skip(skip)
            .limit(maxResults);

        const totalCount = await Email.countDocuments(query);
        console.log(`[Diagnostic] Found ${emails.length} emails in DB for query, total count: ${totalCount}`);

        if (totalCount === 0 && folder === 'inbox' && page === 1) {
            console.log(`[Diagnostic] No emails in DB for ${googleId}, triggering emergency sync...`);
            // Trigger in background
            syncUserEmails(googleId).catch(err => console.error('[Diagnostic] Emergency sync failed:', err));
        }

        return {
            emails,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / maxResults),
                totalEmails: totalCount,
                hasNextPage: skip + emails.length < totalCount
            }
        };

    } catch (error) {
        console.error('Error fetching emails from DB:', error);
        throw error;
    }
};

/**
 * Fetch a single email by ID (DB first, then Gmail API fallback)
 */
const getEmailById = async (googleId, messageId) => {
    try {
        // Try DB first
        let email = await Email.findOne({ messageId });
        
        if (email) {
            return email;
        }

        // Fallback to Gmail API
        console.log(`Email ${messageId} not found in DB, fetching from Gmail API`);
        const gmail = await getGmailClient(googleId);

        const msgDetails = await gmail.users.messages.get({
            userId: 'me',
            id: messageId,
            format: 'full'
        });

        const parsedEmail = parseEmailDetails(msgDetails.data);
        
        // Save to DB for future requests
        await saveEmailsToDb(googleId, [parsedEmail]);
        
        return { ...parsedEmail, googleId };
    } catch (error) {
        console.error(`Error fetching email ${messageId}:`, error);
        throw error;
    }
};

/**
 * Fetch a full conversation thread by its ID (DB first)
 */
const getThreadById = async (googleId, threadId) => {
    try {
        // Try fetching all messages in thread from DB
        let emails = await Email.find({ threadId }).sort({ date: 1 });

        if (emails.length === 0) {
            // Fallback to Gmail API
            console.log(`Thread ${threadId} not found in DB, fetching from Gmail API`);
            const gmail = await getGmailClient(googleId);

            const threadDetails = await gmail.users.threads.get({
                userId: 'me',
                id: threadId,
                format: 'full'
            });

            const messages = threadDetails.data.messages || [];
            const parsedMessages = messages.map(msg => parseEmailDetails(msg));
            
            // Save all messages in thread to DB
            await saveEmailsToDb(googleId, parsedMessages);
            emails = parsedMessages.map(m => ({ ...m, googleId }));
        }

        // Return structured thread data
        const lastMessage = emails[emails.length - 1];

        return {
            ...lastMessage,
            messages: emails
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

        // After sending, fetch the full details and save to DB
        try {
            const sentMsgId = response.data.id;
            const fullSentMsg = await getEmailById(googleId, sentMsgId);
            await saveEmailsToDb(googleId, [fullSentMsg]);
        } catch (saveErr) {
            console.error('Failed to save sent email to DB:', saveErr);
        }

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

        // Update local DB to stay in sync
        const update = {};
        if (action === 'mark_read') update.isRead = true;
        if (action === 'mark_unread') update.isRead = false;
        if (action === 'archive') update.folder = 'archive';
        if (action === 'trash') update.folder = 'trash';
        
        // Also update the full labels list if needed
        await Email.updateOne({ messageId }, { $set: update });

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

        // Update local DB
        await Email.updateOne({ messageId }, { $set: { folder: 'trash' } });

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
const replyToEmail = async (googleId, id, { body, to, cc, bcc, subject } = {}) => {
    try {
        // Fetch original to get Message-ID and threadId
        // First try to find as messageId
        let original = await Email.findOne({ messageId: id });
        
        // If not found, try to find the latest message in the thread if id is a threadId
        if (!original) {
            original = await Email.findOne({ threadId: id }).sort({ date: -1 });
        }

        if (!original) {
            // If still not in DB, try fetching from Gmail directly as messageId
            try {
                original = await getEmailById(googleId, id);
            } catch (err) {
                // If that fails too, maybe it's a threadId but not in our DB yet
                const thread = await getThreadById(googleId, id);
                if (thread && thread.messages && thread.messages.length > 0) {
                    original = thread.messages[thread.messages.length - 1];
                }
            }
        }

        if (!original) throw new Error('Original email or thread not found');

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
        folder: (() => {
            const prioritized = ['INBOX', 'SENT', 'DRAFT', 'TRASH', 'SPAM'];
            const found = data.labelIds.find(l => prioritized.includes(l));
            if (found) return found.toLowerCase();
            return data.labelIds.find(l => !['UNREAD', 'STARRED', 'IMPORTANT', 'CATEGORY_PERSONAL'].includes(l))?.toLowerCase() || 'inbox';
        })(),
        isRead: !data.labelIds.includes('UNREAD'),
        isStarred: data.labelIds.includes('STARRED'),
        sender: {
            name: senderName || senderEmail,
            email: senderEmail
        },
        to,
        receiver: to, // Added receiver field
        cc,
        bcc,
        messageIdHeader,
        replyTo,
        subject,
        snippet: data.snippet,
        date: new Date(date).toISOString(),
        googleId: '', // Placeholder, will be set during saving
        body,
        attachments,
        labels: data.labelIds,
        tags: data.labelIds.filter(l => ['CATEGORY_UPDATES', 'CATEGORY_PROMOTIONS', 'CATEGORY_SOCIAL', 'IMPORTANT'].includes(l))
    };
};

/**
 * Helper to save a list of emails to the database
 * @param {string} googleId 
 * @param {Array} emails 
 */
const saveEmailsToDb = async (googleId, emails) => {
    if (!emails || emails.length === 0) return;

    const operations = emails.map(email => ({
        updateOne: {
            filter: { messageId: email.id },
            update: {
                $set: {
                    ...email,
                    messageId: email.id,
                    googleId,
                    date: new Date(email.date)
                }
            },
            upsert: true
        }
    }));

    try {
        console.log(`[Diagnostic] Attempting to bulk save ${emails.length} emails to DB: [${emails.map(e => e.id).join(', ')}]`);
        await Email.bulkWrite(operations);
        console.log(`Successfully saved/updated ${emails.length} emails for user ${googleId}`);
    } catch (error) {
        console.error(`Error saving emails to database for user ${googleId}:`, error);
    }
};

/**
 * Start watching the user's inbox for changes using Google Pub/Sub
 */
const watchInbox = async (googleId) => {
    try {
        const gmail = await getGmailClient(googleId);
        const user = await User.findOne({ googleId });

        console.log(`Starting watch for user ${user.email} on topic ${process.env.GOOGLE_PUBSUB_TOPIC}`);
        const response = await gmail.users.watch({
            userId: 'me',
            requestBody: {
                topicName: process.env.GOOGLE_PUBSUB_TOPIC
            }
        });
        console.log(`Watch successful for ${user.email}:`, response.data);

        const { historyId, expiration } = response.data;

        // Save historyId to start syncing from here next time
        user.lastHistoryId = historyId;
        user.watchExpiration = new Date(parseInt(expiration));
        await user.save();

        return response.data;
    } catch (error) {
        console.error('Error starting Gmail watch:', error);
        throw error;
    }
};

/**
 * Fetch incremental changes using history.list API
 */
const syncUserEmails = async (googleId) => {
    try {
        console.log(`[Diagnostic] Starting sync for googleId: ${googleId}`);
        const gmail = await getGmailClient(googleId);
        const user = await User.findOne({ googleId });

        const emailCount = await Email.countDocuments({ googleId });
        if (emailCount === 0 || !user.lastHistoryId) {
            console.log(`[Diagnostic] Database empty or no historyId for user ${user.email}, performing initial fetch with filters`);
            
            // Construct query based on syncPeriod and inboxCategories
            let query = [];
            
            // Sync Period filter
            if (user.syncPeriod && user.syncPeriod !== 'everything') {
                const days = parseInt(user.syncPeriod);
                if (!isNaN(days)) {
                    const date = new Date();
                    date.setDate(date.getDate() - days);
                    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '/');
                    query.push(`after:${dateStr}`);
                }
            }
            
            // Inbox Categories filter
            if (user.inboxCategories && user.inboxCategories.length > 0) {
                const categoryQuery = user.inboxCategories.map(cat => {
                    const mappedCat = cat.toLowerCase() === 'primary' ? 'personal' : cat.toLowerCase();
                    return `category:${mappedCat}`;
                }).join(' OR ');
                query.push(`(${categoryQuery})`);
            }
            
            const q = query.join(' ');
            console.log(`[Diagnostic] Syncing with query: "${q}"`);

            const initialList = await gmail.users.messages.list({
                userId: 'me',
                q: q || undefined,
                maxResults: 100 // Fetch a decent amount for initial sync
            });

            const initialMessages = initialList.data.messages || [];
            console.log(`[Diagnostic] Gmail API returned ${initialMessages.length} messages for initial sync`);
            const newEmails = await Promise.all(
                initialMessages.map(msg => getEmailById(googleId, msg.id).catch(() => null))
            );
            
            const validEmails = newEmails.filter(e => e !== null);
            await saveEmailsToDb(googleId, validEmails);

            // Get current historyId for subsequent incremental syncs
            const profile = await gmail.users.getProfile({ userId: 'me' });
            user.lastHistoryId = profile.data.historyId;
            await user.save();
            
            return { newEmails: validEmails };
        }

        let response;
        try {
            response = await gmail.users.history.list({
                userId: 'me',
                startHistoryId: user.lastHistoryId,
                historyTypes: ['messageAdded', 'labelAdded', 'labelRemoved']
            });
        } catch (error) {
            if (error.code === 404 || error.code === 410) {
                console.log(`History ID expired for ${user.email}, performing fallback sync`);
                // History ID too old, get current historyId and just fetch recent messages
                const profile = await gmail.users.getProfile({ userId: 'me' });
                const currentHistoryId = profile.data.historyId;

                // Fetch recent messages as a fallback
                const recent = await gmail.users.messages.list({
                    userId: 'me',
                    maxResults: 10
                });

                const messageIds = (recent.data.messages || []).map(m => m.id);
                const newEmails = await Promise.all(
                    messageIds.map(id => getEmailById(googleId, id).catch(() => null))
                );

                user.lastHistoryId = currentHistoryId;
                await user.save();

                return {
                    newEmails: newEmails.filter(e => e !== null),
                    fallback: true
                };
            }
            throw error;
        }

        const history = response.data.history || [];
        const newHistoryId = response.data.historyId;

        // Collect all message IDs that were added
        const messageIds = [];
        history.forEach(record => {
            if (record.messagesAdded) {
                record.messagesAdded.forEach(ma => messageIds.push(ma.message.id));
            }
        });

        // Fetch full details for new messages
        const newEmails = await Promise.all(
            [...new Set(messageIds)].map(id => getEmailById(googleId, id).catch(() => null))
        );

        const validEmails = newEmails.filter(e => e !== null);
        
        // Apply category filter during background sync if categories are set
        let filteredEmails = validEmails;
        if (user.inboxCategories && user.inboxCategories.length > 0) {
            const allowedLabels = user.inboxCategories.map(cat => {
                const mappedCat = (cat.toLowerCase() === 'primary' ? 'personal' : cat.toLowerCase()).toUpperCase();
                return `CATEGORY_${mappedCat}`;
            });
            
            filteredEmails = validEmails.filter(email => 
                email.labels.some(label => allowedLabels.includes(label)) ||
                email.labels.includes('INBOX') ||
                email.labels.includes('SENT') ||
                email.labels.includes('DRAFT')
            );
        }

        // Save to database
        await saveEmailsToDb(googleId, filteredEmails);

        // Update user's historyId for next sync
        if (newHistoryId) {
            user.lastHistoryId = newHistoryId;
            await user.save();
        }

        return {
            newEmails: filteredEmails,
            history
        };
    } catch (error) {
        console.error('Error syncing emails via history:', error);
        throw error;
    }
};

module.exports = {
    getEmails,
    getEmailById,
    getThreadById,
    sendEmail,
    modifyEmail,
    deleteEmail,
    replyToEmail,
    watchInbox,
    syncUserEmails
};
