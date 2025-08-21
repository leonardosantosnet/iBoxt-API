const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json()); // SECRET should be in env variables, not hardcoded
const SECRET = 'your_jwt_secret';
app.post('/vitals', (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).send('Missing Authorization header');
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).send('Missing token');
    jwt.verify(token, SECRET, (err, user) => {
        if (err) return res.status(403).send('Invalid token');
        const {heartRate, oxygenLevel, timestamp} = req.body;
        if (!heartRate || !oxygenLevel || typeof heartRate !== 'number' || typeof oxygenLevel !== 'number') {
            return res.status(400).send('Invalid vital sign data');
        } // Simulate DB save with dummy promise
        saveToDb({user, heartRate, oxygenLevel, timestamp}).then(() => {
            console.log('New vitals saved:', {user, heartRate, oxygenLevel, timestamp}); // Simulate real-time event emission here, e.g.: //
            eventEmitter.emit('newVital', {user, heartRate, oxygenLevel, timestamp});
            res.status(200).send('Vital signs recorded');
        }).catch(() => res.status(500).send('Database error'));
    });
});

function saveToDb(data) {
    return new Promise((resolve) => setTimeout(resolve, 100)); // dummy async save
}