import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.js";

export const login = async (req, res) => {
  const { email, password } = req.body;

  // check email
  if (email !== process.env.ADMIN_EMAIL) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // compare password
  const isMatch = await bcrypt.compare(
    password,
    process.env.ADMIN_PASSWORD
  );

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // generate token
  const token = generateToken(email);

  res.json({
    message: "Login success",
    token
  });
};