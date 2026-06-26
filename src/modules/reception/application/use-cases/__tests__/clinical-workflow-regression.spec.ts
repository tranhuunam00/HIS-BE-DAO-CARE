import { BadRequestException } from '@nestjs/common';
import { PatientVisit } from '../../../domain/entities/patient-visit.model';
import {
  AcceptPatientUseCase,
  CompletePatientUseCase,
  ConfirmResultsWaitUseCase,
  TransferRoomUseCase,
} from '../patient-visit.use-cases';
import { AddOrderItemUseCase } from '../../../../billing/application/use-cases/add-order-item.use-case';
import { CreatePaymentUseCase } from '../../../../billing/application/use-cases/create-payment.use-case';
import { UpdateOrderItemUseCase } from '../../../../billing/application/use-cases/update-order-item.use-case';
import { Order } from '../../../../billing/domain/entities/order.model';
import { OrderItem } from '../../../../billing/domain/entities/order-item.model';
import {
  ORDER_ITEM_RESULT_STATUS,
  ORDER_ITEM_STATUS,
  ORDER_STATUS,
  PATIENT_VISIT_STATUS,
  PAYMENT_METHOD,
  SERVICE_PRICE_TYPE,
  STAFF_ATTENDANCE_STATUS,
  STAFF_TITLE,
  VISIT_PRIORITY,
} from '../../../../../common/constants/workflow.constants';

const now = new Date('2026-06-26T08:00:00.000Z');

function makeVisit(overrides: Partial<PatientVisit> = {}): PatientVisit {
  const base = {
    id: 'visit-1',
    visitCode: 'LK260626-0001',
    patientId: 'patient-1',
    branchId: 'branch-1',
    appointmentId: null,
    currentRoomId: null,
    currentDoctorId: null,
    currentNurseId: null,
    queueNumber: 1,
    priorityLevel: VISIT_PRIORITY.REGULAR,
    queueCode: 'W001',
    status: PATIENT_VISIT_STATUS.ADMITTED,
    reason: 'Kham tong quat',
    pulse: null,
    bloodPressure: null,
    temperature: null,
    weight: null,
    height: null,
    createdAt: now,
    updatedAt: now,
    patient: undefined,
    branch: undefined,
    currentRoom: undefined,
    currentDoctor: undefined,
    currentNurse: undefined,
    ...overrides,
  };

  return new PatientVisit(
    base.id,
    base.visitCode,
    base.patientId,
    base.branchId,
    base.appointmentId,
    base.currentRoomId,
    base.currentDoctorId,
    base.currentNurseId,
    base.queueNumber,
    base.priorityLevel,
    base.queueCode,
    base.status,
    base.reason,
    base.pulse,
    base.bloodPressure,
    base.temperature,
    base.weight,
    base.height,
    base.createdAt,
    base.updatedAt,
    base.patient,
    base.branch,
    base.currentRoom,
    base.currentDoctor,
    base.currentNurse,
  );
}

function makeVisitRepository(initialVisit = makeVisit()) {
  let currentVisit = initialVisit;

  return {
    findAll: jest.fn(),
    findByCode: jest.fn(),
    getNextQueueNumber: jest.fn(),
    getNextQueueCode: jest.fn(),
    countAll: jest.fn(),
    findById: jest.fn(async (id: string) =>
      id === currentVisit.id ? currentVisit : null,
    ),
    save: jest.fn(
      async (visitPatch: Partial<PatientVisit> & { id?: string }) => {
        currentVisit = makeVisit({
          ...currentVisit,
          ...visitPatch,
          id: visitPatch.id || currentVisit.id,
        });
        return currentVisit;
      },
    ),
    get current() {
      return currentVisit;
    },
  };
}

function makeOrderItem(overrides: Partial<OrderItem> = {}): OrderItem {
  const base = {
    id: 'item-1',
    orderId: 'order-1',
    serviceId: 'service-1',
    quantity: 1,
    price: 100000,
    status: ORDER_ITEM_STATUS.PENDING,
    createdAt: now,
    updatedAt: now,
    service: undefined,
    resultNotes: null,
    resultStatus: ORDER_ITEM_RESULT_STATUS.NONE,
    performedById: null,
    performedBy: undefined,
    ...overrides,
  };

  return new OrderItem(
    base.id,
    base.orderId,
    base.serviceId,
    base.quantity,
    base.price,
    base.status,
    base.createdAt,
    base.updatedAt,
    base.service,
    base.resultNotes,
    base.resultStatus,
    base.performedById,
    base.performedBy,
  );
}

function makeOrder(items: OrderItem[], overrides: Partial<Order> = {}): Order {
  const base = {
    id: 'order-1',
    orderCode: 'ORD-001',
    visitId: 'visit-1',
    patientId: 'patient-1',
    status: ORDER_STATUS.PENDING,
    totalAmount: items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    ),
    createdAt: now,
    updatedAt: now,
    visit: undefined,
    patient: undefined,
    items,
    ...overrides,
  };

  return new Order(
    base.id,
    base.orderCode,
    base.visitId,
    base.patientId,
    base.status,
    base.totalAmount,
    base.createdAt,
    base.updatedAt,
    base.visit,
    base.patient,
    base.items,
  );
}

function makeAddOrderItemHarness(initialVisitStatus: string) {
  let items: OrderItem[] = [];
  const visitEntity = { id: 'visit-1', status: initialVisitStatus };
  const orderRepository = {
    findById: jest.fn(async () => makeOrder(items)),
    saveItem: jest.fn(async (patch: Partial<OrderItem>) => {
      const item = makeOrderItem({ id: 'item-1', ...patch });
      items = [item];
      return item;
    }),
    save: jest.fn(async (order: Order) => makeOrder(order.items || items, order)),
  };
  const serviceRepository = {
    findOne: jest.fn(async () => ({
      id: 'service-1',
      prices: [{ priceType: SERVICE_PRICE_TYPE.LISTED, amount: 150000 }],
    })),
  };
  const visitRepository = {
    findOne: jest.fn(async () => visitEntity),
    save: jest.fn(async (visit: typeof visitEntity) => visit),
  };
  const useCase = new AddOrderItemUseCase(
    orderRepository as any,
    serviceRepository as any,
    visitRepository as any,
  );

  return { useCase, orderRepository, visitRepository, visitEntity };
}

describe('Clinical workflow regression from BE HTML flow', () => {
  describe('Role 1 - Dieu phoi / Le tan', () => {
    it('dispatches an admitted patient to a clinical room as WAITING_CLINICAL_EXAM by default', async () => {
      const visitRepository = makeVisitRepository(
        makeVisit({ status: PATIENT_VISIT_STATUS.ADMITTED }),
      );
      const attendanceRepository = {
        findOne: jest.fn(async () => ({
          staffId: 'doctor-1',
          isAcceptingPatients: true,
          staff: { title: STAFF_TITLE.DOCTOR },
        })),
        find: jest.fn(async () => [
          {
            staffId: 'doctor-1',
            isAcceptingPatients: true,
            staff: { title: STAFF_TITLE.DOCTOR },
          },
        ]),
      };
      const staffAssignmentRepository = {
        find: jest.fn(async () => [
          { staffId: 'doctor-1', roomId: 'clinic-room-1' },
        ]),
      };
      const useCase = new TransferRoomUseCase(
        visitRepository,
        attendanceRepository as any,
        staffAssignmentRepository as any,
      );

      const result = await useCase.execute('visit-1', {
        roomId: 'clinic-room-1',
        doctorId: 'doctor-1',
      });

      expect(result.currentRoomId).toBe('clinic-room-1');
      expect(result.currentDoctorId).toBe('doctor-1');
      expect(result.status).toBe(PATIENT_VISIT_STATUS.WAITING_CLINICAL_EXAM);
    });

    it('moves a visit from ALL_SERVICES_DONE to WAITING_RESULTS when coordinator confirms result wait', async () => {
      const visitRepository = makeVisitRepository(
        makeVisit({ status: PATIENT_VISIT_STATUS.ALL_SERVICES_DONE }),
      );
      const useCase = new ConfirmResultsWaitUseCase(visitRepository);

      const result = await useCase.execute('visit-1');

      expect(result.status).toBe(PATIENT_VISIT_STATUS.WAITING_RESULTS);
    });

    it('dispatches a patient with completed results back to the clinical room as WAITING_CONCLUSION', async () => {
      const visitRepository = makeVisitRepository(
        makeVisit({ status: PATIENT_VISIT_STATUS.WAITING_RESULTS }),
      );
      const attendanceRepository = {
        findOne: jest.fn(async () => ({
          staffId: 'doctor-1',
          isAcceptingPatients: true,
          staff: { title: STAFF_TITLE.DOCTOR },
        })),
        find: jest.fn(async () => [
          {
            staffId: 'doctor-1',
            isAcceptingPatients: true,
            staff: { title: STAFF_TITLE.DOCTOR },
          },
        ]),
      };
      const staffAssignmentRepository = {
        find: jest.fn(async () => [
          { staffId: 'doctor-1', roomId: 'clinic-room-1' },
        ]),
      };
      const useCase = new TransferRoomUseCase(
        visitRepository,
        attendanceRepository as any,
        staffAssignmentRepository as any,
      );

      const result = await useCase.execute('visit-1', {
        roomId: 'clinic-room-1',
        doctorId: 'doctor-1',
      });

      expect(result.status).toBe(PATIENT_VISIT_STATUS.WAITING_CONCLUSION);
      expect(result.currentRoomId).toBe('clinic-room-1');
      expect(result.currentDoctorId).toBe('doctor-1');
    });
  });

  describe('Role 2 - Bac si phong kham', () => {
    it('does not allow accepting a patient when the doctor has not checked in for the room', async () => {
      const visitRepository = makeVisitRepository(
        makeVisit({
          status: PATIENT_VISIT_STATUS.WAITING_CLINICAL_EXAM,
          currentRoomId: 'clinic-room-1',
          currentDoctorId: 'doctor-1',
        }),
      );
      const useCase = new AcceptPatientUseCase(visitRepository);

      await expect(useCase.execute('visit-1', 'doctor-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('moves a clinical patient into examination when the workflow state is valid', async () => {
      const visitRepository = makeVisitRepository(
        makeVisit({
          status: PATIENT_VISIT_STATUS.WAITING_CLINICAL_EXAM,
          currentRoomId: 'clinic-room-1',
          currentDoctorId: 'doctor-1',
        }),
      );
      const attendanceRepository = {
        findOne: jest.fn(async () => ({
          staffId: 'doctor-1',
          branchId: 'branch-1',
          date: new Date().toISOString().split('T')[0],
          status: STAFF_ATTENDANCE_STATUS.CHECKED_IN,
          isAcceptingPatients: true,
          staff: { title: STAFF_TITLE.DOCTOR },
        })),
      };
      const useCase = new AcceptPatientUseCase(
        visitRepository,
        attendanceRepository as any,
      );

      const result = await useCase.execute('visit-1', 'doctor-1');

      expect(result.status).toBe(PATIENT_VISIT_STATUS.IN_CLINICAL_EXAM);
      expect(result.currentDoctorId).toBe('doctor-1');
    });

    it('completes a clinical exam with pending CLS orders as CLINICAL_EXAM_DONE', async () => {
      const visitRepository = makeVisitRepository(
        makeVisit({
          status: PATIENT_VISIT_STATUS.IN_CLINICAL_EXAM,
          currentRoomId: 'clinic-room-1',
          currentDoctorId: 'doctor-1',
        }),
      );
      const orderRepository = {
        findByVisitId: jest.fn(async () =>
          makeOrder([makeOrderItem({ status: ORDER_ITEM_STATUS.PENDING })]),
        ),
      };
      const roomRepository = {
        findOne: jest.fn(async () => ({ id: 'coord-room-1' })),
      };
      const useCase = new CompletePatientUseCase(
        visitRepository,
        orderRepository as any,
        roomRepository as any,
      );

      const result = await useCase.execute('visit-1');

      expect(result.status).toBe(PATIENT_VISIT_STATUS.CLINICAL_EXAM_DONE);
      expect(result.currentRoomId).toBe('coord-room-1');
      expect(result.currentDoctorId).toBeNull();
    });

    it('completes a clinical exam without CLS orders immediately', async () => {
      const visitRepository = makeVisitRepository(
        makeVisit({
          status: PATIENT_VISIT_STATUS.IN_CLINICAL_EXAM,
          currentRoomId: 'clinic-room-1',
          currentDoctorId: 'doctor-1',
        }),
      );
      const orderRepository = {
        findByVisitId: jest.fn(async () => makeOrder([])),
      };
      const roomRepository = {
        findOne: jest.fn(),
      };
      const useCase = new CompletePatientUseCase(
        visitRepository,
        orderRepository as any,
        roomRepository as any,
      );

      const result = await useCase.execute('visit-1');

      expect(result.status).toBe(PATIENT_VISIT_STATUS.COMPLETED);
      expect(result.currentRoomId).toBe('clinic-room-1');
      expect(result.currentDoctorId).toBe('doctor-1');
    });

    it('moves a patient through conclusion after CLS results are returned', async () => {
      const visitRepository = makeVisitRepository(
        makeVisit({
          status: PATIENT_VISIT_STATUS.WAITING_CONCLUSION,
          currentRoomId: 'clinic-room-1',
          currentDoctorId: 'doctor-1',
        }),
      );
      const attendanceRepository = {
        findOne: jest.fn(async () => ({
          staffId: 'doctor-1',
          branchId: 'branch-1',
          date: new Date().toISOString().split('T')[0],
          status: STAFF_ATTENDANCE_STATUS.CHECKED_IN,
          isAcceptingPatients: true,
          staff: { title: STAFF_TITLE.DOCTOR },
        })),
      };
      const acceptUseCase = new AcceptPatientUseCase(
        visitRepository,
        attendanceRepository as any,
      );
      const completeUseCase = new CompletePatientUseCase(
        visitRepository,
        { findByVisitId: jest.fn() } as any,
        { findOne: jest.fn() } as any,
      );

      const accepted = await acceptUseCase.execute('visit-1', 'doctor-1');
      const completed = await completeUseCase.execute('visit-1');

      expect(accepted.status).toBe(PATIENT_VISIT_STATUS.IN_CONCLUSION);
      expect(completed.status).toBe(PATIENT_VISIT_STATUS.COMPLETED);
    });
  });

  describe('Role 3 - Thu ngan / CLS', () => {
    it('moves a direct service registration from ADMITTED to PENDING_PAYMENT', async () => {
      const { useCase, visitRepository, visitEntity } =
        makeAddOrderItemHarness(PATIENT_VISIT_STATUS.ADMITTED);

      await useCase.execute('order-1', {
        serviceId: 'service-1',
        quantity: 1,
      });

      expect(visitRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: PATIENT_VISIT_STATUS.PENDING_PAYMENT }),
      );
      expect(visitEntity.status).toBe(PATIENT_VISIT_STATUS.PENDING_PAYMENT);
    });

    it('keeps the visit in clinical examination when a doctor only adds pending CLS orders', async () => {
      const { useCase, visitRepository, visitEntity } =
        makeAddOrderItemHarness(PATIENT_VISIT_STATUS.IN_CLINICAL_EXAM);

      await useCase.execute('order-1', {
        serviceId: 'service-1',
        quantity: 1,
      });

      expect(visitRepository.save).not.toHaveBeenCalled();
      expect(visitEntity.status).toBe(PATIENT_VISIT_STATUS.IN_CLINICAL_EXAM);
    });

    it('does not put a paid visit into WAITING_SERVICE until CLS room and performer are dispatched', async () => {
      const visitEntity = { id: 'visit-1', status: PATIENT_VISIT_STATUS.PENDING_PAYMENT };
      const orderRepository = {
        findById: jest.fn(async () => makeOrder([makeOrderItem()])),
        save: jest.fn(async (order: Order) =>
          makeOrder(order.items || [], order),
        ),
      };
      const paymentRepository = {
        generatePaymentCode: jest.fn(async () => 'PAY-001'),
        save: jest.fn(async (payment: any) => ({
          id: 'payment-1',
          ...payment,
          paidAt: now,
          createdAt: now,
          updatedAt: now,
        })),
      };
      const visitRepository = {
        findOne: jest.fn(async () => visitEntity),
        save: jest.fn(async (visit: any) => visit),
      };
      const useCase = new (CreatePaymentUseCase as any)(
        paymentRepository,
        orderRepository,
        visitRepository,
      );

      await useCase.execute({
        orderId: 'order-1',
        amount: 100000,
        paymentMethod: PAYMENT_METHOD.CASH,
      });

      expect(orderRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: ORDER_STATUS.PAID }),
      );
      expect(visitRepository.save).not.toHaveBeenCalled();
      expect(visitEntity.status).toBe(PATIENT_VISIT_STATUS.PENDING_PAYMENT);
    });

    it('marks the visit ALL_SERVICES_DONE only after every ordered service is completed or cancelled', async () => {
      let item = makeOrderItem({ status: ORDER_ITEM_STATUS.PENDING });
      const orderRepository = {
        findById: jest.fn(async () => makeOrder([item])),
        findItemById: jest.fn(async () => item),
        saveItem: jest.fn(async (patch: Partial<OrderItem>) => {
          item = makeOrderItem({ ...item, ...patch });
          return item;
        }),
      };
      const visitEntity = { id: 'visit-1', status: PATIENT_VISIT_STATUS.WAITING_SERVICE };
      const visitRepository = {
        findOne: jest.fn(async () => visitEntity),
        save: jest.fn(async (visit: any) => visit),
      };
      const useCase = new UpdateOrderItemUseCase(
        orderRepository as any,
        visitRepository as any,
      );

      const result = await useCase.execute('order-1', 'item-1', {
        status: ORDER_ITEM_STATUS.COMPLETED,
        resultStatus: ORDER_ITEM_RESULT_STATUS.COMPLETED,
        resultNotes: 'Da thuc hien xong',
        performedById: 'doctor-cls-1',
      });

      expect(result.items?.[0]).toEqual(
        expect.objectContaining({
          status: ORDER_ITEM_STATUS.COMPLETED,
          resultStatus: ORDER_ITEM_RESULT_STATUS.COMPLETED,
          resultNotes: 'Da thuc hien xong',
          performedById: 'doctor-cls-1',
        }),
      );
      expect(visitEntity.status).toBe(PATIENT_VISIT_STATUS.ALL_SERVICES_DONE);
    });
  });
});
