import express from 'express';
import { log } from '../logger';
import {
  checkArticleHealth,
  get,
  getAll,
  updateStockByProductMade,
  upsert
} from '../services/article';
import { serializeNonDefaultTypes } from './utils';

export default {
  configureRoutes: (prefix: string, app: express.Application) => {
    /**
     * Checks whether the service has all resources he needs to properly operate
     * Possible returns:
     * - 204 : the service is OK
     * - 404 : the service is Degraded
     */
     app.get(`/${prefix}/health`, async (_, res) => {
      try {
        await checkArticleHealth();
        res.status(200).send("ok");
      } catch (error: any) {
        log.info(error);
        res.status(500).send('Degraded');
      }
      });

    /**
     * Retrieve all the articles
     */
    app.get(`/${prefix}`, async (req, res) => {
      try {
        // Invoke the service to get all the articles
        const allArticles = await getAll({
          identification: req.query.identification
            ? parseInt(req.query.identification?.toString(), 10)
            : undefined
        });

        // serialize the result with special serializer because of some non-standard types, like `bigint`
        const articlesParsed = serializeNonDefaultTypes(allArticles.articles);
        res.json(articlesParsed);
      } catch (error) {
        log.error(
          'Error invoking `getAll` from `article service`. Details:',
          error
        );
        res.status(500).send('There was an error fetching the Articles');
      }
    });

    /**
     * Retrieve single the article
     */
    app.get(`/${prefix}/:id`, async (req, res) => {
      try {
        // Invoke the service to get an article by the provided ID
        const retrievedArticle = await get(parseInt(req.params.id, 10));

        // serialize the result with special serializer because of some non-standard types, like `bigint`
        const articleParsed = serializeNonDefaultTypes(
          retrievedArticle.article
        );
        res.json(articleParsed);
      } catch (error) {
        log.error(
          'Error invoking `get` from `article service`. Details:',
          error
        );
        res.status(500).send('There was an error fetching the Product');
      }
    });

    /**
     * Create an article
     */
    app.post(`/${prefix}`, async (req, res) => {
      try {
        if (req.body.id) {
          return res.status(400).json({
            message: 'Not allowed to specify Article ID when creating a new one'
          });
        }
        // prepare the data to be inserted
        const newArticle = {
          name: req.body.name,
          availableStock: req.body.availableStock,
          identification: req.body.identification,
          id: 0
        };

        // invoke the service that will write the received data to the database
        const creationResult = await upsert(newArticle);
        if (creationResult.error) {
          return res
            .status(500)
            .json({ msg: 'There was an error processing your request' });
        }

        // serialize the result with special serializer because of some non-standard types, like `bigint`
        const articleParsed = serializeNonDefaultTypes(creationResult.article);
        return res.json(articleParsed);
      } catch (error) {
        log.error(
          'Error invoking `upsert` from `article service`. Details:',
          error
        );
        return res.status(500).send('There was an error fetching the Articles');
      }
    });

    /**
     * Update Article stock based on Product selling event
     */
    app.post(`/${prefix}/stock-update/by/product/:id`, async (req, res) => {
      try {
        // handle the `quantity` query param to guarantee we have a valid value
        const quantity = req.body.quantity
          ? parseInt(`${req.body.quantity}`, 10)
          : 1;

        // invoke the update Stock service
        const updatedStock = await updateStockByProductMade(
          parseInt(req.params.id, 10),
          quantity
        );
        const articlesParsed = serializeNonDefaultTypes(updatedStock);
        return res.json(articlesParsed);
      } catch (error) {
        log.error(
          'Error invoking `updateStockByProductMade` from `article service`. Details:',
          error
        );
        return res
          .status(500)
          .send('There was an error updating the Articles invetory stock');
      }
    });
  }
};
