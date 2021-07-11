import { Product } from "@prisma/client";
import { log } from "../../logger";
import { prisma } from "../prisma-client";
import { ArticlesAssignment, ProductComplete } from "./model";

// Typed Return: convention on how to return
// Use error as part of the return instead of using exceptions (like async/await forces).
// This way we have a more "procedural" flow, like would do in a Golang idiomatic way

export type ProductReturnSingle = {
  product: ProductComplete | null;
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
  product: Product,
  articles: Array<ArticlesAssignment>
): Promise<ProductReturnSingle> => {
  try {
    // get only the necessary attributes to write do Database
    // for instance, the `id` is not passed because the column is autoincrement (serial)
    const { name, price } = product;

    const articlesOnProductsCreate = articles.map((article) => ({
      quantity: article.quantity,
      articleId: article.articleId,
    }));

    const productCreated = await prisma.product.upsert({
      where: { id: product.id },
      create: {
        name,
        price,
        articles: {
          createMany: {
            data: articlesOnProductsCreate,
            skipDuplicates: true,
          },
        },
      },
      update: { name, price },
    });
    const productComplete = Object.assign(productCreated, { articles: [] });
    return {
      product: productComplete,
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
    const retrievedProduct = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    // if doesnt find the product, don't waste timing searching for articlesOnProducts
    if (!retrievedProduct) {
      return { product: null, error: null };
    }

    const articlesOnProducts = await prisma.articlesOnProducts.findMany({
      where: {
        productId: retrievedProduct?.id,
      },
    });

    // compose the returning object with Products data + articles used to make it
    const fullProduct = Object.assign(retrievedProduct, {
      articles: articlesOnProducts,
    });
    return { product: fullProduct, error: null };
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
