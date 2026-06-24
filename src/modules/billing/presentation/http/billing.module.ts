import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderOrmEntity } from '../../infrastructure/database/order.entity';
import { OrderItemOrmEntity } from '../../infrastructure/database/order-item.entity';
import { PaymentOrmEntity } from '../../infrastructure/database/payment.entity';
import { PatientVisitOrmEntity } from '../../../reception/infrastructure/database/patient-visit.entity';
import { ServiceOrmEntity } from '../../../medical/infrastructure/database/service.entity';

import { OrderRepository } from '../../infrastructure/repositories/order.repository';
import { PaymentRepository } from '../../infrastructure/repositories/payment.repository';

import { OrderController } from './controllers/order.controller';
import { PaymentController } from './controllers/payment.controller';

import { IOrderRepositoryToken, ListOrdersUseCase } from '../../application/use-cases/list-orders.use-case';
import { GetOrderByVisitUseCase } from '../../application/use-cases/get-order-by-visit.use-case';
import { AddOrderItemUseCase } from '../../application/use-cases/add-order-item.use-case';
import { UpdateOrderItemUseCase } from '../../application/use-cases/update-order-item.use-case';
import { DeleteOrderItemUseCase } from '../../application/use-cases/delete-order-item.use-case';
import { IPaymentRepositoryToken, CreatePaymentUseCase } from '../../application/use-cases/create-payment.use-case';
import { GetPaymentsByOrderUseCase } from '../../application/use-cases/get-payments-by-order.use-case';
import { RefundOrderUseCase } from '../../application/use-cases/refund-order.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderOrmEntity,
      OrderItemOrmEntity,
      PaymentOrmEntity,
      PatientVisitOrmEntity,
      ServiceOrmEntity,
    ]),
  ],
  controllers: [
    OrderController,
    PaymentController,
  ],
  providers: [
    {
      provide: IOrderRepositoryToken,
      useClass: OrderRepository,
    },
    {
      provide: IPaymentRepositoryToken,
      useClass: PaymentRepository,
    },
    // Order Use Cases
    ListOrdersUseCase,
    GetOrderByVisitUseCase,
    AddOrderItemUseCase,
    UpdateOrderItemUseCase,
    DeleteOrderItemUseCase,
    RefundOrderUseCase,
    // Payment Use Cases
    CreatePaymentUseCase,
    GetPaymentsByOrderUseCase,
  ],
  exports: [
    IOrderRepositoryToken,
    IPaymentRepositoryToken,
  ],
})
export class BillingModule {}
