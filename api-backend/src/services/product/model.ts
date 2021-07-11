import { Article, ArticlesOnProducts, Product } from "@prisma/client";

/**
 * Specify quantity of articles used to made a product
 */
export type ArticlesAssignment = {
  articleId: number;
  quantity: number;
};

export type ProductComplete = Product & { articles: Array<ArticlesOnProducts> };

export type ProductAvailable = Product & {
  articles: Array<any>;
  quantityAvailable: number;
};
