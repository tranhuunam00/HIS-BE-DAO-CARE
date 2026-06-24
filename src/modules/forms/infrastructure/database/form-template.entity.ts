import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'form_templates' })
export class FormTemplateOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column()
  type: string; // 'PRINT_TEMPLATE' | 'CLINICAL_TEMPLATE' | 'ADMINISTRATIVE_TEMPLATE'

  @Column()
  category: string; // 'INVOICE' | 'PRESCRIPTION' | 'LAB_RESULT' | 'ULTRASOUND_RESULT' | 'SOAP'

  @Column({ name: 'html_content', type: 'text' })
  htmlContent: string;

  @Column({ type: 'varchar', nullable: true })
  description: string | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
