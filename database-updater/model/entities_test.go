package model

import (
	"database-autoupdater/globals"
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestConvertArticleIncomingToWarehouse(t *testing.T) {
	globals.WarehouseArticleEndpoint = "http://localhost:4000/article"
	articleIncoming := ArticleIncoming{
		ArtId: "1",
		Stock: "100",
		Name:  "Foo",
	}
	converted := ConvertArticleIncomingToWarehouse(articleIncoming)

	assert.Equal(t, articleIncoming.ArtId, fmt.Sprintf("%d", converted.Identification))
	assert.Equal(t, articleIncoming.Stock, fmt.Sprintf("%d", converted.AvailableStock))
	assert.Equal(t, articleIncoming.Name, converted.Name)
}

func TestConvertProductIncomingToWarehouse(t *testing.T) {
	globals.WarehouseArticleEndpoint = "http://localhost:4000/article"
	productIncoming := ProductIncoming{
		Name:  "Bar",
		Price: "99.99",
		ContainArticles: []ProductArticleIncoming{
			{
				ArtId:    "1",
				AmountOf: "2",
			},
			{
				ArtId:    "2",
				AmountOf: "8",
			},
		},
	}
	converted := ConvertProductIncomingToWarehouse(productIncoming)

	assert.Equal(t, productIncoming.Name, converted.Name)
	assert.Equal(t, productIncoming.Price, fmt.Sprintf("%.2f", converted.Price))
}
