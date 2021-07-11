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
