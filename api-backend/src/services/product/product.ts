import { Product } from '@prisma/client';
import { log } from '../../logger';
import { prisma } from '../prisma-client';
import {
  ArticlesAssignment,
  ProductAvailable,
  ProductComplete
} from '../model';
import { get as getArticle } from '../article';

// Typed Return: convention on how to return
// Use error as part of the return instead of using exceptions (like async/await forces).
// This way we have a more "procedural" flow, like would do in a Golang idiomatic way

export type ProductReturn<T extends Product> = {
  product: T | null;
  error: string | null;
};

export type ProductReturnList<T extends Product> = {
  products: Array<T> | null;
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
): Promise<ProductReturn<Product>> => {
  try {
    // get only the necessary attributes to write do Database
    // for instance, the `id` is not passed because the column is autoincrement (serial)
    const { name, price } = product;

    const articlesOnProductsCreate = articles.map((article) => ({
      quantity: article.quantity,
      articleId: article.articleId
    }));

    const productCreated = await prisma.product.upsert({
      where: { id: product.id },
      create: {
        name,
        price,
        articles: {
          createMany: {
            data: articlesOnProductsCreate,
            skipDuplicates: true
          }
        }
      },
      update: { name, price }
    });
    const productComplete = Object.assign(productCreated, { articles: [] });
    return {
      product: productComplete,
      error: null
    };
  } catch (error) {
    log.error('Error creating a Product. Details:', error);
    return {
      product: null,
      error:
        'Error inserting a Product to the database. Check the logs for more details'
    };
  }
};

/**
 * Fetches a single Product with primary key = param id
 *
 * @param id primary key value of the fetching Product
 * @returns Product or Error
 */
export const get = async (
  id: number
): Promise<ProductReturn<ProductComplete>> => {
  try {
    const retrievedProduct = await prisma.product.findUnique({
      where: {
        id
      }
    });

    // if doesnt find the product, don't waste timing searching for articlesOnProducts
    if (!retrievedProduct) {
      return { product: null, error: null };
    }

    const articlesOnProducts = await prisma.articlesOnProducts.findMany({
      where: {
        productId: retrievedProduct?.id
      }
    });

    // compose the returning object with Products data + articles used to make it
    const fullProduct = Object.assign(retrievedProduct, {
      articles: articlesOnProducts
    });
    return { product: fullProduct, error: null };
  } catch (error) {
    log.error('Error fetching One Product by Id. Details:', error);
    return {
      product: null,
      error: 'Error fetching One Product by Id. Check the logs for more details'
    };
  }
};

/**
 * Fetches a list of Products
 * TODO: Pagination/Limit
 *
 * @returns a list with all Products
 */
export const getAll = async (): Promise<ProductReturnList<Product>> => {
  try {
    const allProducts = await prisma.product.findMany({});
    return { products: allProducts, error: null };
  } catch (error) {
    log.error('Error fetching all Products. Details:', error);
    return {
      products: null,
      error: 'Error fetching all Products. Check the logs for more details'
    };
  }
};

/**
 * Fetches a list of Products with Articles used
 * TODO: Pagination/Limit
 * @returns a list with all Products
 */
export const getAllWithAvailability = async (): Promise<
  ProductReturnList<ProductAvailable>
> => {
  try {
    // Check how the code above just looks like a GraphQL resolver!
    // If we have GraphQL, we could fire a request here and have
    // the data we need for this logic. Nice TODO: GraphQL.

    // 1) Retrieve all the products that will be returned
    const allProducts = await prisma.product.findMany({});

    // 2) For every Product, fetch the Product composition, that is the Articles and respective
    // quantities from ArticleOnProduct relation
    // and enrich it with the Article details
    const productsWithArticles = await Promise.all(
      // 2.1) For each Product, retrieve the relations with Article
      allProducts.map(async (product) => {
        // 2.1.1) fetch the relationships for the current product
        const articlesOnProductsRetrieved =
          await prisma.articlesOnProducts.findMany({
            where: {
              productId: product.id
            }
          });

        // 2.1.2) For each relation retrieved, fetch the Article details to build
        // the enriched relationship data
        const articlesOnProductsWithArticleDetails = await Promise.all(
          articlesOnProductsRetrieved.map(async (aopr) => {
            // we totally need a cache here to improve this resolution
            // TODO: cache

            // 2.1.2.1) Fetch the Article details
            const articleGetResult = await getArticle(aopr.articleId);
            if (articleGetResult.error) {
              // if there's an error retrieving details, put this information
              return {
                ...aopr,
                article: {
                  name: '<failed to fetch>',
                  identification: 0,
                  availableStock: -1
                }
              };
            }

            // merge/enrich the ArticleOnProduct objetct with the Article details + quantity field
            // of the relationship
            return {
              article: articleGetResult.article,
              quantity: aopr.quantity
            };
          })
        );

        // 2.1.3) **Evaluate the product quantity available**
        //  find the min stock/quantity ratio among all the Articles needed to know
        // what's the minimum quantity
        //  of Products can be done, because that will the available Product count
        const articlesQuantityProducts =
          articlesOnProductsWithArticleDetails.map((apdetail) =>
            Math.floor(apdetail.article?.availableStock! / apdetail.quantity)
          );
        // among the array of how many Products can be made by each Article, get the min
        // because that will be the available Product count
        const quantityAvailable = Math.min.apply(
          null,
          articlesQuantityProducts
        );

        // 2.1.4) return the enriched relationship ArticleOnProduct
        return {
          ...product,
          articles: articlesOnProductsWithArticleDetails,
          quantityAvailable
        };
      })
    );

    return { products: productsWithArticles, error: null };
  } catch (error) {
    log.error('Error fetching all Products. Details:', error);
    return {
      products: null,
      error: 'Error fetching all Products. Check the logs for more details'
    };
  }
};
