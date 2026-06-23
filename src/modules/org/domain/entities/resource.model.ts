export class Resource {
  constructor(
    public readonly id: string,
    public readonly roomId: string,
    public readonly name: string,
    public readonly code: string,
    public readonly type: string, // CHAIR, BED, EQUIPMENT
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}
