# Picture Generator UI

## Description

This service provides high resolution images of configured vehicles

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

What things you need to install the software.

```
NodeJS
```

### Installing

A step by step series of examples that tell you have to get a development env running.

Clone or download source code

Install Dependencies

```
execute: npm install
```

### Setup

Configure these environment variables: webpack.config.\* depending on each environment

```
process.env.API_URL
endpoint used to authenticate and load brands/models data
```

```
process.env.IMAGEGEN_URL
endpoint used to retrieve images from ImageGen
```

```
process.env.BASENAME
basename directory which the app will be deployed
```

### Running

Start web app in development mode with Mock API
_webpack.config.dev_

```
execute: npm start
web app: http://localhost:3000
```

Start web app in test mode
_webpack.config.test_

```
execute: npm run start:test
```

### Deployment

Run Tests, create build:
_webpack.config.prod_
files are generated in /build folder

```
execute: npm run build
```

### Technologies

- Web: HTML5, Javascript, React v17 , ESLinter
- Build/Bundling: Webpack
- Layout: flexbox, css-grid
- Data Fetching: react-query
- Components: styled-components
- Animations: react-spring
- Mock API: json-server

## Author

- **Oscar Bastos**
