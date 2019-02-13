var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

app.set("view engine", "ejs")

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
  extended: true
}));

//handler = '/'
app.get("/", (req, res) => {
  res.redirect('/urls');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console

  var short = generateRandomString()
  var long = req.body.longURL;
  urlDatabase[short] = long; // Respond with 'Ok' (we will replace this)
  res.redirect('/urls/' + short); ///'urls/' + short
});

app.post('/urls/:shortURL/delete', (req, res) => {
  console.log('sdfeasdSfe')
  delete urlDatabase[req.params.shortURL];
  console.log('sdfeasdSfe')
  res.redirect('/urls')
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  let newString = '';
  newString = (Math.random() * (5 - 1) + 1).toString(36).substring(2, 8);
  return newString;
}