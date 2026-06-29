import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DeleteOrderItemUseCase, IOrderRepositoryToken } from '../delete-order-item.use-case';
import { PatientVisitOrmEntity } from '../../../../reception/infrastructure/database/patient-visit.entity';
import { ORDER_ITEM_STATUS, PATIENT_VISIT_STATUS } from '../../../../../common/constants/workflow.constants';

describe('DeleteOrderItemUseCase', () => {
  let deleteOrderItemUseCase: DeleteOrderItemUseCase;
  let mockOrderRepository: any;
  let mockVisitRepository: any;

  const mockOrder = {
    id: 'order-1',
    orderCode: 'ORD0001',
    visitId: 'visit-1',
    patientId: 'patient-1',
    status: 'PENDING',
    totalAmount: 100000,
    items: [
      {
        id: 'item-1',
        orderId: 'order-1',
        serviceId: 'svc-1',
        quantity: 1,
        price: 100000,
        status: ORDER_ITEM_STATUS.PENDING,
        isPaid: false,
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
      findItemById: jest.fn(async (id) => mockOrder.items.find(i => i.id === id)),
      deleteItem: jest.fn(async () => {}),
      save: jest.fn(async (order) => order),
    };

    mockVisitRepository = {
      findOne: jest.fn(async () => mockVisit),
      save: jest.fn(async (visit) => visit),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteOrderItemUseCase,
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

    deleteOrderItemUseCase = module.get<DeleteOrderItemUseCase>(DeleteOrderItemUseCase);
  });

  it('should successfully delete a pending, unpaid order item', async () => {
    // Setup order with item-1
    const orderWithDeletedItem = {
      ...mockOrder,
      items: [], // mock it being deleted in DB
    };
    mockOrderRepository.findById
      .mockResolvedValueOnce(mockOrder) // first find
      .mockResolvedValueOnce(orderWithDeletedItem); // find after delete

    const result = await deleteOrderItemUseCase.execute('order-1', 'item-1');

    expect(mockOrderRepository.deleteItem).toHaveBeenCalledWith('item-1');
    expect(mockOrderRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'order-1',
        totalAmount: 0,
      })
    );
    expect(result.items).toHaveLength(0);
  });

  it('should throw NotFoundException if order does not exist', async () => {
    mockOrderRepository.findById.mockResolvedValue(null);

    await expect(
      deleteOrderItemUseCase.execute('invalid-order', 'item-1')
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException if item does not exist or belongs to another order', async () => {
    mockOrderRepository.findItemById.mockResolvedValue(null);

    await expect(
      deleteOrderItemUseCase.execute('order-1', 'invalid-item')
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if item status is not PENDING', async () => {
    const nonPendingItem = {
      id: 'item-1',
      orderId: 'order-1',
      status: ORDER_ITEM_STATUS.IN_PROGRESS,
      isPaid: false,
    };
    mockOrderRepository.findItemById.mockResolvedValue(nonPendingItem);

    await expect(
      deleteOrderItemUseCase.execute('order-1', 'item-1')
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException if item is already paid (Boundary Case)', async () => {
    const paidItem = {
      id: 'item-1',
      orderId: 'order-1',
      status: ORDER_ITEM_STATUS.PENDING,
      isPaid: true, // paid item
    };
    mockOrderRepository.findItemById.mockResolvedValue(paidItem);

    await expect(
      deleteOrderItemUseCase.execute('order-1', 'item-1')
    ).rejects.toThrow(BadRequestException);
  });
});
