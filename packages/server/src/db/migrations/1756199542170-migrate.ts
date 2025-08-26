import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrate1756199542170 implements MigrationInterface {
    name = 'Migrate1756199542170'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["MATERIALIZED_VIEW","tweet_like_count","public"]);
        await queryRunner.query(`DROP MATERIALIZED VIEW "tweet_like_count"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE MATERIALIZED VIEW "tweet_like_count" AS SELECT "like"."tweet_id" AS "tweet_id", count(*) AS "like_count" FROM "like" "like" GROUP BY tweet_id`);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public","MATERIALIZED_VIEW","tweet_like_count","SELECT \"like\".\"tweet_id\" AS \"tweet_id\", count(*) AS \"like_count\" FROM \"like\" \"like\" GROUP BY tweet_id"]);
    }

}
