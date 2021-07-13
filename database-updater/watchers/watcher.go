package watchers

import (
	"os"

	"github.com/fsnotify/fsnotify"
	"github.com/sirupsen/logrus"
)

// StartPipeline starts an automatic data ingestion pipeline in Warehouse Database
// where files placed at incomingDataFolder will be processed and, if they are OK, the will
// be POSTed to the Warehouse API and moved to the sucessfullFolder. Otherwhise they won't be
// POSTed and they will be moved to the failProcessedFolder
func StartPipeline(incomingDataFolder string, successProcessedFolder string, failProcessedFolder string, handleIncomingData func(string, string, string) error) {
	pendingFile := make(chan string)
	successFile := make(chan string)
	failFile := make(chan string)

	// Watch for events at the three folders of the pipeline in parallel
	go watchForNewFiles(incomingDataFolder, pendingFile)
	go watchForNewFiles(successProcessedFolder, successFile)
	go watchForNewFiles(failProcessedFolder, failFile)

	for {

		select {
		// case a new data file has arrived
		case arrivedFilePath := <-pendingFile:
			logrus.Debugf("New pending file change detected: %s", arrivedFilePath)
			// invoke the specialized function that will handle this kind of function
			go handleIncomingData(arrivedFilePath, successProcessedFolder, failProcessedFolder)

		// case a new data has been successly ingested
		case successFilePath := <-successFile:
			logrus.Debugf("New success file change detected. Data successly ingested!: %s", successFilePath)

		// case a the received data couldn't be ingested
		case failFilePath := <-failFile:
			logrus.Debugf("There were an error on the data ingestion of the following file: %s", failFilePath)
		}
	}
}

// watchForNewFiles fires a folder content watcher for new files created and
// sends this file name to the chan passed as param
func watchForNewFiles(watchPath string, fileName chan string) {

	logrus.Debugf("Watching for changes at %s", watchPath)

	// if the folder doesnt exist, create it
	if _, err := os.Stat(watchPath); os.IsNotExist(err) {
		os.Mkdir(watchPath, 0777)
	}

	// Creates a new file watcher
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		logrus.Errorf("Error %s", err)
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
