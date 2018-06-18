'use strict';

import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import logger from './logger';
import loggerMiddleware from './logger-middleware';
import errorMiddleware from './error-middleware';

const app = express();
let server = null;

app.use(cors({ credentials: true, origin: process.env.CORS_ORIGIN }));
app.use(loggerMiddleware); // logger middleware at the app-level

app.use(); // TODO: Add auth routes here

app.all('*', (request, response) => {
  logger.log(logger.INFO, 'Returning a 404 from the catch/all default route');
  return response.sendStatus(404);
});

app.use(errorMiddleware); // error catching middleware...this is 'next'

const startServer = () => {
  return mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      server = app.listen(process.env.PORT, () => {
        logger.log(logger.INFO, `SERVER IS LISTENING ON PORT ${process.env.PORT}`);
      });
    })
    .catch((err) => {
      logger.log(logger.ERROR, `SERVER START ERROR ${JSON.stringify(err)}`);
    });
};

const stopServer = () => {
  return mongoose.disconnect()
    .then(() => {
      server.close(() => {
        logger.log(logger.INFO, 'SERVER IS OFF');
      });
    })
    .catch((err) => {
      logger.log(logger.ERROR, `STOP SERVER ERROR, ${JSON.stringify(err)}`);
    });
};

export { startServer, stopServer };
