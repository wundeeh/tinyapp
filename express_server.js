// Required addons
const express = require("express");
const cookieParser = require('cookie-parser');
const e = require("express");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 8080; // default port 8080

// Random string generator
function generateRandomString() {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;

  for (let i = 0; i < characters.length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result.substring(0, 6);
};

// EJS compatability
app.set('view engine', 'ejs');

// Url database
const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW",
  },
  s9m5xK: {
    longURL: "https://www.google.com",
    userID: "aJ48lW",
  },
};

// Users database
const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "test@test.com",
    password: "123",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
}

// Find the user that matches the email and returns the object
const getUserFromEmail = (obj, email) => {
  for (const user in obj) {
    if (obj[user].email === email) {
      return obj[user];
    }
  }
  return undefined;
};

// Find URLs by user id
const urlsForUser = (obj, id) => {
  let userURLs = {};

  for (const shortURL in obj) {
    if (obj[shortURL].userID === id) {
      userURLs[shortURL] = obj[shortURL];
    }
  }
  return userURLs;
};

app.use(express.urlencoded({ extended: true}));

app.use(cookieParser());

// Adds new url to the list, redirects to page with short url
app.post("/urls", (req, res) => {
  let user = users[req.cookies["userID"]];
  if (user) {
    const newUrl = generateRandomString();
    urlDatabase[newUrl] = {
      longURL: req.body.longURL,
      userID: user.id,
    };
      //console.log(req.body); // Log the POST request body to the console
    res.redirect(`/urls/${newUrl}`);
  } else {
    res.status(401).send("You must be logged in to do that");
  }
});

// Deletes a URL
app.post("/urls/:id/delete", (req, res) => {
  const { id } = req.params;
  const user = users[req.cookies["userID"]];

  if (user && user === urlDatabase[id].userID) {
    delete urlDatabase[id];
    res.redirect("/urls");
  } else {
    res.status(403).send("You're not authorised to do that")
  }
});

// Edits a URL
app.post("/urls/:id", (req, res) => {
  const { id } = req.params;
  const user = users[req.cookies["userID"]];

  if (user && user === urlDatabase[id].userID) {
    urlDatabase[id].longURL = req.body.newURL;
    res.redirect("/urls");
  } else {
    res.status(403).send("You're not authorised to do that")
  }
  //console.log("body request:", req.body.newURL);
  //console.log("URLs after update:", urlDatabase);
});

// Registration
app.post("/register", (req, res) => {
    //console.log("password:", req.body.password);
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Invalid parameters");
  }

  if (!getUserFromEmail(users, req.body.email)) {
    const randomID = generateRandomString();
    newUser = {id: randomID, email: req.body.email, password: bcrypt.hashSync(req.body.password, 10)};
    res.cookie("userID", randomID);
    users[randomID] = newUser;
      //console.log("registered users:", users);
    res.redirect("/urls");
  } else {
    res.status(400).send("Account already registered");
  }
});

// Login
app.post("/login", (req, res) => {
  const user = getUserFromEmail(users, req.body.email);
    //console.log("current user:", user);
    //console.log("password:", req.body.password)
    //console.log("compare sync:", bcrypt.compareSync(req.body.password, hashedPassword))
  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    res.cookie('userID', user.id);
    res.redirect("/urls"); 
  } else {
    res.status(401).send("Invalid credentials, please try again");
  }

});

// Logout
app.post("/logout", (req, res) => {
  res.clearCookie('userID');
  res.redirect("/login");
});

// Registration Page
app.get("/register", (req, res) => {
  let user = users[req.cookies["userID"]];
  if (user) {
    res.redirect("/urls");
  }
  const templateVars = { user: user};
  res.render("urls_registration", templateVars);
});

// Header page
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Login Page
app.get("/login", (req, res) => {
  let user = users[req.cookies["userID"]];
  if (user) {
    res.redirect("/urls");
    return;
  }
    //console.log("users:", users);
    //console.log("user:", user, req.cookies);
  const templateVars = { user: user};
  res.render("urls_login", templateVars);
});

// Shows all urls using json format
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// A list of all urls edited
app.get("/urls", (req, res) => {
  let user = users[req.cookies["userID"]];
  const userURLS = urlsForUser(urlDatabase, user.id);
    //console.log("user:", user);
    //console.log("users:", users);
    //console.log(userURLS);
    //console.log("userID:",req.cookies["userID"]);
    //console.log("urls user:", user);
  if (user) {
    const templateVars = { urls: userURLS, user: user};
    res.render("urls_index", templateVars);
  } else {
    res.status(400).send("You must be logged in to view this");
  }
});

// Page to create new urls
app.get("/urls/new", (req, res) => {
  let user = users[req.cookies["userID"]];
  if (!user) {
    res.redirect("/login");
    return;
  }
  const templateVars = { urls: urlDatabase, user: user};
  res.render("urls_new", templateVars);
});

// Access the shortened ID
app.get("/urls/:id", (req, res) => {
  // console.log(req.params.id);
  const user = users[req.cookies["userID"]];
  const userURLS = urlsForUser(urlDatabase, user.id);
  const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id].longURL, urls: urlDatabase, user:user};

  if (!user || !userURLS[id]) {
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

// Going here gives Hello World
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});