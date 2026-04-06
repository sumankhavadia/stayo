if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const apiListingsRouter = require('./routes/apiListings.js');
const apiAuthRouter = require('./routes/apiAuth.js');
const ExpressError = require('./utils/ExpressError.js');
const session = require('express-session');
const MongoStoreModule = require('connect-mongo');
const MongoStore = MongoStoreModule.default || MongoStoreModule; 
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.locals.currentUser = null;
app.locals.success = [];
app.locals.error = [];

const frontendUrl = process.env.FRONTEND_URL;
const allowedOrigins = [frontendUrl, 'http://localhost:5173'].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)
    ) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

const dburl=process.env.MONGO_URL;

// DATABASE CONNECTION
async function connectDB() {
    if (!dburl) {
        console.error('Database connection error: MONGO_URL is not set');
        return;
    }
    try {
        await mongoose.connect(dburl, {
          serverSelectionTimeoutMS: 5000,
        });
        console.log("Connected to the database");
    } catch (error) {
        console.error("Database connection error:", error);
    }
}
connectDB();


let store;
if (process.env.NODE_ENV === 'production' && dburl) {
  try {
    store = MongoStore.create({
      mongoUrl: dburl,
      touchAfter: 24 * 3600, // time period in seconds
      crypto: {
        secret: process.env.SESSION_SECRET
      }
    });

    store.on("error", function (e) {
      console.log("SESSION STORE ERROR", e);
    });
  } catch (e) {
    console.log("SESSION STORE INIT ERROR", e);
  }
}

const sessionConfig = {
    secret: process.env.SESSION_SECRET,
    resave: false,
  saveUninitialized: false,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
    maxAge: 1000 * 60 * 60 * 24 * 7,
    sameSite: 'lax'
    }
};

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
  sessionConfig.cookie.sameSite = 'none';
  sessionConfig.cookie.secure = true;
}

if (store) {
  sessionConfig.store = store;
}
    

app.use(session(sessionConfig));   
app.use(flash()); 
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  res.locals.success = req.flash('success') || [];
  res.locals.error = req.flash('error') || [];
    next();
});

app.get("/", (req, res) => {
  res.json({
    message: 'Stayo API is running',
    endpoints: ['/api/auth', '/api/listings'],
  });
});
// USE ROUTERS

app.use('/api', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database is currently unavailable. Please try again shortly.',
    });
  }
  return next();
});
app.use('/api/auth', apiAuthRouter);
app.use('/api/listings', apiListingsRouter);


// 404 HANDLER
app.use((req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});
// ERROR HANDLER
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err); // Let default handler deal with it
  }
  const { statusCode = 500, message = "Something went wrong" } = err;
  return res.status(statusCode).json({ message });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
