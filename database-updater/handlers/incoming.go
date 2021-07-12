package handlers

import "github.com/sirupsen/logrus"

func HandleIncomingDataFile(domain string) func(string, string, string) {

	return func(filePath, sucessfulFoder, failedFolder string) {
		logrus.Debugf("Incoming data for a new %s", domain)
	}
}
