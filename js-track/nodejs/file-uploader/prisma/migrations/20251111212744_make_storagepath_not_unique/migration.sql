-- DropForeignKey
ALTER TABLE "folders" DROP CONSTRAINT "folders_parentFolderId_fkey";

-- DropIndex
DROP INDEX "folders_storagePath_key";

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_parentFolderId_fkey" FOREIGN KEY ("parentFolderId") REFERENCES "folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
