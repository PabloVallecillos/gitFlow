const path = require('path');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const express = require('express');
const morgan = require('morgan');
const passport = require('passport');
const methodOverride = require('method-override')
const session = require('express-session');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);

// Load config
dotenv.config({ path: './config/config.env' });

// Passport config
require('./config/passport')(passport);

connectDB();

const app = express();

// Body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Method - override
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    let method = req.body._method
    delete req.body._method
    return method
  }
}))


if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Session
app.use(
  session({
    secret: 'keyboard cat',
    resave: false, // dont save the session if doesn´t modify
    saveUninitialized: false, // don´t create the session until something is stored
    // cookie: { secure: true }   https
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

// Handlebars Helpers
const {
  formatDate,
  stripTags,
  truncate,
  editIcon,
  select,
} = require('./helpers/hbs');

//Handlebars
app.engine(
  '.hbs',
  exphbs({
    helpers: {
      formatDate,
      stripTags,
      truncate,
      editIcon,
      select,
    },
    defaultLayout: 'main',
    extname: '.hbs',
  })
);
app.set('view engine', '.hbs');

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Set global var ignore
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/stories', require('./routes/stories'));

const PORT = process.env.PORT || 3000;

app.listen(
  PORT,
  console.log(`Server runing in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// some pointless comment to our project
