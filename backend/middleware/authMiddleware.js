const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ msg: "No token" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, "smart_expense_secret");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(400).json({ msg: "Invalid token" });
  }
};