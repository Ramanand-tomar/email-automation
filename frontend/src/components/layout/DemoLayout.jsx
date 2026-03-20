import Sidebar from './Sidebar';
import DemoHeader from './DemoHeader';

export default function DemoLayout({
  activeFolder,
  onFolderChange,
  onCompose,
  emailList,
  emailDetail,
}) {
  return (
    <div className="h-screen flex overflow-hidden bg-stone-100">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 hidden md:block">
        <Sidebar
          activeFolder={activeFolder}
          onFolderChange={onFolderChange}
          onCompose={onCompose}
        />
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        <DemoHeader activeFolder={activeFolder} />

        <div className="flex-1 flex overflow-hidden">
          {/* Email list panel */}
          <div className="w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
            {emailList}
          </div>

          {/* Email detail panel */}
          <div className="hidden md:flex flex-1 flex-col bg-white overflow-y-auto">
            {emailDetail}
          </div>
        </div>
      </div>
    </div>
  );
}
