import { upsert, get } from "./product";
import { prisma } from "../prisma-client";
import { Prisma } from "@prisma/client";

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
    const result = await get(1);
    expect(result.product).toBeNull();
    expect(result.error).toBeNull();
  });

  test("Create simple Product", async () => {
    const result = await upsert({
      name: "Test",
      price: priceDecimal,
      id: 0,
    });
    expect(result.product).not.toBeNull();
    expect(result.error).toBeNull();

    expect(result.product?.price.toNumber()).toBe(priceDecimal.toNumber());
  });

  test("Insert and Update Product", async () => {
    const result = await upsert({
      name: "Test",
      price: priceDecimal,
      id: 0,
    });
    expect(result.product).not.toBeNull();
    expect(result.error).toBeNull();
    expect(result.product?.price.toNumber()).toBe(priceDecimal.toNumber());

    const resultUpdate = await upsert({
      name: "Test name changed",
      price: new Prisma.Decimal(99.99),
      id: result.product?.id!,
    });

    expect(resultUpdate.product).not.toBeNull();
    expect(resultUpdate.error).toBeNull();

    expect(resultUpdate.product?.name).toBe("Test name changed");

    const resultGet = await get(result.product?.id!);
    expect(resultGet.error).toBeNull();
    expect(resultGet.product?.price.toNumber()).toBe(
      new Prisma.Decimal(99.99).toNumber()
    );
  });
});
