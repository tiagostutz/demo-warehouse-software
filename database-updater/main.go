package main

import (
	"database-autoupdater/handlers"
	"database-autoupdater/watchers"
	"flag"

	"github.com/sirupsen/logrus"
)

var incomingDataFolder string
var successfulProcessedFolder string
var failedProcessedFolder string

func init() {

	logrus.Infof("Starting file watcher database auto-updater")

	//flags parse
	logLevel := "info"
	flag.StringVar(&logLevel, "logLevel", "info", "Log level")
	flag.StringVar(&incomingDataFolder, "incomingDataFolder", "", "Folder where the products.json and inventory.json will be placed to get the read the data from")
	flag.StringVar(&successfulProcessedFolder, "successfulProcessedFolder", "", "Folder where the products.json and inventory.json that were successfully processed will be moved to")
	flag.StringVar(&failedProcessedFolder, "failedProcessedFolder", "", "Folder where the products.json and inventory.json that has failed in the processing will be moved to")
	flag.Parse()

	flagMessge := ""

	if incomingDataFolder == "" {
		flagMessge += "\n--incomingDataFolder flag must be provided"
	}
	if successfulProcessedFolder == "" {
		flagMessge += "\n--successfulProcessedFolder flag must be provided"
	}
	if failedProcessedFolder == "" {
		flagMessge += "\n--failedProcessedFolder flag must be provided"
	}

	if flagMessge != "" {
		logrus.Error(flagMessge)
		logrus.Exit(1)
	}

	if incomingDataFolder == successfulProcessedFolder || incomingDataFolder == failedProcessedFolder || successfulProcessedFolder == failedProcessedFolder {
		flagMessge = "The --incomingDataFolder, --successfulProcessedFolder and  --failedProcessedFolder must have different values and point to differente folders"
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
	logrus.Infof("successfulProcessedFolder = %s", successfulProcessedFolder)
	logrus.Infof("failedProcessedFolder = %s", failedProcessedFolder)

	//setup gin routes
	logrus.Infof("Initialization completed")

}

func main() {
	done := make(chan string)

	// Start a pipeline for Articles (Inventory)
	go watchers.StartPipeline(incomingDataFolder, successfulProcessedFolder, failedProcessedFolder, handlers.HandleIncomingDataFile("article"))
	logrus.Info("Started data ingestion watcher for Articles")

	// Start a pipeline for Products
	go watchers.StartPipeline(incomingDataFolder, successfulProcessedFolder, failedProcessedFolder, handlers.HandleIncomingDataFile("product"))
	logrus.Info("Started data ingestion watcher for Products")

	<-done
}
