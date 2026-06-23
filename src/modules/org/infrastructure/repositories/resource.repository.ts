import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IResourceRepository } from '../../domain/repositories/resource.repository.interface';
import { Resource } from '../../domain/entities/resource.model';
import { ResourceOrmEntity } from '../database/resource.entity';

@Injectable()
export class ResourceRepository implements IResourceRepository {
  constructor(
    @InjectRepository(ResourceOrmEntity)
    private readonly ormRepository: Repository<ResourceOrmEntity>
  ) {}

  async findAll(roomId?: string): Promise<Resource[]> {
    const where: any = {};
    if (roomId) {
      where.roomId = roomId;
    }
    const orms = await this.ormRepository.find({
      where,
      order: { createdAt: 'ASC' },
    });
    return orms.map((orm) => this.toDomain(orm));
  }

  async findById(id: string): Promise<Resource | null> {
    const orm = await this.ormRepository.findOne({
      where: { id },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findByCode(code: string): Promise<Resource | null> {
    const orm = await this.ormRepository.findOne({
      where: { code },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async save(resource: Resource): Promise<Resource> {
    const orm = this.toOrm(resource);
    const saved = await this.ormRepository.save(orm);
    return this.toDomain(saved);
  }

  private toDomain(orm: ResourceOrmEntity): Resource {
    return new Resource(
      orm.id,
      orm.roomId,
      orm.name,
      orm.code,
      orm.type,
      orm.isActive,
      orm.createdAt,
      orm.updatedAt
    );
  }

  private toOrm(domain: Resource): ResourceOrmEntity {
    const orm = new ResourceOrmEntity();
    orm.id = domain.id;
    orm.roomId = domain.roomId;
    orm.name = domain.name;
    orm.code = domain.code;
    orm.type = domain.type;
    orm.isActive = domain.isActive;
    if (domain.createdAt) orm.createdAt = domain.createdAt;
    if (domain.updatedAt) orm.updatedAt = domain.updatedAt;
    return orm;
  }
}
