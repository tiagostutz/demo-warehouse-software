import { Article, PrismaClient } from '@prisma/client';
import { log } from '../logger';

const prisma = new PrismaClient();

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
    log.error('Error fetching One Article by Id');
    return {
      article: null,
      error:
        'Error fetching One Article by Id. Check the logs for more details',
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
  identification: number,
): Promise<ArticleReturnSingle> => {
  try {
    const single = await prisma.article.findFirst({
      where: {
        identification,
      },
    });
    return { article: single, error: null };
  } catch (error) {
    log.error('Error fetching One Article by Id. Details:', error);
    return {
      article: null,
      error:
        'Error fetching One Article by Id. Check the logs for more details',
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
    log.error('Error fetching all Articles. Details:', error);
    return {
      articles: null,
      error: 'Error fetching all Articles. Check the logs for more details',
    };
  }
};
