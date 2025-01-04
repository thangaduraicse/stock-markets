import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import favicon from 'serve-favicon';
import morgan from 'morgan';
import { NSERouter } from './routes/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const nseRouter = new NSERouter();
const port = process.env.PORT || 54_321;
const staticFolderPath = join(__dirname, '..', 'build');

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
app.use(morgan('combined'));
app.use(compression());
app.use(favicon(join(__dirname, '..', 'favicon.ico')));

app.disable('x-powered-by');

app.use('/api', nseRouter);

if (existsSync(staticFolderPath)) {
  app.use(express.static(staticFolderPath));
}

app.use((__, response) => {
  response.header('Content-Type', 'application/json');
  response.status(404);
  response.json({ error: '404 NOT_FOUND !' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});
