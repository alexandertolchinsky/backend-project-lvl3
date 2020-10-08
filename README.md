![.github/workflows/backend-project-lvl3.yml](https://github.com/alexandertolchinsky/backend-project-lvl3/workflows/.github/workflows/backend-project-lvl3.yml/badge.svg)
[![Maintainability](https://api.codeclimate.com/v1/badges/ff5706415f21a04ab217/maintainability)](https://codeclimate.com/github/alexandertolchinsky/backend-project-lvl3/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/ff5706415f21a04ab217/test_coverage)](https://codeclimate.com/github/alexandertolchinsky/backend-project-lvl3/test_coverage)

# Utility to download the address from network
## About The Project
This is a training project in which I implemented a utility to download the address from network.

The capabilities of the utility:
1) You can specify the folder to put the finished file in
2) The utility downloads all the resources listed on the page and changes the page so that it starts referring to local versions

## Getting Started
### Installation
1. Clone the repo
```sh 
git clone https://github.com/alexandertolchinsky/backend-project-lvl3.git
```
2. Install package locally
```sh
npm link
```
## How to run
download the address to the current directory
```sh 
page-loader https://ru.hexlet.io/courses
```
download the address to the specified directory
```sh 
page-loader --output /tmp https://ru.hexlet.io/courses
```

## Usage
### Example of download the address to the current directory
[![asciicast](https://asciinema.org/a/QbqcMjleHMdzhJDK9VXvzlac8.svg)](https://asciinema.org/a/QbqcMjleHMdzhJDK9VXvzlac8)

### Example of download the address to the specified directory
[![asciicast](https://asciinema.org/a/Gb2FPXJqYlRW9YCP4G8tBKqHD.svg)](https://asciinema.org/a/Gb2FPXJqYlRW9YCP4G8tBKqHD)

## Contact
Alexander Tolchinsky - alexander.tolchinsky@gmail.com

Project Link: [https://github.com/alexandertolchinsky/backend-project-lvl3](https://github.com/alexandertolchinsky/backend-project-lvl3)
## Acknowledgements
* [axios](https://github.com/axios/axios)
* [Node.js](https://nodejs.org)
* [Commander.js](https://github.com/tj/commander.js)
* [cheerio](https://cheerio.js.org)
* [debug](https://github.com/visionmedia/debug)
* [listr](https://github.com/SamVerschueren/listr)
* [prettier](https://prettier.io)
