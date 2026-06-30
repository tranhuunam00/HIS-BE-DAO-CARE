import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveCapacityAndResources1782720000000 implements MigrationInterface {
    name = 'RemoveCapacityAndResources1782720000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints on resources table
        await queryRunner.query(`ALTER TABLE "his"."resources" DROP CONSTRAINT IF EXISTS "FK_d9b2106f609d3f7c3fcf284d011"`);
        // Drop table resources
        await queryRunner.query(`DROP TABLE IF EXISTS "his"."resources"`);
        // Drop capacity column from rooms table
        await queryRunner.query(`ALTER TABLE "his"."rooms" DROP COLUMN IF EXISTS "capacity"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Add capacity column back to rooms
        await queryRunner.query(`ALTER TABLE "his"."rooms" ADD COLUMN "capacity" integer NOT NULL DEFAULT '1'`);
        // Recreate resources table
        await queryRunner.query(`CREATE TABLE "his"."resources" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "room_id" uuid NOT NULL, "name" character varying NOT NULL, "code" character varying NOT NULL, "type" character varying NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_b7ab912cd81e4b447e43d45e382" UNIQUE ("code"), CONSTRAINT "PK_632484ab9dff41bba94f9b7c85e" PRIMARY KEY ("id"))`);
        // Re-add foreign key constraint
        await queryRunner.query(`ALTER TABLE "his"."resources" ADD CONSTRAINT "FK_d9b2106f609d3f7c3fcf284d011" FOREIGN KEY ("room_id") REFERENCES "his"."rooms"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
}
