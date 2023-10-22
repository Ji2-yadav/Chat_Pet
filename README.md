# Chat_Pet - A Powerful tool for all your data needs
## Overview

## Table of Contents

- [Getting Started](<#getting started>)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
  - [Setting Up Flask API](<#setting up flask api>)
  - [Setting Up React App](<#setting up react app>)
- [License](#license)

## Getting Started

This repository contains the source code for Chat_Pet .Follow the steps below to download and use the software.

### Prerequisites

Before getting started, make sure you have the following software installed on your machine:

- Python3.8
- npm

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/Ji2-yadav/Chat_Pet.git
   cd chat_pet
   ```

2. **Initialize an Empty React App**

   In another folder, create an empty React app using npm. You can do this by running the following commands:

   ```bash
   cd /path/to/new-directory/
   npx create-react-app chat_pet_frontend
   cd chat_pet_frontend
   ```

3. **Copy Files from Cloned Repository to React App**

   Copy the `package.json` and `src` folder from the cloned repository to your React app folder. You can use the following commands:

   ```bash
   cp -r /path/to/chat_pet/frontend/chat_front/package.json /path/to/chat_pet_frontend/
   cp -r /path/to/chat_pet/frontend/chat_front/src /path/to/chat_pet_frontend/
   ```

4. **Install Dependencies**

   Inside your React app folder, install the required dependencies:

   ```bash
   npm install
   ```

5. **Install Python Dependencies**

   Install python dependencies, preferably in an environment

   ```bash
   python3 -r requirements.txt
   ```

 6. Setup Environment file

Create environment file, and add necessary variables
```bash
   cd /path/to/chat_pet/backend/
   touch .env
   vi .env
   ```
The file should contain the following format:
```bash
   OPENAI_API_KEY = 'some key'
   UPLOAD_FOLDER = 'some path'
   ```

## Usage

Set up React app and Flask api before using the software

### Setting Up Flask API

1. Open the `app.py` file in your cloned repository.

2. Set up your Flask API endpoints and functionality in the `app.py` file as needed.

3. Run the Python Flask API:

   ```bash
   cd /path/to/chat_pet/backend/api/
   python3 app.py
   ```

   Your Flask API will be accessible at the specified endpoints. The default port Flask API uses is '5001'. You may change it in app.py, and modify the same in chat_pet_frontend
   
### Setting Up React App

1. Set up the API endpoint:
	- navigate to 'config.j*s' file
	- update the IP and port number where api is hosted

   ```bash
   cd /path/to/chat_pet_frontend/src/configs/
   vi config.js
   ```

   This will open up the api_endpoints file, update the flask_api endpoint hosted in the previous step, along with the port number.
   
2. Start the React app:

   ```bash
   npm start
   ```

   This will launch the development server, and you can access the app in your web browser at `http://localhost:3000`.


## License

All rights reserved. © 
