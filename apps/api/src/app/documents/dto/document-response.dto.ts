export class DocumentResponseDto {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
  content?: {
    summary: string | null;
    markdown: string | null;
    status: string;
    processedAt: Date | null;
    errorMessage: string | null;
  };
}

export class DocumentListResponseDto {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
  processingStatus: string;
}
