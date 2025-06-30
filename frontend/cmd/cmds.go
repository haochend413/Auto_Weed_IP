package cmd

import (
	"github.com/spf13/cobra"
)

var inputPath string

var detectCmd = &cobra.Command{
	Use:   "detect",
	Short: "detect",
	Long:  "Weed Detection",

	Run: func(cmd *cobra.Command, args []string) {
		SendImageProcessRequest("detect")
	},
}

var segmentCmd = &cobra.Command{
	Use:   "seg",
	Short: "segment",
	Long:  "Weed Segmentation",

	Run: func(cmd *cobra.Command, args []string) {
		SendImageProcessRequest("segment")
	},
}

var clsCmd = &cobra.Command{
	Use:   "cls",
	Short: "classify",
	Long:  "Weed Classification",

	Run: func(cmd *cobra.Command, args []string) {
		SendImageProcessRequest("classify")
	},
}

func init() {
	detectCmd.Flags().StringVarP(&inputPath, "input", "i", "", "path to input folder")
	detectCmd.MarkFlagRequired("input")
	segmentCmd.Flags().StringVarP(&inputPath, "input", "i", "", "path to input folder")
	segmentCmd.MarkFlagRequired("input")
	clsCmd.Flags().StringVarP(&inputPath, "input", "i", "", "path to input folder")
	clsCmd.MarkFlagRequired("input")
}
