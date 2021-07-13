package model

import (
	"strconv"

	"github.com/sirupsen/logrus"
)

// ArticleWarehouse represents an Article in the Warehouse API
type ArticleWarehouse struct {
	ID             int32  `json:"id"`
	Identification int32  `json:"identification"`
	Name           string `json:"name"`
	AvailableStock int32  `json:"availableStock"`
}

// ProductWarehouse represents a Product in the Warehouse API
type ProductWarehouse struct {
	ID       int32                      `json:"id"`
	Name     string                     `json:"name"`
	Price    float32                    `json:"price"`
	Articles []ProductArticlesWarehouse `json:"articles"`
}

// ProductArticlesWarehouse represents the list of ArticleWarehouse
// a given ProductWarehouse is made of
type ProductArticlesWarehouse struct {
	ArticleID int32 `json:"articleId"`
	Quantity  int32 `json:"quantity"`
}

// JSON FROM INCOMING FILES

// ArticleIncoming represents an Article in the incoming file
type ArticleIncoming struct {
	ArtId string `json:"art_id"`
	Name  string `json:"name"`
	Stock string `json:"stock"`
}

// ProductIncoming represents an Product in the incoming file
type ProductIncoming struct {
	Name            string                   `json:"name"`
	Price           string                   `json:"price"`
	ContainArticles []ProductArticleIncoming `json:"contain_articles"`
}

// ProductArticleIncoming represents the list of ArticleIncoming
// a given ProductIncoming is made of
type ProductArticleIncoming struct {
	ArtId    string `json:"art_id"`
	AmountOf string `json:"amount_of"`
}

// Inventory represents the root of the articles file
type Inventory struct {
	Inventory []ArticleIncoming `json:"inventory"`
}

// IncomingProducts represents the root of the products file
type IncomingProducts struct {
	Products []ProductIncoming `json:"products"`
}

func ConvertArticleIncomingToWarehouse(articleIncoming ArticleIncoming) *ArticleWarehouse {
	// convert the ID field to Int, which is the type used in the
	// Warehouse API
	id, err := strconv.Atoi(articleIncoming.ArtId)
	if err != nil {
		logrus.Errorf("Error parsing ArticleIncoming ID. Details: %s", err)
		return nil
	}

	// convert the Stock field to Int, which is the type used in the
	// Warehouse API
	stock, err := strconv.Atoi(articleIncoming.Stock)
	if err != nil {
		logrus.Errorf("Error parsing ArticleIncoming Stock. Details: %s", err)
		return nil
	}

	// return the converted Article
	return &ArticleWarehouse{
		Identification: int32(id),
		Name:           articleIncoming.Name,
		AvailableStock: int32(stock),
	}
}

func ConvertProductIncomingToWarehouse(productIncoming ProductIncoming) *ProductWarehouse {

	// convert the Price field to Float32, which is the type used in the
	// Warehouse API
	price, err := strconv.ParseFloat(productIncoming.Price, 32)
	if err != nil {
		logrus.Errorf("Error converting ProductIncoming Price. Details: %s", err)
		return nil
	}

	// walk all the article composition itens of the incoming Product
	// to convert to the correspondant ArticleComposition of the Warehouse API
	articlesMadeOf := []ProductArticlesWarehouse{}
	for i := 0; i < len(productIncoming.ContainArticles); i++ {

		// convert the ArtID field to Int32, which is the type used in the
		// Warehouse API to build the relationship between Product and Article
		artId, err := strconv.Atoi(productIncoming.ContainArticles[i].ArtId)
		if err != nil {
			logrus.Errorf("Error converting ProductIncoming Contained Article Id. Details: %s", err)
			return nil
		}

		// convert the Quantity field to Int32, which is the type used in the
		// Warehouse API to define how much of the specified Article is used on the Product
		quantity, err := strconv.Atoi(productIncoming.ContainArticles[i].AmountOf)
		if err != nil {
			logrus.Errorf("Error converting ProductIncoming Contained Article AmoutOf. Details: %s", err)
			return nil
		}
		articleComposition := ProductArticlesWarehouse{
			ArticleID: int32(artId),
			Quantity:  int32(quantity),
		}
		articlesMadeOf = append(articlesMadeOf, articleComposition)
	}

	return &ProductWarehouse{
		Name:     productIncoming.Name,
		Price:    float32(price),
		Articles: articlesMadeOf,
	}
}
