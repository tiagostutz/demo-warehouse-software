package watchers

import (
	"os"
	"testing"
)

var baseTestFolder, incomingDataFolder, successProcessedFolder, failProcessedFolder, domain string

func setup() error {
	baseTestFolder = "dummy-test"
	incomingDataFolder = baseTestFolder + "/incoming"
	successProcessedFolder = baseTestFolder + "/success"
	failProcessedFolder = baseTestFolder + "/faild"

	os.RemoveAll(baseTestFolder)

	err := os.Mkdir(baseTestFolder, 0777)
	if err != nil {
		return err
	}

	err = os.Mkdir(incomingDataFolder, 0777)
	if err != nil {
		return err
	}

	err = os.Mkdir(successProcessedFolder, 0777)
	if err != nil {
		return err
	}

	err = os.Mkdir(failProcessedFolder, 0777)
	if err != nil {
		return err
	}

	domain = "dummy"
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
