const PORT = 5000;
const express = require('express');
const path = require('path');
const apiRoute = require("./routes/api");

const app = express();

app.use('/api', apiRoute);
app.use('/', express.static(path.join(__dirname, "client")));

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
})