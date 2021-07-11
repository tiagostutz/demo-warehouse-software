-- DropForeignKey
ALTER TABLE "ArticlesOnProducts" DROP CONSTRAINT "ArticlesOnProducts_articleId_fkey";

-- DropForeignKey
ALTER TABLE "ArticlesOnProducts" DROP CONSTRAINT "ArticlesOnProducts_productId_fkey";

-- AddForeignKey
ALTER TABLE "ArticlesOnProducts" ADD FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticlesOnProducts" ADD FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
