/*
  Warnings:

  - You are about to drop the column `cover_photo` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `profile_photo` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ImageType" AS ENUM ('Profile_Photo', 'Cover_Photo', 'Post');

-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "imageType" "ImageType" NOT NULL DEFAULT 'Post',
ADD COLUMN     "userId" INTEGER,
ALTER COLUMN "postId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "cover_photo",
DROP COLUMN "profile_photo";

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
