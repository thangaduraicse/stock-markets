import path from 'node:path';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import favicon from 'serve-favicon';
import { NSERouter } from './routes/index.js';
import { __dirname } from './helpers/index.js';

const app = express();
const nseRouter = new NSERouter();
const port = process.env.PORT || 54_321;

app.use(
  cors({
    corsOptions: {
      origin: true,
      credentials: true,
      maxAge: 86_400,
    },
  })
);
app.use(express.json({ limit: '300kb' }));
app.use(
  express.urlencoded({
    limit: '50mb',
    extended: true,
  })
);
app.use(compression());
app.use(favicon(path.join(__dirname, '..', 'favicon.ico')));

app.disable('x-powered-by');

app.use('/', nseRouter);

app.use((__, response) => {
  response.header('Content-Type', 'application/json');
  response.status(404);
  response.json({ error: '404 NOT_FOUND !' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});
