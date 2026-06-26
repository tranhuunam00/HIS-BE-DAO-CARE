import { MigrationInterface, QueryRunner } from "typeorm";

export class ReplaceCoordinatesWithGoogleMapUrl1782359000000 implements MigrationInterface {
    name = 'ReplaceCoordinatesWithGoogleMapUrl1782359000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "his"."branches" DROP COLUMN "latitude"`);
        await queryRunner.query(`ALTER TABLE "his"."branches" DROP COLUMN "longitude"`);
        await queryRunner.query(`ALTER TABLE "his"."branches" ADD COLUMN "google_map_url" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "his"."branches" DROP COLUMN "google_map_url"`);
        await queryRunner.query(`ALTER TABLE "his"."branches" ADD COLUMN "latitude" double precision`);
        await queryRunner.query(`ALTER TABLE "his"."branches" ADD COLUMN "longitude" double precision`);
    }
}
