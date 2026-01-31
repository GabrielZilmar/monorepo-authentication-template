import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTokensAndEmailTemplate1769455288474
  implements MigrationInterface
{
  name = 'AddTokensAndEmailTemplate1769455288474';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."tokens_type_enum" AS ENUM('email_verification', 'password_reset')`,
    );
    await queryRunner.query(
      `CREATE TABLE "tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "type" "public"."tokens_type_enum" NOT NULL, "hashed_token" character varying(500) NOT NULL, "expires_at" TIMESTAMP NOT NULL, "used" boolean NOT NULL DEFAULT false, "used_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3001e89ada36263dabf1fb6210a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_8ff42f3a653d51338352d9c439" ON "tokens" ("hashed_token") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_306030d9411d291750fd115857" ON "tokens" ("user_id", "type") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."email_templates_type_enum" AS ENUM('email_verification', 'password_reset', 'welcome', 'password_changed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "email_templates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."email_templates_type_enum" NOT NULL, "subject" character varying(255) NOT NULL, "html_template" text NOT NULL, "text_template" text, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_ed00bc5c34216c3969792984c1f" UNIQUE ("type"), CONSTRAINT "PK_06c564c515d8cdb40b6f3bfbbb4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_35e829d942fb076baf75011a88" ON "email_templates" ("type", "is_active") `,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "email_verified" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "tokens" ADD CONSTRAINT "FK_8769073e38c365f315426554ca5" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tokens" DROP CONSTRAINT "FK_8769073e38c365f315426554ca5"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email_verified"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_35e829d942fb076baf75011a88"`,
    );
    await queryRunner.query(`DROP TABLE "email_templates"`);
    await queryRunner.query(`DROP TYPE "public"."email_templates_type_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_306030d9411d291750fd115857"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8ff42f3a653d51338352d9c439"`,
    );
    await queryRunner.query(`DROP TABLE "tokens"`);
    await queryRunner.query(`DROP TYPE "public"."tokens_type_enum"`);
  }
}
