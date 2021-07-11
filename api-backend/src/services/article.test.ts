import { PrismaClient } from "@prisma/client";
import { create, get } from "./article";

describe("Testing CRUD Operations", () => {
  // Before each test, clean the database to run a "clean" test
  beforeEach(async () => {
    const prisma = new PrismaClient();
    // clean
    await prisma.article.deleteMany({});
  });

  // After all tests, clean the database for any test data inserted
  afterAll(async () => {
    const prisma = new PrismaClient();
    // clean
    await prisma.article.deleteMany({});
  });

  test("Fetch by ID returning null", async () => {
    const result = await get(1);
    expect(result.article).toBeNull();
    expect(result.error).toBeNull();
  });

  test("Create simple Article", async () => {
    const result = await create({
      name: "Test",
      availableStock: 0,
      identification: 10001,
      id: 0,
    });
    expect(result.article).not.toBeNull();
    expect(result.error).toBeNull();

    expect(result.article?.identification).toBe(10001);
  });

  test("Attempt to insert duplicated identification Articles should return error", async () => {
    const result = await create({
      name: "Test",
      availableStock: 0,
      identification: 10001,
      id: 0,
    });
    expect(result.article).not.toBeNull();
    expect(result.error).toBeNull();
    expect(result.article?.identification).toBe(10001);

    const resultDupl = await create({
      name: "Test",
      availableStock: 0,
      identification: 10001,
      id: 0,
    });

    expect(resultDupl.article).toBeNull();
    expect(resultDupl.error).not.toBeNull();
  });
});
