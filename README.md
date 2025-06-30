# Auto_Weed_IP

<u>**A**</u>utomatic <u>**W**</u>eed <u>**I**</u>mage <u>**P**</u>rocessing

Automatic weed classification & segmentation powered by YOLO. 

## Requirements

python 3.13 (maybe), go 1.24.4

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

- detect : use detect with -i flag
  `./awd detect -i path_to_the_images_folder`

- segmentation : use seg with -i flag
  `./awd seg -i path_to_the_images_folder`

- classification : use seg with -i flag
  `./awd cls -i path_to_the_images_folder`

  | ID | Common Name      | Role  | Species                   | EPPO Taxon Code | Name                                   |
|----|------------------|-------|---------------------------|-----------------|----------------------------------------|
| 0  | chinee apple     | weed  | ziziphus mauritiana       | ZIPMA           | weed: ziziphus mauritiana             |
| 1  | lantana          | weed  | lantana camara            | LANCA           | weed: lantana camara                  |
| 2  | parkinsonia      | weed  | parkinsonia aculeata      | PAKAC           | weed: parkinsonia aculeata            |
| 3  | parthenium       | weed  | parthenium hysterophorus  | PTNHY           | weed: parthenium hysterophorus        |
| 4  | prickly acacia   | weed  | vachellia nilotica        | ACANL           | weed: vachellia nilotica              |
| 5  | rubber vine      | weed  | cryptostegia grandiflora  | CVRGR           | weed: cryptostegia grandiflora        |
| 6  | siam weed        | weed  | chromolaena odorata       | EUPOD           | weed: chromolaena odorata             |
| 7  | snake weed       | weed  | gutierrezia sarothrae     | GUESA           | weed: gutierrezia sarothrae           |
| 8  | negative         | na    |                           |                 | none                                   |


  The results will be stored in `~/Awd_Results` folder as a zip file named after time stored. 
