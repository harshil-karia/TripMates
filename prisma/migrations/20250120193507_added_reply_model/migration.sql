/*
  Warnings:

  - You are about to drop the `Interest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserIntrest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserIntrest" DROP CONSTRAINT "UserIntrest_intrestId_fkey";

-- DropForeignKey
ALTER TABLE "UserIntrest" DROP CONSTRAINT "UserIntrest_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "intrests" "Interest_List"[];

-- DropTable
DROP TABLE "Interest";

-- DropTable
DROP TABLE "UserIntrest";

-- CreateTable
CREATE TABLE "Reply" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "commentId" INTEGER NOT NULL,

    CONSTRAINT "Reply_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Reply" ADD CONSTRAINT "Reply_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
