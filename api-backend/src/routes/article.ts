import express from "express";
import { log } from "../logger";
import { getAll } from "../services/article";

export const addRoutes = (app: express.Application) => {
  /**
   * Checks whether the service has all resources he needs to properly operate
   * Possible returns:
   * - 204 : the service is OK
   * - 404 : the service is Degraded
   */
  app.get("/health", async (_, res) => res.status(204).send());

  app.get("/", async (_, res) => {
    try {
      const allArticles = await getAll();
      res.json(allArticles);
    } catch (error) {
      log.error("Error invoking `getAll` from `allArticles`. Details:", error);
      res.status(500).send("There was an error fetching the Articles");
    }
  });
};
