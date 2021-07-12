package handlers

import (
	"encoding/json"
	"io/ioutil"
	"os"

	"database-autoupdater/model"

	"github.com/sirupsen/logrus"
)

//HandleIncomingDataFile prepares an function to handle incoming data for a given domain
func HandleArticleIncomingDataFile(filePath, sucessfulFoder, failFolder string) {
	logrus.Debugf("Incoming data for a new Article. File name: %s", filePath)
	// Open the received JSON File
	jsonFile, err := os.Open(filePath)
	if err != nil {
		logrus.Debugf("Error opening incoming Article file. Moving to %s folder", failFolder)
		// move the file to the error folder
		return
	}

	// defer the closing the file
	defer jsonFile.Close()

	// get the byte content of the file
	byteValue, err := ioutil.ReadAll(jsonFile)
	if err != nil {
		logrus.Debugf("Error reading bytes of incoming Article file. Moving to %s folder", failFolder)
		// move the file to the error folder
		return
	}

	var inventory model.Inventory
	// unmarshal byteArray into article
	err = json.Unmarshal(byteValue, &inventory)
	if err != nil {
		logrus.Debugf("Error unmarshalling bytes of incoming Article to correspondant var. Moving to %s folder", failFolder)
		// move the file to the error folder
		return
	}

	// convert the ArticleIncoming to ArticleWarehouse

	logrus.Debugf("New Article data succesfully ingested. Moving to %s folder", sucessfulFoder)
}

func HandleProductIncomingDataFile(filePath, sucessfulFoder, failFolder string) {
	logrus.Debugf("Incoming data for a new Product. File name: %s", filePath)
	logrus.Debugf("Error ingesting received Product data. Moving to %s folder", failFolder)
	logrus.Debugf("New Product data succesfully ingested. Moving to %s folder", sucessfulFoder)
}
