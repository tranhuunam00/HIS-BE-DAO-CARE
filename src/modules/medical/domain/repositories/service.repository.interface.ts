import { Service } from '../entities/service.model';

export const IServiceRepositoryToken = 'IServiceRepository';

export interface IServiceRepository {
  findAll(specialtyId?: string, category?: string): Promise<Service[]>;
  findById(id: string): Promise<Service | null>;
  findByCode(code: string): Promise<Service | null>;
  save(service: Service): Promise<Service>;
}
