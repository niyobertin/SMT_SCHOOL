/*
  Warnings:

  - You are about to drop the column `accessToken` on the `YouTubeToken` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `YouTubeToken` table. All the data in the column will be lost.
  - You are about to drop the column `scope` on the `YouTubeToken` table. All the data in the column will be lost.
  - You are about to drop the column `tokenType` on the `YouTubeToken` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `YouTubeToken` table. All the data in the column will be lost.
  - Added the required column `credentials` to the `YouTubeToken` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."YouTubeToken" DROP CONSTRAINT "YouTubeToken_userId_fkey";

-- AlterTable
ALTER TABLE "public"."YouTubeToken" DROP COLUMN "accessToken",
DROP COLUMN "refreshToken",
DROP COLUMN "scope",
DROP COLUMN "tokenType",
DROP COLUMN "userId",
ADD COLUMN     "credentials" TEXT NOT NULL,
ADD COLUMN     "provider" TEXT NOT NULL DEFAULT 'youtube';
