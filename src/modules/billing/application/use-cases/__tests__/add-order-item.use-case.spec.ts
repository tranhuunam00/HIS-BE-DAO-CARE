import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddOrderItemUseCase, IOrderRepositoryToken } from '../add-order-item.use-case';
import { ServiceOrmEntity } from '../../../../medical/infrastructure/database/service.entity';
import { PatientVisitOrmEntity } from '../../../../reception/infrastructure/database/patient-visit.entity';
import { ORDER_ITEM_STATUS, PATIENT_VISIT_STATUS } from '../../../../../common/constants/workflow.constants';

describe('AddOrderItemUseCase - Pricing Effective Date', () => {
  let addOrderItemUseCase: AddOrderItemUseCase;
  let mockOrderRepository: any;
  let mockServiceRepository: any;
  let mockVisitRepository: any;

  const mockOrder = {
    id: 'order-1',
    orderCode: 'ORD0001',
    visitId: 'visit-1',
    patientId: 'patient-1',
    status: 'PENDING',
    totalAmount: 0,
    items: [],
  };

  const mockVisit = {
    id: 'visit-1',
    status: PATIENT_VISIT_STATUS.ADMITTED,
  };

  beforeEach(async () => {
    mockOrderRepository = {
      findById: jest.fn(async () => mockOrder),
      saveItem: jest.fn(async () => {}),
      save: jest.fn(async (order) => order),
    };

    mockServiceRepository = {
      findOne: jest.fn(),
    };

    mockVisitRepository = {
      findOne: jest.fn(async () => mockVisit),
      save: jest.fn(async (visit) => visit),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddOrderItemUseCase,
        {
          provide: IOrderRepositoryToken,
          useValue: mockOrderRepository,
        },
        {
          provide: getRepositoryToken(ServiceOrmEntity),
          useValue: mockServiceRepository,
        },
        {
          provide: getRepositoryToken(PatientVisitOrmEntity),
          useValue: mockVisitRepository,
        },
      ],
    }).compile();

    addOrderItemUseCase = module.get<AddOrderItemUseCase>(AddOrderItemUseCase);
  });

  it('should use the correct active price based on effective date (ignoring future prices)', async () => {
    // Setup target date of today: 2026-06-26
    const today = new Date('2026-06-26T12:00:00Z');
    jest.useFakeTimers().setSystemTime(today);

    // Mock service prices: 
    // - One active price from 2026-06-01 (100,000 VND)
    // - One future price effective on 2026-07-01 (150,000 VND)
    const mockService = {
      id: 'svc-1',
      code: 'SVC_TEST',
      name: 'Service Test',
      prices: [
        {
          priceType: 'LISTED',
          amount: 100000,
          effectiveDate: new Date('2026-06-01'),
        },
        {
          priceType: 'LISTED',
          amount: 150000,
          effectiveDate: new Date('2026-07-01'),
        },
      ],
    };

    mockServiceRepository.findOne.mockResolvedValue(mockService);

    await addOrderItemUseCase.execute('order-1', {
      serviceId: 'svc-1',
      quantity: 1,
    });

    // Check that it chose the active price (100,000) instead of the future price (150,000)
    expect(mockOrderRepository.saveItem).toHaveBeenCalledWith(
      expect.objectContaining({
        price: 100000,
      })
    );

    jest.useRealTimers();
  });

  it('should use the most recent active price when multiple past prices are eligible', async () => {
    const today = new Date('2026-06-26T12:00:00Z');
    jest.useFakeTimers().setSystemTime(today);

    // Mock service prices: 
    // - Older active price from 2026-06-01 (100,000 VND)
    // - Newer active price from 2026-06-20 (120,000 VND)
    // - Future price effective on 2026-07-01 (150,000 VND)
    const mockService = {
      id: 'svc-1',
      code: 'SVC_TEST',
      name: 'Service Test',
      prices: [
        {
          priceType: 'LISTED',
          amount: 100000,
          effectiveDate: new Date('2026-06-01'),
        },
        {
          priceType: 'LISTED',
          amount: 120000,
          effectiveDate: new Date('2026-06-20'),
        },
        {
          priceType: 'LISTED',
          amount: 150000,
          effectiveDate: new Date('2026-07-01'),
        },
      ],
    };

    mockServiceRepository.findOne.mockResolvedValue(mockService);

    await addOrderItemUseCase.execute('order-1', {
      serviceId: 'svc-1',
      quantity: 1,
    });

    // Check that it chose the most recent active price (120,000)
    expect(mockOrderRepository.saveItem).toHaveBeenCalledWith(
      expect.objectContaining({
        price: 120000,
      })
    );

    jest.useRealTimers();
  });
});
