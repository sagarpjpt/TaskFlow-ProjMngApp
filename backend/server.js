const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

connectDB();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({ message: 'TaskFlow API is running' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/project'));
app.use('/api/tickets', require('./routes/ticket'));
app.use('/api/comments', require('./routes/comment'));
app.use('/api/analytics', require('./routes/analytics'));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
