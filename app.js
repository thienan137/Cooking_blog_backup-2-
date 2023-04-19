const express = require("express");
// const handlebars = require("express-handlebars");
const expressLayouts = require('express-ejs-layouts');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');


const app = express();
const port = 3000;

require("dotenv").config();

app.use(express.urlencoded( { extended: true } ));
app.use(express.static('public'));
app.use(expressLayouts);
app.use(express.json());


app.use(cookieParser('CookingBlogSecure'));
app.use(session({
  secret: 'CookingBlogSecretSession',
  saveUninitialized: true,
  resave: true
}));
app.use(flash());
app.use(fileUpload());


//layout
// app.engine(
//   "handlebars",
//   handlebars.engine({
//     layoutsDir: `${__dirname}/views/layouts`, //phải lấy folder layout
//   })
// );
// app.set("layout", "./layouts/main");
// app.set("view engine", "handlebars");
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');


//Routes
const routes = require("./server/routes/recipeRoutes.js");
app.use("/", routes);

//listen
app.listen(port, () => console.log(`Listening to port ${port}`));

