# Auto_Weed_IP

<u>**A**</u>utomatic <u>**W**</u>eed <u>**I**</u>mage <u>**P**</u>rocessing

Automatic weed classification & segmentation powered by YOLO. 

## Installation

- Build from source
  1. Clone the repo : `git clone https://github.com/haochend413/Auto_Weed_IP.git`
  2. run server locally: `./server_setup.sh`
  3. build & start frontend:
     - `cd frontend`
     - `go build -o awd`

## Frontend Guide

- detect : use d with -i flag
  `awd d -i path_to_the_images_folder`

  The results will be stored in `~/Awd_Results` folder. 
