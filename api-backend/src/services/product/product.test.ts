import { Prisma } from "@prisma/client";
import { prisma } from "../prisma-client";
import { upsert as upserProduct, get as getProduct } from ".";
import { upsert as upserArticle, get as getArticle } from "../article";

const priceDecimal = new Prisma.Decimal(14.5);

describe("Testing CRUD Operations", () => {
  // Before each test, clean the database to run a "clean" test
  beforeEach(async () => {
    // clean
    await prisma.product.deleteMany({});
  });

  // After all tests, clean the database for any test data inserted
  afterAll(async () => {
    // clean
    await prisma.product.deleteMany({});
  });

  test("Fetch by ID returning null", async () => {
    const result = await getProduct(1);
    expect(result.product).toBeNull();
    expect(result.error).toBeNull();
  });

  test("Create simple Product", async () => {
    const result = await upserProduct(
      {
        name: "Test",
        price: priceDecimal,
        id: 0,
      },
      []
    );
    expect(result.product).not.toBeNull();
    expect(result.error).toBeNull();

    expect(result.product?.price.toNumber()).toBe(priceDecimal.toNumber());
  });

  test("Insert and Update Product", async () => {
    const result = await upserProduct(
      {
        name: "Test",
        price: priceDecimal,
        id: 0,
      },
      []
    );
    expect(result.product).not.toBeNull();
    expect(result.error).toBeNull();
    expect(result.product?.price.toNumber()).toBe(priceDecimal.toNumber());

    const resultUpdate = await upserProduct(
      {
        name: "Test name changed",
        price: new Prisma.Decimal(99.99),
        id: result.product?.id!,
      },
      []
    );

    expect(resultUpdate.product).not.toBeNull();
    expect(resultUpdate.error).toBeNull();

    expect(resultUpdate.product?.name).toBe("Test name changed");

    const resultGet = await getProduct(result.product?.id!);
    expect(resultGet.error).toBeNull();
    expect(resultGet.product?.price.toNumber()).toBe(
      new Prisma.Decimal(99.99).toNumber()
    );
  });
});

/**
 * Those tests aims to validate the Product <==> Article relationship
 */
describe("Testing Product relationship with Article", () => {
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

  /**
   * Creates 4 different articles and then create 1 Product using 3 of them
   */
  test("Create Articles and a Product related to them", async () => {
    const resultArticle1 = await upserArticle({
      name: "Article 1",
      availableStock: 5,
      identification: BigInt(11223344),
      id: 0,
    });
    expect(resultArticle1.article).not.toBeNull();
    expect(resultArticle1.error).toBeNull();

    const resultArticle2 = await upserArticle({
      name: "Article 2",
      availableStock: 7,
      identification: BigInt(55667788),
      id: 0,
    });
    expect(resultArticle2.article).not.toBeNull();
    expect(resultArticle2.error).toBeNull();

    const resultArticle3 = await upserArticle({
      name: "Article 3",
      availableStock: 1,
      identification: BigInt(88888888),
      id: 0,
    });
    expect(resultArticle3.article).not.toBeNull();
    expect(resultArticle3.error).toBeNull();

    // Create a Product with Article 1, Article 2 and Article 3.
    // leaving the Article 2 off
    const result = await upserProduct(
      {
        name: "Test Product Create",
        price: priceDecimal,
        id: 0,
      },
      [
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
      ]
    );
    expect(result.product).not.toBeNull();
    expect(result.error).toBeNull();

    // check whether the inserted relationship is correct
    const resultGet = await getProduct(result.product?.id!);
    expect(resultGet.product).not.toBeNull();
    expect(resultGet.error).toBeNull();
    expect(resultGet.product?.articles).not.toBeNull();
    expect(resultGet.product?.articles.length).toBe(3);
  });
});
