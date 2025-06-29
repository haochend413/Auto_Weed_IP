package cmd

import (
	"bytes"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"

	"github.com/spf13/cobra"
)

var inputPath string

var detectCmd = &cobra.Command{
	Use:   "detect",
	Short: "detect",
	Long:  "Weed Detection",

	Run: func(cmd *cobra.Command, args []string) {
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
		resp, err := http.Post("http://127.0.0.1:8000/detect", writer.FormDataContentType(), &buf)
		// fmt.Println("Content-Length:", resp.Header.Get("Content-Length"))
		if err != nil {
			panic(err)
		}
		defer resp.Body.Close()

		fmt.Println("images sent, waiting for server response")

		// Save the response body (zip file) to disk
		homeDir, err := os.UserHomeDir()
		if err != nil {
			panic(err)
		}
		outputDir := filepath.Join(homeDir, "AWD_Results")
		os.MkdirAll(outputDir, 0755)
		outputPath := filepath.Join(outputDir, "results.zip")
		out, err := os.Create(outputPath)
		if err != nil {
			panic(err)
		}
		defer out.Close()
		_, err = io.Copy(out, resp.Body)
		if err != nil {
			panic(err)
		}
		fmt.Println("Results saved as results.zip under your ~/Awd_Results folder")
	},
}

func init() {
	detectCmd.Flags().StringVarP(&inputPath, "input", "i", "", "path to input folder")
	detectCmd.MarkFlagRequired("input")
}
