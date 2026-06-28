import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveRoomFromScopedPermissions1782359700000 implements MigrationInterface {
    name = 'RemoveRoomFromScopedPermissions1782359700000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Clear any existing scoped permissions to avoid foreign key / unique constraint failures
        await queryRunner.query(`TRUNCATE TABLE "his"."scoped_permissions" CASCADE`);

        // Drop old unique constraints & foreign key
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" DROP CONSTRAINT "UQ_user_scoped_perm"`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" DROP CONSTRAINT "UQ_role_scoped_perm"`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" DROP CONSTRAINT "FK_scoped_permissions_room"`);

        // Drop room_id column
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" DROP COLUMN "room_id"`);

        // Recreate unique constraints for [user_id, branch_id] and [role_id, branch_id]
        await queryRunner.query(`
            ALTER TABLE "his"."scoped_permissions" 
            ADD CONSTRAINT "UQ_user_scoped_perm" UNIQUE ("user_id", "branch_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "his"."scoped_permissions" 
            ADD CONSTRAINT "UQ_role_scoped_perm" UNIQUE ("role_id", "branch_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" DROP CONSTRAINT "UQ_role_scoped_perm"`);
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" DROP CONSTRAINT "UQ_user_scoped_perm"`);
        
        await queryRunner.query(`ALTER TABLE "his"."scoped_permissions" ADD COLUMN "room_id" uuid NOT NULL`);
        await queryRunner.query(`
            ALTER TABLE "his"."scoped_permissions" 
            ADD CONSTRAINT "FK_scoped_permissions_room" 
            FOREIGN KEY ("room_id") REFERENCES "his"."rooms"("id") ON DELETE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "his"."scoped_permissions" 
            ADD CONSTRAINT "UQ_user_scoped_perm" UNIQUE ("user_id", "branch_id", "room_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "his"."scoped_permissions" 
            ADD CONSTRAINT "UQ_role_scoped_perm" UNIQUE ("role_id", "branch_id", "room_id")
        `);
    }
}
