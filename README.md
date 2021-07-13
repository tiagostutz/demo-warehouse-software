# Demo Warehouse Software

A simple demo of a warehouse software with TypeScript, PostgreSQL, Prisma, Kong, Prometheus, Grafana and Go.

## Getting started

### Option 1

```bash
git clone https://github.com/tiagostutz/demo-warehouse-software
```

```bash
docker-compose up
```

Wait for the services to be ready and then populate the database with using the file watch:

```bash
cp assets/inventory.json local-data/incoming/article/
```

```bash
cp assets/products.json local-data/incoming/product/
```

```bash
cd web-app
yarn install
yarn build
yarn start
```

Open [http://localhost:3000](http://localhost:3000) on your Browser and check

### Option 2

1) Create this docker-compose.yml:

```yaml
version: "3.7"

services:
  db:
    image: tiagostutz/warehouse-demo-postgres:0.0.3
    environment:
      - POSTGRES_DB=demo-warehouse
      - POSTGRES_PASSWORD=123456
      - POSTGRES_INITDB_ARGS=--debug
    ports:
      - 5432:5432

  api-backend:
    image: tiagostutz/warehouse-demo-api-backend:0.0.3
    ports:
      - 4000:4000
    environment:
      - DATABASE_URL=postgres://postgres:123456@db:5432/demo-warehouse

  database-updater:
    image: tiagostutz/warehouse-demo-database-updater:0.0.3
    volumes:
      - ./local-data:/app/data
    environment:
      - LOG_LEVEL=debug
      - WAREHOUSE_ARTICLE_ENDPOINT=http://api-backend:4000/article
      - WAREHOUSE_PRODUCT_ENDPOINT=http://api-backend:4000/product
```

And bring it up:

```bash
docker-compose up
```

2) After all the services are up, check that the database is clean by executing:

```bash
curl http://localhost:4000/article
```

```bash
curl http://localhost:4000/product
```

They should return and empty array `[]` as the response.

3) Now let's put some Articles from the [inventory.json](assets/inventory.json) file. To do this, you need to copy this file to the folder the database auto-updater is watching for. Execute this:

```bash
cp assets/inventory.json local-data/incoming/article/
```

Check again the return of the API:

```bash
curl http://localhost:4000/article
```

4) Now let's put some Products from the [products.json](assets/products.json) file. To do this, you need to copy this file to the folder the database auto-updater is watching for. Execute this:

```bash
cp assets/products.json local-data/incoming/product/
```

Check again the return of the API:

```bash
curl http://localhost:4000/product
```

5) Let's get some details on the products created, like the quantity available based on the invetory stock:

```bash
curl http://localhost:4000/product/1
```

```bash
curl http://localhost:4000/product/2
```

If all went as expected, the `quantityAvailable` of this Product with **id=1** should be `2` and of the Product with **id=2** should be `1`.

6) Finally, let's update the inventory stock (reduce) simulating as if a second product was bought and let's check the quantity of the first:

```bash
curl --location --request POST 'http://localhost:4000/article/stock-update/by/product/2' \
--header 'Content-Type: application/json' \
--data-raw '{
    "quantity": 1
}'
```

And let's check how the quantity available of the Products we have now:

```bash
curl http://localhost:4000/product/1
```

Product with **id=1** should have **quantityAvailable=1**

```bash
curl http://localhost:4000/product/2
```

Product with **id=2** should have **quantityAvailable=0**

## Development Mode

To run each part individually in development mode, follow the steps bellow
### API Backend

To run api-backend in development mode, first clone this repo:

```bash
git clone https://github.com/tiagostutz/demo-warehouse-software.git
```

Bring the database up:

```bash
docker-compose up db
```

Then go to the [api-backend](api-backend) folder and run

```bash
yarn install
```

Run the tests:

```bash
yarn test
```

Start the API in development mode:

```bash
yarn run dev
```

### Database auto-updater

First, bring the database and the api-backend up (described in the previous session).

After that, run

```bash
go mod download
```

Then, to run the tests run:

```bash
go test ./...
```

## Evolution Stages

**Stage 1** (current implementation): no security, no load handling, no caching
![stage 1 overview](assets/system-design-stage-1.jpg)

**Stage 2** (goal of this project): security, load balancing one level (API Gateway), no caching
![stage 2 overview](assets/system-design-stage-2.jpg)

**Stage 3** (start production): security, load balancing one level (API Gateway), observability, caching
![stage 3 overview](assets/system-design-stage-3.jpg)

**Stage 4** (scaling to the cloud): security, load handling, caching, observability, database replica/shard, job scheduling with queues and workflow management
![stage 4 overview](assets/system-design-stage-4.jpg)

## Testing

There are two levels of tests: component/service/unit level and integration/API level test.

Running **API Backend** tests:

```bash
yarn run test
```

To run the **Database Auto-updater** integrated tests, you need the database and one instance of the API Backend up at **localhost:4000**, then run:

```bash
go test ./...
```

### API Backend

The tests here are at folders names `tests` and the files has a `.test.ts` suffix. To run the tests:

```bash
yarn run test
```

### Database Auto-updater

## Architecture overview and Design decisions

- Pros and cons
- Other possibilities
- Kong API Gateway
- Sidecar/Ambassador to hide from the Business Logic this complexity

### Observability

- Healthcheck
  - `/health`
  - `/ready`
- Prometheus Metrics:
  - Database updater
  - API Backend
- Grafana

### Prisma as an ORM (and why not GraphQL?)

What happens when running:

```bash
yarn install @prisma/client
```

The install command automatically invokes prisma generate for you which reads your Prisma schema and generates a version of Prisma Client that is tailored to your models.
Whenever you make changes to your Prisma schema in the future, you manually need to invoke `npx prisma generate` in order to accomodate the changes in your Prisma Client API.

- More at [https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/install-prisma-client-typescript-postgres/](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/install-prisma-client-typescript-postgres/)

- Used the defaults of Prisma to generate a Database, but if the data modeling would be subject to a Data Administration process with data/terms dictionary, conventions, abbreviations and that kind of stuff, some additional configuration would be needed on the [schema.prisma](api-backend/schema.prisma) definition.

```bash
DATABASE_URL=postgres://postgres:123456@localhost:5432/demo-warehouse npx prisma migrate dev --name init
```

- **GraphQL**: definitely would be a good option, but there are some scenarios we need specific business logic that would need some code working. But for data fecthing and mutation to database, good one. The endpoints that need additional logic could expose those endpoints as regular APIs and use the GraphQL to fetch and mutate data.
- **Migration tool demo**:
  - started with ON DELETE CASCADE for all FKs
  - then ON DELETE RESTRICT for all FKs
  - then ON DELETE RESTRICT for Article ON DELETE CASCADE for Product

```bash
DATABASE_URL=postgres://postgres:123456@localhost:5432/demo-warehouse npx prisma migrate dev --name init
```

### TypeScript mixed with pure JavaScript

If there's no domain involved or for a more integration and "flow setup" kind of code, go with vanilla JavaScript. If there's model, business logic or heavy componentization, go with TypeScript.

### Thoughts on scaling the solution

- Change the load from watching files to consuming a queue
- If a need for a more complex enrichment of the data, consider using a Workflow/pipeline orchestrator (like Netflix Conductor)

## Software Highlevel Spec

This software should hold **articles**, and the articles should contain:

- identification number
- name
- available stock

It should be possible to **load articles into the software from a file**, see the provided [inventory.json](inventory.json) sample file.

The warehouse software should also have **products**, products are made of different articles. Products should have:

- name
- price
- list of articles of which they are made from with a quantity

The products should also be **loaded from a file**, see the provided [products.json](products.json) sample file.

The warehouse should have at least the following functionality;

- Get all products and quantity of each that is available with the current inventory
- Remove(Sell) a product and update the inventory accordingly
