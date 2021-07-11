/*
  Warnings:

  - A unique constraint covering the columns `[identification]` on the table `Article` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Article.identification_unique" ON "Article"("identification");
