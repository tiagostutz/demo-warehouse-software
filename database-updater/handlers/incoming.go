package handlers

import (
	"encoding/json"
	"io/ioutil"
	"os"
	"path/filepath"

	"database-autoupdater/model"

	"github.com/sirupsen/logrus"
)

//HandleIncomingDataFile prepares an function to handle incoming data for a given domain
func HandleArticleIncomingDataFile(filePath, sucessfulFoder, failFolder string) error {
	logrus.Debugf("Incoming data for a new Article. File name: %s", filePath)

	// Resolve file name. Used to move from the folders
	fileName := filepath.Base(filePath)

	// Open the received JSON File
	jsonFile, err := os.Open(filePath)
	if err != nil {
		logrus.Errorf("Error opening incoming Article file. Moving to %s folder", failFolder)
		// move the file to the error folder
		os.Rename(filePath, failFolder+"/"+fileName)
		return err
	}

	// defer the closing the file
	defer jsonFile.Close()

	// get the byte content of the file
	byteValue, err := ioutil.ReadAll(jsonFile)
	if err != nil {
		logrus.Errorf("Error reading bytes of incoming Article file. Moving to %s folder", failFolder)
		// move the file to the error folder
		os.Rename(filePath, failFolder+"/"+fileName)
		return err
	}

	var inventory model.Inventory
	// unmarshal byteArray into article
	err = json.Unmarshal(byteValue, &inventory)
	if err != nil {
		logrus.Errorf("Error unmarshalling bytes of incoming Article to correspondant var. Moving to %s folder", failFolder)
		// move the file to the error folder
		os.Rename(filePath, failFolder+"/"+fileName)
		return err
	}

	// convert the ArticleIncoming to ArticleWarehouse
	for i := 0; i < len(inventory.Inventory); i++ {
		articleWarehouse := model.ConvertArticleIncomingToWarehouse(inventory.Inventory[i])
		// Good candidate to run in a separate go routine of to put this in a queue
		// but now, lets keep it sync and simple
		// Create Article in the Warehouse API
		postArticleToWarehouse(*articleWarehouse)
	}

	logrus.Debugf("New Article data succesfully ingested. Moving to %s folder", sucessfulFoder)

	// move to sucess folder
	os.Rename(filePath, sucessfulFoder+"/"+fileName)
	return nil
}

func postArticleToWarehouse(article model.ArticleWarehouse) error {
	logrus.Debugf("POST Article to Warehouse API %#v", article)
	return nil
}

func HandleProductIncomingDataFile(filePath, sucessfulFoder, failFolder string) error {
	logrus.Debugf("Incoming data for a new Product. File name: %s", filePath)
	logrus.Debugf("Error ingesting received Product data. Moving to %s folder", failFolder)
	logrus.Debugf("New Product data succesfully ingested. Moving to %s folder", sucessfulFoder)
	return nil
}
