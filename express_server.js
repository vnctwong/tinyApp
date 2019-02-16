let express = require("express");
let app = express();
let PORT = 8080; // default port 8080
app.set("view engine", "ejs")
let cookieParser = require('cookie-parser')
app.use(cookieParser());


const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "rdmStr"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "rdmStr"
  }
};

const users = {
  "rdmStr": {
    id: "rdmStr",
    email: "1@email.com",
    password: "1"
  },
  "rdmStr2": {
    id: "rdmStr2",
    email: "2@email.com",
    password: "2"
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
  let user = req.cookies["user_id"];
  let templateVars = {
    urls: urlsForUser(user),
    user
  };
  res.render("urls", templateVars);
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
  //see if logged in
  if (!req.cookies['user_id']) {
    //if not, return status code (403)
    res.status(403).send('You need to Login to do this')
    //else
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  }
});

app.post('/urls/:shortURL', (req, res) => {
  //see if logged in
  if (!req.cookies['user_id']) {
    //if not, return status code (403)
    res.status(403).send('You need to Login to do this')
    //else
  } else {
    let shortURL = req.params.shortURL;
    let longURL = req.body.longURL;
    urlDatabase[shortURL] = longURL;
    res.redirect('/urls');
  }
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
      res.status(403).send('password incorrect');
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

function urlsForUser(id) {
  let userUrls = {};
  //loops through Url db
  for (var key in urlDatabase) {
    //if users[userID] = logged in ID
    if (urlDatabase[key].userID === id) {
      //returns short url obj
      userUrls[key] = (urlDatabase[key].longURL);
    }
  }
  return userUrls;
}

// const urlDatabase = {
//   b6UTxQ: {
//     longURL: "https://www.tsn.ca",
//     userID: "rdmStr"
//   },
//   i3BoGr: {
//     longURL: "https://www.google.ca",
//     userID: "rdmStr"

// const users = {
//   "rdmStr": {
//     id: "rdmStr",
//     email: "1@email.com",
//     password: "1"
//   },
//   "rdmStr2": {
//     id: "rdmStr2",
//     email: "2@email.com",
//     password: "2"