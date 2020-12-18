import express from 'express';

import dotenv from 'dotenv';

import { json, urlencoded } from 'body-parser';

import morgan from 'morgan';

import cors from 'cors';

import authRoutes from './src/routes/auth';

import orgCreateRoute from './src/routes/org.route';

import profileRoute from './src/routes/profile.route';

import postRoute from './src/routes/post.route';

import commentRoute from './src/routes/comment.route';

const app = express();
dotenv.config();
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(morgan('dev'));

const PORT = process.env.PORT || 4500;

app.get('/', (req, res) => res.status(200).json({
  status: 'okay',
  code: 200,
  message: 'team work api',
}));

app.use('/api/v1', authRoutes);
app.use('/api/v1', orgCreateRoute);
app.use('/api/v1', profileRoute);
app.use('/api/v1', postRoute);
app.use('/api/v1', commentRoute);

app.all('*', (req, res) => res.status(404).json({
  status: 'error',
  message: 'not found',
  code: 404,
}));

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`app is listening on localhost:${PORT}`);
});
