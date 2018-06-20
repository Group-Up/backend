# GroupUp

**Author**: Zachary Schumpert, Sarah Geyer, Carl Olson, Mario Flores Jr.

**Version**: 1.0.0

## Overview

The GroupUp application provides users with a common virtual meeting place where they can plan events, update agendas, send messages and keep track of any information a group would enjoy having easy access to!  Users can easily invite friends, family or coworkers by accessing their Google contacts directly from the GroupUp application.  Within your custom group, share locations you plan to meet, share photos of an event and message all the members in your group at once!  GroupUp will make any company event, convention, road-trip or party a breeze to plan.

#### In Your.env File:

 * PORT: defaults to 3000
 * NODE_ENV: set to development
 * MONGODB_URI: set to mongodb://localhost/testing

## Getting Started

To install dependencies, run:

```npm i```

```nodemon``` or ```npm start``` This will start the server and tell you what port you're on

To start the db and test the routes, from the command line, enter:

```npm run dbon``` This turns MongoDB on

```npm run test``` Enter this line in a separate command line tab. This initiates the tests via jest

```npm run dboff``` This turns off MongoDB

## Mechanics


## Architecture

JavaScript, Node, Express, MongoDB, Mongoose, Travis, Heroku, superagent, winston, logger, jest, babel, dotenv, body-parser, crypto, bcrypt, jsonwebtoken, fs-extra, faker.

## Change Log

 * 6-18-2018 9:30am - Initial scaffolding
 * 6-18-2018 10:15am - Signup and Login functionality established(Post, Get)
 * 6-18-2018 11:30am - Completed Form Validation, Google OAuth functionality, and Bearer Basic Authentication for login/signin.
 * 6-18-2018 1:00pm - Account, Event, Post Router tests established.
 * 6-18-2018 3:30pm - Routes established for Profile, Post, and Events(Get, Put, Post, Delete)

## Workflow


#### Model Relationships

