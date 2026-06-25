import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPerformedByIdToOrderItem1782356974952 implements MigrationInterface {
    name = 'AddPerformedByIdToOrderItem1782356974952'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "his"."order_items" ADD "performed_by_id" uuid`);
        await queryRunner.query(`ALTER TABLE "his"."order_items" ADD CONSTRAINT "FK_e7d0cfaedf5d8a3e44db9222270" FOREIGN KEY ("performed_by_id") REFERENCES "his"."staff"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "his"."order_items" DROP CONSTRAINT "FK_e7d0cfaedf5d8a3e44db9222270"`);
        await queryRunner.query(`ALTER TABLE "his"."order_items" DROP COLUMN "performed_by_id"`);
    }

}
