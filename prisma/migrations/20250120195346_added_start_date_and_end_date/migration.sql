-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "end_date" TEXT NOT NULL DEFAULT 'Not Decided',
ADD COLUMN     "start_date" TEXT NOT NULL DEFAULT 'Not Decided';
