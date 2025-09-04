import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrate1757005861025 implements MigrationInterface {
    name = 'Migrate1757005861025'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "refresh_token"`);
        await queryRunner.query(`ALTER TABLE "refresh_token" ADD "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_token" DROP COLUMN "expires_at"`);
    }

}
