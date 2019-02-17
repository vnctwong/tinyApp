const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],


  maxAge: 24 * 60 * 60 * 1000
}))
app.set("view engine", "ejs");

//creates random string for url and username
function generateRandomString() {
  let newString = '';
  newString = (Math.random() * (5 - 1) + 1).toString(36).substring(2, 8);
  return newString;
}
//check if email is taken
function emailCheck(newEmail) {

  for (var key in users) {
    if (newEmail === users[key].email) {
      return true;
    }
  }
};
//checks if password matches account
function authenticateUser(email, password) {

  for (var key in users) {
    if (users[key].email === email &&
      bcrypt.compareSync(password, users[key].password)) {
      return users[key];
    }
  }
}
//regulates saved user urls
function urlsForUser(id) {
  let userUrls = {};

  for (var key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      userUrls[key] = (urlDatabase[key].longURL);
    }
  }
  return userUrls;
}
//converts all urls to http protocol
function httpCheck(string) {

  if ((string.startsWith('http://')) || (string.startsWith('https://'))) {
    return string;
  } else {
    return 'https://' + string;
  }
}

const urlDatabase = {

  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "rdmStr"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "rdmStr"
  },
  frwtyh: {
    longURL: "https://www.espn.com",
    userID: "rdmStr2"
  }
};

const users = {

  "rdmStr": {
    id: "rdmStr",
    email: "1@email.com",
    password: bcrypt.hashSync("1", 10)
  },
  "rdmStr2": {
    id: "rdmStr2",
    email: "2@email.com",
    password: bcrypt.hashSync("2", 10)
  }
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get("/", (req, res) => {
  res.redirect('/urls');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.session.user_id),
    users,
    user: req.session.user_id,
  };
  res.render("urls", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    users,
    user: req.session.user_id,
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    users,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: req.session.user_id,
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  console.log(req.body);

  let userID = req.session.user_id
  let short = generateRandomString()
  let long = httpCheck(req.body.longURL);
  urlDatabase[short] = {
    longURL: long,
    userID: userID,
  };
  res.redirect('/urls/' + short);
});

app.post('/urls/:shortURL/delete', (req, res) => {

  if (!req.session.user_id) {
    res.status(403).send('You need to Login to do this')

  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  }
});

app.post('/urls/:shortURL', (req, res) => {

  if (!req.session.user_id) {
    res.status(403).send('You need to Login to do this')

  } else {
    let userID = req.session.user_id
    let shortURL = req.params.shortURL;
    let longURL = httpCheck(req.body.longURL);
    urlDatabase[shortURL] = {
      longURL: longURL,
      userID: userID,
    };
    res.redirect('/urls');
  }
});

app.post('/login', (req, res) => {
  let user = authenticateUser(req.body.email, req.body.password);

  if (!req.body.email || !req.body.password) {
    res.status(400).send('Enter email & password');

  } else if (user) {
    req.session.user_id = user.id;
    res.redirect('/urls');

  } else {
    res.status(403).send('Email or Password incorrect');
  }

});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  let templateVars = {
    users,
    user: req.session.user_id,
  };
  if (req.session.user) {
    res.redirect('/urls');
  } else {
    res.render('urls_register', templateVars);
  }
});

app.post('/register', (req, res) => {

  if (!req.body.email || !req.body.password) {
    res.status(400).send('Enter email & password');

  } else if (emailCheck(req.body.email)) {
    res.status(400).send('Email already taken');

  } else {
    let password = req.body.password;
    let hashedPassword = bcrypt.hashSync(password, 10)
    let user = {
      id: generateRandomString(),
      password: hashedPassword,
      email: req.body.email
    };
    users[user.id] = user
    req.session.user_id = user.id;
    console.log(user);
    res.redirect('/urls');
  }
});

app.get('/login', (req, res) => {
  let templateVars = {
    users,
    user: req.session.user_id,
  };
  if (req.session.user) {
    res.redirect('/urls');
  } else {
    res.render('urls_login', templateVars);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});