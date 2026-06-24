import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFormsSchema1782290397828 implements MigrationInterface {
    name = 'AddFormsSchema1782290397828'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "his"."form_templates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "code" character varying NOT NULL, "type" character varying NOT NULL, "category" character varying NOT NULL, "html_content" text NOT NULL, "description" character varying, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_0ac5ddfb628c4eb61b704913b79" UNIQUE ("code"), CONSTRAINT "PK_dda93f70be71cb4a2e496b5ae49" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "his"."form_templates"`);
    }

}
