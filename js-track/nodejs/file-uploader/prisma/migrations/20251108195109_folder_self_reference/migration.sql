-- AlterTable
ALTER TABLE "folders" ADD COLUMN     "parentFolderId" INTEGER;

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_parentFolderId_fkey" FOREIGN KEY ("parentFolderId") REFERENCES "folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
