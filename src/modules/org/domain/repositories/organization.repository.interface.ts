import { Organization } from '../entities/organization.model';

export interface IOrganizationRepository {
  findDefault(): Promise<Organization | null>;
  findById(id: string): Promise<Organization | null>;
  findByCode(code: string): Promise<Organization | null>;
  save(org: Organization): Promise<Organization>;
}

export const IOrganizationRepositoryToken = Symbol('IOrganizationRepository');
