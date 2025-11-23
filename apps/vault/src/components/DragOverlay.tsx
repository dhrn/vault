import { Upload } from 'lucide-react';

export function DragOverlay() {
  return (
    <div className="fixed inset-0 bg-blue-500 bg-opacity-10 border-4 border-blue-500 border-dashed z-50 flex items-center justify-center pointer-events-none">
      <div className="bg-white p-12 rounded-lg shadow-2xl">
        <div className="flex flex-col items-center gap-4">
          <Upload className="h-16 w-16 text-blue-600" />
          <p className="text-blue-600 text-2xl font-medium">Drop files to upload</p>
          <p className="text-gray-500 text-sm">Supports PDF, TXT, DOC, DOCX (max 10MB)</p>
        </div>
      </div>
    </div>
  );
}
