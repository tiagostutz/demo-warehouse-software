package handlers

import (
	"database-autoupdater/globals"
	"database-autoupdater/helpers"
	"fmt"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

var baseTestFolder, incomingDataFolder, successProcessedFolder, failProcessedFolder, domain string

func setup() error {
	globals.WarehouseArticleEndpoint = "http://localhost:4000/article"
	baseTestFolder = "test-folder"

	domain = "foo"
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

func TestHandleArticleIncomingDataFile(t *testing.T) {
	setup()

	inventoryFileName := "inventory.json"
	incomingFile := fmt.Sprintf("%s/%s", incomingDataFolder, inventoryFileName)
	err := HandleArticleIncomingDataFile(incomingFile, successProcessedFolder, failProcessedFolder)
	// must return error because the file doesnt exist
	if err == nil {
		t.Fail()
	}

	// copy the file to incoming folder to process
	_, err = helpers.CopyFile("test-data/"+inventoryFileName, incomingFile)
	if err != nil {
		t.Fail()
	}

	err = HandleArticleIncomingDataFile(incomingFile, successProcessedFolder, failProcessedFolder)
	if err != nil {
		t.Fail()
	}

	f, err := os.Stat(successProcessedFolder + "/" + inventoryFileName)
	if err != nil {
		t.Fail()
	}

	// check the file is in the success place
	assert.Equal(t, f.Name(), inventoryFileName)

	teardown()
}

func TestHandleProductIncomingDataFile(t *testing.T) {
	setup()

	productsFileName := "products.json"
	incomingFile := fmt.Sprintf("%s/%s", incomingDataFolder, productsFileName)
	err := HandleProductIncomingDataFile(incomingFile, successProcessedFolder, failProcessedFolder)
	// must return error because the file doesnt exist
	if err == nil {
		t.Fail()
	}

	// copy the file to incoming folder to process
	_, err = helpers.CopyFile("test-data/"+productsFileName, incomingFile)
	if err != nil {
		t.Fail()
	}

	err = HandleProductIncomingDataFile(incomingFile, successProcessedFolder, failProcessedFolder)
	if err != nil {
		t.Fail()
	}

	f, err := os.Stat(successProcessedFolder + "/" + productsFileName)
	if err != nil {
		t.Fail()
	}

	// check the file is in the success place
	assert.Equal(t, f.Name(), productsFileName)

	teardown()
}
