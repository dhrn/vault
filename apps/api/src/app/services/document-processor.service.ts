import { Injectable } from '@nestjs/common';
import {PDFParse} from 'pdf-parse';
import * as mammoth from 'mammoth';
import { promises as fs } from 'fs';

@Injectable()
export class DocumentProcessorService {
  async extractText(filePath: string, mimeType: string): Promise<string> {
    const buffer = await fs.readFile(filePath);

    try {
      if (mimeType === 'application/pdf') {
        return await this.extractFromPdf(buffer);
      } else if (
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimeType === 'application/msword'
      ) {
        return await this.extractFromDocx(buffer);
      } else if (mimeType.startsWith('text/')) {
        return buffer.toString('utf-8');
      } else {
        throw new Error(`Unsupported file type: ${mimeType}`);
      }
    } catch (error: any) {
      console.error('Error extracting text:', error);
      throw new Error(`Failed to extract text from document: ${error.message}`);
    }
  }

  private async extractFromPdf(buffer: Buffer): Promise<string> {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    
    return result.text;
  }

  private async extractFromDocx(buffer: Buffer): Promise<string> {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
}
