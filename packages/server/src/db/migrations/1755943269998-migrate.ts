import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrate1755943269998 implements MigrationInterface {
    name = 'Migrate1755943269998'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_token" ADD "generated_from_id" uuid`);
        await queryRunner.query(`ALTER TABLE "refresh_token" ADD CONSTRAINT "UQ_9376f5f31d731f673484eadeb4a" UNIQUE ("generated_from_id")`);
        await queryRunner.query(`ALTER TABLE "refresh_token" ADD CONSTRAINT "FK_9376f5f31d731f673484eadeb4a" FOREIGN KEY ("generated_from_id") REFERENCES "refresh_token"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_token" DROP CONSTRAINT "FK_9376f5f31d731f673484eadeb4a"`);
        await queryRunner.query(`ALTER TABLE "refresh_token" DROP CONSTRAINT "UQ_9376f5f31d731f673484eadeb4a"`);
        await queryRunner.query(`ALTER TABLE "refresh_token" DROP COLUMN "generated_from_id"`);
    }

}
