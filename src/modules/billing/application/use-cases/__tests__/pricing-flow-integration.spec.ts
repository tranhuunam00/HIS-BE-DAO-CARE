import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UpsertServicePricesUseCase } from '../../../../medical/application/use-cases/upsert-service-prices.use-case';
import { AddOrderItemUseCase, IOrderRepositoryToken } from '../add-order-item.use-case';
import { DeleteOrderItemUseCase } from '../delete-order-item.use-case';
import { CreatePaymentUseCase } from '../create-payment.use-case';
import { ServiceOrmEntity } from '../../../../medical/infrastructure/database/service.entity';
import { PatientVisitOrmEntity } from '../../../../reception/infrastructure/database/patient-visit.entity';
import { ServicePrice } from '../../../../medical/domain/entities/service-price.model';
import { Service } from '../../../../medical/domain/entities/service.model';
import { Order } from '../../../domain/entities/order.model';
import { OrderItem } from '../../../domain/entities/order-item.model';
import {
  ORDER_ITEM_STATUS,
  ORDER_STATUS,
  PATIENT_VISIT_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
} from '../../../../../common/constants/workflow.constants';
import { ISpecialtyRepositoryToken } from '../../../../medical/domain/repositories/specialty.repository.interface';
import { IServiceRepositoryToken } from '../../../../medical/domain/repositories/service.repository.interface';
import { IServicePriceRepositoryToken } from '../../../../medical/domain/repositories/service-price.repository.interface';
import { IPaymentRepositoryToken } from '../create-payment.use-case';

describe('Pricing History and Billing Flow Integration Test', () => {
  let upsertServicePricesUseCase: UpsertServicePricesUseCase;
  let addOrderItemUseCase: AddOrderItemUseCase;
  let deleteOrderItemUseCase: DeleteOrderItemUseCase;
  let createPaymentUseCase: CreatePaymentUseCase;

  // In-memory DB mocks
  let serviceDb: Service;
  let pricesDb: ServicePrice[] = [];
  let orderDb: Order;
  let orderItemsDb: OrderItem[] = [];
  let visitDb: any;
  let paymentDb: any = null;

  beforeEach(async () => {
    // Reset databases
    pricesDb = [];
    orderItemsDb = [];
    paymentDb = null;

    serviceDb = new Service(
      'service-123',
      'spec-123',
      'DV_TEST_FULL',
      'Dịch vụ Test Tổng Hợp',
      'EXAMINATION',
      null,
      'Mô tả test',
      30,
      null,
      true,
      new Date(),
      new Date(),
      [],
    );

    orderDb = new Order(
      'order-123',
      'ORD-2026-0001',
      'visit-123',
      'patient-123',
      ORDER_STATUS.PENDING,
      0,
      new Date(),
      new Date(),
      null,
      null,
      [],
    );

    visitDb = {
      id: 'visit-123',
      status: PATIENT_VISIT_STATUS.ADMITTED,
    };

    // Mock Specialty Repo (required by Create/Update Specialty contexts)
    const mockSpecialtyRepo = {};

    // Mock Service Repo
    const mockServiceRepo = {
      findById: jest.fn(async (id: string) => {
        if (id === serviceDb.id) {
          // Attach latest prices to the service model
          return new Service(
            serviceDb.id,
            serviceDb.specialtyId,
            serviceDb.code,
            serviceDb.name,
            serviceDb.category,
            serviceDb.insuranceCode,
            serviceDb.description,
            serviceDb.durationMinutes,
            serviceDb.resultDurationHours,
            serviceDb.isActive,
            serviceDb.createdAt,
            serviceDb.updatedAt,
            pricesDb,
          );
        }
        return null;
      }),
      save: jest.fn(async (s: Service) => {
        serviceDb = s;
        return serviceDb;
      }),
    };

    // Mock Service Price Repo
    const mockServicePriceRepo = {
      save: jest.fn(async (p: ServicePrice) => {
        pricesDb.push(p);
        return p;
      }),
      deleteByServiceAndType: jest.fn(async (serviceId: string, priceType: string) => {
        pricesDb = pricesDb.filter((p) => p.priceType !== priceType);
      }),
      findByServiceId: jest.fn(async (serviceId: string) => {
        return pricesDb.filter((p) => p.serviceId === serviceId);
      }),
    };

    // Mock Order Repo
    const mockOrderRepo = {
      findById: jest.fn(async (id: string) => {
        if (id === orderDb.id) {
          return new Order(
            orderDb.id,
            orderDb.orderCode,
            orderDb.visitId,
            orderDb.patientId,
            orderDb.status,
            orderDb.totalAmount,
            orderDb.createdAt,
            orderDb.updatedAt,
            orderDb.visit,
            orderDb.patient,
            orderItemsDb,
          );
        }
        return null;
      }),
      saveItem: jest.fn(async (item: any) => {
        const existingIndex = orderItemsDb.findIndex((i) => i.id === item.id);
        const newItem = new OrderItem(
          item.id || `item-${Date.now()}-${Math.random()}`,
          item.orderId,
          item.serviceId,
          item.quantity,
          item.price,
          item.status || ORDER_ITEM_STATUS.PENDING,
          new Date(),
          new Date(),
        );
        if (existingIndex >= 0) {
          orderItemsDb[existingIndex] = newItem;
        } else {
          orderItemsDb.push(newItem);
        }
        return newItem;
      }),
      deleteItem: jest.fn(async (itemId: string) => {
        orderItemsDb = orderItemsDb.filter((i) => i.id !== itemId);
      }),
      findItemById: jest.fn(async (itemId: string) => {
        return orderItemsDb.find((i) => i.id === itemId) || null;
      }),
      save: jest.fn(async (orderPatch: Partial<Order>) => {
        orderDb = {
          ...orderDb,
          ...orderPatch,
        } as Order;
        return orderDb;
      }),
    };

    // Mock Payment Repo
    const mockPaymentRepo = {
      generatePaymentCode: jest.fn(async () => 'PAY-2026-9999'),
      save: jest.fn(async (payment: any) => {
        paymentDb = {
          id: 'pay-123',
          paidAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          ...payment,
        };
        return paymentDb;
      }),
    };

    // Nest Test Module compilation
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpsertServicePricesUseCase,
        AddOrderItemUseCase,
        DeleteOrderItemUseCase,
        CreatePaymentUseCase,
        {
          provide: ISpecialtyRepositoryToken,
          useValue: mockSpecialtyRepo,
        },
        {
          provide: IServiceRepositoryToken,
          useValue: mockServiceRepo,
        },
        {
          provide: IServicePriceRepositoryToken,
          useValue: mockServicePriceRepo,
        },
        {
          provide: IOrderRepositoryToken,
          useValue: mockOrderRepo,
        },
        {
          provide: IPaymentRepositoryToken,
          useValue: mockPaymentRepo,
        },
        {
          provide: getRepositoryToken(ServiceOrmEntity),
          useValue: {
            findOne: jest.fn(async () => {
              // Return Orm equivalent
              return {
                id: serviceDb.id,
                prices: pricesDb,
              };
            }),
          },
        },
        {
          provide: getRepositoryToken(PatientVisitOrmEntity),
          useValue: {
            findOne: jest.fn(async () => visitDb),
            save: jest.fn(async (v) => {
              visitDb = { ...visitDb, ...v };
              return visitDb;
            }),
          },
        },
      ],
    }).compile();

    upsertServicePricesUseCase = module.get<UpsertServicePricesUseCase>(UpsertServicePricesUseCase);
    addOrderItemUseCase = module.get<AddOrderItemUseCase>(AddOrderItemUseCase);
    deleteOrderItemUseCase = module.get<DeleteOrderItemUseCase>(DeleteOrderItemUseCase);
    createPaymentUseCase = module.get<CreatePaymentUseCase>(CreatePaymentUseCase);
  });

  it('verifies the full flow: pricing timeline configs -> correct active price calculation -> order total updates -> payment confirmation', async () => {
    // -------------------------------------------------------------------------
    // STEP 1: Admin configures first price: 100,000 VND on 2026-06-01
    // -------------------------------------------------------------------------
    const date1 = new Date('2026-06-01T10:00:00');
    jest.useFakeTimers().setSystemTime(date1);
    orderDb.createdAt = date1;

    await upsertServicePricesUseCase.execute(serviceDb.id, {
      prices: [
        {
          priceType: 'LISTED',
          amount: 100000,
          vatRate: 0,
          effectiveDate: '2026-06-01',
        },
      ],
    });

    expect(pricesDb).toHaveLength(1);

    // -------------------------------------------------------------------------
    // STEP 2: Doctor/Nurse adds the service to patient's order on Date 2026-06-15.
    // Price A (100,000 VND, effective 2026-06-01) is ACTIVE.
    // -------------------------------------------------------------------------
    const date2 = new Date('2026-06-15T10:00:00');
    jest.setSystemTime(date2);
    orderDb.createdAt = date2;

    let orderState = await addOrderItemUseCase.execute(orderDb.id, {
      serviceId: serviceDb.id,
      quantity: 2,
    });

    expect(orderState.items).toHaveLength(1);
    expect(orderState.items![0].price).toBe(100000); // Should be Price A
    expect(orderState.totalAmount).toBe(200000); // 100,000 * 2 = 200,000 VND

    // -------------------------------------------------------------------------
    // STEP 3: On Date 2026-06-20, Admin updates price to 120,000 VND (applies immediately)
    // -------------------------------------------------------------------------
    const date3 = new Date('2026-06-20T10:00:00');
    jest.setSystemTime(date3);

    await upsertServicePricesUseCase.execute(serviceDb.id, {
      prices: [
        {
          priceType: 'LISTED',
          amount: 100000,
          vatRate: 0,
          effectiveDate: '2026-06-01',
        },
        {
          priceType: 'LISTED',
          amount: 120000,
          vatRate: 0,
          effectiveDate: '2026-06-20',
        },
      ],
    });

    expect(pricesDb).toHaveLength(2);

    // -------------------------------------------------------------------------
    // STEP 4: Later, on Date 2026-06-25, they add the same service again.
    // Item 1 (added on June 15) must keep its historical price 100,000 VND.
    // Item 2 (added on June 25) must use the new active price 120,000 VND.
    // -------------------------------------------------------------------------
    const date4 = new Date('2026-06-25T10:00:00');
    jest.setSystemTime(date4);
    orderDb.createdAt = date4;

    orderState = await addOrderItemUseCase.execute(orderDb.id, {
      serviceId: serviceDb.id,
      quantity: 1,
    });

    expect(orderState.items).toHaveLength(2);
    expect(orderState.items![0].price).toBe(100000);
    expect(orderState.items![1].price).toBe(120000);
    expect(orderState.totalAmount).toBe(320000);

    // -------------------------------------------------------------------------
    // STEP 5: Delete the first order item and check that order total decreases
    // -------------------------------------------------------------------------
    const firstItemId = orderState.items![0].id;
    orderState = await deleteOrderItemUseCase.execute(orderDb.id, firstItemId);

    expect(orderState.items).toHaveLength(1);
    expect(orderState.items![0].price).toBe(120000);
    expect(orderState.totalAmount).toBe(120000);

    // -------------------------------------------------------------------------
    // STEP 6: Create a payment for this order
    // -------------------------------------------------------------------------
    const payment = await createPaymentUseCase.execute({
      orderId: orderDb.id,
      amount: 120000,
      paymentMethod: PAYMENT_METHOD.TRANSFER,
    });

    expect(payment.status).toBe(PAYMENT_STATUS.SUCCESS);
    expect(payment.amount).toBe(120000);
    expect(orderDb.status).toBe(ORDER_STATUS.PAID);

    jest.useRealTimers();
  });

  describe('Boundary and price transition edge cases', () => {
    it('applies fallback price (earliest future price) when the target date is before all configured effective dates', async () => {
      // Setup legacy prices in DB directly (not via upsertUseCase to bypass future validation)
      pricesDb = [
        new ServicePrice('p-1', serviceDb.id, 'LISTED', 120000, 0, new Date('2026-06-20T00:00:00'), new Date(), new Date()),
        new ServicePrice('p-2', serviceDb.id, 'LISTED', 150000, 0, new Date('2026-06-25T00:00:00'), new Date(), new Date()),
      ];

      // Target date is June 10th (before all effective dates)
      const targetDate = new Date('2026-06-10T12:00:00');
      jest.useFakeTimers().setSystemTime(targetDate);
      orderDb.createdAt = targetDate;

      const orderState = await addOrderItemUseCase.execute(orderDb.id, {
        serviceId: serviceDb.id,
        quantity: 1,
      });

      // Should fall back to the earliest future price (120,000 VND)
      expect(orderState.items![0].price).toBe(120000);
      jest.useRealTimers();
    });

    it('handles exact boundary date match (targetDate == effectiveDate) and off-by-one day before (targetDate == effectiveDate - 1 day)', async () => {
      // Set current time to June 20, so June 15 and June 20 prices are not in the future
      const baseDate = new Date('2026-06-20T12:00:00');
      jest.useFakeTimers().setSystemTime(baseDate);
      orderDb.createdAt = baseDate;

      await upsertServicePricesUseCase.execute(serviceDb.id, {
        prices: [
          {
            priceType: 'LISTED',
            amount: 100000,
            vatRate: 0,
            effectiveDate: '2026-06-15',
          },
          {
            priceType: 'LISTED',
            amount: 130000,
            vatRate: 0,
            effectiveDate: '2026-06-20',
          },
        ],
      });

      // Case 1: Target date is exactly 1 day before the new price (June 19th)
      // It should apply the older price (100,000 VND)
      const targetDate1 = new Date('2026-06-19T12:00:00');
      jest.setSystemTime(targetDate1);
      orderDb.createdAt = targetDate1;

      let orderState = await addOrderItemUseCase.execute(orderDb.id, {
        serviceId: serviceDb.id,
        quantity: 1,
      });
      const firstItemId = orderState.items![0].id;
      expect(orderState.items![0].price).toBe(100000);

      // Case 2: Target date is exactly the effective date (June 20th)
      // It should apply the new price (130,000 VND)
      const targetDate2 = new Date('2026-06-20T12:00:00');
      jest.setSystemTime(targetDate2);
      orderDb.createdAt = targetDate2;

      orderState = await addOrderItemUseCase.execute(orderDb.id, {
        serviceId: serviceDb.id,
        quantity: 1,
      });
      const secondItemId = orderState.items![1].id;
      expect(orderState.items![1].price).toBe(130000);

      // Clean up order items
      await deleteOrderItemUseCase.execute(orderDb.id, firstItemId);
      await deleteOrderItemUseCase.execute(orderDb.id, secondItemId);
      jest.useRealTimers();
    });

    it('returns default price of 0 if there are no prices configured at all', async () => {
      // Force pricesDb to be empty (mocking no configured prices)
      pricesDb = [];

      const targetDate = new Date('2026-06-20T10:00:00');
      jest.useFakeTimers().setSystemTime(targetDate);
      orderDb.createdAt = targetDate;

      const orderState = await addOrderItemUseCase.execute(orderDb.id, {
        serviceId: serviceDb.id,
        quantity: 1,
      });

      expect(orderState.items![0].price).toBe(0);
      jest.useRealTimers();
    });

    it('applies non-listed price if no listed price is present', async () => {
      // Set current time to June 20, so June 15 is in past
      const targetDate = new Date('2026-06-20T12:00:00');
      jest.useFakeTimers().setSystemTime(targetDate);
      orderDb.createdAt = targetDate;

      // Configure only an INSURANCE price
      await upsertServicePricesUseCase.execute(serviceDb.id, {
        prices: [
          {
            priceType: 'INSURANCE',
            amount: 85000,
            vatRate: 0,
            effectiveDate: '2026-06-15',
          },
        ],
      });

      const orderState = await addOrderItemUseCase.execute(orderDb.id, {
        serviceId: serviceDb.id,
        quantity: 1,
      });

      // Should fall back to the first available price (85,000 VND) because no LISTED type is configured
      expect(orderState.items![0].price).toBe(85000);
      jest.useRealTimers();
    });

    it('maintains historical order item prices even when service prices are updated/overwritten afterwards', async () => {
      // 1. Set current time to June 15, then config listed price: 100,000 VND effective on June 15
      const date15 = new Date('2026-06-15T10:00:00');
      jest.useFakeTimers().setSystemTime(date15);
      orderDb.createdAt = date15;

      await upsertServicePricesUseCase.execute(serviceDb.id, {
        prices: [
          {
            priceType: 'LISTED',
            amount: 100000,
            vatRate: 0,
            effectiveDate: '2026-06-15',
          },
        ],
      });

      // 2. Add order item on June 18
      const date18 = new Date('2026-06-18T10:00:00');
      jest.setSystemTime(date18);
      orderDb.createdAt = date18;

      let orderState = await addOrderItemUseCase.execute(orderDb.id, {
        serviceId: serviceDb.id,
        quantity: 1,
      });
      const oldItemId = orderState.items![0].id;
      expect(orderState.items![0].price).toBe(100000);

      // 3. Admin updates the pricing schedule on June 20: June 15 price is KEPT, and a new price (140,000 VND) is ADDED for June 20
      const date20 = new Date('2026-06-20T10:00:00');
      jest.setSystemTime(date20);

      await upsertServicePricesUseCase.execute(serviceDb.id, {
        prices: [
          {
            priceType: 'LISTED',
            amount: 100000,
            vatRate: 0,
            effectiveDate: '2026-06-15',
          },
          {
            priceType: 'LISTED',
            amount: 140000,
            vatRate: 0,
            effectiveDate: '2026-06-20',
          },
        ],
      });

      // 4. Retrieve order again or add a new item on June 21 to verify
      // The old item MUST retain the price of 100,000 VND (immutability of created items)
      // The new item must use the new active price of 140,000 VND
      const date21 = new Date('2026-06-21T10:00:00');
      jest.setSystemTime(date21);
      orderDb.createdAt = date21;

      const updatedOrder = await addOrderItemUseCase.execute(orderDb.id, {
        serviceId: serviceDb.id,
        quantity: 1,
      });
      
      const item1 = updatedOrder.items!.find((i) => i.id === oldItemId);
      const item2 = updatedOrder.items!.find((i) => i.id !== oldItemId);

      expect(item1?.price).toBe(100000); // untouched!
      expect(item2?.price).toBe(140000); // uses the newly updated active price!
      
      // Clean up order items
      await deleteOrderItemUseCase.execute(orderDb.id, item1!.id);
      await deleteOrderItemUseCase.execute(orderDb.id, item2!.id);
      jest.useRealTimers();
    });

    it('throws BadRequestException if client attempts to delete or modify an active or expired price', async () => {
      // 1. Setup an active price (effective on June 15) and another active price (effective on June 20)
      const baseDate = new Date('2026-06-20T12:00:00');
      jest.useFakeTimers().setSystemTime(baseDate);
      orderDb.createdAt = baseDate;

      await upsertServicePricesUseCase.execute(serviceDb.id, {
        prices: [
          {
            priceType: 'LISTED',
            amount: 100000,
            vatRate: 0,
            effectiveDate: '2026-06-15',
          },
          {
            priceType: 'LISTED',
            amount: 150000,
            vatRate: 0,
            effectiveDate: '2026-06-20',
          },
        ],
      });

      // 2. Client attempts to upsert but leaves out the June 15 active price (trying to delete it)
      await expect(
        upsertServicePricesUseCase.execute(serviceDb.id, {
          prices: [
            {
              priceType: 'LISTED',
              amount: 150000,
              vatRate: 0,
              effectiveDate: '2026-06-20',
            },
          ],
        }),
      ).rejects.toThrow(BadRequestException);

      // 3. Client attempts to upsert and modifies the amount of the June 15 active price
      await expect(
        upsertServicePricesUseCase.execute(serviceDb.id, {
          prices: [
            {
              priceType: 'LISTED',
              amount: 110000, // changed from 100000
              vatRate: 0,
              effectiveDate: '2026-06-15',
            },
            {
              priceType: 'LISTED',
              amount: 150000,
              vatRate: 0,
              effectiveDate: '2026-06-20',
            },
          ],
        }),
      ).rejects.toThrow(BadRequestException);

      jest.useRealTimers();
    });

    it('throws BadRequestException if client attempts to configure a price with future effective date', async () => {
      // Current date is June 20
      const baseDate = new Date('2026-06-20T12:00:00');
      jest.useFakeTimers().setSystemTime(baseDate);
      orderDb.createdAt = baseDate;

      // Client attempts to upsert a price with effective date in the future (July 1st)
      await expect(
        upsertServicePricesUseCase.execute(serviceDb.id, {
          prices: [
            {
              priceType: 'LISTED',
              amount: 150000,
              vatRate: 0,
              effectiveDate: '2026-07-01', // future!
            },
          ],
        }),
      ).rejects.toThrow(BadRequestException);

      jest.useRealTimers();
    });
  });

  describe('Super detailed billing and order creation time pricing tests', () => {
    it('applies fallback price of current system time when order.createdAt is undefined', async () => {
      // 1. Setup prices: June 15: 100k, June 20: 130k
      jest.useFakeTimers().setSystemTime(new Date('2026-06-20T12:00:00'));
      orderDb.createdAt = new Date('2026-06-20T12:00:00');

      await upsertServicePricesUseCase.execute(serviceDb.id, {
        prices: [
          {
            priceType: 'LISTED',
            amount: 100000,
            vatRate: 0,
            effectiveDate: '2026-06-15',
          },
          {
            priceType: 'LISTED',
            amount: 130000,
            vatRate: 0,
            effectiveDate: '2026-06-20',
          },
        ],
      });

      // 2. Mock current time to June 21, and force orderDb.createdAt to be null
      jest.setSystemTime(new Date('2026-06-21T10:00:00'));
      (orderDb as any).createdAt = null;

      // 3. Add order item
      const orderState = await addOrderItemUseCase.execute(orderDb.id, {
        serviceId: serviceDb.id,
        quantity: 1,
      });

      // Since order.createdAt is null, it should fallback to the current system time (June 21), which resolves to 130,000 VND
      expect(orderState.items![0].price).toBe(130000);
      
      // Clean up
      const itemId = orderState.items![0].id;
      await deleteOrderItemUseCase.execute(orderDb.id, itemId);
      jest.useRealTimers();
    });

    it('resolves historical price correctly when adding items to a past order (past order pricing consistency)', async () => {
      // 1. Setup: June 15: 100k, June 20: 130k
      jest.useFakeTimers().setSystemTime(new Date('2026-06-20T12:00:00'));
      orderDb.createdAt = new Date('2026-06-20T12:00:00');

      await upsertServicePricesUseCase.execute(serviceDb.id, {
        prices: [
          {
            priceType: 'LISTED',
            amount: 100000,
            vatRate: 0,
            effectiveDate: '2026-06-15',
          },
          {
            priceType: 'LISTED',
            amount: 130000,
            vatRate: 0,
            effectiveDate: '2026-06-20',
          },
        ],
      });

      // 2. An order created in the past on June 17th (orderDb.createdAt = June 17th)
      orderDb.createdAt = new Date('2026-06-17T09:00:00');

      // 3. Now is June 25th (future date). Doctor adds service to this past order
      jest.setSystemTime(new Date('2026-06-25T15:00:00'));

      const orderState = await addOrderItemUseCase.execute(orderDb.id, {
        serviceId: serviceDb.id,
        quantity: 1,
      });

      // The resolved price should be the active price at order creation date (June 17), which is 100,000 VND, NOT June 25th active price (130,000 VND)
      expect(orderState.items![0].price).toBe(100000);

      // Clean up
      const itemId = orderState.items![0].id;
      await deleteOrderItemUseCase.execute(orderDb.id, itemId);
      jest.useRealTimers();
    });

    it('handles calendar day boundary transitions precisely (off-by-one millisecond testing)', async () => {
      // 1. Setup: June 15: 100k, June 20: 130k
      jest.useFakeTimers().setSystemTime(new Date('2026-06-20T12:00:00'));
      orderDb.createdAt = new Date('2026-06-20T12:00:00');

      await upsertServicePricesUseCase.execute(serviceDb.id, {
        prices: [
          {
            priceType: 'LISTED',
            amount: 100000,
            vatRate: 0,
            effectiveDate: '2026-06-15',
          },
          {
            priceType: 'LISTED',
            amount: 130000,
            vatRate: 0,
            effectiveDate: '2026-06-20',
          },
        ],
      });

      // Case 1: Order was created exactly 1 millisecond before June 20 (June 19, 23:59:59.999)
      const dateBefore = new Date('2026-06-19T23:59:59.999');
      orderDb.createdAt = dateBefore;
      // Current system time is June 25
      jest.setSystemTime(new Date('2026-06-25T10:00:00'));

      let orderState = await addOrderItemUseCase.execute(orderDb.id, {
        serviceId: serviceDb.id,
        quantity: 1,
      });
      const firstItemId = orderState.items![0].id;
      expect(orderState.items![0].price).toBe(100000); // June 19th is before June 20th -> Old Price

      // Case 2: Order was created exactly at the start of June 20 (June 20, 00:00:00.000)
      const dateStart = new Date('2026-06-20T00:00:00.000');
      orderDb.createdAt = dateStart;

      orderState = await addOrderItemUseCase.execute(orderDb.id, {
        serviceId: serviceDb.id,
        quantity: 1,
      });
      const secondItemId = orderState.items![1].id;
      expect(orderState.items![1].price).toBe(130000); // June 20th -> New Price

      // Clean up
      await deleteOrderItemUseCase.execute(orderDb.id, firstItemId);
      await deleteOrderItemUseCase.execute(orderDb.id, secondItemId);
      jest.useRealTimers();
    });

    it('resolves correct historical price when a new price is added today but order was created yesterday', async () => {
      // 1. Setup initial price on June 15: 100k
      jest.useFakeTimers().setSystemTime(new Date('2026-06-15T12:00:00'));
      orderDb.createdAt = new Date('2026-06-15T12:00:00');

      await upsertServicePricesUseCase.execute(serviceDb.id, {
        prices: [
          {
            priceType: 'LISTED',
            amount: 100000,
            vatRate: 0,
            effectiveDate: '2026-06-15',
          },
        ],
      });

      // 2. Order created yesterday, June 25th
      const dateYesterday = new Date('2026-06-25T14:00:00');
      orderDb.createdAt = dateYesterday;

      // 3. Today is June 26th. Admin updates the price schedule: adds June 26 price of 150k (applies today)
      jest.setSystemTime(new Date('2026-06-26T10:00:00'));
      await upsertServicePricesUseCase.execute(serviceDb.id, {
        prices: [
          {
            priceType: 'LISTED',
            amount: 100000,
            vatRate: 0,
            effectiveDate: '2026-06-15',
          },
          {
            priceType: 'LISTED',
            amount: 150000, // new price effective today
            vatRate: 0,
            effectiveDate: '2026-06-26',
          },
        ],
      });

      // 4. Bác sĩ thêm dịch vụ vào đơn hàng ngày hôm qua (June 25th)
      const orderState = await addOrderItemUseCase.execute(orderDb.id, {
        serviceId: serviceDb.id,
        quantity: 1,
      });

      // The price should be 100,000 VND (active price on June 25th), NOT 150,000 VND (effective today June 26th)
      expect(orderState.items![0].price).toBe(100000);

      // Clean up
      const itemId = orderState.items![0].id;
      await deleteOrderItemUseCase.execute(orderDb.id, itemId);
      jest.useRealTimers();
    });
  });
});
