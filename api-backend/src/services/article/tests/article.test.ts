import { request } from 'http';
import { upsert, get, checkArticleHealth } from '..';
import { prisma } from '../../prisma-client';

const identificationMockBigInt = BigInt(20211010090012331);

describe('Testing CRUD Operations', () => {
  // Before each test, clean the database to run a "clean" test
  beforeEach(async () => {
    // clean
    await prisma.article.deleteMany({});
  });

  // After all tests, clean the database for any test data inserted
  afterAll(async () => {
    // clean
    await prisma.article.deleteMany({});
  });

  test('Fetch by ID returning null', async () => {
    const result = await get(1);
    expect(result.article).toBeNull();
    expect(result.error).toBeNull();
  });

  test('Create simple Article', async () => {
    const result = await upsert({
      name: 'Test',
      availableStock: 0,
      identification: identificationMockBigInt,
      id: 0,
    });
    expect(result.article).not.toBeNull();
    expect(result.error).toBeNull();

    expect(result.article?.identification).toBe(identificationMockBigInt);
  });

  test('Attempt to insert duplicated identification Articles should return error', async () => {
    const result = await upsert({
      name: 'Test',
      availableStock: 0,
      identification: identificationMockBigInt,
      id: 0,
    });
    expect(result.article).not.toBeNull();
    expect(result.error).toBeNull();
    expect(result.article?.identification).toBe(identificationMockBigInt);

    const resultDupl = await upsert({
      name: 'Test',
      availableStock: 0,
      identification: identificationMockBigInt,
      id: 0,
    });

    expect(resultDupl.article).toBeNull();
    expect(resultDupl.error).not.toBeNull();
  });

  test('Insert and Update Article', async () => {
    const result = await upsert({
      name: 'Test',
      availableStock: 0,
      identification: identificationMockBigInt,
      id: 0,
    });
    expect(result.article).not.toBeNull();
    expect(result.error).toBeNull();
    expect(result.article?.identification).toBe(identificationMockBigInt);

    const resultUpdate = await upsert({
      name: 'Test name changed',
      availableStock: 0,
      identification: identificationMockBigInt,
      id: result.article?.id!,
    });

    expect(resultUpdate.article).not.toBeNull();
    expect(resultUpdate.error).toBeNull();

    expect(resultUpdate.article?.name).toBe('Test name changed');

    const resultGet = await get(result.article?.id!);
    expect(resultGet.error).toBeNull();
    expect(resultGet.article?.identification).toBe(identificationMockBigInt);
  });

  /**
   * queries the number of rows to check db connection
   */
  test('Attempt to query count to check db connection', async () => {
    const result = await checkArticleHealth();
    expect(result).not.toBeNull();
  });
  test('check for article health status code', async () => {
    request('http://localhost:4000/article/health', (res) => {
      expect(res.statusCode).toEqual(200);
    })
   });
});
