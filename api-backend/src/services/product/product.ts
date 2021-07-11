import { Product } from "@prisma/client";
import { log } from "../../logger";
import { prisma } from "../prisma-client";

// Typed Return: convention on how to return
// Use error as part of the return instead of using exceptions (like async/await forces).
// This way we have a more "procedural" flow, like would do in a Golang idiomatic way

export type ProductReturnSingle = {
  product: Product | null;
  error: string | null;
};

export type ProductReturnList = {
  products: Array<Product> | null;
  error: string | null;
};

// ------

/**
 * Writes a Product to the database
 *
 * @param Product Product to be created
 * @returns the created Product
 */
export const upsert = async (
  product: Product
): Promise<ProductReturnSingle> => {
  try {
    // get only the necessary attributes to write do Database
    // for instance, the `id` is not passed because the column is autoincrement (serial)
    const { name, price } = product;
    const ProductCreated = await prisma.product.upsert({
      where: { id: product.id },
      create: { name, price },
      update: { name, price },
    });
    return {
      product: ProductCreated,
      error: null,
    };
  } catch (error) {
    log.error("Error creating a Product. Details:", error);
    return {
      product: null,
      error:
        "Error inserting a Product to the database. Check the logs for more details",
    };
  }
};

/**
 * Fetches a single Product with primary key = param id
 *
 * @param id primary key value of the fetching Product
 * @returns Product or Error
 */
export const get = async (id: number): Promise<ProductReturnSingle> => {
  try {
    const single = await prisma.product.findUnique({
      where: {
        id,
      },
    });
    return { product: single, error: null };
  } catch (error) {
    log.error("Error fetching One Product by Id. Details:", error);
    return {
      product: null,
      error:
        "Error fetching One Product by Id. Check the logs for more details",
    };
  }
};

/**
 * Fetches a list of Products
 * TODO: Pagination/Limit
 *
 * @returns a list with all Products
 */
export const getAll = async (): Promise<ProductReturnList> => {
  try {
    const allProducts = await prisma.product.findMany({});
    return { products: allProducts, error: null };
  } catch (error) {
    log.error("Error fetching all Products. Details:", error);
    return {
      products: null,
      error: "Error fetching all Products. Check the logs for more details",
    };
  }
};
