const express = require("express");
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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true}));

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
  console.log("body request:", req.body.newURL);
  urlDatabase[id] = req.body.newURL
  console.log("URLs after update:", urlDatabase);
  res.redirect("/urls")
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.end("Done");
});

// Header page
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Login Page
// app.get("/login", (req, res) => {
//   
// });

// Shows all urls using json format
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// A list of all urls edited
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Page to create new urls
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// Placeholder :d
app.get("/urls/:id", (req, res) => {
  // console.log(req.params.id);
  const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id]}
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