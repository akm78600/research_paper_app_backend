const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const connectDB = require('./config/db');
const morgan = require('morgan');

const port = process.env.PORT || 5000;

connectDB();

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));
// Routes
app.use('/api/papers', require('./routes/paperRoutes'));



app.listen(port, () => console.log(`Server started on port ${port}`));
