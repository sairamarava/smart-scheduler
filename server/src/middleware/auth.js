const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    // Get token from header, query, or cookie
    const token =
      req.headers.authorization?.split(" ")[1] ||
      req.query.token ||
      req.cookies?.token;

    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user from decoded token
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Add user data to request for use in controllers
    req.user = user;
    req.userId = user._id; // Add userId directly for convenience
    next();
  } catch (error) {
    console.error("Auth Error:", error.message);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
