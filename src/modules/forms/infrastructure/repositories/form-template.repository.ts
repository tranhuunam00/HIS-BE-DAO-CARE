import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IFormTemplateRepository } from '../../domain/repositories/form-template.repository.interface';
import { FormTemplate } from '../../domain/entities/form-template.model';
import { FormTemplateOrmEntity } from '../database/form-template.entity';

@Injectable()
export class FormTemplateRepository implements IFormTemplateRepository {
  constructor(
    @InjectRepository(FormTemplateOrmEntity)
    private readonly ormRepository: Repository<FormTemplateOrmEntity>,
  ) {}

  async findAll(type?: string, category?: string): Promise<FormTemplate[]> {
    const where: any = {};
    if (type) where.type = type;
    if (category) where.category = category;

    const entities = await this.ormRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });

    return entities.map((e) => this.mapToDomain(e));
  }

  async findById(id: string): Promise<FormTemplate | null> {
    const entity = await this.ormRepository.findOneBy({ id });
    if (!entity) return null;
    return this.mapToDomain(entity);
  }

  async findByCode(code: string): Promise<FormTemplate | null> {
    const entity = await this.ormRepository.findOneBy({ code });
    if (!entity) return null;
    return this.mapToDomain(entity);
  }

  async save(template: FormTemplate): Promise<FormTemplate> {
    const orm = new FormTemplateOrmEntity();
    if (template.id) orm.id = template.id;
    orm.name = template.name;
    orm.code = template.code;
    orm.type = template.type;
    orm.category = template.category;
    orm.htmlContent = template.htmlContent;
    orm.description = template.description;
    orm.isActive = template.isActive;

    const saved = await this.ormRepository.save(orm);
    return this.mapToDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }

  private mapToDomain(orm: FormTemplateOrmEntity): FormTemplate {
    return new FormTemplate(
      orm.id,
      orm.name,
      orm.code,
      orm.type,
      orm.category,
      orm.htmlContent,
      orm.description,
      orm.isActive,
      orm.createdAt,
      orm.updatedAt,
    );
  }
}
