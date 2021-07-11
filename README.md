# Demo Warehouse Software

A simple demo of a warehouse software with TypeScript, PostgreSQL, Prisma, Kong, Prometheus, Grafana and Go.

## Getting started

To start, clone this repo:

```bash
git clone https://github.com/tiagostutz/demo-warehouse-software.git
```

Then bring all the components up:

```bash
docker-compose up --build
```

Now fetch some products and some articles:

```bash
curl -X GET "https://localhost:4001/articles"
curl -X GET "https://localhost:4001/products"
```

### Database auto-updater

To see the auto-updater loading new Articles from a file, copy the [test-files/new-articles.json](test-files/new-articles.json) to the [processing-files](processing-files) folder:

```bash
cp test-files/new-articles.json processing-files/
```

Check the logs and fetch again the articles

```bash
curl -X GET "https://localhost:4001/articles"
```

The same goes to the Product. Copy the [test-files/new-products.json](test-files/new-products.json) to the [processing-files](processing-files) folder:

```bash
cp test-files/new-products.json processing-files/
```

Check the logs and fetch again the products

```bash
curl -X GET "https://localhost:4001/products"
```

### Check some metrics

Check the metrics at [https://localhost:4002](https://localhost:4002) with the following credentials:

- login: **admin**
- password: **admin**

## Testing

### API Backend

### Database Auto-updater

## Architecture overview and Design decisions

- Pros and cons
- Other possibilities

### Observability

- Healthcheck
  - `/health`
  - `/ready`
- Prometheus Metrics:
  - Database updater
  - API Backend
- Grafana

### Prisma as an ORM

What happens when running:

```bash
yarn install @prisma/client
```

The install command automatically invokes prisma generate for you which reads your Prisma schema and generates a version of Prisma Client that is tailored to your models.
Whenever you make changes to your Prisma schema in the future, you manually need to invoke `npx prisma generate` in order to accomodate the changes in your Prisma Client API.

- More at https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/install-prisma-client-typescript-postgres/

- Used the defaults of Prisma to generate a Database, but if the data modeling would be subject to a Data Administration process with data/terms dictionary, conventions, abbreviations and that kind of stuff, some additional configuration would be needed on the [schema.prisma](api-backend/schema.prisma) definition.

```bash
DATABASE_URL=postgres://postgres:123456@localhost:5432/demo-warehouse npx prisma migrate dev --name init
```

- GraphQL
- Migration tool demo:
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
