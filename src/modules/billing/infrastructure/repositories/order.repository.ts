import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { Order } from '../../domain/entities/order.model';
import { OrderItem } from '../../domain/entities/order-item.model';
import { OrderOrmEntity } from '../database/order.entity';
import { OrderItemOrmEntity } from '../database/order-item.entity';

@Injectable()
export class OrderRepository implements IOrderRepository {
  constructor(
    @InjectRepository(OrderOrmEntity)
    private readonly ormRepository: Repository<OrderOrmEntity>,
    @InjectRepository(OrderItemOrmEntity)
    private readonly itemRepository: Repository<OrderItemOrmEntity>,
  ) {}

  private mapToDomain(entity: OrderOrmEntity): Order {
    return new Order(
      entity.id,
      entity.orderCode,
      entity.visitId,
      entity.patientId,
      entity.status,
      Number(entity.totalAmount),
      entity.createdAt,
      entity.updatedAt,
      entity.visit,
      entity.patient,
      entity.items ? entity.items.map((i) => this.mapItemToDomain(i)) : [],
    );
  }

  private mapItemToDomain(entity: OrderItemOrmEntity): OrderItem {
    return new OrderItem(
      entity.id,
      entity.orderId,
      entity.serviceId,
      entity.quantity,
      Number(entity.price),
      entity.status,
      entity.createdAt,
      entity.updatedAt,
      entity.service,
      entity.resultNotes,
      entity.resultStatus,
    );
  }

  async findAll(filters?: { status?: string; search?: string }): Promise<Order[]> {
    const queryBuilder = this.ormRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.visit', 'visit')
      .leftJoinAndSelect('order.patient', 'patient')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.service', 'service');

    if (filters?.status) {
      queryBuilder.andWhere('order.status = :status', { status: filters.status });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(order.orderCode ILIKE :search OR patient.fullName ILIKE :search OR patient.phone ILIKE :search OR visit.visitCode ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    queryBuilder.orderBy('order.createdAt', 'DESC');
    const entities = await queryBuilder.getMany();
    return entities.map((e) => this.mapToDomain(e));
  }

  async findById(id: string): Promise<Order | null> {
    const entity = await this.ormRepository.findOne({
      where: { id },
      relations: { visit: true, patient: true, items: { service: true } },
    });
    return entity ? this.mapToDomain(entity) : null;
  }

  async findByVisitId(visitId: string): Promise<Order | null> {
    const entity = await this.ormRepository.findOne({
      where: { visitId },
      relations: { visit: true, patient: true, items: { service: true } },
    });
    return entity ? this.mapToDomain(entity) : null;
  }

  async save(order: Omit<Order, 'id'> & { id?: string }): Promise<Order> {
    const entity = this.ormRepository.create(order);
    const saved = await this.ormRepository.save(entity);
    const reFetched = await this.findById(saved.id);
    return reFetched!;
  }

  async saveItem(item: Omit<OrderItem, 'id'> & { id?: string }): Promise<OrderItem> {
    const entity = this.itemRepository.create(item);
    const saved = await this.itemRepository.save(entity);
    const reFetched = await this.itemRepository.findOne({
      where: { id: saved.id },
      relations: { service: true },
    });
    return this.mapItemToDomain(reFetched!);
  }

  async findItemById(itemId: string): Promise<OrderItem | null> {
    const entity = await this.itemRepository.findOne({
      where: { id: itemId },
      relations: { service: true },
    });
    return entity ? this.mapItemToDomain(entity) : null;
  }

  async deleteItem(itemId: string): Promise<void> {
    await this.itemRepository.delete(itemId);
  }

  async generateOrderCode(): Promise<string> {
    const count = await this.ormRepository.count();
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '').slice(2);
    const nextSeq = (count + 1).toString().padStart(4, '0');
    return `ORD${today}-${nextSeq}`;
  }
}
