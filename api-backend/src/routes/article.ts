import express from "express";
import { log } from "../logger";
import { get, getAll, upsert } from "../services/article";
import { serializeNonDefaultTypes } from "./utils";

export default {
  configureRoutes: (prefix: string, app: express.Application) => {
    /**
     * Checks whether the service has all resources he needs to properly operate
     * Possible returns:
     * - 204 : the service is OK
     * - 404 : the service is Degraded
     */
    app.get(`/${prefix}/health`, async (_, res) => res.status(204).send());

    /**
     * Retrieve all the articles
     */
    app.get(`/${prefix}`, async (_, res) => {
      try {
        const allArticles = await getAll();
        const articlesParsed = serializeNonDefaultTypes(allArticles.articles);
        res.json(articlesParsed);
      } catch (error) {
        log.error(
          "Error invoking `getAll` from `article service`. Details:",
          error
        );
        res.status(500).send("There was an error fetching the Articles");
      }
    });

    /**
     * Retrieve single the article
     */
    app.get(`/${prefix}/:id`, async (req, res) => {
      try {
        const retrievedArticle = await get(parseInt(req.params.id));
        const articleParsed = serializeNonDefaultTypes(
          retrievedArticle.article
        );
        res.json(articleParsed);
      } catch (error) {
        log.error(
          "Error invoking `get` from `article service`. Details:",
          error
        );
        res.status(500).send("There was an error fetching the Product");
      }
    });

    /**
     * Create an article
     */
    app.post(`/${prefix}`, async (req, res) => {
      try {
        if (req.body.id) {
          return res.status(400).json({
            message:
              "Not allowed to specify Article ID when creating a new one",
          });
        }
        const newArticle = {
          name: req.body.name,
          availableStock: req.body.availableStock,
          identification: req.body.identification,
          id: 0,
        };
        const createdArticle = await upsert(newArticle);
        const articleParsed = serializeNonDefaultTypes(createdArticle);
        res.json(articleParsed);
      } catch (error) {
        log.error(
          "Error invoking `upsert` from `article service`. Details:",
          error
        );
        res.status(500).send("There was an error fetching the Articles");
      }
    });
  },
};
