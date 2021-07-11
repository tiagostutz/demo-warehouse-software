import express from "express";
import { log } from "./logger";
import articleRoutes from "./routes/article";
import productRoutes from "./routes/product";

const app = express();
const port = 4000;

// Configure the API routes related to the Article domain
articleRoutes.configureRoutes("article", app);

// Configure the API routes related to the Product domain
productRoutes.configureRoutes("product", app);

app.get("/", (req, res) => {
  res.send("Welcome to Warehouse API");
});
app.listen(port, () => {
  log.info(`Warehouse Demo API Backend listening at http://localhost:${port}`);
});
