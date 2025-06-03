const mysql = require('mysql2');
const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');

// Environment variables with fallbacks for development
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'root1234';
const DB_NAME = process.env.DB_NAME || 'miniproject';
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

// Replace single connection with connection pool
const pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    database: DB_NAME,
    password: DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Convert pool to use promises
const promisePool = pool.promise();

// Test the connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Successfully connected to the database!');
    
    // Create database if it doesn't exist
    connection.query('CREATE DATABASE IF NOT EXISTS ??', [DB_NAME], (err) => {
        if (err) {
            console.error('Error creating database:', err);
            return;
        }
        console.log('Database created or already exists');
        
        // Use the database
        connection.query('USE ??', [DB_NAME], (err) => {
            if (err) {
                console.error('Error using database:', err);
                return;
            }
            
            // Create users table if it doesn't exist
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    email VARCHAR(100) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;
            
            connection.query(createTableQuery, (err) => {
                if (err) {
                    console.error('Error creating users table:', err);
                    return;
                }
                console.log('Users table created or already exists');

                // Create packages table if it doesn't exist
                const createPackagesTableQuery = `
                    CREATE TABLE IF NOT EXISTS packages (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        Destination VARCHAR(100) NOT NULL,
                        Hotels VARCHAR(100) NOT NULL,
                        Restaurant VARCHAR(100) NOT NULL,
                        PlacesToVisit VARCHAR(100) NOT NULL,
                        Budget DECIMAL(10,2) NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                `;

                connection.query(createPackagesTableQuery, (err) => {
                    if (err) {
                        console.error('Error creating packages table:', err);
                        return;
                    }
                    console.log('Packages table created or already exists');

                    // Check if packages exist before inserting
                    connection.query('SELECT COUNT(*) as count FROM packages', (err, results) => {
                        if (err) {
                            console.error('Error checking packages:', err);
                            return;
                        }

                        if (results[0].count === 0) {
                            // Insert initial packages only if table is empty
                            const insertPackageQuery = `
                                INSERT INTO packages (Destination, Hotels, Restaurant, PlacesToVisit, Budget)
                                VALUES 
                                ('Indore', 'Enrise by : Sayaji', 'Sayaji Family Restaurant', 'Hotel Redisson', 11000),
                                ('Mumbai', 'Taj Mahal Palace', 'Leopold Cafe', 'Gateway of India', 25000)
                            `;
                            
                            connection.query(insertPackageQuery, (err, result) => {
                                if (err) {
                                    console.error('Error inserting initial packages:', err);
                                    return;
                                }
                                console.log('Initial packages inserted successfully');
                            });
                        }
                    });
                });
            });
        });
    });
    
    // Release the connection back to the pool
    connection.release();
});

// Add this before the routes to log all requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.get('/register', (req, res) => {
    console.log('Serving register page');
    res.sendFile(path.join(__dirname, '/public/register.html'));
});

app.post('/register', async (req, res) => {
    try {
        console.log('POST /register received');
        console.log('Request body:', req.body);

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            console.log('Missing required fields');
            return res.status(400).send('All fields are required');
        }

        const [result] = await promisePool.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, password]
        );
        
        console.log("User registered successfully:", result);
        res.redirect('/');
    } catch (err) {
        console.error("Error registering user:", err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).send("Email already exists");
        }
        res.status(500).send("Internal Server Error");
    }
});

app.get('/hotels', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/hotels.html'));
});

app.get('/signin', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/signin.html'));
});

app.post('/signin', async (req, res) => {
    try {
        console.log('Received signin request');
        console.log('Request body:', req.body);
        
        const { email, password } = req.body;
        
        if (!email || !password) {
            console.log('Missing email or password');
            return res.status(400).json({ error: "Email and password are required" });
        }

        const [results] = await promisePool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (!results || results.length === 0) {
            console.log('No user found with email:', email);
            return res.status(401).json({ error: "Incorrect email or password" });
        }

        if (results[0].password !== password) {
            console.log('Password mismatch for user:', email);
            return res.status(401).json({ error: "Incorrect email or password" });
        }

        console.log("User logged in successfully:", results[0]);
        res.json({ 
            success: true, 
            redirect: '/home',
            user: {
                id: results[0].id,
                name: results[0].name,
                email: results[0].email
            }
        });
    } catch (error) {
        console.error('Unexpected error in signin route:', error);
        res.status(500).json({ error: "An unexpected error occurred" });
    }
});

app.get('/home', (req, res) => {
    res.render('home');
});

// Update view-packages route to use pool
app.get('/view-packages', async (req, res) => {
    try {
        const [results] = await promisePool.query('SELECT * FROM packages');
        console.log('All packages:', results);
        res.json(results);
    } catch (err) {
        console.error('Error fetching packages:', err);
        res.status(500).json({ error: "Database error occurred" });
    }
});

// Update search-packages route to use pool
app.post('/search-packages', async (req, res) => {
    try {
        const { destination, budget } = req.body;
        console.log('Search request received:', { destination, budget });

        const [results] = await promisePool.query(
            'SELECT * FROM packages WHERE Destination = ? AND Budget <= ?',
            [destination, budget]
        );
        
        res.render('search-results', {
            packages: results,
            destination: destination,
            budget: budget,
            message: results.length > 0 ? 
                `Found ${results.length} packages for ${destination} within budget ₹${budget}` : 
                `No packages found for ${destination} within budget ₹${budget}`
        });
    } catch (err) {
        console.error('Error searching packages:', err);
        res.status(500).json({ error: "Database error occurred" });
    }
});

// Add error handling middleware after all routes
app.use((req, res, next) => {
    res.status(404).render('error', {
        message: 'Page not found',
        error: { status: 404 }
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    const status = err.status || 500;
    const message = process.env.NODE_ENV === 'production' 
        ? 'Something went wrong!' 
        : err.message;
    
    res.status(status).render('error', {
        message: message,
        error: process.env.NODE_ENV === 'production' ? {} : err
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});