import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { useUploadDocument } from './useDocuments';

export function useFileDropzone() {
  const uploadDocument = useUploadDocument();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      try {
        const uploadPromises = acceptedFiles.map((file) =>
          uploadDocument.mutateAsync(file)
        );
        await Promise.all(uploadPromises);

        toast.success('Upload complete', {
          description: `Successfully uploaded ${acceptedFiles.length} file${
            acceptedFiles.length > 1 ? 's' : ''
          }`,
        });
      } catch (err: any) {
        toast.error('Upload failed', {
          description: err.response?.data?.message || 'Failed to upload file(s)',
        });
      }
    },
    [uploadDocument]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: uploadDocument.isPending,
    noClick: true,
    noKeyboard: true,
  });

  return {
    getRootProps,
    getInputProps,
    isDragActive,
    openFileDialog: open,
    isUploading: uploadDocument.isPending,
  };
}
