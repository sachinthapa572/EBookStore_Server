# E-Book Store Server

## Overview
This project is the server-side implementation for an E-Book Store. It is built using Node.js and Express, and it provides various functionalities for managing books, authors, reviews, and user authentication.

## Project Structure

```
bun.lock
logs/
	src/
	@types/
	app/
	cloud/
	config/
	controllers/
	enum/
	logger/
	middlewares/
	model/
	routes/
	seeds/
	services/
	types/
	utils/
	validators/
public/
	temp/
package.json
os.mjs
tsconfig.json
```

## Installation

1. Clone the repository:
```sh
git clone https://github.com/sachinthapa572/e-book-store--Server-.git
```

2. Navigate to the project directory:
```sh
cd e-book-store--Server-
```

3. Install dependencies:
```sh
npm install
```

## Running the Server

### Development
To run the server in development mode:
```sh
npm run dev
```

### Production
To run the server in production mode:
```sh
npm start
```

## Scripts
- `clean`: Remove node_modules
- `dev`: Run the server in development mode
- `build`: Build the project
- `start`: Run the server in production mode
- `prettier`: Format the code using Prettier
- `seed`: Seed the database

## Environment Variables
Create a `.env` file in the root directory and add the following variables:
```
S3_BUCKET=your_s3_bucket
SECRET_KEY=your_secret_key
```

## License
This project is licensed under the ISC License.

## Author
Sachin Thapa
