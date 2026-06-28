import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsPaidToOrderItem1782613000000 implements MigrationInterface {
  name = 'AddIsPaidToOrderItem1782613000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add isPaid column to order_items
    await queryRunner.query(`
      ALTER TABLE "his"."order_items"
      ADD COLUMN IF NOT EXISTS "is_paid" BOOLEAN NOT NULL DEFAULT FALSE
    `);

    // Mark existing items of PAID orders as already paid
    await queryRunner.query(`
      UPDATE "his"."order_items" oi
      SET "is_paid" = TRUE
      FROM "his"."orders" o
      WHERE oi.order_id = o.id
        AND o.status = 'PAID'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "his"."order_items"
      DROP COLUMN IF EXISTS "is_paid"
    `);
  }
}
