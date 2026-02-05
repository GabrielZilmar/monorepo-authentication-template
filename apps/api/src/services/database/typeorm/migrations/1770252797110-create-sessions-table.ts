import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSessionsTable1770252797110 implements MigrationInterface {
  name = 'CreateSessionsTable1770252797110';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8ff42f3a653d51338352d9c439"`,
    );
    await queryRunner.query(
      `CREATE TABLE "sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "refresh_token" character varying(500) NOT NULL, "expires_at" TIMESTAMP NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "user_agent" character varying(255), "ip_address" character varying(45), "last_used_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_c862499023be8feec98129d4e96" UNIQUE ("refresh_token"), CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c862499023be8feec98129d4e9" ON "sessions" ("refresh_token") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_988b9e434a536256a4fee3ad68" ON "sessions" ("user_id", "is_active") `,
    );
    await queryRunner.query(
      `ALTER TABLE "tokens" ADD CONSTRAINT "UQ_8ff42f3a653d51338352d9c439d" UNIQUE ("hashed_token")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8ff42f3a653d51338352d9c439" ON "tokens" ("hashed_token") `,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD CONSTRAINT "FK_085d540d9f418cfbdc7bd55bb19" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sessions" DROP CONSTRAINT "FK_085d540d9f418cfbdc7bd55bb19"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8ff42f3a653d51338352d9c439"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tokens" DROP CONSTRAINT "UQ_8ff42f3a653d51338352d9c439d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_988b9e434a536256a4fee3ad68"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c862499023be8feec98129d4e9"`,
    );
    await queryRunner.query(`DROP TABLE "sessions"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_8ff42f3a653d51338352d9c439" ON "tokens" ("hashed_token") `,
    );
  }
}
