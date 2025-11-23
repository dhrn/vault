import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatOpenAI } from '@langchain/openai';

@Injectable()
export class AIService {
  private model: ChatAnthropic | ChatOpenAI;
  private provider: string;

  // Character limits for AI processing
  private readonly MAX_SUMMARY_CHARS = 150000; // For summaries (keep concise)
  private readonly CHUNK_SIZE = 80000; // Process markdown in chunks of ~25k tokens
  private readonly MAX_TOTAL_CHUNKS = 20; // Maximum chunks to process (prevents extreme costs)

  constructor(private configService: ConfigService) {
    this.provider = this.configService.get<string>('AI_PROVIDER', 'claude');
    this.model = this.initializeModel();
  }

  private initializeModel(): ChatAnthropic | ChatOpenAI {
    switch (this.provider.toLowerCase()) {
      case 'openai':
        const openaiApiKey = this.configService.get<string>('OPENAI_API_KEY');
        if (!openaiApiKey) {
          throw new Error('OPENAI_API_KEY is required when using OpenAI provider');
        }
        console.log('Initializing OpenAI provider');
        return new ChatOpenAI({
          apiKey: openaiApiKey,
          model: this.configService.get<string>('OPENAI_MODEL', 'gpt-4o'),
          temperature: 0.7,
        });

      case 'claude':
      case 'anthropic':
        const anthropicApiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
        if (!anthropicApiKey) {
          throw new Error('ANTHROPIC_API_KEY is required when using Claude provider');
        }
        console.log('Initializing Claude provider');
        return new ChatAnthropic({
          apiKey: anthropicApiKey,
          model: this.configService.get<string>('ANTHROPIC_MODEL', 'claude-3-5-sonnet-20241022'),
          temperature: 0.7,
        });

      default:
        throw new Error(
          `Unsupported AI provider: ${this.provider}. Supported providers are: openai, claude`
        );
    }
  }

  /**
   * Split text into chunks for processing
   */
  private splitIntoChunks(text: string, chunkSize: number): string[] {
    const chunks: string[] = [];

    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }

    return chunks;
  }

  /**
   * Truncate text for summary generation
   */
  private truncateForSummary(text: string): { text: string; wasTruncated: boolean } {
    if (text.length <= this.MAX_SUMMARY_CHARS) {
      return { text, wasTruncated: false };
    }

    console.warn(
      `Document exceeds ${this.MAX_SUMMARY_CHARS} chars (${text.length}). Truncating for summary...`
    );
    return {
      text: text.substring(0, this.MAX_SUMMARY_CHARS),
      wasTruncated: true,
    };
  }

  async generateSummary(text: string): Promise<string> {
    try {
      const { text: processedText, wasTruncated } = this.truncateForSummary(text);

      let prompt = `Please provide a concise summary of the following document:\n\n${processedText}`;

      if (wasTruncated) {
        prompt = `Note: This is a large document (${text.length} characters). Below is the first ${this.MAX_SUMMARY_CHARS} characters. Please provide a concise summary:\n\n${processedText}`;
      }

      const response = await this.model.invoke([{ role: 'user', content: prompt }]);

      let summary = response.content.toString();

      if (wasTruncated) {
        summary = `**Note:** Summary generated from the first ${this.MAX_SUMMARY_CHARS} of ${text.length} characters.\n\n${summary}`;
      }

      return summary;
    } catch (error: any) {
      console.error(`Error generating summary with ${this.provider}:`, error);
      throw new Error(`Failed to generate summary: ${error.message}`);
    }
  }

  async generateMarkdown(text: string): Promise<string> {
    try {
      // If text is small enough, process in one go
      if (text.length <= this.CHUNK_SIZE) {
        const prompt = `Convert the following document into clean, well-formatted markdown. Preserve the structure and formatting:\n\n${text}`;

        const response = await this.model.invoke([{ role: 'user', content: prompt }]);
        return response.content.toString();
      }

      // For large documents, process in chunks
      console.log(
        `Processing large document (${text.length} chars) in chunks of ${this.CHUNK_SIZE}...`
      );

      const chunks = this.splitIntoChunks(text, this.CHUNK_SIZE);
      const totalChunks = Math.min(chunks.length, this.MAX_TOTAL_CHUNKS);

      if (chunks.length > this.MAX_TOTAL_CHUNKS) {
        console.warn(
          `Document has ${chunks.length} chunks, limiting to ${this.MAX_TOTAL_CHUNKS} to prevent excessive API costs`
        );
      }

      const markdownChunks: string[] = [];

      for (let i = 0; i < totalChunks; i++) {
        console.log(`Processing chunk ${i + 1}/${totalChunks}...`);

        const chunkPrompt = `Convert the following document section (part ${i + 1} of ${totalChunks}) into clean, well-formatted markdown. Preserve the structure and formatting. Do not add introductory text or explanations, just convert to markdown:\n\n${chunks[i]}`;

        const response = await this.model.invoke([
          { role: 'user', content: chunkPrompt },
        ]);

        markdownChunks.push(response.content.toString());
      }

      // Combine all chunks
      const combinedMarkdown = markdownChunks.join('\n\n---\n\n');

      // Add notice about chunking
      if (chunks.length > this.MAX_TOTAL_CHUNKS) {
        const processedChars = totalChunks * this.CHUNK_SIZE;
        return `> **Note:** This document was very large. Showing markdown for the first ${processedChars.toLocaleString()} of ${text.length.toLocaleString()} characters (${totalChunks} of ${chunks.length} sections).\n\n${combinedMarkdown}`;
      }

      return combinedMarkdown;
    } catch (error: any) {
      console.error(`Error generating markdown with ${this.provider}:`, error);
      throw new Error(`Failed to generate markdown: ${error.message}`);
    }
  }

  getProvider(): string {
    return this.provider;
  }
}
