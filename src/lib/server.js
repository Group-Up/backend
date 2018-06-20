'use strict';

import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import logger from './logger';
import loggerMiddleware from './logger-middleware';
import errorMiddleware from './error-middleware';
import authRoutes from '../routes/account-router';
import profileRoutes from '../routes/profile-router';
import eventRoutes from '../routes/event-router';
import postRoutes from '../routes/post-router';
import imageRoutes from '../routes/image-router';
import googleAuthRoute from '../routes/google-login-route';

const app = express();
let server = null;

app.use(cors({ credentials: true, origin: process.env.CORS_ORIGIN }));
app.use(loggerMiddleware);

app.use(authRoutes);
app.use(profileRoutes);
app.use(postRoutes);
app.use(eventRoutes);
app.use(imageRoutes);
app.use(googleAuthRoute);

app.all('*', (request, response) => {
  logger.log(logger.INFO, 'Returning a 404 from the catch/all default route');
  return response.sendStatus(404);
});

app.use(errorMiddleware);

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
