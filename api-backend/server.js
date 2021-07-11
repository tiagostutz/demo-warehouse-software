import express from 'express';
import { log } from './logger';

const app = express();
const port = 4000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  log.info(`Warehouse Demo API Backend listening at http://localhost:${port}`);
});
