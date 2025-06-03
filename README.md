# WanderLust - Travel Package Booking Website

A web application for browsing and booking travel packages.

## Features

- User registration and authentication
- Browse travel packages
- Search packages by destination and budget
- View package details including hotels, restaurants, and places to visit

## Prerequisites

- Node.js (version 14 or higher)
- MySQL (version 5.7 or higher)
- npm or yarn package manager

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd WanderLust
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   DB_HOST=your_database_host
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_NAME=your_database_name
   PORT=your_port_number
   NODE_ENV=development
   ```

4. Create the database and tables:
   - The application will automatically create the database and required tables on first run
   - Make sure your MySQL server is running and accessible

5. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

1. Set up your production environment variables in `.env`:
   ```
   NODE_ENV=production
   DB_HOST=your_production_db_host
   DB_USER=your_production_db_user
   DB_PASSWORD=your_production_db_password
   DB_NAME=your_production_db_name
   PORT=your_production_port
   ```

2. Install production dependencies:
   ```bash
   npm install --production
   ```

3. Start the production server:
   ```bash
   npm start
   ```

## Environment Variables

- `DB_HOST`: Database host address
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name
- `PORT`: Port number for the server
- `NODE_ENV`: Environment (development/production)

## Project Structure

```
WanderLust/
├── public/           # Static files (CSS, images, client-side JS)
├── views/            # EJS templates
├── index.js         # Main application file
├── package.json     # Project dependencies and scripts
├── .env             # Environment variables (create this file)
└── README.md        # This file
```

## Security Notes

- Never commit the `.env` file to version control
- Use strong passwords for database access
- Keep all dependencies updated
- Use HTTPS in production

## Support

For any issues or questions, please open an issue in the repository. 