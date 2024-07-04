const { AuthenticationError } = require("apollo-server-express");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const decodeJWTToken = (context) => {
  return jwt.verify(context, process.env.JWT_SECRET);
};

module.exports = {
  decodeJWTToken,
};
