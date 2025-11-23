import { useState } from 'react';
import { Toaster } from 'sonner';
import { Folder } from 'lucide-react';
import { FileUpload } from '../components/FileUpload';
import { DocumentList } from '../components/DocumentList';
import { DocumentDetail } from '../components/DocumentDetail';
import { DragOverlay } from '../components/DragOverlay';
import { useFileDropzone } from '../hooks/useFileDropzone';


export function App() {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    openFileDialog,
    isUploading,
  } = useFileDropzone();

  return (
      <div className="min-h-screen bg-background" {...getRootProps()}>
        <input {...getInputProps()} />

        {/* Header */}
        <header className="sticky top-0 z-50 border-b bg-white">
          <div className="mx-auto px-6 py-3">
            <div className="flex items-center gap-3">
              <Folder className="h-10 w-10 text-blue-600" />
              <h1 className="text-xl font-normal text-gray-800">
                Document Vault
              </h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto px-6">
          <div className="space-y-6">
            <div className="bg-white p-6">
              <div className="flex items-center justify-between gap-2">
                <span className="text-lg font-medium">My Documents</span>
                <FileUpload
                  onOpenFileDialog={openFileDialog}
                  isUploading={isUploading}
                />
              </div>
            </div>

            <div className="bg-white">
              <DocumentList onSelectDocument={setSelectedDocumentId} />
            </div>
          </div>
        </main>

        {/* Drag Overlay */}
        {isDragActive && <DragOverlay />}

        {/* Document Detail Sheet */}
        <DocumentDetail
          documentId={selectedDocumentId}
          onClose={() => setSelectedDocumentId(null)}
          onDelete={() => setSelectedDocumentId(null)}
        />

        {/* Toast Notifications */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: { background: 'white', border: '1px solid #e5e7eb' },
            className: 'border',
            duration: 3000,
          }}
          richColors
        />
      </div>
  );
}

export default App;
