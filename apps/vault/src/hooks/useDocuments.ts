import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, PaginationParams } from '../lib/api';

// Query keys
export const documentKeys = {
  all: ['documents'] as const,
  lists: () => [...documentKeys.all, 'list'] as const,
  list: (params?: PaginationParams) => [...documentKeys.lists(), params] as const,
  details: () => [...documentKeys.all, 'detail'] as const,
  detail: (id: string) => [...documentKeys.details(), id] as const,
};

// Hook to fetch all documents
export function useDocuments(params?: PaginationParams) {
  return useQuery({
    queryKey: documentKeys.list(params),
    queryFn: () => apiService.getAllDocuments(params),
    refetchInterval: 5000, // Refetch every 5 seconds to check processing status
  });
}

// Hook to fetch a single document
export function useDocument(id: string | null) {
  return useQuery({
    queryKey: documentKeys.detail(id || ''),
    queryFn: () => apiService.getDocumentById(id!),
    enabled: !!id, // Only run query if id is provided
    refetchInterval: (data) => {
      // Refetch every 3 seconds if document is processing
      const isProcessing = data?.content?.status === 'PENDING' || data?.content?.status === 'PROCESSING';
      return isProcessing ? 3000 : false;
    },
  });
}

// Hook to upload document
export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => apiService.uploadDocument(file),
    onSuccess: () => {
      // Invalidate and refetch all documents lists (all pagination states)
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
    },
  });
}

// Hook to delete document
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiService.deleteDocument(id),
    onSuccess: () => {
      // Invalidate and refetch all documents lists (all pagination states)
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
    },
  });
}
