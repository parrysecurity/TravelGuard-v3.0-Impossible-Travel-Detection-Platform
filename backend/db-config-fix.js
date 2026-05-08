// Add this to the top of server.js after the imports
// Replace the existing pool configuration with this:

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'travelguard',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
    // Add connection timeout and retry logic
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    max: 20
});
