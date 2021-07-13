#!/bin/sh

/bin/database-autoupdater --logLevel=$LOG_LEVEL \
--incomingDataFolder=/app/data/incoming \
--successProcessedFolder=/app/data/success \
--failProcessedFolder=/app/data/fail \
--warehouseArticleEndpoint=$WAREHOUSE_ARTICLE_ENDPOINT \
--warehouseProductEndpoint=$WAREHOUSE_PRODUCT_ENDPOINT