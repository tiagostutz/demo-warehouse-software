import express from "express";
import { log } from "../logger";
import { get, getAll, upsert } from "../services/product";
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
     * Retrieve all the products
     */
    app.get(`/${prefix}`, async (_, res) => {
      try {
        const allProducts = await getAll();
        const productsParsed = serializeNonDefaultTypes(allProducts.products);
        res.json(productsParsed);
      } catch (error) {
        log.error(
          "Error invoking `getAll` from `product service`. Details:",
          error
        );
        res.status(500).send("There was an error fetching the Products");
      }
    });

    /**
     * Retrieve single the product
     */
    app.get(`/${prefix}/:id`, async (req, res) => {
      try {
        const retrievedProduct = await get(parseInt(req.params.id));
        const productParsed = serializeNonDefaultTypes(
          retrievedProduct.product
        );
        res.json(productParsed);
      } catch (error) {
        log.error(
          "Error invoking `get` from `product service`. Details:",
          error
        );
        res.status(500).send("There was an error fetching the Product");
      }
    });

    /**
     * Create an product
     */
    app.post(`/${prefix}`, async (req, res) => {
      try {
        log.silly(req.body);
        if (req.body.id) {
          return res.status(400).json({
            message:
              "Not allowed to specify Product ID when creating a new one",
          });
        }

        // extract the basic data from the Product
        // to pass to the service invocation
        const basicData = {
          id: 0,
          name: req.body.name,
          price: req.body.price,
        };
        const articles = req.body.articles ? req.body.articles : [];
        const createdProduct = await upsert(basicData, articles);
        const productParsed = serializeNonDefaultTypes(createdProduct);
        res.json(productParsed);
      } catch (error) {
        log.error(
          "Error invoking `upsert` from `product service`. Details:",
          error
        );
        res.status(500).send("There was an error creating a Product");
      }
    });
  },
};
