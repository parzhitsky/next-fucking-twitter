import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrate1755944551098 implements MigrationInterface {
    name = 'Migrate1755944551098'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_token" RENAME COLUMN "used_at" TO "revoked_at"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_token" RENAME COLUMN "revoked_at" TO "used_at"`);
    }

}
