import { Resource } from './resource.model';

export class Room {
  constructor(
    public readonly id: string,
    public readonly branchId: string,
    public readonly name: string,
    public readonly code: string,
    public readonly type: string, // CLINIC, TREATMENT, PROCEDURE, LABORATORY, IMAGING
    public readonly specialtyId: string | null,
    public readonly floor: string | null,
    public readonly capacity: number,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly resources?: Resource[]
  ) {}
}
