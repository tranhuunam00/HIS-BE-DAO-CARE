import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBillingSchema1782355000000 implements MigrationInterface {
    name = 'AddBillingSchema1782355000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create orders table
        await queryRunner.query(`
            CREATE TABLE "his"."orders" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "order_code" character varying NOT NULL,
                "visit_id" uuid NOT NULL,
                "patient_id" uuid NOT NULL,
                "status" character varying NOT NULL DEFAULT 'PENDING',
                "total_amount" numeric(15,2) NOT NULL DEFAULT 0.00,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_orders_order_code" UNIQUE ("order_code"),
                CONSTRAINT "PK_orders_id" PRIMARY KEY ("id")
            )
        `);

        // Create order_items table
        await queryRunner.query(`
            CREATE TABLE "his"."order_items" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "order_id" uuid NOT NULL,
                "service_id" uuid NOT NULL,
                "quantity" integer NOT NULL DEFAULT 1,
                "price" numeric(15,2) NOT NULL DEFAULT 0.00,
                "status" character varying NOT NULL DEFAULT 'PENDING',
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_order_items_id" PRIMARY KEY ("id")
            )
        `);

        // Create payments table
        await queryRunner.query(`
            CREATE TABLE "his"."payments" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "payment_code" character varying NOT NULL,
                "order_id" uuid NOT NULL,
                "amount" numeric(15,2) NOT NULL,
                "payment_method" character varying NOT NULL,
                "status" character varying NOT NULL DEFAULT 'SUCCESS',
                "paid_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_payments_payment_code" UNIQUE ("payment_code"),
                CONSTRAINT "PK_payments_id" PRIMARY KEY ("id")
            )
        `);

        // Foreign keys for orders
        await queryRunner.query(`
            ALTER TABLE "his"."orders" 
            ADD CONSTRAINT "FK_orders_visit_id" 
            FOREIGN KEY ("visit_id") REFERENCES "his"."patient_visits"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "his"."orders" 
            ADD CONSTRAINT "FK_orders_patient_id" 
            FOREIGN KEY ("patient_id") REFERENCES "his"."patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        // Foreign keys for order_items
        await queryRunner.query(`
            ALTER TABLE "his"."order_items" 
            ADD CONSTRAINT "FK_order_items_order_id" 
            FOREIGN KEY ("order_id") REFERENCES "his"."orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "his"."order_items" 
            ADD CONSTRAINT "FK_order_items_service_id" 
            FOREIGN KEY ("service_id") REFERENCES "his"."services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        // Foreign keys for payments
        await queryRunner.query(`
            ALTER TABLE "his"."payments" 
            ADD CONSTRAINT "FK_payments_order_id" 
            FOREIGN KEY ("order_id") REFERENCES "his"."orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "his"."payments" DROP CONSTRAINT "FK_payments_order_id"`);
        await queryRunner.query(`ALTER TABLE "his"."order_items" DROP CONSTRAINT "FK_order_items_service_id"`);
        await queryRunner.query(`ALTER TABLE "his"."order_items" DROP CONSTRAINT "FK_order_items_order_id"`);
        await queryRunner.query(`ALTER TABLE "his"."orders" DROP CONSTRAINT "FK_orders_patient_id"`);
        await queryRunner.query(`ALTER TABLE "his"."orders" DROP CONSTRAINT "FK_orders_visit_id"`);
        
        await queryRunner.query(`DROP TABLE "his"."payments"`);
        await queryRunner.query(`DROP TABLE "his"."order_items"`);
        await queryRunner.query(`DROP TABLE "his"."orders"`);
    }
}
