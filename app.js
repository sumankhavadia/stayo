if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require("method-override");
const ejsmate = require('ejs-mate');
const listingsRouter = require('./routes/listings.js');
const reviewsRouter = require('./routes/reviews.js');
const userRouter = require('./routes/user.js');
const ExpressError = require('./utils/ExpressError.js');
const session = require('express-session');
const MongoStoreModule = require('connect-mongo');
const MongoStore = MongoStoreModule.default || MongoStoreModule; 
const flash = require('connect-flash');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.engine("ejs", ejsmate);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, 'public')));

const dburl=process.env.MONGO_URL;
// DATABASE CONNECTION
async function connectDB() {
    try {
        await mongoose.connect(dburl);
        console.log("Connected to the database");
    } catch (error) {
        console.error("Database connection error:", error);
    }
}
connectDB();


const store = MongoStore.create({
  mongoUrl: dburl,
  touchAfter: 24 * 3600, // time period in seconds
  crypto: {
    secret: process.env.SESSION_SECRET 
  }
});

store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e);
});

const sessionConfig = {
    store,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,        
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};
    

app.use(session(sessionConfig));   
app.use(flash()); 
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.get("/", (req, res) => {
  res.redirect("/listings");
  // OR: res.render("home"); if you have home.ejs
});
// USE ROUTERS

app.use('/listings', listingsRouter);
app.use('/listings/:id/reviews', reviewsRouter);
app.use('/', userRouter);


// 404 HANDLER
app.use((req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});
// ERROR HANDLER
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { err: { statusCode, message } });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
