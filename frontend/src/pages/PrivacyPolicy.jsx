import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-hero-gradient flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-bold text-lg text-gray-900">BeyondChats</span>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: March 20, 2026</p>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-10 space-y-8 text-gray-600 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. About BeyondChats</h2>
            <p>
              BeyondChats is an email automation application that connects to your Gmail account to help you
              manage your inbox more efficiently. It provides features like real-time email syncing, AI-powered
              reply drafts, multi-folder management, and instant notifications.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
            <p className="mb-3">When you use BeyondChats, we access the following information through your Google account:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Email metadata:</strong> Sender name, email address, subject lines, timestamps, and labels.</li>
              <li><strong>Email content:</strong> The body of your emails, used to display them in the app and to generate AI reply suggestions.</li>
              <li><strong>Google profile information:</strong> Your name, email address, and profile picture, used to identify your account within the app.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Email display and management:</strong> We fetch and display your emails so you can read, reply to, archive, and manage them from within BeyondChats.</li>
              <li><strong>AI reply generation:</strong> When you request an AI-generated reply, the email content is sent to Google Gemini AI to draft a response. This happens only when you explicitly click "Generate Reply".</li>
              <li><strong>Real-time sync:</strong> We use Google Pub/Sub to receive notifications when new emails arrive, so your inbox stays up to date without manual refreshing.</li>
              <li><strong>Authentication:</strong> We use Google OAuth 2.0 to securely authenticate your identity. We never see or store your Google password.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Google API Services Usage Disclosure</h2>
            <p>
              BeyondChats' use and transfer of information received from Google APIs adheres to the{' '}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 hover:text-brand-700 underline"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Data Storage and Security</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your OAuth access tokens are stored securely on our server and are used only to communicate with Gmail on your behalf.</li>
              <li>Email data is cached temporarily to provide a fast user experience and is not shared with any third parties beyond the AI reply generation service (Google Gemini).</li>
              <li>We use HTTPS encryption for all data in transit between your browser, our servers, and Google's APIs.</li>
              <li>We do not sell, rent, or trade your personal information to any third party.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Google OAuth Scopes</h2>
            <p className="mb-3">BeyondChats requests the following Google OAuth permissions:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>gmail.readonly:</strong> To read and display your emails.</li>
              <li><strong>gmail.send:</strong> To send emails and replies on your behalf when you click "Send".</li>
              <li><strong>gmail.modify:</strong> To mark emails as read, archive, or move them to trash.</li>
              <li><strong>userinfo.profile:</strong> To display your name and profile picture in the app.</li>
              <li><strong>userinfo.email:</strong> To identify your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Data Retention and Deletion</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You can disconnect your Google account at any time by revoking access through your{' '}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-600 hover:text-brand-700 underline"
                >
                  Google Account permissions
                </a>.
              </li>
              <li>Upon disconnection, we delete your stored tokens and cached email data from our servers.</li>
              <li>We do not retain your email content after you stop using the service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Third-Party Services</h2>
            <p>BeyondChats uses the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong>Google Gmail API:</strong> For reading, sending, and managing your emails.</li>
              <li><strong>Google Pub/Sub:</strong> For real-time email notifications.</li>
              <li><strong>Google Gemini AI:</strong> For generating AI reply suggestions (only when you explicitly request it).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Children's Privacy</h2>
            <p>
              BeyondChats is not intended for use by children under the age of 13. We do not knowingly
              collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. Any changes will be reflected on this page
              with an updated "Last updated" date. We encourage you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Contact Us</h2>
            <p>
              If you have any questions or concerns about this privacy policy or how your data is handled,
              please contact us at{' '}
              <a href="mailto:support@beyondchats.com" className="text-brand-600 hover:text-brand-700 underline">
                support@beyondchats.com
              </a>.
            </p>
          </section>

        </div>

        <div className="mt-8 text-center">
          <Link to="/" className="text-brand-600 hover:text-brand-700 text-sm font-medium">
            &larr; Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
