/*
  Warnings:

  - The values [REJECTED] on the enum `FollowStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FollowStatus_new" AS ENUM ('PENDING', 'ACCEPTED');
ALTER TABLE "public"."followers" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "followers" ALTER COLUMN "status" TYPE "FollowStatus_new" USING ("status"::text::"FollowStatus_new");
ALTER TYPE "FollowStatus" RENAME TO "FollowStatus_old";
ALTER TYPE "FollowStatus_new" RENAME TO "FollowStatus";
DROP TYPE "public"."FollowStatus_old";
ALTER TABLE "followers" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
