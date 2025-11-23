import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StorageService } from '../services/storage.service';
import { DocumentProcessorService } from '../services/document-processor.service';
import { AIService } from '../services/ai.service';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { DocumentResponseDto, DocumentListResponseDto } from './dto/document-response.dto';
import { PaginationQueryDto, PaginatedResponseDto } from './dto/pagination.dto';
import { Document } from '../entities/document.entity';
import { DocumentContent, ProcessingStatus } from '../entities/document-content.entity';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(DocumentContent)
    private documentContentRepository: Repository<DocumentContent>,
    private storage: StorageService,
    private processor: DocumentProcessorService,
    private aiService: AIService,
  ) {
    console.log(`Documents service initialized with AI provider: ${this.aiService.getProvider()}`);
  }

  async uploadDocument(file: Express.Multer.File): Promise<DocumentResponseDto> {
    const filename = `${uuidv4()}${extname(file.originalname)}`;
    const filePath = await this.storage.saveFile(filename, file.buffer);

    const document = this.documentRepository.create({
      filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      filePath,
    });

    const savedDocument = await this.documentRepository.save(document);

    const content = this.documentContentRepository.create({
      documentId: savedDocument.id,
      status: ProcessingStatus.PENDING,
    });

    await this.documentContentRepository.save(content);

    this.processDocumentAsync(savedDocument.id, filePath, file.mimetype);

    savedDocument.content = content;
    return this.mapToResponseDto(savedDocument);
  }

  private async processDocumentAsync(
    documentId: string,
    filePath: string,
    mimeType: string
  ): Promise<void> {
    try {
      await this.documentContentRepository.update(
        { documentId },
        { status: ProcessingStatus.PROCESSING }
      );

      const text = await this.processor.extractText(filePath, mimeType);

      // Generate summary and markdown using AI service
      const [summary, markdown] = await Promise.all([
        this.aiService.generateSummary(text),
        this.aiService.generateMarkdown(text),
      ]);

      await this.documentContentRepository.update(
        { documentId },
        {
          summary,
          markdown,
          status: ProcessingStatus.COMPLETED,
          processedAt: new Date(),
        }
      );
    } catch (error: any) {
      console.error(`Error processing document ${documentId}:`, error);
      await this.documentContentRepository.update(
        { documentId },
        {
          status: ProcessingStatus.FAILED,
          errorMessage: error.message,
        }
      );
    }
  }

  async getAllDocuments(
    paginationQuery: PaginationQueryDto
  ): Promise<PaginatedResponseDto<DocumentListResponseDto>> {
    const { page = 1, limit = 10, sortBy = 'uploadedAt', order = 'DESC' } = paginationQuery;
    const skip = (page - 1) * limit;

    // Build order object based on sortBy parameter
    const orderObj: any = {};
    orderObj[sortBy] = order;

    const [documents, total] = await this.documentRepository.findAndCount({
      relations: ['content'],
      order: orderObj,
      skip,
      take: limit,
    });

    const data = documents.map((doc) => ({
      id: doc.id,
      filename: doc.filename,
      originalName: doc.originalName,
      mimeType: doc.mimeType,
      size: doc.size,
      uploadedAt: doc.uploadedAt,
      processingStatus: doc.content?.status || ProcessingStatus.PENDING,
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async getDocumentById(id: string): Promise<DocumentResponseDto> {
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['content'],
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    return this.mapToResponseDto(document);
  }

  async deleteDocument(id: string): Promise<void> {
    const document = await this.documentRepository.findOne({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    await this.storage.deleteFile(document.filename);
    await this.documentRepository.delete({ id });
  }

  async downloadDocument(id: string): Promise<{ buffer: Buffer; filename: string; mimeType: string }> {
    const document = await this.documentRepository.findOne({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    const buffer = await this.storage.getFile(document.filename);
    return {
      buffer,
      filename: document.originalName,
      mimeType: document.mimeType,
    };
  }

  private mapToResponseDto(document: Document): DocumentResponseDto {
    return {
      id: document.id,
      filename: document.filename,
      originalName: document.originalName,
      mimeType: document.mimeType,
      size: document.size,
      uploadedAt: document.uploadedAt,
      content: document.content
        ? {
            summary: document.content.summary,
            markdown: document.content.markdown,
            status: document.content.status,
            processedAt: document.content.processedAt,
            errorMessage: document.content.errorMessage,
          }
        : undefined,
    };
  }
}
