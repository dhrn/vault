import { useState } from 'react';
import { toast } from 'sonner';
import { FileText, Download, Trash2, Eye, Folder, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Button } from '@/components/ui/button';
import { apiService, DocumentListItem } from '../lib/api';
import { useDocuments, useDeleteDocument } from '../hooks/useDocuments';
import { formatDate, formatFileSize, getStatusBadge } from '@/lib/ui.utils';

interface DocumentListProps {
  onSelectDocument: (id: string) => void;
}


export function DocumentList({ onSelectDocument }: DocumentListProps) {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { data, isLoading } = useDocuments({ page, limit, sortBy: 'uploadedAt', order: 'DESC' });
  const deleteDocument = useDeleteDocument();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<DocumentListItem | null>(null);

  const documents = data?.data || [];
  const meta = data?.meta;

  const handleDelete = async () => {
    if (!documentToDelete) return;

    try {
      await deleteDocument.mutateAsync(documentToDelete.id);
      toast.success('Document deleted', {
        description: `${documentToDelete.originalName} has been deleted`,
      });
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    } catch (err: any) {
      toast.error('Delete failed', {
        description: err.response?.data?.message || 'Failed to delete document',
      });
    }
  };

  const handleDownload = (doc: DocumentListItem) => {
    window.open(apiService.getDownloadUrl(doc.id), '_blank');
    toast.success('Download started', {
      description: doc.originalName,
    });
  };


  const getFileIcon = (mimeType: string) => {
    if (mimeType === 'application/pdf') {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (mimeType.includes('word')) {
      return <FileText className="h-5 w-5 text-blue-600" />;
    } else {
      return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[40%]">Name</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Last modified</TableHead>
              <TableHead>File size</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-12" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-5 w-20 ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Folder className="h-20 w-20 text-gray-300 mb-4" />
        <h3 className="text-lg font-normal text-gray-600 mb-1">A big empty space. Just for you.</h3>
        <p className="text-sm text-gray-500">Drop files anywhere to upload or use the New button.</p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[40%]">Name</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Last modified</TableHead>
              <TableHead>File size</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <ContextMenu key={doc.id}>
                <ContextMenuTrigger asChild>
                  <TableRow
                    className="cursor-pointer"
                    onClick={() => onSelectDocument(doc.id)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {getFileIcon(doc.mimeType)}
                        <span className="text-sm">{doc.originalName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">me</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(doc.uploadedAt)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatFileSize(doc.size)}
                    </TableCell>
                    <TableCell className="text-right">
                      {getStatusBadge(doc.processingStatus)}
                    </TableCell>
                  </TableRow>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-48">
                  <ContextMenuItem onClick={() => onSelectDocument(doc.id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Open
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => handleDownload(doc)}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    className="text-red-600"
                    onClick={() => {
                      setDocumentToDelete(doc);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </TableBody>
        </Table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} documents
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(1)}
              disabled={!meta.hasPreviousPage}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={!meta.hasPreviousPage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium">
              Page {meta.page} of {meta.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={!meta.hasNextPage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(meta.totalPages)}
              disabled={!meta.hasNextPage}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{documentToDelete?.originalName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteDocument.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteDocument.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteDocument.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
