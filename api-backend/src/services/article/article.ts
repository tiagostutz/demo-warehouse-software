import { Article } from "@prisma/client";
import { log } from "../../logger";
import { prisma } from "../prisma-client";

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
      update: { identification, name, availableStock },
    });
    return {
      article: articleCreated,
      error: null,
    };
  } catch (error) {
    log.error("Error creating an Article. Details:", error);
    return {
      article: null,
      error:
        "Error inserting an Article to the database. Check the logs for more details",
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
        id,
      },
    });
    return { article: single, error: null };
  } catch (error) {
    log.error("Error fetching One Article by Id. Details:", error);
    return {
      article: null,
      error:
        "Error fetching One Article by Id. Check the logs for more details",
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
        identification,
      },
    });
    return { article: single, error: null };
  } catch (error) {
    log.error("Error fetching One Article by Id. Details:", error);
    return {
      article: null,
      error:
        "Error fetching One Article by Id. Check the logs for more details",
    };
  }
};

/**
 * Fetches a list of Articles
 * TODO: Pagination/Limit
 *
 * @returns a list with all Articles
 */
export const getAll = async (): Promise<ArticleReturnList> => {
  try {
    const allArticles = await prisma.article.findMany({});
    return { articles: allArticles, error: null };
  } catch (error) {
    log.error("Error fetching all Articles. Details:", error);
    return {
      articles: null,
      error: "Error fetching all Articles. Check the logs for more details",
    };
  }
};
