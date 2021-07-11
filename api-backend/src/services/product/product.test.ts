import { Prisma } from "@prisma/client";
import { prisma } from "../prisma-client";
import { upsert as upserProduct, get as getProduct } from ".";
import { upsert as upserArticle, get as getArticle } from "../article";
import { getAll } from "./product";

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
   * Creates 3 different articles and then create 1 Product using them
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
    expect(result.product).not.toBeNull();
    expect(result.error).toBeNull();

    // check whether the inserted relationship is correct
    const resultGet = await getProduct(result.product?.id!);
    expect(resultGet.product).not.toBeNull();
    expect(resultGet.error).toBeNull();
    expect(resultGet.product?.articles).not.toBeNull();
    expect(resultGet.product?.articles.length).toBe(3);

    // check if the quantities of the articles match
    resultGet.product?.articles.forEach((article) => {
      const originalArticle = articleList.find(
        (al) => al.articleId === article.articleId
      );
      expect(article.quantity).toBe(originalArticle?.quantity);
    });
  });

  /**
   * Creates 3 different articles and then create 1 Product using them
   * trying to put duplicate relationships
   */
  test("Attempt to duplicate relationship between Articles and a Product", async () => {
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

    // adding a duplicated item as the last item
    const result = await upserProduct(
      {
        name: "Test Product Create",
        price: priceDecimal,
        id: 0,
      },
      [
        ...articleList,
        {
          articleId: resultArticle1.article?.id!,
          quantity: 6,
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

    // check if the quantities of the articles match
    // remeber that in the list sent to the service there was one duplicated
    // item that should be ignored. Thats why it is being checked here the original list
    resultGet.product?.articles.forEach((article) => {
      const originalArticle = articleList.find(
        (al) => al.articleId === article.articleId
      );
      expect(article.quantity).toBe(originalArticle?.quantity);
    });
  });

  /**
   * Creates 3 different articles and then create 1 Product using them
   * and try to send an non-existent article.
   * The Product should not be created (rollback) due to the integrity constraint violation
   */
  test("Attempt to create a Product with existing and non-existing Articles", async () => {
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
      {
        articleId: -1, // non-existent product
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
    expect(result.product).toBeNull();
    expect(result.error).not.toBeNull();

    // As the whole transaction rolled back, the product should
    // not been created and hence there should be no products registered
    const resultGet = await getAll();
    expect(resultGet.products?.length).toBe(0);
    expect(resultGet.error).toBeNull();
  });
});
