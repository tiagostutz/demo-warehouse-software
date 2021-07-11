import express from "express";
import { log } from "../logger";
import { getAll } from "../services/product";
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
          "Error invoking `getAll` from `allProducts`. Details:",
          error
        );
        res.status(500).send("There was an error fetching the Products");
      }
    });
  },
};
