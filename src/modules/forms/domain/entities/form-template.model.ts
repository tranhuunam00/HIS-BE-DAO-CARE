export class FormTemplate {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly code: string,
    public readonly type: string, // 'PRINT_TEMPLATE' | 'CLINICAL_TEMPLATE' | 'ADMINISTRATIVE_TEMPLATE'
    public readonly category: string, // 'INVOICE' | 'PRESCRIPTION' | 'LAB_RESULT' | 'ULTRASOUND_RESULT' | 'SOAP'
    public readonly htmlContent: string,
    public readonly description: string | null,
    public readonly isActive: boolean,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
