
const express = require('express');
const cors = require("cors");
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
const SECRET = '9ECB531EC6AE02CB0274336690E76A0A39511429859537BE242147B65B1824DD';

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

app.use(cors());

app.post("/login", (req, res) => {
    db.all(`SELECT * FROM users WHERE username='${req.headers['username']}' AND password='${req.headers['password']}'`, [], (err, rows) => {
        if (err) throw err;
       
        if(rows.length != 1){
            res.status(403).send('Invalid Authorization');          
        }else{
            const payload = { user: req.headers['password'] };
            const token = jwt.sign(payload, SECRET, { expiresIn: "1m" });
            res.json({ token });
        }

    });
});

app.post('/vitals',(req,res) => {


    const authHeader = req.headers['authorization'];
    if (!authHeader)
        return res.status(401).send('Missing Authorization header');

    const token = authHeader.split(' ')[1];

    if (!token) return res.status(401).send('Missing token');

    jwt.verify(token,SECRET,(err) => {

        if (err) return res.status(403).send('Invalid token');

        const { heartRate,oxygenLevel,timestamp } = req.body;

        if (!heartRate || !oxygenLevel || typeof heartRate !== 'number' || typeof oxygenLevel !== 'number') {
            return res.status(400).send('Invalid vital sign data');
        }

        if(saveToDb(heartRate,oxygenLevel,timestamp)){
            res.send('Vital signs recorded');
        }else{
            return res.status(400).send('Invalid vital sign data'); 
        }
    });
});


function saveToDb(heartRate,oxygenLevel,timestamp) {
    try{
        if(db.prepare('INSERT INTO info(heartRate,oxygenLevel,timestamp) VALUES(?,?,?)').run(heartRate, oxygenLevel, timestamp))
            return true;
    }catch(error){
        return false;
    }   
}

app.listen(3000,() => console.log('Server running on port 3000'));
