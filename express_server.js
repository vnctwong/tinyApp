let express = require("express");
let app = express();
let PORT = 8080; // default port 8080
app.set("view engine", "ejs")
let cookieParser = require('cookie-parser')
app.use(cookieParser());


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

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
    urls: urlDatabase,
    user: req.cookies["user_id"]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: req.cookies["user_id"]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: req.cookies["user_id"]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console

  let short = generateRandomString()
  let long = req.body.longURL;
  urlDatabase[short] = long; // Respond with 'Ok' (we will replace this)
  res.redirect('/urls/' + short); ///'urls/' + short
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
})

app.post('/urls/:shortURL', (req, res) => {

  let shortURL = req.params.shortURL;
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  //1. check whether the email or password is empty

  if (!req.body.email || !req.body.password) {
    res.status(400).send('Enter email & password');
  } else {
    //Email and password were entered.
    //Email and password exists in the DB
    let user = authenticateUser(req.body.email, req.body.password);
    if (user) {
      //everything is fine
      res.cookie("user_id", user.id);
      res.redirect('/urls');
    } else {
      res.status(403).send(' or password incorrect');
    }
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  let templateVars = {
    user: req.cookies["user_id"]
  };
  res.render('urls_register');
});

app.post('/register', (req, res) => {
  //if .body empty, 400


  if (!req.body.email || !req.body.password) {
    res.status(400).send('Enter email & password');

  } else if (emailCheck(req.body.email)) {
    res.status(400).send('Email taken');

  } else {
    //adds new user object to global userDir
    let user = {
      id: generateRandomString(),
      password: req.body.password,
      email: req.body.email
    };
    users[user.id] = user
    res.cookie('user_id', user.id);
    console.log(user);
    res.redirect('/urls');
  }
});

app.get('/login', (req, res) => {
  res.render('urls_login');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  let newString = '';
  newString = (Math.random() * (5 - 1) + 1).toString(36).substring(2, 8);
  return newString;
}

function emailCheck(newEmail) {
  for (var key in users) {
    if (newEmail === users[key].email) {
      return true;
    }
  }
};

function authenticateUser(email, password) {
  for (var key in users) {
    if (users[key].email === email && users[key].password) {
      return users[key];
    }
  }
}