import {
  PATIENT_GENDER,
  STAFF_TITLE,
} from '../../../../common/constants/workflow.constants';

export enum BranchScopeMode {
  ALL = 'ALL',
  SPECIFIC = 'SPECIFIC',
}

export const DEFAULT_FAILED_LOGIN_LIMIT = 15;
export const DEFAULT_LOGIN_TIMEZONE = 'Asia/Ho_Chi_Minh';
export const USERNAME_PATTERN = /^[A-Za-z0-9._-]+$/;
export const PATIENT_ROLE_NAME = 'PATIENT';
export const DEFAULT_STAFF_ROLE_NAME = STAFF_TITLE.DOCTOR;
export const PATIENT_ROLE_DESCRIPTION = 'Patient portal account';
export const AUTH_ROLE_NAME = {
  ADMIN: 'ADMIN',
  DOCTOR: STAFF_TITLE.DOCTOR,
  RECEPTION: 'RECEPTION',
  NURSE: STAFF_TITLE.NURSE,
  TECHNICIAN: STAFF_TITLE.TECHNICIAN,
  PATIENT: PATIENT_ROLE_NAME,
  ACCOUNTANT: 'ACCOUNTANT',
} as const;
export const GOOGLE_TOKEN_INFO_URL = 'https://oauth2.googleapis.com/tokeninfo';
export const GOOGLE_TOKEN_ISSUERS = ['accounts.google.com', 'https://accounts.google.com'];
export const GOOGLE_CLIENT_ID_ENV_KEYS = [
  'GOOGLE_AUTH_CLIENT_ID',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_MAILER_CLIENT_ID',
];
export const DEFAULT_GOOGLE_PATIENT_DOB = '1900-01-01';
export const DEFAULT_GOOGLE_PATIENT_GENDER = PATIENT_GENDER.OTHER;
export const GOOGLE_PATIENT_PHONE_PREFIX = 'GOOGLE-';
export const PATIENT_CODE_PREFIX = 'BN';
export const PASSWORD_HASH_ROUNDS = 10;

export const MANAGED_USER_STATUS = {
  ACTIVE: 'ACTIVE',
  LOCKED: 'LOCKED',
} as const;

export type ManagedUserStatus =
  (typeof MANAGED_USER_STATUS)[keyof typeof MANAGED_USER_STATUS];
export type AuthRoleName = (typeof AUTH_ROLE_NAME)[keyof typeof AUTH_ROLE_NAME];

export const AUDIT_LOG_ACTION = {
  ADD_SERVICE: 'ADD_SERVICE',
  UPDATE_SERVICE: 'UPDATE_SERVICE',
  DELETE_SERVICE: 'DELETE_SERVICE',
  CHECK_IN: 'CHECK_IN',
  UPDATE_VITALS: 'UPDATE_VITALS',
  TRANSFER_ROOM: 'TRANSFER_ROOM',
  CONFIRM_RESULTS_WAIT: 'CONFIRM_RESULTS_WAIT',
  ACCEPT_PATIENT: 'ACCEPT_PATIENT',
  COMPLETE_PATIENT: 'COMPLETE_PATIENT',
} as const;

export const AUDIT_LOG_MODULE = {
  RECEPTION: 'RECEPTION',
  BILLING: 'BILLING',
  AUTH: 'AUTH',
} as const;

export type AuditLogAction = (typeof AUDIT_LOG_ACTION)[keyof typeof AUDIT_LOG_ACTION];
export type AuditLogModule = (typeof AUDIT_LOG_MODULE)[keyof typeof AUDIT_LOG_MODULE];
