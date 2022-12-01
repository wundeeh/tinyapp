// Find the user that matches the email and returns the object
const getUserFromEmail = (obj, email) => {
  for (const user in obj) {
    if (obj[user].email === email) {
      return obj[user];
    }
  }
  return undefined;
};

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

module.exports = { getUserFromEmail, generateRandomString, urlsForUser };