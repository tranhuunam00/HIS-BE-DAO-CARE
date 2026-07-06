import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsGuestToAppointments1783311856966 implements MigrationInterface {
    name = 'AddIsGuestToAppointments1783311856966'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "his"."appointments" ADD "is_guest" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "his"."appointments" DROP COLUMN "is_guest"`);
    }

}
