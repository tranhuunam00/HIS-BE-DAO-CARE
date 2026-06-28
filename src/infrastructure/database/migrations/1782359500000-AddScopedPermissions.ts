import { MigrationInterface, QueryRunner } from "typeorm";

export class AddScopedPermissions1782359500000 implements MigrationInterface {
    name = 'AddScopedPermissions1782359500000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "his"."scoped_permissions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid,
                "role_id" uuid,
                "branch_id" uuid NOT NULL,
                "folder" character varying(100) NOT NULL,
                "modality" character varying(100) NOT NULL,
                "can_view" boolean NOT NULL DEFAULT false,
                "can_read" boolean NOT NULL DEFAULT false,
                "can_approve" boolean NOT NULL DEFAULT false,
                "can_consult" boolean NOT NULL DEFAULT false,
                "can_cancel_consult" boolean NOT NULL DEFAULT false,
                "can_edit" boolean NOT NULL DEFAULT false,
                "can_delete" boolean NOT NULL DEFAULT false,
                "can_update_his" boolean NOT NULL DEFAULT false,
                "can_share" boolean NOT NULL DEFAULT false,
                "can_stats" boolean NOT NULL DEFAULT false,
                "can_cancel_approve" boolean NOT NULL DEFAULT false,
                "can_delete_series" boolean NOT NULL DEFAULT false,
                "can_view_history" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_scoped_permissions_id" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_user_scoped_perm" UNIQUE ("user_id", "branch_id", "folder", "modality"),
                CONSTRAINT "UQ_role_scoped_perm" UNIQUE ("role_id", "branch_id", "folder", "modality")
            )
        `);

        await queryRunner.query(`
            ALTER TABLE "his"."scoped_permissions" 
            ADD CONSTRAINT "FK_scoped_permissions_user" 
            FOREIGN KEY ("user_id") REFERENCES "his"."users"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "his"."scoped_permissions" 
            ADD CONSTRAINT "FK_scoped_permissions_role" 
            FOREIGN KEY ("role_id") REFERENCES "his"."roles"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "his"."scoped_permissions" 
            ADD CONSTRAINT "FK_scoped_permissions_branch" 
            FOREIGN KEY ("branch_id") REFERENCES "his"."branches"("id") ON DELETE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" DROP CONSTRAINT "FK_scoped_permissions_branch"`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" DROP CONSTRAINT "FK_scoped_permissions_role"`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" DROP CONSTRAINT "FK_scoped_permissions_user"`);
        await queryRunner.query(`DROP TABLE "his"."scoped_permissions"`);
    }
}
