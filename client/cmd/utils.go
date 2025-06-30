package cmd

import (
	"bytes"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

func SendImageProcessRequest(operation string) {
	//need to pass the input files into server
	var buf bytes.Buffer
	writer := multipart.NewWriter(&buf)

	err := filepath.Walk(inputPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() {
			file, err := os.Open(path)
			if err != nil {
				return err
			}
			defer file.Close()

			part, err := writer.CreateFormFile("images", info.Name())
			if err != nil {
				return err
			}
			_, err = io.Copy(part, file)
			if err != nil {
				return err
			}
		}
		return nil
	})

	if err != nil {
		panic(err)
	}

	writer.Close()

	// Send the POST request
	// This might be buggy, test!
	resp, err := http.Post("http://127.0.0.1:8000/"+operation, writer.FormDataContentType(), &buf)
	// fmt.Println("Content-Length:", resp.Header.Get("Content-Length"))
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	fmt.Println("images sent, waiting for server response")

	// Save the response body (zip file) to disk
	now := time.Now()
	timeStr := now.Format("2006-01-02_15-04-05")
	homeDir, err := os.UserHomeDir()
	if err != nil {
		panic(err)
	}
	outputDir := filepath.Join(homeDir, "AWD_Results")

	if _, err := os.Stat(outputDir); os.IsNotExist(err) {
		err = os.MkdirAll(outputDir, 0755)
		if err != nil {
			panic(err)
		}
	}
	fmt.Println("a")
	outputPath := filepath.Join(outputDir, timeStr+".zip")
	out, err := os.Create(outputPath)
	if err != nil {
		panic(err)
	}
	defer out.Close()
	_, err = io.Copy(out, resp.Body)
	if err != nil {
		panic(err)
	}
	fmt.Println("Results saved as " + timeStr + ".zip" + " under your ~/Awd_Results folder")
}
