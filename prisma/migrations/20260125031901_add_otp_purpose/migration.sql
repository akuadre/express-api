/*
  Warnings:

  - Added the required column `purpose` to the `EmailOtp` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('REGISTER', 'RESET_PASSWORD');

-- AlterTable
ALTER TABLE "EmailOtp" ADD COLUMN     "purpose" "OtpPurpose" NOT NULL;
