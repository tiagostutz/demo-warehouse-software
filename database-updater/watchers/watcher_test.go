package watchers

import (
	"os"
	"testing"
)

var baseTestFolder, incomingDataFolder, successProcessedFolder, failProcessedFolder, domain string

func setup() error {

	domain = "dummy"
	baseTestFolder = "dummy-test"
	incomingDataFolder = baseTestFolder + "/incoming/" + domain
	successProcessedFolder = baseTestFolder + "/success/" + domain
	failProcessedFolder = baseTestFolder + "/fail/" + domain

	os.RemoveAll(baseTestFolder)

	err := os.MkdirAll(baseTestFolder, 0777)
	if err != nil {
		return err
	}

	err = os.MkdirAll(incomingDataFolder, 0777)
	if err != nil {
		return err
	}

	err = os.MkdirAll(successProcessedFolder, 0777)
	if err != nil {
		return err
	}

	err = os.MkdirAll(failProcessedFolder, 0777)
	if err != nil {
		return err
	}

	return nil
}
func teardown() {
	os.RemoveAll(baseTestFolder)
}

func TestStartPipeline(t *testing.T) {
	err := setup()
	if err != nil {
		t.Fail()
	}

	teardown()
}
