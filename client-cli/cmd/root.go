package cmd

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "awd",
	Short: "autoweed",
	Long:  "Auto Weed IP",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("YOLO powered weed automatic classification/segmentation/detection tool. \n To start, use help")
	},
}

func Execute() {
	//use context to pass app state

	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}

func init() {
	rootCmd.AddCommand(runCmd)
}
