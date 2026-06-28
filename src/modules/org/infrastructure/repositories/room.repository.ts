import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IRoomRepository } from '../../domain/repositories/room.repository.interface';
import { Room } from '../../domain/entities/room.model';
import { Resource } from '../../domain/entities/resource.model';
import { RoomOrmEntity } from '../database/room.entity';
import { RoomServiceCapabilityOrmEntity } from '../database/room-service-capability.entity';

@Injectable()
export class RoomRepository implements IRoomRepository {
  constructor(
    @InjectRepository(RoomOrmEntity)
    private readonly ormRepository: Repository<RoomOrmEntity>,
    @InjectRepository(RoomServiceCapabilityOrmEntity)
    private readonly capabilityRepository: Repository<RoomServiceCapabilityOrmEntity>,
  ) {}

  async findAll(branchId?: string): Promise<Room[]> {
    const where: any = {};
    if (branchId) {
      where.branchId = branchId;
    }
    const orms = await this.ormRepository.find({
      where,
      relations: { resources: true, serviceCapabilities: true },
      order: { createdAt: 'ASC' },
    });
    return orms.map((orm) => this.toDomain(orm));
  }

  async findById(id: string): Promise<Room | null> {
    const orm = await this.ormRepository.findOne({
      where: { id },
      relations: { resources: true, serviceCapabilities: true },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findByCode(code: string): Promise<Room | null> {
    const orm = await this.ormRepository.findOne({
      where: { code },
      relations: { resources: true, serviceCapabilities: true },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async save(room: Room): Promise<Room> {
    const orm = this.toOrm(room);
    const saved = await this.ormRepository.save(orm);
    if (room.serviceIds !== undefined) {
      await this.capabilityRepository.delete({ roomId: saved.id });
      if (room.serviceIds.length > 0) {
        await this.capabilityRepository.save(
          room.serviceIds.map((serviceId) => this.capabilityRepository.create({
            roomId: saved.id,
            serviceId,
          })),
        );
      }
    }
    const reFetched = await this.findById(saved.id);
    return reFetched!;
  }

  private toDomain(orm: RoomOrmEntity): Room {
    const resources = orm.resources
      ? orm.resources.map(
          (r) =>
            new Resource(
              r.id,
              r.roomId,
              r.name,
              r.code,
              r.type,
              r.isActive,
              r.isOccupied,
              r.createdAt,
              r.updatedAt
            )
        )
      : [];

    return new Room(
      orm.id,
      orm.branchId,
      orm.name,
      orm.code,
      orm.type,
      orm.specialtyId,
      orm.floor,
      orm.capacity,
      orm.isActive,
      orm.createdAt,
      orm.updatedAt,
      resources,
      orm.serviceCapabilities?.map((capability) => capability.serviceId) || [],
    );
  }

  private toOrm(domain: Room): RoomOrmEntity {
    const orm = new RoomOrmEntity();
    orm.id = domain.id;
    orm.branchId = domain.branchId;
    orm.name = domain.name;
    orm.code = domain.code;
    orm.type = domain.type;
    orm.specialtyId = domain.specialtyId;
    orm.floor = domain.floor;
    orm.capacity = domain.capacity;
    orm.isActive = domain.isActive;
    if (domain.createdAt) orm.createdAt = domain.createdAt;
    if (domain.updatedAt) orm.updatedAt = domain.updatedAt;
    return orm;
  }
}
