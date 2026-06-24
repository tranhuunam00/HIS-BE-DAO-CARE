import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsAcceptingPatientsToStaffAttendance1782357000000 implements MigrationInterface {
    name = 'AddIsAcceptingPatientsToStaffAttendance1782357000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "his"."staff_attendances" 
            ADD COLUMN "is_accepting_patients" boolean NOT NULL DEFAULT true
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "his"."staff_attendances" 
            DROP COLUMN "is_accepting_patients"
        `);
    }
}
