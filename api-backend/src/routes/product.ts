import express from 'express';
import { log } from '../logger';
import { getAll, getAllWithAvailability, upsert } from '../services/product';
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
        await  checkProductHealth();
        res.status(201).send("ok");
      } catch (error: any) {
        log.info(error);
        res.status(404).send('Degraded');
      }
      });

    /**
     * Retrieve all the products
     */
    app.get(`/${prefix}`, async (_, res) => {
      try {
        // Invoke the service to get all the products on the base
        const allProducts = await getAll();

        // serialize the result with special serializer because of some non-standard types, like `bigint`
        const productsParsed = serializeNonDefaultTypes(allProducts.products);
        res.json(productsParsed);
      } catch (error) {
        log.error(
          'Error invoking `getAll` from `product service`. Details:',
          error
        );
        res.status(500).send('There was an error fetching the Products');
      }
    });

    /**
     * Retrieve single the product
     */
    app.get(`/${prefix}/:id`, async (req, res) => {
      try {
        // Invoke the service to get an product by the provided ID
        const retrievedProduct = await getAllWithAvailability(
          parseInt(req.params.id, 10)
        );

        // serialize the result with special serializer because of some non-standard types, like `bigint`
        const productParsed = serializeNonDefaultTypes(
          retrievedProduct.products
        );
        if (productParsed.length > 0) {
          return res.json(productParsed);
        }
        return res.status(404).send('Not found');
      } catch (error) {
        log.error(
          'Error invoking `get` from `product service`. Details:',
          error
        );
        return res.status(500).send('There was an error fetching the Product');
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
            message: 'Not allowed to specify Product ID when creating a new one'
          });
        }

        // extract the basic data from the Product
        // to pass to the service invocation
        const basicData = {
          id: 0,
          name: req.body.name,
          price: req.body.price
        };
        const articles = req.body.articles ? req.body.articles : [];

        // invoke the service that will write the received data to the database
        const creationResult = await upsert(basicData, articles);
        if (creationResult.error) {
          return res
            .status(500)
            .json({ msg: 'There was an error processing your request' });
        }
        // serialize the result with special serializer because of some non-standard types, like `bigint`
        const productParsed = serializeNonDefaultTypes(creationResult.product);
        return res.json(productParsed);
      } catch (error) {
        log.error(
          'Error invoking `upsert` from `product service`. Details:',
          error
        );
        return res.status(500).send('There was an error creating a Product');
      }
    });
  }
};
