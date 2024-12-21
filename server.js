const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Add detailed logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    next();
});

// Add error handling middleware
app.use((err, req, res, next) => {
    console.error('Error occurred:', err);
    console.error('Stack trace:', err.stack);
    res.status(500).send('Something broke!');
});

// Log the current directory and build path
console.log('Current directory:', __dirname);
console.log('Build path:', path.join(__dirname, 'build'));
console.log('Build directory contents:', fs.readdirSync(path.join(__dirname, 'build')));

// Serve static files from /j7qf5y/wf path
app.use('/j7qf5y/wf', express.static(path.join(__dirname, 'build')));

// Handle all routes under /j7qf5y/wf
app.get('/j7qf5y/wf/*', function (req, res) {
    const indexPath = path.join(__dirname, 'build', 'index.html');
    console.log('Attempting to serve:', indexPath);
    
    if (!fs.existsSync(indexPath)) {
        console.error('index.html not found at:', indexPath);
        return res.status(404).send(`index.html not found at ${indexPath}`);
    }
    
    try {
        const indexContent = fs.readFileSync(indexPath, 'utf8');
        console.log('Successfully read index.html');
        res.send(indexContent);
    } catch (error) {
        console.error('Error reading index.html:', error);
        res.status(500).send('Error reading index.html');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 