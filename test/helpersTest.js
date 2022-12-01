const { assert } = require('chai');

const { getUserFromEmail } = require('../helpers');

const testUsers = {
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
};

describe('getUserFromEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserFromEmail(testUsers, "user@example.com").id;
    const expectedUserID = "userRandomID";
    assert.equal(user, expectedUserID);
  });

  it("should return undefined when searching for an email that doesn't exist", () => {
    const user = getUserFromEmail(testUsers, "none@example.com");
    assert.equal(user, undefined);
  });
});