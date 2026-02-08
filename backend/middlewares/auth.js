const { verifyJWT } = require("../utils/generateToken");

const verifyUser = async (req, res, next) => {
  try {
    let token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Please Sign in",
      });
    }

    try {
      let user = await verifyJWT(token);
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Please Sign in",
        });
      }
      req.user = user.id;
      next();
    } catch (error) {}
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Missing Token",
    });
  }
};

module.exports = verifyUser;
