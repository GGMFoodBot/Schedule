const express = require("express");
const app = express();
const fs = require('fs');

const port = 1234;
const SETTINGS_FILE = './userSettings.json';

app.get("/", (req, res) => {
    // SETTINGS_FILE 파일을 읽어서 send, pretty print
    fs.readFile(SETTINGS_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error reading the settings file");
            return;
        }
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(JSON.parse(data), null, 4));
    });
});

app.listen(port, () => {
    console.log("1234 port open")
});
