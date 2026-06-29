import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { UpdateOrderItemUseCase, IOrderRepositoryToken } from '../update-order-item.use-case';
import { PatientVisitOrmEntity } from '../../../../reception/infrastructure/database/patient-visit.entity';
import { ORDER_ITEM_STATUS, PATIENT_VISIT_STATUS } from '../../../../../common/constants/workflow.constants';

describe('UpdateOrderItemUseCase', () => {
  let updateOrderItemUseCase: UpdateOrderItemUseCase;
  let mockOrderRepository: any;
  let mockVisitRepository: any;

  const mockOrder = {
    id: 'order-1',
    orderCode: 'ORD0001',
    visitId: 'visit-1',
    patientId: 'patient-1',
    status: 'PAID',
    totalAmount: 100000,
    items: [
      {
        id: 'item-1',
        orderId: 'order-1',
        serviceId: 'svc-1',
        quantity: 1,
        price: 100000,
        status: ORDER_ITEM_STATUS.IN_PROGRESS,
        isPaid: true,
        resultStatus: 'NONE',
      },
    ],
  };

  const mockVisit = {
    id: 'visit-1',
    status: PATIENT_VISIT_STATUS.WAITING_SERVICE,
  };

  beforeEach(async () => {
    mockOrderRepository = {
      findById: jest.fn(async () => mockOrder),
      saveItem: jest.fn(async (item) => item),
    };

    mockVisitRepository = {
      findOne: jest.fn(async () => mockVisit),
      save: jest.fn(async (visit) => visit),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateOrderItemUseCase,
        {
          provide: IOrderRepositoryToken,
          useValue: mockOrderRepository,
        },
        {
          provide: getRepositoryToken(PatientVisitOrmEntity),
          useValue: mockVisitRepository,
        },
      ],
    }).compile();

    updateOrderItemUseCase = module.get<UpdateOrderItemUseCase>(UpdateOrderItemUseCase);
  });

  it('should successfully update item to COMPLETED and update visit status to ALL_SERVICES_DONE', async () => {
    const completedItem = {
      id: 'item-1',
      orderId: 'order-1',
      status: ORDER_ITEM_STATUS.COMPLETED,
      resultStatus: 'COMPLETED',
      isPaid: true,
    };
    mockOrderRepository.findById
      .mockResolvedValueOnce(mockOrder) // first load
      .mockResolvedValueOnce({
        ...mockOrder,
        items: [completedItem],
      });

    mockVisit.status = PATIENT_VISIT_STATUS.WAITING_SERVICE;

    const result = await updateOrderItemUseCase.execute('order-1', 'item-1', {
      status: ORDER_ITEM_STATUS.COMPLETED,
      resultStatus: 'COMPLETED',
    });

    expect(mockOrderRepository.saveItem).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'item-1',
        status: ORDER_ITEM_STATUS.COMPLETED,
        resultStatus: 'COMPLETED',
      })
    );
    expect(mockVisitRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'visit-1',
        status: PATIENT_VISIT_STATUS.ALL_SERVICES_DONE,
      })
    );
  });

  it('should NOT update visit status to ALL_SERVICES_DONE if resultStatus is updated to PENDING (Boundary Case)', async () => {
    const completedPendingResultItem = {
      id: 'item-1',
      orderId: 'order-1',
      status: ORDER_ITEM_STATUS.COMPLETED,
      resultStatus: 'PENDING', // Trả sau
      isPaid: true,
    };
    mockOrderRepository.findById
      .mockResolvedValueOnce(mockOrder)
      .mockResolvedValueOnce({
        ...mockOrder,
        items: [completedPendingResultItem],
      });

    mockVisit.status = PATIENT_VISIT_STATUS.IN_SERVICE;
    mockVisitRepository.save.mockClear();

    await updateOrderItemUseCase.execute('order-1', 'item-1', {
      status: ORDER_ITEM_STATUS.COMPLETED,
      resultStatus: 'PENDING',
    });

    expect(mockVisitRepository.save).not.toHaveBeenCalled();
    expect(mockVisit.status).not.toBe(PATIENT_VISIT_STATUS.ALL_SERVICES_DONE);
  });

  it('should successfully update visit status to ALL_SERVICES_DONE when resultStatus transitions from PENDING to COMPLETED', async () => {
    const originalPendingItem = {
      id: 'item-1',
      orderId: 'order-1',
      status: ORDER_ITEM_STATUS.COMPLETED,
      resultStatus: 'PENDING',
      isPaid: true,
    };
    const completedItem = {
      id: 'item-1',
      orderId: 'order-1',
      status: ORDER_ITEM_STATUS.COMPLETED,
      resultStatus: 'COMPLETED',
      isPaid: true,
    };
    
    mockOrderRepository.findById
      .mockResolvedValueOnce({
        ...mockOrder,
        items: [originalPendingItem],
      })
      .mockResolvedValueOnce({
        ...mockOrder,
        items: [completedItem],
      });

    mockVisit.status = PATIENT_VISIT_STATUS.WAITING_SERVICE;
    mockVisitRepository.save.mockClear();

    await updateOrderItemUseCase.execute('order-1', 'item-1', {
      status: ORDER_ITEM_STATUS.COMPLETED,
      resultStatus: 'COMPLETED',
    });

    expect(mockVisitRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'visit-1',
        status: PATIENT_VISIT_STATUS.ALL_SERVICES_DONE,
      })
    );
  });
});
