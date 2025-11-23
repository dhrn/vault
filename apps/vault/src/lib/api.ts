import axios from 'axios';

const API_BASE_URL = '/api';

export interface Document {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  processingStatus?: string;
  content?: {
    summary: string | null;
    markdown: string | null;
    status: string;
    processedAt: string | null;
    errorMessage: string | null;
  };
}

export interface DocumentListItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  processingStatus: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: 'uploadedAt' | 'originalName' | 'size';
  order?: 'ASC' | 'DESC';
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}


const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

class ApiService {

  async uploadDocument(file: File): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await client.post<Document>('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  async getAllDocuments(params?: PaginationParams): Promise<PaginatedResponse<DocumentListItem>> {
    const response = await client.get<PaginatedResponse<DocumentListItem>>('/documents', {
      params,
    });
    return response.data;
  }

  async getDocumentById(id: string): Promise<Document> {
    const response = await client.get<Document>(`/documents/${id}`);
    return response.data;
  }

  async deleteDocument(id: string): Promise<void> {
    await client.delete(`/documents/${id}`);
  }

  getDownloadUrl(id: string): string {
    return `${API_BASE_URL}/documents/${id}/download`;
  }

}

export const apiService = new ApiService();