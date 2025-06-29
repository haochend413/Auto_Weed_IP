# Auto_Weed_IP

<u>**A**</u>utomatic <u>**W**</u>eed <u>**I**</u>mage <u>**P**</u>rocessing

Automatic weed classification & segmentation powered by YOLO. 

## Requirements

python 3.13 (maybe)

## Installation

- Build from source
  1. Clone the repo : `git clone https://github.com/haochend413/Auto_Weed_IP.git`
  2. System permission: `chmod -x setup.sh localserver.sh`
  3. Environment setup: `./setup.sh`.
  4. To run server locally on 8000 port : `./localserver.sh` (Right now the only option). 
  5. build & start frontend:
     - `cd frontend`
     - `go build -o awd`

## Frontend Use Guide

[![Guide](https://img.youtube.com/vi/jOXxdtn0LE8/0.jpg)](https://youtu.be/jOXxdtn0LE8)

- detect : use d with -i flag
  `./awd d -i path_to_the_images_folder`

  The results will be stored in `~/Awd_Results` folder. 
