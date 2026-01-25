// middleware/logger.js
export const requestLogger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
//   console.log("Params:", req.params);
//   console.log("Query:", req.query);
//   console.log("Body:", req.body);
  console.log("------");
  next();
};
