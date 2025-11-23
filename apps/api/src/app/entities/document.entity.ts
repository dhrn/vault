import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne } from 'typeorm';
import { DocumentContent } from './document-content.entity';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string;

  @Column({ name: 'original_name' })
  originalName: string;

  @Column({ name: 'mime_type' })
  mimeType: string;

  @Column('bigint')
  size: number;

  @Column({ name: 'file_path' })
  filePath: string;

  @CreateDateColumn({ name: 'uploaded_at' })
  uploadedAt: Date;

  @OneToOne(() => DocumentContent, (content) => content.document, { cascade: true, eager: true })
  content: DocumentContent;
}
