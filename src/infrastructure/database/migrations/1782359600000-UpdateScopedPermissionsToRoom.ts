import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateScopedPermissionsToRoom1782359600000 implements MigrationInterface {
    name = 'UpdateScopedPermissionsToRoom1782359600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Clear any existing scoped permissions to avoid foreign key / unique constraint failures
        await queryRunner.query(`TRUNCATE TABLE "his"."scoped_permissions" CASCADE`);

        // Drop old unique constraints
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" DROP CONSTRAINT "UQ_user_scoped_perm"`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" DROP CONSTRAINT "UQ_role_scoped_perm"`);

        // Drop old columns
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" DROP COLUMN "folder"`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" DROP COLUMN "modality"`);

        // Add new room_id column
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" ADD COLUMN "room_id" uuid NOT NULL`);

        // Add foreign key constraint to room
        await queryRunner.query(`
            ALTER TABLE "his"."scoped_permissions" 
            ADD CONSTRAINT "FK_scoped_permissions_room" 
            FOREIGN KEY ("room_id") REFERENCES "his"."rooms"("id") ON DELETE CASCADE
        `);

        // Add new unique constraints
        await queryRunner.query(`
            ALTER TABLE "his"."scoped_permissions" 
            ADD CONSTRAINT "UQ_user_scoped_perm" UNIQUE ("user_id", "branch_id", "room_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "his"."scoped_permissions" 
            ADD CONSTRAINT "UQ_role_scoped_perm" UNIQUE ("role_id", "branch_id", "room_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" DROP CONSTRAINT "UQ_role_scoped_perm"`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" DROP CONSTRAINT "UQ_user_scoped_perm"`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" DROP CONSTRAINT "FK_scoped_permissions_room"`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" DROP COLUMN "room_id"`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" ADD COLUMN "folder" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" ADD COLUMN "modality" character varying(100) NOT NULL`);
        await queryRunner.query(`
            ALTER TABLE "his"."scoped_permissions" 
            ADD CONSTRAINT "UQ_user_scoped_perm" UNIQUE ("user_id", "branch_id", "folder", "modality")
        `);
        await queryRunner.query(`
            ALTER TABLE "his"."scoped_permissions" 
            ADD CONSTRAINT "UQ_role_scoped_perm" UNIQUE ("role_id", "branch_id", "folder", "modality")
        `);
    }
}
