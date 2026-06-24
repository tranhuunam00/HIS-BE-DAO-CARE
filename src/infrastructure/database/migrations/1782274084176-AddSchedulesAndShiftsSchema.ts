import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSchedulesAndShiftsSchema1782274084176 implements MigrationInterface {
    name = 'AddSchedulesAndShiftsSchema1782274084176'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "his"."branch_allowed_ips" DROP CONSTRAINT "FK_branch_allowed_ips_branch"`);
        await queryRunner.query(`ALTER TABLE "his"."user_branch_scopes" DROP CONSTRAINT "FK_user_branch_scopes_branch"`);
        await queryRunner.query(`ALTER TABLE "his"."user_branch_scopes" DROP CONSTRAINT "FK_user_branch_scopes_user"`);
        await queryRunner.query(`ALTER TABLE "his"."users" DROP CONSTRAINT "FK_users_default_branch"`);
        await queryRunner.query(`ALTER TABLE "his"."users" DROP CONSTRAINT "FK_users_login_time_window"`);
        await queryRunner.query(`ALTER TABLE "his"."departments" DROP CONSTRAINT "FK_departments_branch"`);
        await queryRunner.query(`ALTER TABLE "his"."staff" DROP CONSTRAINT "FK_staff_department"`);
        await queryRunner.query(`ALTER TABLE "his"."service_prices" DROP CONSTRAINT "FK_service_prices_service"`);
        await queryRunner.query(`ALTER TABLE "his"."user_branch_scopes" DROP CONSTRAINT "UQ_user_branch_scopes_pair"`);
        await queryRunner.query(`CREATE TABLE "his"."shifts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "start_time" character varying NOT NULL, "end_time" character varying NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_84d692e367e4d6cdf045828768c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "his"."staff_schedule_overrides" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "staff_id" uuid NOT NULL, "date" date NOT NULL, "override_type" character varying NOT NULL, "branch_id" uuid, "shift_id" uuid, "reason" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_de69cf55ac4030e344c3a7dede4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "his"."staff_schedule_templates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "staff_id" uuid NOT NULL, "branch_id" uuid NOT NULL, "day_of_week" character varying NOT NULL, "shift_id" uuid NOT NULL, "effective_date" date NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ea615b9f2184e86f3b1c3a01f49" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "his"."user_branch_scopes" ADD CONSTRAINT "UQ_5a5c25d6af31856d7c78e727bdd" UNIQUE ("user_id", "branch_id")`);
        await queryRunner.query(`ALTER TABLE "his"."branch_allowed_ips" ADD CONSTRAINT "FK_dfadd44620ca691113c00d96571" FOREIGN KEY ("branch_id") REFERENCES "his"."branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."user_branch_scopes" ADD CONSTRAINT "FK_0642e71b8c160823c44a808df53" FOREIGN KEY ("user_id") REFERENCES "his"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."user_branch_scopes" ADD CONSTRAINT "FK_0664d9c1dab0f8b4d5b596c844c" FOREIGN KEY ("branch_id") REFERENCES "his"."branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."users" ADD CONSTRAINT "FK_4dcacd1b99b93f7ad61ee69c3a3" FOREIGN KEY ("default_branch_id") REFERENCES "his"."branches"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."users" ADD CONSTRAINT "FK_f6f9d72a8e46b53076ad7d722a5" FOREIGN KEY ("login_time_window_id") REFERENCES "his"."login_time_windows"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."departments" ADD CONSTRAINT "FK_40b8818a0e3324c859199265503" FOREIGN KEY ("branch_id") REFERENCES "his"."branches"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."staff" ADD CONSTRAINT "FK_51b371508b14db31bee80fded0a" FOREIGN KEY ("department_id") REFERENCES "his"."departments"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."staff_schedule_overrides" ADD CONSTRAINT "FK_cc3c84dfb2d40fb684b63c8a149" FOREIGN KEY ("staff_id") REFERENCES "his"."staff"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."staff_schedule_overrides" ADD CONSTRAINT "FK_64d6ad35549f2020e41606582fe" FOREIGN KEY ("branch_id") REFERENCES "his"."branches"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."staff_schedule_overrides" ADD CONSTRAINT "FK_2a786d670418340c0e61a60af4b" FOREIGN KEY ("shift_id") REFERENCES "his"."shifts"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."staff_schedule_templates" ADD CONSTRAINT "FK_0c8c96d62a63900ff28937dbfcf" FOREIGN KEY ("staff_id") REFERENCES "his"."staff"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."staff_schedule_templates" ADD CONSTRAINT "FK_c7fbfc559a86b161ae78f117f6a" FOREIGN KEY ("branch_id") REFERENCES "his"."branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."staff_schedule_templates" ADD CONSTRAINT "FK_38fa92f3c933956cb8db6313cad" FOREIGN KEY ("shift_id") REFERENCES "his"."shifts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."service_prices" ADD CONSTRAINT "FK_874b2f636cc2cb53ec02f80399c" FOREIGN KEY ("service_id") REFERENCES "his"."services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "his"."service_prices" DROP CONSTRAINT "FK_874b2f636cc2cb53ec02f80399c"`);
        await queryRunner.query(`ALTER TABLE "his"."staff_schedule_templates" DROP CONSTRAINT "FK_38fa92f3c933956cb8db6313cad"`);
        await queryRunner.query(`ALTER TABLE "his"."staff_schedule_templates" DROP CONSTRAINT "FK_c7fbfc559a86b161ae78f117f6a"`);
        await queryRunner.query(`ALTER TABLE "his"."staff_schedule_templates" DROP CONSTRAINT "FK_0c8c96d62a63900ff28937dbfcf"`);
        await queryRunner.query(`ALTER TABLE "his"."staff_schedule_overrides" DROP CONSTRAINT "FK_2a786d670418340c0e61a60af4b"`);
        await queryRunner.query(`ALTER TABLE "his"."staff_schedule_overrides" DROP CONSTRAINT "FK_64d6ad35549f2020e41606582fe"`);
        await queryRunner.query(`ALTER TABLE "his"."staff_schedule_overrides" DROP CONSTRAINT "FK_cc3c84dfb2d40fb684b63c8a149"`);
        await queryRunner.query(`ALTER TABLE "his"."staff" DROP CONSTRAINT "FK_51b371508b14db31bee80fded0a"`);
        await queryRunner.query(`ALTER TABLE "his"."departments" DROP CONSTRAINT "FK_40b8818a0e3324c859199265503"`);
        await queryRunner.query(`ALTER TABLE "his"."users" DROP CONSTRAINT "FK_f6f9d72a8e46b53076ad7d722a5"`);
        await queryRunner.query(`ALTER TABLE "his"."users" DROP CONSTRAINT "FK_4dcacd1b99b93f7ad61ee69c3a3"`);
        await queryRunner.query(`ALTER TABLE "his"."user_branch_scopes" DROP CONSTRAINT "FK_0664d9c1dab0f8b4d5b596c844c"`);
        await queryRunner.query(`ALTER TABLE "his"."user_branch_scopes" DROP CONSTRAINT "FK_0642e71b8c160823c44a808df53"`);
        await queryRunner.query(`ALTER TABLE "his"."branch_allowed_ips" DROP CONSTRAINT "FK_dfadd44620ca691113c00d96571"`);
        await queryRunner.query(`ALTER TABLE "his"."user_branch_scopes" DROP CONSTRAINT "UQ_5a5c25d6af31856d7c78e727bdd"`);
        await queryRunner.query(`DROP TABLE "his"."staff_schedule_templates"`);
        await queryRunner.query(`DROP TABLE "his"."staff_schedule_overrides"`);
        await queryRunner.query(`DROP TABLE "his"."shifts"`);
        await queryRunner.query(`ALTER TABLE "his"."user_branch_scopes" ADD CONSTRAINT "UQ_user_branch_scopes_pair" UNIQUE ("user_id", "branch_id")`);
        await queryRunner.query(`ALTER TABLE "his"."service_prices" ADD CONSTRAINT "FK_service_prices_service" FOREIGN KEY ("service_id") REFERENCES "his"."services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."staff" ADD CONSTRAINT "FK_staff_department" FOREIGN KEY ("department_id") REFERENCES "his"."departments"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."departments" ADD CONSTRAINT "FK_departments_branch" FOREIGN KEY ("branch_id") REFERENCES "his"."branches"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."users" ADD CONSTRAINT "FK_users_login_time_window" FOREIGN KEY ("login_time_window_id") REFERENCES "his"."login_time_windows"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."users" ADD CONSTRAINT "FK_users_default_branch" FOREIGN KEY ("default_branch_id") REFERENCES "his"."branches"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."user_branch_scopes" ADD CONSTRAINT "FK_user_branch_scopes_user" FOREIGN KEY ("user_id") REFERENCES "his"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."user_branch_scopes" ADD CONSTRAINT "FK_user_branch_scopes_branch" FOREIGN KEY ("branch_id") REFERENCES "his"."branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."branch_allowed_ips" ADD CONSTRAINT "FK_branch_allowed_ips_branch" FOREIGN KEY ("branch_id") REFERENCES "his"."branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
