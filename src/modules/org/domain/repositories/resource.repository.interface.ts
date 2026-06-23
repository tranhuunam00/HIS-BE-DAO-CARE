import { Resource } from '../entities/resource.model';

export interface IResourceRepository {
  findAll(roomId?: string): Promise<Resource[]>;
  findById(id: string): Promise<Resource | null>;
  findByCode(code: string): Promise<Resource | null>;
  save(resource: Resource): Promise<Resource>;
}

export const IResourceRepositoryToken = Symbol('IResourceRepository');
