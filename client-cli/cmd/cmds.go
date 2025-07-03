package cmd

import (
	"github.com/spf13/cobra"
)

var inputPath string

// var detectCmd = &cobra.Command{
// 	Use:   "detect",
// 	Short: "detect",
// 	Long:  "Weed Detection",

// 	Run: func(cmd *cobra.Command, args []string) {
// 		SendImageProcessRequest("detect")
// 	},
// }

// var segmentCmd = &cobra.Command{
// 	Use:   "seg",
// 	Short: "segment",
// 	Long:  "Weed Segmentation",

// 	Run: func(cmd *cobra.Command, args []string) {
// 		SendImageProcessRequest("segment")
// 	},
// }

// var clsCmd = &cobra.Command{
// 	Use:   "cls",
// 	Short: "classify",
// 	Long:  "Weed Classification",

// 	Run: func(cmd *cobra.Command, args []string) {
// 		SendImageProcessRequest("classify")
// 	},
// }

var runCmd = &cobra.Command{
	Use:   "r",
	Short: "run",
	Run: func(cmd *cobra.Command, args []string) {
		if cmd.Flags().Changed("det") {
			SendImageProcessRequest("detection")
		} else if cmd.Flags().Changed("seg") {
			SendImageProcessRequest("segmentation")
		} else if cmd.Flags().Changed("cls") {
			SendImageProcessRequest("classification")
		} else if cmd.Flags().Changed("all") {
			SendImageProcessRequest("all")
		} else {
			cmd.Help()
		}
	},
}

func init() {
	runCmd.Flags().StringVarP(&inputPath, "det", "d", "", "detection on folder")
	// runCmd.MarkFlagRequired("det")
	runCmd.Flags().StringVarP(&inputPath, "seg", "s", "", "segmentation on folder")
	// runCmd.MarkFlagRequired("seg")
	runCmd.Flags().StringVarP(&inputPath, "cls", "c", "", "classification on folder")
	// runCmd.MarkFlagRequired("cls")
	runCmd.Flags().StringVarP(&inputPath, "all", "a", "", "all operations on folder")
	// runCmd.MarkFlagRequired("all")

}
