# ssurgo-api

This API provides an easy way to query the Soil Survey Geographic Database (SSURGO), without the need to create explicit SQL queries.

## Table of Contents:

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Installation](#example2)

## Tech Stack

- Node.js

## Features

The API is documented at https://ssurgo.covercrop-data.org/

## Local Installation Steps

**Prerequisites:**
1. Node and NPM [Download Here](https://nodejs.org/en/download/)
2. Git [Download Here](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
3. A code editor (we recommend VS Code) [Download Here](https://code.visualstudio.com/docs/setup/setup-overview)

**Steps:**
1. Open a new Terminal for Mac/Linux or Command Prompt for Windows
2. Move to the desired folder `cd /path/to/folder`
3. Clone this repository into that folder `git clone https://github.com/precision-sustainable-ag/ssurgo-api`
4. From the Terminal/Command Prompt, move into the cloned directory `cd ssurgo-api`
5. From the same command window, run `npm install` to install project dependencies. A full list of the dependencies can be found in package.json. If you are running on a windows machine, delete package-lock.json prior to running the below command. 
6. Create a file called .env. The file will contain the below keys. This document is in the git ignore, so it (and your API keys) won't be pushed to the repository. Ask @rickhitchcock for the values of the key
```
Weather|postgres|<weather server key>
```
7. After the dependencies have been installed and the .env file has been created, run `npm start` to run the code locally.
8. Open http://localhost.

**Date Created:** 11/28/2022

**Date Last Modified:** 01/31/2023
