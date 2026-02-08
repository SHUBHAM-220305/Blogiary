const jwt = require("jsonwebtoken");
const {
  JWT_SECRET,
  RESET_PASSWORD_SECRET,
  RESET_PASSWORD_EXPIRE,
} = require("../config/dotenv.config");

async function generateJWT(payload) {
  let token = await jwt.sign(payload, JWT_SECRET);
  return token;
}

async function verifyJWT(token) {
  try {
    let data = await jwt.verify(token, JWT_SECRET);
    return data;
  } catch (error) {
    return false;
  }
}

async function decodeJWT(token) {
  let decoded = await jwt.decode(token);
  return decoded;
}

function generateResetToken(payload) {
  return jwt.sign(payload, RESET_PASSWORD_SECRET, {
    expiresIn: RESET_PASSWORD_EXPIRE,
  });
}

function verifyResetToken(token) {
  return jwt.verify(token, RESET_PASSWORD_SECRET);
}

module.exports = {
  generateJWT,
  verifyJWT,
  decodeJWT,
  generateResetToken,
  verifyResetToken,
};
