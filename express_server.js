const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080

function generateRandomString() {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;

  for (let i = 0; i < characters.length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result.substring(0, 6);
};

app.set('view engine', 'ejs');

// Urls database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Users database
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
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

app.use(express.urlencoded({ extended: true}));

app.use(cookieParser());

// Adds new url to the list, redirects to page with short url
app.post("/urls", (req, res) => {
  const newUrl = generateRandomString();
  urlDatabase[newUrl] = req.body.longURL;
  //console.log(req.body); // Log the POST request body to the console
  res.redirect(`/urls/${newUrl}`); // Redirectrs the user to the page with a newly created short url
});

// Deletes a URL
app.post("/urls/:id/delete", (req, res) => {
  const { id } = req.params;
  delete urlDatabase[id];
  res.redirect("/urls");
});

// Edits a URL
app.post("/urls/:id", (req, res) => {
  const { id } = req.params;
    //console.log("body request:", req.body.newURL);
  urlDatabase[id] = req.body.newURL;
    //console.log("URLs after update:", urlDatabase);
  res.redirect("/urls");
});

// Registration
app.post("/register", (req, res) => {
    //console.log("password:", req.body.password);
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Invalid parameters");
  }

  if (!getUserFromEmail(users, req.body.email)) {
    const randomID = generateRandomString();
    newUser = {id: randomID, email: req.body.email, password: req.body.password};
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
  let user = getUserFromEmail(users, req.body.email);
    //console.log("current user:", user);
  if (!user) {
    return res.status(403).send("This user doesn't exist");
  }
  if (user.email === req.body.email && user.password !== req.body.password) {
    return res.status(403).send("Invalid credentials");
  }
  if (user.email === req.body.email && user.password === req.body.password) {
    res.cookie('userID', user.id);
    res.redirect("/urls");
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
  const templateVars = { urls: urlDatabase, user: user};
  res.render("urls_registration", templateVars);
});

// Header page
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Login Page
app.get("/login", (req, res) => {
  let user = users[req.cookies["userID"]];
  const templateVars = { urls: urlDatabase, user: user};
  res.render("urls_login", templateVars);
});

// Shows all urls using json format
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// A list of all urls edited
app.get("/urls", (req, res) => {
  let user = users[req.cookies["userID"]];
    //console.log("userID:",req.cookies["userID"]);
    //console.log("urls user:", user);
  const templateVars = { urls: urlDatabase, user: user};
  res.render("urls_index", templateVars);
});

// Page to create new urls
app.get("/urls/new", (req, res) => {
  let user = users[req.cookies["userID"]];
  const templateVars = { urls: urlDatabase, user: user};
  res.render("urls_new", templateVars);
});

// Placeholder :id
app.get("/urls/:id", (req, res) => {
  // console.log(req.params.id);
  let user = users[req.cookies["userID"]];
  const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id], urls: urlDatabase, user:user};
  res.render("urls_show", templateVars)
});

// Definition of what ID is
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

// Going here gives Hello World
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});