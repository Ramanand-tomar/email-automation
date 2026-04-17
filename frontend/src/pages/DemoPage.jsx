import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import DemoLayout from '../components/layout/DemoLayout';
import EmailList from '../components/email/EmailList';
import EmailDetail from '../components/email/EmailDetail';
import ComposeModal from '../components/email/ComposeModal';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { useEmailList } from '../hooks/useEmails';
import Spinner from '../components/ui/Spinner';

// MongoDB returns `messageId`, Gmail API fallback returns `id`
const getEmailId = (email) => email?.messageId || email?.id;

export default function DemoPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isComposing, setIsComposing] = useState(false);
  const [page, setPage] = useState(1);

  const { data } = useEmailList(activeFolder, page);
  const emails = data?.emails || [];

  const currentIndex = emails.findIndex(e => getEmailId(e) === getEmailId(selectedEmail));
  const prevEmail = currentIndex > 0 ? emails[currentIndex - 1] : null;
  const nextEmail = currentIndex >= 0 && currentIndex < emails.length - 1 ? emails[currentIndex + 1] : null;

  useSocket();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
        <div className="text-center text-white">
          <Spinner size="lg" className="mx-auto mb-4 border-white/30 border-t-white" />
          <p className="font-medium">Loading your inbox...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleFolderChange = (folder) => {
    setActiveFolder(folder);
    setSelectedEmail(null);
    setPage(1);
  };

  return (
    <>
      <DemoLayout
        activeFolder={activeFolder}
        onFolderChange={handleFolderChange}
        onCompose={() => setIsComposing(true)}
        hasSelectedEmail={!!selectedEmail}
        onBack={() => setSelectedEmail(null)}
        emailList={
          <EmailList
            folder={activeFolder}
            selectedEmailId={getEmailId(selectedEmail)}
            onSelectEmail={setSelectedEmail}
          />
        }
        emailDetail={
          <EmailDetail
            emailId={getEmailId(selectedEmail)}
            onPrevEmail={prevEmail ? () => setSelectedEmail(prevEmail) : null}
            onNextEmail={nextEmail ? () => setSelectedEmail(nextEmail) : null}
          />
        }
      />

      <ComposeModal
        isOpen={isComposing}
        onClose={() => setIsComposing(false)}
      />
    </>
  );
}
