import { useState } from 'react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { X, Download, Trash2, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  CardContent,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { apiService } from '../lib/api';
import { useDocument, useDeleteDocument } from '../hooks/useDocuments';
import { formatFileSize } from '@/lib/ui.utils';

interface DocumentDetailProps {
  documentId: string | null;
  onClose: () => void;
  onDelete: () => void;
}

export function DocumentDetail({ documentId, onClose, onDelete }: DocumentDetailProps) {
  const { data: document, isLoading } = useDocument(documentId);
  const deleteDocument = useDeleteDocument();
  const [activeTab, setActiveTab] = useState<'summary' | 'markdown'>('summary');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    if (!documentId) return;

    try {
      await deleteDocument.mutateAsync(documentId);
      toast.success('Document deleted', {
        description: document?.originalName,
      });
      setDeleteDialogOpen(false);
      onDelete();
      onClose();
    } catch (err: any) {
      toast.error('Delete failed', {
        description: err.response?.data?.message || 'Failed to delete document',
      });
    }
  };

  const handleDownload = () => {
    if (!documentId) return;
    window.open(apiService.getDownloadUrl(documentId), '_blank');
    toast.success('Download started', {
      description: document?.originalName,
    });
  };

  const isProcessing =
    document?.content?.status === 'PENDING' || document?.content?.status === 'PROCESSING';

  return (
    <>
      <Sheet open={!!documentId} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="right" className="w-[70vw] sm:max-w-none p-0 overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col h-full p-6 gap-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-40 w-full mt-4" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : document ? (
            <div className="flex flex-col h-full">
              {/* Header */}
              <SheetHeader className="border-b bg-white px-6 py-4 space-y-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <FileText className="h-8 w-8 text-blue-600 mt-1 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <SheetTitle className="text-xl font-semibold text-gray-900 truncate">
                        {document.originalName}
                      </SheetTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2 flex-wrap">
                        <span>{formatFileSize(document.size)}</span>
                        <span className="truncate">{document.mimeType}</span>
                        <span>
                          {new Date(document.uploadedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button onClick={handleDownload} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      onClick={() => setDeleteDialogOpen(true)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                    <Button onClick={onClose} variant="ghost" size="sm">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </SheetHeader>

              {/* Processing status */}
              {isProcessing && (
                <div className="px-6 py-4 border-b bg-blue-50">
                  <Alert>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <AlertDescription>
                      Processing document with AI...
                      <Progress value={66} className="mt-2" />
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {document.content?.status === 'FAILED' && (
                <div className="px-6 py-4 border-b">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Processing failed: {document.content.errorMessage}
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Content tabs */}
              {document.content?.status === 'COMPLETED' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Tabs */}
                  <div className="border-b bg-white px-6">
                    <div className="flex gap-6">
                      <button
                        onClick={() => setActiveTab('summary')}
                        className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === 'summary'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Summary
                      </button>
                      <button
                        onClick={() => setActiveTab('markdown')}
                        className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === 'markdown'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Markdown
                      </button>
                    </div>
                  </div>

                  {/* Tab content */}
                  <div className="flex-1 overflow-auto p-6 bg-muted/20">
                    {activeTab === 'summary' && (
                        <CardContent>
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {document.content.summary || ''}
                            </ReactMarkdown>
                          </div>
                        </CardContent>
                    )}

                    {activeTab === 'markdown' && (
                        <CardContent>
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {document.content.markdown || ''}
                            </ReactMarkdown>
                          </div>
                        </CardContent>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{document?.originalName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteDocument.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteDocument.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteDocument.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
