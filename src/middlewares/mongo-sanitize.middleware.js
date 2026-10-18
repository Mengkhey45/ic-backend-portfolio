/**
 * Express 5 compatible middleware to prevent NoSQL query injection
 * Recursively removes keys starting with '$' or containing '.' in body, query, and params
 */
const cleanObject = (obj) => {
  if (!obj || typeof obj !== "object") return;
  
  for (const key of Object.keys(obj)) {
    if (key.startsWith("$") || key.includes(".")) {
      delete obj[key];
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      cleanObject(obj[key]);
    }
  }
};

export const sanitizeNoSQL = (req, res, next) => {
  if (req.body) cleanObject(req.body);
  if (req.query) cleanObject(req.query);
  if (req.params) cleanObject(req.params);
  next();
};

export default sanitizeNoSQL;
