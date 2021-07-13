-- CreateTable
CREATE TABLE "Article" (
    "id" SERIAL NOT NULL,
    "identification" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "availableStock" INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticlesOnProducts" (
    "productId" INTEGER NOT NULL,
    "articleId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    PRIMARY KEY ("productId","articleId")
);

-- AddForeignKey
ALTER TABLE "ArticlesOnProducts" ADD FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- AddForeignKey
ALTER TABLE "ArticlesOnProducts" ADD FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "ArticlesOnProducts" DROP CONSTRAINT "ArticlesOnProducts_articleId_fkey";

-- DropForeignKey
ALTER TABLE "ArticlesOnProducts" DROP CONSTRAINT "ArticlesOnProducts_productId_fkey";

-- AddForeignKey
ALTER TABLE "ArticlesOnProducts" ADD FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticlesOnProducts" ADD FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "ArticlesOnProducts" DROP CONSTRAINT "ArticlesOnProducts_productId_fkey";

-- AddForeignKey
ALTER TABLE "ArticlesOnProducts" ADD FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - A unique constraint covering the columns `[identification]` on the table `Article` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Article.identification_unique" ON "Article"("identification");


-- AlterTable
ALTER TABLE "Article" ALTER COLUMN "identification" SET DATA TYPE BIGINT;
