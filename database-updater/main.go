package main

import (
	"database-autoupdater/handlers"
	"database-autoupdater/watchers"
	"flag"
	"fmt"

	"github.com/sirupsen/logrus"
)

var incomingDataFolder string
var successProcessedFolder string
var failProcessedFolder string
var warehouseArticleEndpoint string
var warehouseProductEndpoint string

func init() {

	logrus.Infof("Starting file watcher database auto-updater")

	//flags parse
	logLevel := "info"
	flag.StringVar(&logLevel, "logLevel", "info", "Log level")
	flag.StringVar(&incomingDataFolder, "incomingDataFolder", "", "Folder where the products.json and inventory.json will be placed to get the read the data from")
	flag.StringVar(&successProcessedFolder, "successProcessedFolder", "", "Folder where the products.json and inventory.json that were successly processed will be moved to")
	flag.StringVar(&failProcessedFolder, "failProcessedFolder", "", "Folder where the products.json and inventory.json that has fail in the processing will be moved to")
	flag.StringVar(&warehouseArticleEndpoint, "warehouseArticleEndpoint", "", "Endpoint of the Article Warehouse API")
	flag.StringVar(&warehouseProductEndpoint, "warehouseProductEndpoint", "", "Endpoint of the Product Warehouse API")
	flag.Parse()

	flagMessge := ""

	if incomingDataFolder == "" {
		flagMessge += "\n--incomingDataFolder flag must be provided"
	}
	if successProcessedFolder == "" {
		flagMessge += "\n--successProcessedFolder flag must be provided"
	}
	if failProcessedFolder == "" {
		flagMessge += "\n--failProcessedFolder flag must be provided"
	}

	if flagMessge != "" {
		logrus.Error(flagMessge)
		logrus.Exit(1)
	}

	if incomingDataFolder == successProcessedFolder || incomingDataFolder == failProcessedFolder || successProcessedFolder == failProcessedFolder {
		flagMessge = "The --incomingDataFolder, --successProcessedFolder and  --failProcessedFolder must have different values and point to differente folders"
	}
	if flagMessge != "" {
		logrus.Error(flagMessge)
		logrus.Exit(1)
	}

	l, err := logrus.ParseLevel(logLevel)
	if err != nil {
		panic("Invalid loglevel")
	}
	logrus.SetLevel(l)

	logrus.Infof("logLevel = %s", logLevel)
	logrus.Infof("incomingDataFolder = %s", incomingDataFolder)
	logrus.Infof("successProcessedFolder = %s", successProcessedFolder)
	logrus.Infof("failProcessedFolder = %s", failProcessedFolder)

	//setup gin routes
	logrus.Infof("Initialization completed")

}

func main() {
	done := make(chan string)

	// Start a pipeline for Articles (Inventory)
	articleDomain := "article"
	go watchers.StartPipeline(fmt.Sprintf("%s/%s", incomingDataFolder, articleDomain), fmt.Sprintf("%s/%s", successProcessedFolder, articleDomain), fmt.Sprintf("%s/%s", failProcessedFolder, articleDomain), handlers.HandleArticleIncomingDataFile)
	logrus.Info("Started data ingestion watcher for Articles")

	// Start a pipeline for Products
	productDomain := "product"
	go watchers.StartPipeline(fmt.Sprintf("%s/%s", incomingDataFolder, productDomain), fmt.Sprintf("%s/%s", successProcessedFolder, productDomain), fmt.Sprintf("%s/%s", failProcessedFolder, productDomain), handlers.HandleProductIncomingDataFile)
	logrus.Info("Started data ingestion watcher for Products")

	<-done
}
