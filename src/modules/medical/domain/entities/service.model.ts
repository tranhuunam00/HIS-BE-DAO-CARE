import { ServicePrice } from './service-price.model';

export class Service {
  constructor(
    public readonly id: string,
    public readonly specialtyId: string | null,
    public readonly code: string,
    public readonly name: string,
    public readonly category: string, // EXAMINATION | LAB_TEST | IMAGING | PROCEDURE | SURGERY | THERAPY
    public readonly insuranceCode: string | null,
    public readonly description: string | null,
    public readonly durationMinutes: number,
    public readonly resultDurationHours: number | null,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly prices?: ServicePrice[],
  ) {}
}
