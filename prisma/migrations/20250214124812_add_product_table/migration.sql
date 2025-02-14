/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Product` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Product_sku_key";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "updatedAt",
ALTER COLUMN "hsnCode" DROP NOT NULL,
ALTER COLUMN "sku" DROP NOT NULL,
ALTER COLUMN "tax" DROP NOT NULL;
