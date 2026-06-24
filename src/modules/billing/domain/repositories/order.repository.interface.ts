import { Order } from '../entities/order.model';
import { OrderItem } from '../entities/order-item.model';

export interface IOrderRepository {
  findAll(filters?: { status?: string; search?: string }): Promise<Order[]>;
  findById(id: string): Promise<Order | null>;
  findByVisitId(visitId: string): Promise<Order | null>;
  save(order: Omit<Order, 'id'> & { id?: string }): Promise<Order>;
  saveItem(item: Omit<OrderItem, 'id'> & { id?: string }): Promise<OrderItem>;
  findItemById(itemId: string): Promise<OrderItem | null>;
  deleteItem(itemId: string): Promise<void>;
  generateOrderCode(): Promise<string>;
}
