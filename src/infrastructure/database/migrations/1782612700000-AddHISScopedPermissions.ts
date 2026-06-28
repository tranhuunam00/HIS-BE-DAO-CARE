import { MigrationInterface, QueryRunner } from "typeorm";

export class AddHISScopedPermissions1782612700000 implements MigrationInterface {
    name = 'AddHISScopedPermissions1782612700000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" ADD "can_register_patient" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" ADD "can_update_patient" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" ADD "can_delete_patient" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" ADD "can_manage_appointment" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" ADD "can_check_in" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" ADD "can_perform_exam" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" ADD "can_order_services" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" ADD "can_prescribe_medicine" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" ADD "can_conclude_exam" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" ADD "can_execute_laboratory" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" ADD "can_approve_result" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" ADD "can_collect_payment" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" ADD "can_refund_payment" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" ADD "can_view_financial_reports" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" ADD "can_view_clinical_reports" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" ADD "can_manage_pharmacy_stock" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" ADD "can_dispense_medicine" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" ADD "can_manage_schedules" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" ADD "can_manage_hr" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" ADD "can_configure_catalog" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" ADD "can_configure_system" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" DROP COLUMN "can_configure_system"`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" DROP COLUMN "can_configure_catalog"`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" DROP COLUMN "can_manage_hr"`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" DROP COLUMN "can_manage_schedules"`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" DROP COLUMN "can_dispense_medicine"`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" DROP COLUMN "can_manage_pharmacy_stock"`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" DROP COLUMN "can_view_clinical_reports"`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" DROP COLUMN "can_view_financial_reports"`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" DROP COLUMN "can_refund_payment"`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" DROP COLUMN "can_collect_payment"`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" DROP COLUMN "can_approve_result"`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" DROP COLUMN "can_execute_laboratory"`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" DROP COLUMN "can_conclude_exam"`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" DROP COLUMN "can_prescribe_medicine"`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" DROP COLUMN "can_order_services"`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" DROP COLUMN "can_perform_exam"`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" DROP COLUMN "can_check_in"`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" DROP COLUMN "can_manage_appointment"`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" DROP COLUMN "can_delete_patient"`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" DROP COLUMN "can_update_patient"`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" DROP COLUMN "can_register_patient"`);
    }
}
