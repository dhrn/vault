import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { StorageService } from '../services/storage.service';
import { DocumentProcessorService } from '../services/document-processor.service';
import { AIService } from '../services/ai.service';
import { Document } from '../entities/document.entity';
import { DocumentContent } from '../entities/document-content.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, DocumentContent]),
  ],
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    StorageService,
    DocumentProcessorService,
    AIService,
  ],
})
export class DocumentsModule {}
