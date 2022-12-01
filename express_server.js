// Required addons
const express = require("express");
const app = express();
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const PORT = 8080;

// EJS compatability
app.set('view engine', 'ejs');

// Databases
const urlDatabase = {};
const users = {};

// Functions
const { getUserFromEmail, generateRandomString, urlsForUser } = require('./helpers');

// app.uses
app.use(express.urlencoded({ extended: true}));
app.use(cookieSession({
  name: 'session',
  secret: 'blue-lobster-jumpscare',
}));


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// POST METHODS:


// Adds new url to the list, redirects to page with short url
app.post("/urls", (req, res) => {
  const user = users[req.session.userID];
  if (user) {
    const newUrl = generateRandomString();
    urlDatabase[newUrl] = {
      longURL: req.body.longURL,
      userID: user.id,
    };
    res.redirect(`/urls/${newUrl}`);
  } else {
    res.status(401).send("You must be logged in to do that");
  }
});

// Deletes a URL
app.post("/urls/:id/delete", (req, res) => {
  const { id } = req.params;
  const user = users[req.session.userID];

  if (user && user.id === urlDatabase[id].userID) {
    delete urlDatabase[id];
    res.redirect("/urls");
  } else {
    res.status(403).send("You're not authorised to do that");
  }
});

// Edits a URL
app.post("/urls/:id", (req, res) => {
  const { id } = req.params;
  const user = users[req.session.userID];

  if (user && user.id === urlDatabase[id].userID) {
    urlDatabase[id].longURL = req.body.newURL;
    res.redirect("/urls");
  } else {
    res.status(403).send("You're not authorised to do that");
  }
});

// Registration
app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Invalid parameters");
  }

  if (!getUserFromEmail(users, req.body.email)) {
    const userID = generateRandomString();

    let newUser = {id: userID, email: req.body.email, password: bcrypt.hashSync(req.body.password, 10)};
    req.session.userID = userID;
    users[userID] = newUser;
    res.redirect("/urls");
  } else {
    res.status(400).send("Account already registered");
  }
});

// Login
app.post("/login", (req, res) => {
  const user = getUserFromEmail(users, req.body.email);

  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    req.session.userID = user.id;
    res.redirect("/urls");
  } else {
    res.status(401).send("Invalid credentials, please try again");
  }
});

// Logout
app.post("/logout", (req, res) => {
  res.clearCookie('session');
  res.clearCookie('session.sig');
  res.redirect("/login");
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// GET METHODS


// Registration Page
app.get("/register", (req, res) => {
  const user = users[req.session.userID];

  if (user) {
    res.redirect("/urls");
  }
  const templateVars = { user: user};
  res.render("urls_registration", templateVars);
});

// Header page
app.get("/", (req, res) => {
  const user = users[req.session.userID];

  if (user) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

// Login Page
app.get("/login", (req, res) => {
  const user = users[req.session.userID];
  
  if (user) {
    res.redirect("/urls");
    return;
  }
  const templateVars = { user: user};
  res.render("urls_login", templateVars);
});

// Shows all urls using json format
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// A list of all urls edited
app.get("/urls", (req, res) => {
  const user = users[req.session.userID];

  if (user) {
    const userURLS = urlsForUser(urlDatabase, user.id);
    const templateVars = { urls: userURLS, user: user};
    res.render("urls_index", templateVars);
  } else {
    res.status(400).send("You must be logged in to view this");
  }
});

// Page to create new urls
app.get("/urls/new", (req, res) => {
  const user = users[req.session.userID];

  if (!user) {
    res.redirect("/login");
    return;
  }
  const templateVars = { urls: urlDatabase, user: user};
  res.render("urls_new", templateVars);
});

// Access the shortened ID
app.get("/urls/:id", (req, res) => {
  const user = users[req.session.userID];

  const userURLS = urlsForUser(urlDatabase, user.id);
  const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id].longURL, urls: urlDatabase, user: user};

  if (!user || !userURLS[req.params.id]) {
    res.status(403).send("You're not authorised to do that");
    return;
  } else {
    res.render("urls_show", templateVars);
  }
});

// Definition of what ID is
app.get("/u/:id", (req, res) => {
  if (urlDatabase[req.params.id]) {
    const longURL = urlDatabase[req.params.id].longURL;
    res.redirect(longURL);
  } else {
    res.status(404).send("This URL does not exist");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});