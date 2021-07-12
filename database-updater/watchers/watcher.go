package watchers

import (
	"fmt"

	"github.com/fsnotify/fsnotify"
	"github.com/sirupsen/logrus"
)

// StartPipeline starts an automatic data ingestion pipeline in Warehouse Database
// where files placed at incomingDataFolder will be processed and, if they are OK, the will
// be POSTed to the Warehouse API and moved to the sucessfullFolder. Otherwhise they won't be
// POSTed and they will be moved to the failedProcessedFolder
func StartPipeline(incomingDataFolder string, successfulProcessedFolder string, failedProcessedFolder string, handleIncomingData func(string, string, string)) {
	pendingFile := make(chan string)
	successFile := make(chan string)
	failedFile := make(chan string)

	// Watch for events at the three folders of the pipeline in parallel
	go watchForNewFiles(incomingDataFolder, pendingFile)
	go watchForNewFiles(successfulProcessedFolder, successFile)
	go watchForNewFiles(failedProcessedFolder, failedFile)

	for {

		select {
		// case a new data file has arrived
		case pendingFilePath := <-pendingFile:
			logrus.Debugf("New pending file change detected: %s", pendingFilePath)
			// invoke the specialized function that will handle this kind of function
			go handleIncomingData(pendingFilePath, successfulProcessedFolder, failedProcessedFolder)

		// case a new data has been successfully ingested
		case successFilePath := <-successFile:
			logrus.Debugf("New success file change detected. Data successfully ingested!: %s", successFilePath)

		// case a the received data couldn't be ingested
		case failedFilePath := <-failedFile:
			logrus.Debugf("There were an error on the data ingestion of the following file: %s", failedFilePath)
		}
	}
}

// watchForNewFiles fires a folder content watcher for new files created and
// sends this file name to the chan passed as param
func watchForNewFiles(watchPath string, fileName chan string) {

	logrus.Debugf("starting file watcher for %s", watchPath)

	// Creates a new file watcher
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		fmt.Println("ERROR", err)
	}
	defer watcher.Close()

	// adds the path as parameter to be watched
	if err := watcher.Add(watchPath); err != nil {
		logrus.Errorf("Error adding folder to watch. Folder: %s. Error details: %s", watchPath, err)
		return
	}

	// Watch folder loop
	for {
		select {
		// watch for events fired on the folder watch loop
		case event := <-watcher.Events:
			// send the file name only if the detected change was a
			// file creation
			if event.Op == fsnotify.Create {
				fileName <- event.Name
			}

		// watch for errors
		case err := <-watcher.Errors:
			logrus.Errorf("Error on watching folder/path. Path: %s. Error: %s", watchPath, err)
		}
	}

}
