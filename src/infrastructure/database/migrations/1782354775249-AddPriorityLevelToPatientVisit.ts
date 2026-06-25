import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPriorityLevelToPatientVisit1782354775249 implements MigrationInterface {
    name = 'AddPriorityLevelToPatientVisit1782354775249'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "his"."orders" DROP CONSTRAINT "FK_orders_patient_id"`);
        await queryRunner.query(`ALTER TABLE "his"."orders" DROP CONSTRAINT "FK_orders_visit_id"`);
        await queryRunner.query(`ALTER TABLE "his"."order_items" DROP CONSTRAINT "FK_order_items_order_id"`);
        await queryRunner.query(`ALTER TABLE "his"."order_items" DROP CONSTRAINT "FK_order_items_service_id"`);
        await queryRunner.query(`ALTER TABLE "his"."payments" DROP CONSTRAINT "FK_payments_order_id"`);
        await queryRunner.query(`ALTER TABLE "his"."staff_attendances" DROP CONSTRAINT "FK_staff_attendances_branch_id"`);
        await queryRunner.query(`ALTER TABLE "his"."staff_attendances" DROP CONSTRAINT "FK_staff_attendances_shift_id"`);
        await queryRunner.query(`ALTER TABLE "his"."staff_attendances" DROP CONSTRAINT "FK_staff_attendances_staff_id"`);
        await queryRunner.query(`ALTER TABLE "his"."patient_visits" ADD "priority_level" character varying NOT NULL DEFAULT 'REGULAR'`);
        await queryRunner.query(`ALTER TABLE "his"."patient_visits" ADD "queue_code" character varying`);
        await queryRunner.query(`ALTER TABLE "his"."orders" ALTER COLUMN "total_amount" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "his"."order_items" ALTER COLUMN "price" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "his"."orders" ADD CONSTRAINT "FK_74df0e55b9805db3a83046d5801" FOREIGN KEY ("visit_id") REFERENCES "his"."patient_visits"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."orders" ADD CONSTRAINT "FK_31ac5021b328302fba17544ff9c" FOREIGN KEY ("patient_id") REFERENCES "his"."patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."order_items" ADD CONSTRAINT "FK_145532db85752b29c57d2b7b1f1" FOREIGN KEY ("order_id") REFERENCES "his"."orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."order_items" ADD CONSTRAINT "FK_4b7bcdfcab38cf99bc8ded5c48a" FOREIGN KEY ("service_id") REFERENCES "his"."services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."payments" ADD CONSTRAINT "FK_b2f7b823a21562eeca20e72b006" FOREIGN KEY ("order_id") REFERENCES "his"."orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."staff_attendances" ADD CONSTRAINT "FK_27e20c5706c665a5af92f1149ef" FOREIGN KEY ("staff_id") REFERENCES "his"."staff"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."staff_attendances" ADD CONSTRAINT "FK_c6d61c30b461d6a935c36514304" FOREIGN KEY ("branch_id") REFERENCES "his"."branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."staff_attendances" ADD CONSTRAINT "FK_9b2221f6f5e02aa96a46ae5dc74" FOREIGN KEY ("shift_id") REFERENCES "his"."shifts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "his"."staff_attendances" DROP CONSTRAINT "FK_9b2221f6f5e02aa96a46ae5dc74"`);
        await queryRunner.query(`ALTER TABLE "his"."staff_attendances" DROP CONSTRAINT "FK_c6d61c30b461d6a935c36514304"`);
        await queryRunner.query(`ALTER TABLE "his"."staff_attendances" DROP CONSTRAINT "FK_27e20c5706c665a5af92f1149ef"`);
        await queryRunner.query(`ALTER TABLE "his"."payments" DROP CONSTRAINT "FK_b2f7b823a21562eeca20e72b006"`);
        await queryRunner.query(`ALTER TABLE "his"."order_items" DROP CONSTRAINT "FK_4b7bcdfcab38cf99bc8ded5c48a"`);
        await queryRunner.query(`ALTER TABLE "his"."order_items" DROP CONSTRAINT "FK_145532db85752b29c57d2b7b1f1"`);
        await queryRunner.query(`ALTER TABLE "his"."orders" DROP CONSTRAINT "FK_31ac5021b328302fba17544ff9c"`);
        await queryRunner.query(`ALTER TABLE "his"."orders" DROP CONSTRAINT "FK_74df0e55b9805db3a83046d5801"`);
        await queryRunner.query(`ALTER TABLE "his"."order_items" ALTER COLUMN "price" SET DEFAULT 0.00`);
        await queryRunner.query(`ALTER TABLE "his"."orders" ALTER COLUMN "total_amount" SET DEFAULT 0.00`);
        await queryRunner.query(`ALTER TABLE "his"."patient_visits" DROP COLUMN "queue_code"`);
        await queryRunner.query(`ALTER TABLE "his"."patient_visits" DROP COLUMN "priority_level"`);
        await queryRunner.query(`ALTER TABLE "his"."staff_attendances" ADD CONSTRAINT "FK_staff_attendances_staff_id" FOREIGN KEY ("staff_id") REFERENCES "his"."staff"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."staff_attendances" ADD CONSTRAINT "FK_staff_attendances_shift_id" FOREIGN KEY ("shift_id") REFERENCES "his"."shifts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."staff_attendances" ADD CONSTRAINT "FK_staff_attendances_branch_id" FOREIGN KEY ("branch_id") REFERENCES "his"."branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."payments" ADD CONSTRAINT "FK_payments_order_id" FOREIGN KEY ("order_id") REFERENCES "his"."orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."order_items" ADD CONSTRAINT "FK_order_items_service_id" FOREIGN KEY ("service_id") REFERENCES "his"."services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."order_items" ADD CONSTRAINT "FK_order_items_order_id" FOREIGN KEY ("order_id") REFERENCES "his"."orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."orders" ADD CONSTRAINT "FK_orders_visit_id" FOREIGN KEY ("visit_id") REFERENCES "his"."patient_visits"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."orders" ADD CONSTRAINT "FK_orders_patient_id" FOREIGN KEY ("patient_id") REFERENCES "his"."patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
