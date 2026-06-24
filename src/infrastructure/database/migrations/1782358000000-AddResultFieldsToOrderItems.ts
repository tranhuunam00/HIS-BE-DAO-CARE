import { MigrationInterface, QueryRunner } from "typeorm";

export class AddResultFieldsToOrderItems1782358000000 implements MigrationInterface {
    name = 'AddResultFieldsToOrderItems1782358000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "his"."order_items" 
            ADD "result_notes" text,
            ADD "result_status" character varying NOT NULL DEFAULT 'NONE'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "his"."order_items" 
            DROP COLUMN "result_notes",
            DROP COLUMN "result_status"
        `);
    }
}
