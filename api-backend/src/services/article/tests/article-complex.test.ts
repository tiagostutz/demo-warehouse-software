import { Prisma } from '@prisma/client';
import { prisma } from '../../prisma-client';
import { upsert as upsertProduct } from '../../product';
import { upsert as upsertArticle } from '..';
import { get, updateStockByProductMade } from '../article';

const priceDecimal = new Prisma.Decimal(14.5);

describe('Create Product, Article and Reduce Stock', () => {
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

  test('Reduce the stock to ONE with a single Article used by a single Product', async () => {
    const resultArticle1 = await upsertArticle({
      name: 'Article 1',
      availableStock: 2,
      identification: BigInt(11223344),
      id: 0
    });

    // Create a Product with Article 1
    const articleList = [
      {
        articleId: resultArticle1.article?.id!,
        quantity: 1
      }
    ];

    // Create one Product
    const productCreated = await upsertProduct(
      {
        name: 'Test Product Create 1',
        price: priceDecimal,
        id: 0
      },
      articleList
    );

    expect(productCreated.product).not.toBeNull();

    if (productCreated.product) {
      const articlesResult = await updateStockByProductMade(
        productCreated.product.id,
        1
      );
      expect(articlesResult.error).toBeNull();
      expect(articlesResult.articles?.length).toBe(1);
      if (articlesResult.articles) {
        expect(articlesResult.articles[0].availableStock).toBe(1);
      }

      // Retrieve from database to check the available stock
      const articledRetrieved = await get(resultArticle1.article?.id!);
      expect(articledRetrieved.article?.availableStock).toBe(1);
    }
  });

  test('Reduce the stock to ZERO with a single Article used by a TWO Products', async () => {
    const resultArticle1 = await upsertArticle({
      name: 'Article 1',
      availableStock: 2,
      identification: BigInt(11223344),
      id: 0
    });

    // Create a Product with Article 1
    const articleList = [
      {
        articleId: resultArticle1.article?.id!,
        quantity: 1
      }
    ];

    // Create two Product
    const productCreated = await upsertProduct(
      {
        name: 'Test Product Create 1',
        price: priceDecimal,
        id: 0
      },
      articleList
    );

    expect(productCreated.product).not.toBeNull();

    if (productCreated.product) {
      const articlesResult = await updateStockByProductMade(
        productCreated.product.id,
        2
      );
      expect(articlesResult.error).toBeNull();
      expect(articlesResult.articles?.length).toBe(1);
      if (articlesResult.articles) {
        expect(articlesResult.articles[0].availableStock).toBe(0);
      }

      // Retrieve from database to check the available stock
      const articledRetrieved = await get(resultArticle1.article?.id!);
      expect(articledRetrieved.article?.availableStock).toBe(0);
    }
  });

  test('Reduce the stock to ZERO of one Article and to ONE of other used by a ONE Products', async () => {
    const resultArticle1 = await upsertArticle({
      name: 'Article 1',
      availableStock: 3,
      identification: BigInt(11223344),
      id: 0
    });
    const resultArticle2 = await upsertArticle({
      name: 'Article 2',
      availableStock: 4,
      identification: BigInt(999888111),
      id: 0
    });

    // Create a Product with Article 1 and Article 2.
    const articleList = [
      {
        articleId: resultArticle1.article?.id!,
        quantity: 1
      },
      {
        articleId: resultArticle2.article?.id!,
        quantity: 2
      }
    ];

    // Create one Product
    const productCreated = await upsertProduct(
      {
        name: 'Test Product Create 1',
        price: priceDecimal,
        id: 0
      },
      articleList
    );

    expect(productCreated.product).not.toBeNull();

    if (productCreated.product) {
      const articlesResult = await updateStockByProductMade(
        productCreated.product.id,
        2
      );
      expect(articlesResult.error).toBeNull();
      expect(articlesResult.articles?.length).toBe(2);

      // Retrieve from database to check the available stock
      const article1Retrieved = await get(resultArticle1.article?.id!);
      expect(article1Retrieved.article?.availableStock).toBe(1);
      const article2Retrieved = await get(resultArticle2.article?.id!);
      expect(article2Retrieved.article?.availableStock).toBe(0);
    }
  });

  /**
   * In this scenario we test the scenario in which we have TWO Products that has one Article in common.
   * The Product1 has two Articles in its compositions, whereas the Product2 has only one, which is one
   * of the Articles on the Product1.
   * Making a scenario where both Products will be used to update the stock of both Articles
   */
  test('Reduce the stock to ONE of one Article and to TWO of other used by a TWO Products', async () => {
    const resultArticle1 = await upsertArticle({
      name: 'Article 1',
      availableStock: 12,
      identification: BigInt(11223344),
      id: 0
    });
    const resultArticle2 = await upsertArticle({
      name: 'Article 2',
      availableStock: 8,
      identification: BigInt(999888111),
      id: 0
    });

    // Create one Product with Article 1 and Article 2.
    const articleListProduct1 = [
      {
        articleId: resultArticle1.article?.id!,
        quantity: 1
      }
    ];
    const product1Created = await upsertProduct(
      {
        name: 'Test Product Create 1',
        price: priceDecimal,
        id: 0
      },
      articleListProduct1
    );

    // Create one Product with Article 1 and Article 2.
    const articleListProduct2 = [
      {
        articleId: resultArticle1.article?.id!,
        quantity: 3
      },
      {
        articleId: resultArticle2.article?.id!,
        quantity: 2
      }
    ];
    const product2Created = await upsertProduct(
      {
        name: 'Test Product Create 1',
        price: priceDecimal,
        id: 0
      },
      articleListProduct2
    );

    expect(product1Created.product).not.toBeNull();
    expect(product2Created.product).not.toBeNull();

    if (product1Created.product && product2Created.product) {
      const articles1Result = await updateStockByProductMade(
        product1Created.product.id,
        2
      );
      expect(articles1Result.error).toBeNull();
      expect(articles1Result.articles?.length).toBe(1);
      const articles2Result = await updateStockByProductMade(
        product2Created.product.id,
        3
      );
      expect(articles2Result.error).toBeNull();
      expect(articles2Result.articles?.length).toBe(2);

      // Retrieve from database to check the available stock
      const article1Retrieved = await get(resultArticle1.article?.id!);
      expect(article1Retrieved.article?.availableStock).toBe(1);
      const article2Retrieved = await get(resultArticle2.article?.id!);
      expect(article2Retrieved.article?.availableStock).toBe(2);
    }
  });
});
