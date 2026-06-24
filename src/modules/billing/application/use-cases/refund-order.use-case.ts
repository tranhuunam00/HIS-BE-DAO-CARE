import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { OrderOrmEntity } from '../../infrastructure/database/order.entity';
import { PaymentOrmEntity } from '../../infrastructure/database/payment.entity';
import { PatientVisitOrmEntity } from '../../../reception/infrastructure/database/patient-visit.entity';
import { RefundOrderDto, OrderResponseDto } from '../dtos/order.dto';

@Injectable()
export class RefundOrderUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(orderId: string, dto: RefundOrderDto): Promise<OrderResponseDto> {
    return await this.dataSource.transaction(async (manager) => {
      // 1. Find the order with items and visit relations
      const order = await manager.findOne(OrderOrmEntity, {
        where: { id: orderId },
        relations: { visit: true, patient: true, items: { service: true } },
      });

      if (!order) {
        throw new NotFoundException('Không tìm thấy đơn dịch vụ');
      }

      // 2. Only paid orders can be refunded
      if (order.status !== 'PAID') {
        throw new BadRequestException('Chỉ có thể hoàn tiền cho hóa đơn đã thanh toán');
      }

      // 3. Match items to refund
      const itemsToRefund = order.items.filter((item) => dto.itemIds.includes(item.id));
      if (itemsToRefund.length !== dto.itemIds.length) {
        throw new BadRequestException('Một số dịch vụ hoàn tiền không tồn tại trong đơn này');
      }

      // 4. Validate clinical status of items (must be PENDING)
      for (const item of itemsToRefund) {
        if (item.status === 'COMPLETED') {
          throw new BadRequestException(
            `Không thể hoàn tiền dịch vụ ${item.service?.name || ''} do đã thực hiện`,
          );
        }
        if (item.status === 'CANCELLED') {
          throw new BadRequestException(
            `Dịch vụ ${item.service?.name || ''} đã được hủy/hoàn tiền trước đó`,
          );
        }
      }

      // 5. Update statuses and calculate total refund amount
      let refundAmount = 0;
      for (const item of itemsToRefund) {
        item.status = 'CANCELLED';
        refundAmount += Number(item.price) * item.quantity;
        await manager.save(item);
      }

      // 6. Generate payment code for negative payment trace
      const paymentCount = await manager.count(PaymentOrmEntity);
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '').slice(2);
      const nextSeq = (paymentCount + 1).toString().padStart(4, '0');
      const paymentCode = `PAY${today}-${nextSeq}`;

      // 7. Save negative payment transaction
      const refundPayment = manager.create(PaymentOrmEntity, {
        id: randomUUID(),
        paymentCode,
        orderId,
        amount: -refundAmount,
        paymentMethod: dto.paymentMethod,
        status: 'SUCCESS',
      });
      await manager.save(refundPayment);

      // 8. Subtract refund from order total amount
      order.totalAmount = Number(order.totalAmount) - refundAmount;

      // 9. Update order status if all items are cancelled
      const allCancelled = order.items.every((item) => item.status === 'CANCELLED');
      if (allCancelled) {
        order.status = 'CANCELLED';

        // Also revert visit status to CANCELLED if the entire visit's services are cancelled
        if (order.visitId) {
          const visit = await manager.findOne(PatientVisitOrmEntity, {
            where: { id: order.visitId },
          });
          if (visit) {
            visit.status = 'CANCELLED';
            await manager.save(visit);
          }
        }
      }

      await manager.save(order);

      // Re-fetch clean copy with relations
      const updatedOrder = await manager.findOneOrFail(OrderOrmEntity, {
        where: { id: orderId },
        relations: { visit: true, patient: true, items: { service: true } },
      });

      return {
        id: updatedOrder.id,
        orderCode: updatedOrder.orderCode,
        visitId: updatedOrder.visitId,
        patientId: updatedOrder.patientId,
        status: updatedOrder.status,
        totalAmount: Number(updatedOrder.totalAmount),
        createdAt: updatedOrder.createdAt,
        updatedAt: updatedOrder.updatedAt,
        visit: updatedOrder.visit,
        patient: updatedOrder.patient,
        items: updatedOrder.items.map((item) => ({
          id: item.id,
          orderId: item.orderId,
          serviceId: item.serviceId,
          quantity: item.quantity,
          price: Number(item.price),
          status: item.status,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          service: item.service,
        })),
      };
    });
  }
}
