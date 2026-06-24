import { FormTemplate } from '../entities/form-template.model';

export const IFormTemplateRepositoryToken = Symbol('IFormTemplateRepository');

export interface IFormTemplateRepository {
  findAll(type?: string, category?: string): Promise<FormTemplate[]>;
  findById(id: string): Promise<FormTemplate | null>;
  findByCode(code: string): Promise<FormTemplate | null>;
  save(template: FormTemplate): Promise<FormTemplate>;
  delete(id: string): Promise<void>;
}
