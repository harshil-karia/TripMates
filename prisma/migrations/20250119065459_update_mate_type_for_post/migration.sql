/*
  Warnings:

  - You are about to drop the `PostPreferdMate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Preferred_Mate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PostPreferdMate" DROP CONSTRAINT "PostPreferdMate_postId_fkey";

-- DropForeignKey
ALTER TABLE "PostPreferdMate" DROP CONSTRAINT "PostPreferdMate_preferdMateId_fkey";

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "preferedMate" "Mate_Type"[];

-- DropTable
DROP TABLE "PostPreferdMate";

-- DropTable
DROP TABLE "Preferred_Mate";
