import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onOpenFileDialog: () => void;
  isUploading: boolean;
}

export function FileUpload({ onOpenFileDialog, isUploading }: FileUploadProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={onOpenFileDialog}
        disabled={isUploading}
        variant="default"
        size="default"
      >
        <Plus className="h-4 w-4 mr-2" />
        {isUploading ? 'Uploading...' : 'New'}
      </Button>
    </div>
  );
}
