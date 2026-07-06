import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPhoneToAppointments1783310689894 implements MigrationInterface {
    name = 'AddPhoneToAppointments1783310689894'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" DROP CONSTRAINT "FK_scoped_permissions_branch"`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" DROP CONSTRAINT "FK_scoped_permissions_role"`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" DROP CONSTRAINT "FK_scoped_permissions_user"`);
        await queryRunner.query(`ALTER TABLE "his"."room_service_capabilities" DROP CONSTRAINT "FK_room_service_capabilities_room"`);
        await queryRunner.query(`ALTER TABLE "his"."room_service_capabilities" DROP CONSTRAINT "FK_room_service_capabilities_service"`);
        await queryRunner.query(`ALTER TABLE "his"."staff_schedule_overrides" DROP CONSTRAINT "FK_staff_schedule_overrides_room"`);
        await queryRunner.query(`ALTER TABLE "his"."staff_schedule_templates" DROP CONSTRAINT "FK_staff_schedule_templates_room"`);
        await queryRunner.query(`CREATE TABLE "his"."resources" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "room_id" character varying NOT NULL, "name" character varying NOT NULL, "code" character varying NOT NULL, "type" character varying NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "is_occupied" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_b7ab912cd81e4b447e43d45e382" UNIQUE ("code"), CONSTRAINT "PK_632484ab9dff41bba94f9b7c85e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "his"."appointments" ADD "phone" character varying`);
        await queryRunner.query(`ALTER TABLE "his"."staff" ALTER COLUMN "email" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" ADD CONSTRAINT "FK_1dc68a537dbacc5fbbb2069cbc3" FOREIGN KEY ("user_id") REFERENCES "his"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" ADD CONSTRAINT "FK_b33cdd73121633143d46a8ec780" FOREIGN KEY ("role_id") REFERENCES "his"."roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" ADD CONSTRAINT "FK_62bc3295805469e7abeaa658d6e" FOREIGN KEY ("branch_id") REFERENCES "his"."branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."room_service_capabilities" ADD CONSTRAINT "FK_4628174fb064f84ce846aaa2f15" FOREIGN KEY ("room_id") REFERENCES "his"."rooms"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."room_service_capabilities" ADD CONSTRAINT "FK_0331ccb21f86067efd687cac9b0" FOREIGN KEY ("service_id") REFERENCES "his"."services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."staff_schedule_overrides" ADD CONSTRAINT "FK_c827bff03c8b742d9a3ee051dff" FOREIGN KEY ("room_id") REFERENCES "his"."rooms"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."staff_schedule_templates" ADD CONSTRAINT "FK_2e5fde375d5fb76fc93964cee17" FOREIGN KEY ("room_id") REFERENCES "his"."rooms"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "his"."staff_schedule_templates" DROP CONSTRAINT "FK_2e5fde375d5fb76fc93964cee17"`);
        await queryRunner.query(`ALTER TABLE "his"."staff_schedule_overrides" DROP CONSTRAINT "FK_c827bff03c8b742d9a3ee051dff"`);
        await queryRunner.query(`ALTER TABLE "his"."room_service_capabilities" DROP CONSTRAINT "FK_0331ccb21f86067efd687cac9b0"`);
        await queryRunner.query(`ALTER TABLE "his"."room_service_capabilities" DROP CONSTRAINT "FK_4628174fb064f84ce846aaa2f15"`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" DROP CONSTRAINT "FK_62bc3295805469e7abeaa658d6e"`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" DROP CONSTRAINT "FK_b33cdd73121633143d46a8ec780"`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" DROP CONSTRAINT "FK_1dc68a537dbacc5fbbb2069cbc3"`);
        await queryRunner.query(`ALTER TABLE "his"."staff" ALTER COLUMN "email" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "his"."appointments" DROP COLUMN "phone"`);
        await queryRunner.query(`DROP TABLE "his"."resources"`);
        await queryRunner.query(`ALTER TABLE "his"."staff_schedule_templates" ADD CONSTRAINT "FK_staff_schedule_templates_room" FOREIGN KEY ("room_id") REFERENCES "his"."rooms"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."staff_schedule_overrides" ADD CONSTRAINT "FK_staff_schedule_overrides_room" FOREIGN KEY ("room_id") REFERENCES "his"."rooms"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."room_service_capabilities" ADD CONSTRAINT "FK_room_service_capabilities_service" FOREIGN KEY ("service_id") REFERENCES "his"."services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."room_service_capabilities" ADD CONSTRAINT "FK_room_service_capabilities_room" FOREIGN KEY ("room_id") REFERENCES "his"."rooms"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" ADD CONSTRAINT "FK_scoped_permissions_user" FOREIGN KEY ("user_id") REFERENCES "his"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" ADD CONSTRAINT "FK_scoped_permissions_role" FOREIGN KEY ("role_id") REFERENCES "his"."roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" ADD CONSTRAINT "FK_scoped_permissions_branch" FOREIGN KEY ("branch_id") REFERENCES "his"."branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
