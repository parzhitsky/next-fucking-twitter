import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrate1757006439642 implements MigrationInterface {
    name = 'Migrate1757006439642'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "refresh_token"`);
        await queryRunner.query(`ALTER TABLE "refresh_token" ADD "user_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "refresh_token" ADD CONSTRAINT "FK_6bbe63d2fe75e7f0ba1710351d4" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_token" DROP CONSTRAINT "FK_6bbe63d2fe75e7f0ba1710351d4"`);
        await queryRunner.query(`ALTER TABLE "refresh_token" DROP COLUMN "user_id"`);
    }

}
