package handlers

import (
	"database-autoupdater/globals"
	"database-autoupdater/model"
	"testing"
)

func TestPostArticle(t *testing.T) {
	globals.WarehouseArticleEndpoint = "http://localhost:4000/article"
	article := model.ArticleWarehouse{
		Identification: 9999,
		Name:           "Article Test",
		AvailableStock: 22,
	}
	err := PostArticle(article)
	if err != nil {
		t.Fail()
	}
}
func TestPostProduct(t *testing.T) {
	// TO DO
}
