export const PATIENT_VISIT_STATUS = {
  ADMITTED: 'ADMITTED',
  WAITING: 'WAITING',
  WAITING_CLINICAL_EXAM: 'WAITING_CLINICAL_EXAM',
  IN_CLINICAL_EXAM: 'IN_CLINICAL_EXAM',
  CLINICAL_EXAM_DONE: 'CLINICAL_EXAM_DONE',
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  WAITING_SERVICE: 'WAITING_SERVICE',
  IN_SERVICE: 'IN_SERVICE',
  ALL_SERVICES_DONE: 'ALL_SERVICES_DONE',
  WAITING_RESULTS: 'WAITING_RESULTS',
  WAITING_CONCLUSION: 'WAITING_CONCLUSION',
  IN_CONCLUSION: 'IN_CONCLUSION',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export const VISIT_PRIORITY = {
  EMERGENCY: 'EMERGENCY',
  PRIORITY: 'PRIORITY',
  REGULAR: 'REGULAR',
} as const;

export const APPOINTMENT_STATUS = {
  BOOKED: 'BOOKED',
  CONFIRMED: 'CONFIRMED',
  CHECKED_IN: 'CHECKED_IN',
  CANCELLED: 'CANCELLED',
} as const;

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
} as const;

export const ORDER_ITEM_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export const ORDER_ITEM_RESULT_STATUS = {
  NONE: 'NONE',
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
} as const;

export const PAYMENT_STATUS = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
} as const;

export const PAYMENT_METHOD = {
  CASH: 'CASH',
  TRANSFER: 'TRANSFER',
  CARD: 'CARD',
} as const;

export const STAFF_ATTENDANCE_STATUS = {
  CHECKED_IN: 'CHECKED_IN',
  CHECKED_OUT: 'CHECKED_OUT',
} as const;

export const SCHEDULE_OVERRIDE_TYPE = {
  LEAVE: 'LEAVE',
  WORK: 'WORK',
} as const;

export const STAFF_TITLE = {
  DOCTOR: 'DOCTOR',
  NURSE: 'NURSE',
  TECHNICIAN: 'TECHNICIAN',
  RECEPTIONIST: 'RECEPTIONIST',
  ADMINISTRATOR: 'ADMINISTRATOR',
  OTHER: 'OTHER',
} as const;

export const PATIENT_GENDER = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER',
} as const;

export const ROOM_TYPE = {
  CLINIC: 'CLINIC',
  TREATMENT: 'TREATMENT',
  PROCEDURE: 'PROCEDURE',
  LABORATORY: 'LABORATORY',
  IMAGING: 'IMAGING',
  RECEPTION: 'RECEPTION',
  ACCOUNTING: 'ACCOUNTING',
} as const;

export const BRANCH_TYPE = {
  CLINIC: 'CLINIC',
} as const;

export const SERVICE_CATEGORY = {
  EXAMINATION: 'EXAMINATION',
  LAB_TEST: 'LAB_TEST',
  IMAGING: 'IMAGING',
  PROCEDURE: 'PROCEDURE',
  SURGERY: 'SURGERY',
  THERAPY: 'THERAPY',
} as const;

export const SERVICE_PRICE_TYPE = {
  LISTED: 'LISTED',
  INSURANCE: 'INSURANCE',
  VIP: 'VIP',
} as const;

export const MEDICATION_ROUTE = {
  ORAL: 'ORAL',
  INJECTION: 'INJECTION',
  TOPICAL: 'TOPICAL',
  INHALATION: 'INHALATION',
  OTHER: 'OTHER',
} as const;

export const FORM_TEMPLATE_TYPE = {
  PRINT_TEMPLATE: 'PRINT_TEMPLATE',
  CLINICAL_TEMPLATE: 'CLINICAL_TEMPLATE',
  ADMINISTRATIVE_TEMPLATE: 'ADMINISTRATIVE_TEMPLATE',
} as const;

export const FORM_TEMPLATE_CATEGORY = {
  INVOICE: 'INVOICE',
  PRESCRIPTION: 'PRESCRIPTION',
  LAB_RESULT: 'LAB_RESULT',
  ULTRASOUND_RESULT: 'ULTRASOUND_RESULT',
  SOAP: 'SOAP',
} as const;

export type PatientVisitStatus =
  (typeof PATIENT_VISIT_STATUS)[keyof typeof PATIENT_VISIT_STATUS];
export type VisitPriority = (typeof VISIT_PRIORITY)[keyof typeof VISIT_PRIORITY];
export type AppointmentStatus =
  (typeof APPOINTMENT_STATUS)[keyof typeof APPOINTMENT_STATUS];
export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
export type OrderItemStatus =
  (typeof ORDER_ITEM_STATUS)[keyof typeof ORDER_ITEM_STATUS];
export type OrderItemResultStatus =
  (typeof ORDER_ITEM_RESULT_STATUS)[keyof typeof ORDER_ITEM_RESULT_STATUS];
export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];
export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];
export type StaffAttendanceStatus =
  (typeof STAFF_ATTENDANCE_STATUS)[keyof typeof STAFF_ATTENDANCE_STATUS];
export type ScheduleOverrideType =
  (typeof SCHEDULE_OVERRIDE_TYPE)[keyof typeof SCHEDULE_OVERRIDE_TYPE];
export type StaffTitle = (typeof STAFF_TITLE)[keyof typeof STAFF_TITLE];
export type PatientGender = (typeof PATIENT_GENDER)[keyof typeof PATIENT_GENDER];
export type RoomType = (typeof ROOM_TYPE)[keyof typeof ROOM_TYPE];
export type BranchType = (typeof BRANCH_TYPE)[keyof typeof BRANCH_TYPE];
export type ServiceCategory =
  (typeof SERVICE_CATEGORY)[keyof typeof SERVICE_CATEGORY];
export type ServicePriceType =
  (typeof SERVICE_PRICE_TYPE)[keyof typeof SERVICE_PRICE_TYPE];
export type MedicationRoute =
  (typeof MEDICATION_ROUTE)[keyof typeof MEDICATION_ROUTE];
export type FormTemplateType =
  (typeof FORM_TEMPLATE_TYPE)[keyof typeof FORM_TEMPLATE_TYPE];
export type FormTemplateCategory =
  (typeof FORM_TEMPLATE_CATEGORY)[keyof typeof FORM_TEMPLATE_CATEGORY];
