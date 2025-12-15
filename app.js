const express = require('express');
const app=express();
const mongoose = require('mongoose');
const Listing = require('./models/listing');
const path = require('path');
const methodOverride = require("method-override");
const ejsmate = require('ejs-mate');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsmate);
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));


async function connectDB() {
    try {
        await mongoose.connect("mongodb://localhost:27017/stayo");
        console.log("Connected to the database");
    } catch (error) {
        console.error("Database connection error:", error);
    } 
}
connectDB();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/listings', async (req, res) => {
    try {
        const alllistings = await Listing.find({});    
        res.render("listings/index.ejs", { alllistings });
    }
    catch (error) {
        res.status(500).send("Error retrieving listings");
    }
});
app.get('/listings/new', (req, res) => {
    res.render("listings/new.ejs");
});

app.get('/listings/:id', async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
 });

 app.post('/listings', async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect('/listings');
 });
 app.get("/listings/:id/edit", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
});
app.put("/listings/:id", async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
});
app.delete("/listings/:id", async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
});


app.listen(8080, () => {
    console.log('Server is running on port 8080');
});
