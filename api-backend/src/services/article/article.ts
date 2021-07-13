import { Article } from '@prisma/client';
import { log } from '../../logger';
import { prisma } from '../prisma-client';
import { get as getProduct } from '../product';

// Typed Return: convention on how to return
// Use error as part of the return instead of using exceptions (like async/await forces).
// This way we have a more "procedural" flow, like would do in a Golang idiomatic way

export type ArticleReturnSingle = {
  article: Article | null;
  error: string | null;
};

export type ArticleReturnList = {
  articles: Array<Article> | null;
  error: string | null;
};

// ------

/**
 * Writes an Article to the database
 *
 * @param article article to be created
 * @returns the created Article
 */
export const upsert = async (
  article: Article
): Promise<ArticleReturnSingle> => {
  try {
    // get only the necessary attributes to write do Database
    // for instance, the `id` is not passed because the column is autoincrement (serial)
    const { identification, name, availableStock } = article;
    const articleCreated = await prisma.article.upsert({
      where: { id: article.id },
      create: { identification, name, availableStock },
      update: { identification, name, availableStock }
    });
    return {
      article: articleCreated,
      error: null
    };
  } catch (error) {
    log.error('Error creating an Article. Details:', error);
    return {
      article: null,
      error:
        'Error inserting an Article to the database. Check the logs for more details'
    };
  }
};

/**
 * Fetches a single article with primary key = param id
 *
 * @param id primary key value of the fetching Article
 * @returns Article or Error
 */
export const get = async (id: number): Promise<ArticleReturnSingle> => {
  try {
    const single = await prisma.article.findUnique({
      where: {
        id
      }
    });
    return { article: single, error: null };
  } catch (error) {
    log.error('Error fetching One Article by Id. Details:', error);
    return {
      article: null,
      error: 'Error fetching One Article by Id. Check the logs for more details'
    };
  }
};

/**
 * Fetches a single article with identification = param identification
 *
 * @param identification value to find corresponding Article
 * @returns Article or Error
 */
export const getByIdentification = async (
  identification: number
): Promise<ArticleReturnSingle> => {
  try {
    const single = await prisma.article.findFirst({
      where: {
        identification
      }
    });
    return { article: single, error: null };
  } catch (error) {
    log.error('Error fetching One Article by Id. Details:', error);
    return {
      article: null,
      error: 'Error fetching One Article by Id. Check the logs for more details'
    };
  }
};

/**
 * Fetches a list of Articles
 * TODO: Pagination/Limit
 *
 * @returns a list with all Articles
 */
export const getAll = async ({
  identification
}: {
  identification: number | undefined;
}): Promise<ArticleReturnList> => {
  try {
    let filter = {};
    if (identification) {
      filter = {
        where: {
          identification
        }
      };
    }
    const allArticles = await prisma.article.findMany(filter);
    return { articles: allArticles, error: null };
  } catch (error) {
    log.error('Error fetching all Articles. Details:', error);
    return {
      articles: null,
      error: 'Error fetching all Articles. Check the logs for more details'
    };
  }
};

/**
 * Update Articles quantity based on the Product Article consumption to be made.
 * Based on a given Product, it finds its Article composition, checks for
 * the quantity involved in the production of one product. multiply it for the `quantity``
 * of Products made and update (reduce) the inventory of each of the Articles involved
 * and returns this list os used Articles with respective inventory quantity updated
 *
 * @returns a list of Articles with updated stock quantities
 */
export const updateStockByProductMade = async (
  productId: number,
  productQuantity: number
): Promise<ArticleReturnList> => {
  try {
    const productResult = await getProduct(productId);
    if (productResult.error) {
      return { error: 'Error updating the stock by Product.', articles: [] };
    }

    // If the product doesn't exist, return an error
    if (!productResult.product) {
      return {
        error: `Could not find a Product with id=${productId}`,
        articles: []
      };
    }

    // Retrieve all the articles used by the Product passed as param
    // with all the details (current stock, for instance)
    // to check and update the article inventory
    const articlesWithNewStockValue = await Promise.all(
      // for each article in the given Product, fetch
      // it current stock detail, reduce by the amount used
      // to build the product and return as the new stock value
      productResult.product.articles.map(async (aop) => {
        // fetch the article to know how many of this there currenly is in inventory
        const articleFetched = await prisma.article.findUnique({
          where: {
            id: aop.articleId
          }
        });

        // will happen just if we have a referential integrity issue, which is not likely
        // to happen as we set our model with FKs
        if (!articleFetched) {
          return {
            id: aop.articleId,
            error: `Error fetching article with ID=${aop.articleId}`,
            newStockQuantity: 0
          };
        }

        // evaluate the new stock value by reducing the current availableStock
        // by the of this Article used to make the given Product and quantity of
        // products passed as param
        const newStockQuantity =
          articleFetched.availableStock - productQuantity * aop.quantity;

        // Update on the database the value of the new Stock value
        const updatedArticle = await prisma.article.update({
          where: {
            id: articleFetched.id
          },
          data: {
            availableStock: newStockQuantity
          }
        });

        // if success at Stock update, return "a summary" of the operation
        if (updatedArticle) {
          return {
            ...articleFetched,
            id: articleFetched.id,
            previousStockQuantity: articleFetched.availableStock,
            newStockQuantity
          };
        }
        return {
          id: articleFetched.id,
          error: `Error retrieving info for Article id=${articleFetched.id}`
        };
      })
    );

    const updatesArticles = articlesWithNewStockValue.map((artc) => artc.id);
    const allArticles = await prisma.article.findMany({
      where: {
        id: {
          in: updatesArticles
        }
      }
    });
    return { articles: allArticles, error: null };
  } catch (error) {
    log.error('Error fetching all Articles. Details:', error);
    return {
      articles: null,
      error: 'Error fetching all Articles. Check the logs for more details'
    };
  }
};
