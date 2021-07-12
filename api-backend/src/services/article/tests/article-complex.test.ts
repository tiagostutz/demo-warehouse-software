import { Prisma } from '@prisma/client';
import { prisma } from '../../prisma-client';
import { upsert as upsertProduct } from '../../product';
import { upsert as upsertArticle } from '..';
import { updateStockByProductMade } from '../article';

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
  test('Reduce by ONE a single Article used by one Product', async () => {
    const resultArticle1 = await upsertArticle({
      name: 'Article 1',
      availableStock: 2,
      identification: BigInt(11223344),
      id: 0,
    });

    // Create a Product with Article 1, Article 2 and Article 3.
    const articleList = [
      {
        articleId: resultArticle1.article?.id!,
        quantity: 1,
      },
    ];

    // Create two Products with the same composition
    const productCreated = await upsertProduct(
      {
        name: 'Test Product Create 1',
        price: priceDecimal,
        id: 0,
      },
      articleList,
    );

    expect(productCreated.product).not.toBeNull();

    if (productCreated.product) {
      updateStockByProductMade(productCreated.product.id, 1);
    }
  });
});
