import jwt from "jsonwebtoken";

export const generateToken = (id, email) => {
  return jwt.sign(
    { id, email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};