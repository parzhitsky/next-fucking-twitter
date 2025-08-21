import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrate1755779304027 implements MigrationInterface {
    name = 'Migrate1755779304027'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "following" ("follower_id" uuid NOT NULL, "followee_id" uuid NOT NULL, CONSTRAINT "PK_c0ace0b0418ce2612c1419a3a81" PRIMARY KEY ("follower_id", "followee_id"))`);
        await queryRunner.query(`CREATE TABLE "tweet" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "text" character varying(280) NOT NULL, "created_by_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_6dbf0db81305f2c096871a585f6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "like" ("user_id" uuid NOT NULL, "tweet_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_4557d44e999226ed96e72a63257" PRIMARY KEY ("user_id", "tweet_id"))`);
        await queryRunner.query(`ALTER TABLE "user" ADD "alias" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_1d5324dc4f0c41f17ebe4bf5aba" UNIQUE ("alias")`);
        await queryRunner.query(`ALTER TABLE "following" ADD CONSTRAINT "FK_59f580ba79fe33c121f8c3cc095" FOREIGN KEY ("follower_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "following" ADD CONSTRAINT "FK_024eb37408e113a164bbe6352f4" FOREIGN KEY ("followee_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tweet" ADD CONSTRAINT "FK_ee09e06bf70b76269ee726916ca" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "like" ADD CONSTRAINT "FK_4356ac2f9519c7404a2869f1691" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "like" ADD CONSTRAINT "FK_ab2820f0f772826fcbc1ac5d747" FOREIGN KEY ("tweet_id") REFERENCES "tweet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "like" DROP CONSTRAINT "FK_ab2820f0f772826fcbc1ac5d747"`);
        await queryRunner.query(`ALTER TABLE "like" DROP CONSTRAINT "FK_4356ac2f9519c7404a2869f1691"`);
        await queryRunner.query(`ALTER TABLE "tweet" DROP CONSTRAINT "FK_ee09e06bf70b76269ee726916ca"`);
        await queryRunner.query(`ALTER TABLE "following" DROP CONSTRAINT "FK_024eb37408e113a164bbe6352f4"`);
        await queryRunner.query(`ALTER TABLE "following" DROP CONSTRAINT "FK_59f580ba79fe33c121f8c3cc095"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_1d5324dc4f0c41f17ebe4bf5aba"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "alias"`);
        await queryRunner.query(`DROP TABLE "like"`);
        await queryRunner.query(`DROP TABLE "tweet"`);
        await queryRunner.query(`DROP TABLE "following"`);
    }

}
