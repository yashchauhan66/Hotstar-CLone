import jwt from "jsonwebtoken";
export const protect = (req, res, next) => {
  try {
    if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }
    const token = req.headers.authorization.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;  

    next();
  } catch (err) {
    console.error("Auth Error:", err.message);
    res.status(401).json({ message: "Token is not valid" });
  }
};


