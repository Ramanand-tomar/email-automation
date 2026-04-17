import { useState } from 'react';
import Sidebar from './Sidebar';
import DemoHeader from './DemoHeader';

export default function DemoLayout({
  activeFolder,
  onFolderChange,
  onCompose,
  emailList,
  emailDetail,
  hasSelectedEmail,
  onBack,
}) {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-stone-100">
      {/* Mobile sidebar overlay */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowMobileSidebar(false)}
          />
          <div className="relative w-64 h-full shadow-xl">
            <Sidebar
              activeFolder={activeFolder}
              onFolderChange={(folder) => {
                onFolderChange(folder);
                setShowMobileSidebar(false);
              }}
              onCompose={() => {
                onCompose();
                setShowMobileSidebar(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="w-64 flex-shrink-0 hidden md:block">
        <Sidebar
          activeFolder={activeFolder}
          onFolderChange={onFolderChange}
          onCompose={onCompose}
        />
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        <DemoHeader
          activeFolder={activeFolder}
          onMenuToggle={() => setShowMobileSidebar(true)}
          showBackButton={hasSelectedEmail}
          onBack={onBack}
        />

        <div className="flex-1 flex overflow-hidden">
          {/* Email list panel — hidden on mobile when email is selected */}
          <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto ${hasSelectedEmail ? 'hidden md:block' : ''}`}>
            {emailList}
          </div>

          {/* Email detail panel — shown on mobile only when email is selected */}
          <div className={`flex-1 flex-col bg-white overflow-y-auto ${hasSelectedEmail ? 'flex' : 'hidden md:flex'}`}>
            {emailDetail}
          </div>
        </div>
      </div>
    </div>
  );
}
