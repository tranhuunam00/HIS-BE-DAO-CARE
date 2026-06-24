import { Shift } from '../entities/shift.model';

export const IShiftRepositoryToken = 'IShiftRepository';

export interface IShiftRepository {
  findAll(): Promise<Shift[]>;
  findById(id: string): Promise<Shift | null>;
  save(shift: Shift): Promise<Shift>;
}
