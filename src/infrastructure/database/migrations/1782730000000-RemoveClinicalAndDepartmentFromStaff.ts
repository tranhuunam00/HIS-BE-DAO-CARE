import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveClinicalAndDepartmentFromStaff1782730000000 implements MigrationInterface {
    name = 'RemoveClinicalAndDepartmentFromStaff1782730000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints first if they exist
        await queryRunner.query(`ALTER TABLE "his"."staff" DROP CONSTRAINT IF EXISTS "FK_d3ea48cd1ab65b16cd3d5fcd2c2"`);
        await queryRunner.query(`ALTER TABLE "his"."staff" DROP CONSTRAINT IF EXISTS "FK_staff_department"`);
        
        // Let's drop columns
        await queryRunner.query(`ALTER TABLE "his"."staff" DROP COLUMN IF EXISTS "is_clinical"`);
        await queryRunner.query(`ALTER TABLE "his"."staff" DROP COLUMN IF EXISTS "department_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "his"."staff" ADD COLUMN "is_clinical" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "his"."staff" ADD COLUMN "department_id" uuid`);
        await queryRunner.query(`ALTER TABLE "his"."staff" ADD CONSTRAINT "FK_d3ea48cd1ab65b16cd3d5fcd2c2" FOREIGN KEY ("department_id") REFERENCES "his"."departments"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }
}
