import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrate1755895748763 implements MigrationInterface {
    name = 'Migrate1755895748763'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "refresh_token" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "used_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_b575dd3c21fb0831013c909e7fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" ADD "password_hash" character varying(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "password_hash"`);
        await queryRunner.query(`DROP TABLE "refresh_token"`);
    }

}
