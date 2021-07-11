-- DropForeignKey
ALTER TABLE "ArticlesOnProducts" DROP CONSTRAINT "ArticlesOnProducts_productId_fkey";

-- AddForeignKey
ALTER TABLE "ArticlesOnProducts" ADD FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
