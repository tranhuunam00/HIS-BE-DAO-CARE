import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVTTechAuthUserScope1782354400000 implements MigrationInterface {
    name = 'AddVTTechAuthUserScope1782354400000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "his"."login_time_windows" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "start_time" character varying NOT NULL,
                "end_time" character varying NOT NULL,
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_login_time_windows" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`ALTER TABLE "his"."users" ADD "username" character varying`);
        await queryRunner.query(`ALTER TABLE "his"."users" ADD CONSTRAINT "UQ_users_username" UNIQUE ("username")`);
        await queryRunner.query(`ALTER TABLE "his"."users" ADD "default_branch_id" uuid`);
        await queryRunner.query(`ALTER TABLE "his"."users" ADD "branch_scope_mode" character varying NOT NULL DEFAULT 'SPECIFIC'`);
        await queryRunner.query(`ALTER TABLE "his"."users" ADD "bypass_ip_restriction" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "his"."users" ADD "login_time_window_id" uuid`);
        await queryRunner.query(`ALTER TABLE "his"."users" ADD "failed_login_count" integer NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "his"."users" ADD "failed_login_limit" integer`);
        await queryRunner.query(`ALTER TABLE "his"."users" ADD "locked_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "his"."users" ADD "locked_by" uuid`);
        await queryRunner.query(`ALTER TABLE "his"."users" ADD "lock_reason" character varying`);

        await queryRunner.query(`
            ALTER TABLE "his"."users"
            ADD CONSTRAINT "FK_users_default_branch"
            FOREIGN KEY ("default_branch_id") REFERENCES "his"."branches"("id")
            ON DELETE SET NULL ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "his"."users"
            ADD CONSTRAINT "FK_users_login_time_window"
            FOREIGN KEY ("login_time_window_id") REFERENCES "his"."login_time_windows"("id")
            ON DELETE SET NULL ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            CREATE TABLE "his"."user_branch_scopes" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "branch_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_user_branch_scopes_pair" UNIQUE ("user_id", "branch_id"),
                CONSTRAINT "PK_user_branch_scopes" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            ALTER TABLE "his"."user_branch_scopes"
            ADD CONSTRAINT "FK_user_branch_scopes_user"
            FOREIGN KEY ("user_id") REFERENCES "his"."users"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "his"."user_branch_scopes"
            ADD CONSTRAINT "FK_user_branch_scopes_branch"
            FOREIGN KEY ("branch_id") REFERENCES "his"."branches"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            CREATE TABLE "his"."branch_allowed_ips" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "branch_id" uuid NOT NULL,
                "ip_address" character varying NOT NULL,
                "description" character varying,
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_branch_allowed_ips" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            ALTER TABLE "his"."branch_allowed_ips"
            ADD CONSTRAINT "FK_branch_allowed_ips_branch"
            FOREIGN KEY ("branch_id") REFERENCES "his"."branches"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            INSERT INTO "his"."login_time_windows" ("name", "start_time", "end_time", "is_active")
            VALUES ('6 AM - 9 PM', '06:00', '21:00', true)
        `);

        await queryRunner.query(`
            UPDATE "his"."users"
            SET "username" = split_part("email", '@', 1),
                "bypass_ip_restriction" = true,
                "failed_login_count" = 0
            WHERE "username" IS NULL
        `);

        await queryRunner.query(`
            UPDATE "his"."users" user_table
            SET "default_branch_id" = branch_table."id"
            FROM (
                SELECT "id" FROM "his"."branches" ORDER BY "created_at" ASC LIMIT 1
            ) branch_table
            WHERE user_table."default_branch_id" IS NULL
        `);

        await queryRunner.query(`
            INSERT INTO "his"."user_branch_scopes" ("user_id", "branch_id")
            SELECT "id", "default_branch_id"
            FROM "his"."users"
            WHERE "default_branch_id" IS NOT NULL
            ON CONFLICT ("user_id", "branch_id") DO NOTHING
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "his"."branch_allowed_ips"`);
        await queryRunner.query(`ALTER TABLE "his"."user_branch_scopes" DROP CONSTRAINT "FK_user_branch_scopes_branch"`);
        await queryRunner.query(`ALTER TABLE "his"."user_branch_scopes" DROP CONSTRAINT "FK_user_branch_scopes_user"`);
        await queryRunner.query(`DROP TABLE "his"."user_branch_scopes"`);
        await queryRunner.query(`ALTER TABLE "his"."users" DROP CONSTRAINT "FK_users_login_time_window"`);
        await queryRunner.query(`ALTER TABLE "his"."users" DROP CONSTRAINT "FK_users_default_branch"`);
        await queryRunner.query(`ALTER TABLE "his"."users" DROP COLUMN "lock_reason"`);
        await queryRunner.query(`ALTER TABLE "his"."users" DROP COLUMN "locked_by"`);
        await queryRunner.query(`ALTER TABLE "his"."users" DROP COLUMN "locked_at"`);
        await queryRunner.query(`ALTER TABLE "his"."users" DROP COLUMN "failed_login_limit"`);
        await queryRunner.query(`ALTER TABLE "his"."users" DROP COLUMN "failed_login_count"`);
        await queryRunner.query(`ALTER TABLE "his"."users" DROP COLUMN "login_time_window_id"`);
        await queryRunner.query(`ALTER TABLE "his"."users" DROP COLUMN "bypass_ip_restriction"`);
        await queryRunner.query(`ALTER TABLE "his"."users" DROP COLUMN "branch_scope_mode"`);
        await queryRunner.query(`ALTER TABLE "his"."users" DROP COLUMN "default_branch_id"`);
        await queryRunner.query(`ALTER TABLE "his"."users" DROP CONSTRAINT "UQ_users_username"`);
        await queryRunner.query(`ALTER TABLE "his"."users" DROP COLUMN "username"`);
        await queryRunner.query(`DROP TABLE "his"."login_time_windows"`);
    }
}
