package handlers

import (
	"bytes"
	"database-autoupdater/globals"
	"database-autoupdater/model"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/sirupsen/logrus"
)

func PostArticle(article model.ArticleWarehouse) error {

	url := globals.WarehouseArticleEndpoint
	logrus.Debugf("Posting new Article to Warehouse API. URL: %s", url)

	var httpClient = &http.Client{Timeout: 30 * time.Second}
	payloadBuf := new(bytes.Buffer)
	err := json.NewEncoder(payloadBuf).Encode(article)

	if err != nil {
		logrus.Errorf("Error encoding the request body to Post a new Article to Warehouse API. Details: %s", err)
		return err
	}
	req, err := http.NewRequest("POST", url, payloadBuf)
	if err != nil {
		logrus.Errorf("Error preparing the request to Post a new Article to Warehouse API. Details: %s", err)
		return err
	}
	req.Header.Add("Content-Type", "application/json")
	resp, err := httpClient.Do(req)
	if err != nil {
		logrus.Errorf("Error doing the request to Post a new Article to Warehouse API. Details: %s", err)
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode > 299 {
		return fmt.Errorf("error POSTing to Warehouse API. Status: %s", resp.Status)
	}

	var jsonResp map[string]interface{}
	err = json.NewDecoder(resp.Body).Decode(&jsonResp)
	if err != nil {
		logrus.Errorf("Error decoding the response of the Post a new Article to Warehouse API. Details: %s", err)
		return err
	}
	return nil
}
func PostProduct(product model.ProductWarehouse) error {

	url := globals.WarehouseProductEndpoint
	logrus.Debugf("Posting new Product to Warehouse API. URL: %s", url)

	var httpClient = &http.Client{Timeout: 30 * time.Second}
	payloadBuf := new(bytes.Buffer)
	err := json.NewEncoder(payloadBuf).Encode(product)

	if err != nil {
		logrus.Errorf("Error encoding the request body to Post a new Product to Warehouse API. Details: %s", err)
		return err
	}
	req, err := http.NewRequest("POST", url, payloadBuf)
	if err != nil {
		logrus.Errorf("Error preparing the request to Post a new Product to Warehouse API. Details: %s", err)
		return err
	}
	req.Header.Add("Content-Type", "application/json")
	resp, err := httpClient.Do(req)
	if err != nil {
		logrus.Errorf("Error doing the request to Post a new Product to Warehouse API. Details: %s", err)
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode > 299 {
		return fmt.Errorf("error POSTing to Warehouse API. Status: %s", resp.Status)
	}

	var jsonResp map[string]interface{}
	err = json.NewDecoder(resp.Body).Decode(&jsonResp)
	if err != nil {
		logrus.Errorf("Error decoding the response of the Post a new Product to Warehouse API. Details: %s", err)
		return err
	}
	return nil
}
