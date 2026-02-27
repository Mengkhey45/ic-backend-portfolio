export const errorMiddleware = (err, req, res, next) => {
  console.error("Server Error:", err.stack);
  const status = err.statusCode || 500;
  
  // Temporarily showing message in production to help debug the 500 error
  const message = err.message || "Internal Server Error";
  
  res.status(status).json({
    success: false,
    message,
    // stack is still hidden in production for security
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
