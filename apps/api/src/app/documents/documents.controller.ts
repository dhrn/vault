import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { DocumentsService } from './documents.service';
import { DocumentResponseDto, DocumentListResponseDto } from './dto/document-response.dto';
import { PaginationQueryDto, PaginatedResponseDto } from './dto/pagination.dto';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
        ],
      })
    )
    file: Express.Multer.File
  ): Promise<DocumentResponseDto> {
    const allowedMimeTypes = [
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error(`File type ${file.mimetype} not supported`);
    }

    return this.documentsService.uploadDocument(file);
  }

  @Get()
  async getAllDocuments(
    @Query() paginationQuery: PaginationQueryDto
  ): Promise<PaginatedResponseDto<DocumentListResponseDto>> {
    return this.documentsService.getAllDocuments(paginationQuery);
  }

  @Get(':id')
  async getDocumentById(@Param('id') id: string): Promise<DocumentResponseDto> {
    return this.documentsService.getDocumentById(id);
  }

  @Delete(':id')
  async deleteDocument(@Param('id') id: string): Promise<{ message: string }> {
    await this.documentsService.deleteDocument(id);
    return { message: 'Document deleted successfully' };
  }

  @Get(':id/download')
  async downloadDocument(@Param('id') id: string, @Res({ passthrough: true }) res: Response): Promise<StreamableFile> {
    const { buffer, filename, mimeType } = await this.documentsService.downloadDocument(id);

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    return new StreamableFile(buffer);
  }
}
