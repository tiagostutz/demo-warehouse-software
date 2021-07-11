import { Prisma } from "@prisma/client";
import { prisma } from "../prisma-client";
import { upsert as upserProduct, get as getProduct } from ".";
import { upsert as upserArticle, get as getArticle } from "../article";
import { getAll, getAllWithAvailability } from "./product";

const priceDecimal = new Prisma.Decimal(14.5);

describe("Create Article, Product and evaluate stock", () => {
  // Before each test, clean the database to run a "clean" test
  beforeEach(async () => {
    // clean
    await prisma.product.deleteMany({});
    await prisma.article.deleteMany({});
  });

  // After all tests, clean the database for any test data inserted
  afterAll(async () => {
    // clean
    await prisma.product.deleteMany({});
    await prisma.article.deleteMany({});
  });

  test("Evaluate NONE Product available based on Inventory (Article stock)", async () => {
    const resultArticle1 = await upserArticle({
      name: "Article 1",
      availableStock: 5,
      identification: BigInt(11223344),
      id: 0,
    });

    const resultArticle2 = await upserArticle({
      name: "Article 2",
      availableStock: 7,
      identification: BigInt(55667788),
      id: 0,
    });

    const resultArticle3 = await upserArticle({
      name: "Article 3",
      availableStock: 1,
      identification: BigInt(88888888),
      id: 0,
    });
    // Create a Product with Article 1, Article 2 and Article 3.
    const articleList = [
      {
        articleId: resultArticle1.article?.id!,
        quantity: 2,
      },
      {
        articleId: resultArticle2.article?.id!,
        quantity: 1,
      },
      {
        articleId: resultArticle3.article?.id!,
        quantity: 4,
      },
    ];
    const result = await upserProduct(
      {
        name: "Test Product Create",
        price: priceDecimal,
        id: 0,
      },
      articleList
    );
    // check whether the inserted relationship is correct
    const resultGet = await getAllWithAvailability();

    //
  });
});
