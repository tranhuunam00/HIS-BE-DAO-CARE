import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveUnusedOrgColumns1782710000000 implements MigrationInterface {
    name = 'RemoveUnusedOrgColumns1782710000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "his"."organizations" DROP COLUMN IF EXISTS "language"`);
        await queryRunner.query(`ALTER TABLE "his"."organizations" DROP COLUMN IF EXISTS "timezone"`);
        await queryRunner.query(`ALTER TABLE "his"."organizations" DROP COLUMN IF EXISTS "country"`);
        await queryRunner.query(`ALTER TABLE "his"."organizations" DROP COLUMN IF EXISTS "default_currency"`);
        await queryRunner.query(`ALTER TABLE "his"."organizations" DROP COLUMN IF EXISTS "date_format"`);
        await queryRunner.query(`ALTER TABLE "his"."organizations" DROP COLUMN IF EXISTS "time_format"`);
        await queryRunner.query(`ALTER TABLE "his"."organizations" DROP COLUMN IF EXISTS "currency_format"`);
        await queryRunner.query(`ALTER TABLE "his"."organizations" DROP COLUMN IF EXISTS "otp_expiration_time"`);
        await queryRunner.query(`ALTER TABLE "his"."organizations" DROP COLUMN IF EXISTS "appointment_cancellation_limit"`);
        await queryRunner.query(`ALTER TABLE "his"."organizations" DROP COLUMN IF EXISTS "mrn_format"`);
        await queryRunner.query(`ALTER TABLE "his"."organizations" DROP COLUMN IF EXISTS "patient_code_format"`);
        await queryRunner.query(`ALTER TABLE "his"."organizations" DROP COLUMN IF EXISTS "visit_code_format"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "his"."organizations" ADD COLUMN "language" character varying NOT NULL DEFAULT 'vi'`);
        await queryRunner.query(`ALTER TABLE "his"."organizations" ADD COLUMN "timezone" character varying NOT NULL DEFAULT 'Asia/Ho_Chi_Minh'`);
        await queryRunner.query(`ALTER TABLE "his"."organizations" ADD COLUMN "country" character varying NOT NULL DEFAULT 'VN'`);
        await queryRunner.query(`ALTER TABLE "his"."organizations" ADD COLUMN "default_currency" character varying NOT NULL DEFAULT 'VND'`);
        await queryRunner.query(`ALTER TABLE "his"."organizations" ADD COLUMN "date_format" character varying NOT NULL DEFAULT 'YYYY-MM-DD'`);
        await queryRunner.query(`ALTER TABLE "his"."organizations" ADD COLUMN "time_format" character varying NOT NULL DEFAULT 'HH:mm:ss'`);
        await queryRunner.query(`ALTER TABLE "his"."organizations" ADD COLUMN "currency_format" character varying NOT NULL DEFAULT 'standard'`);
        await queryRunner.query(`ALTER TABLE "his"."organizations" ADD COLUMN "otp_expiration_time" integer NOT NULL DEFAULT 300`);
        await queryRunner.query(`ALTER TABLE "his"."organizations" ADD COLUMN "appointment_cancellation_limit" integer NOT NULL DEFAULT 24`);
        await queryRunner.query(`ALTER TABLE "his"."organizations" ADD COLUMN "mrn_format" character varying NOT NULL DEFAULT 'MRN-{YY}{MM}{DD}-{SEQ}'`);
        await queryRunner.query(`ALTER TABLE "his"."organizations" ADD COLUMN "patient_code_format" character varying NOT NULL DEFAULT 'PT-{YY}{MM}-{SEQ}'`);
        await queryRunner.query(`ALTER TABLE "his"."organizations" ADD COLUMN "visit_code_format" character varying NOT NULL DEFAULT 'VS-{YY}{MM}{DD}-{SEQ}'`);
    }
}
