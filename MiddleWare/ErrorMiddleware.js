const CatchError = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Backend Error";
  const extraDetails = err.extraDetails || "Error from Backend"

  // Handle Mongoose ValidationError
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      error: errors.join(", "),
    });
  }

  // Handle MongoDB Network Error
  if (err.name === "MongoNetworkError") {
    return res.status(503).json({
      success: false,
      message: "Network error occurred. Please try again later.",
    });
  }

  // Handle MongoDB Write Concern Error
  if (err.name === "MongoWriteConcernError") {
    return res.status(500).json({
      success: false,
      message: "Write concern error. Please check your database write operations.",
    });
  }

  // Handle MongoDB Bulk Write Error
  if (err.name === "MongoBulkWriteError") {
    return res.status(400).json({
      success: false,
      message: "Bulk write error. Please check your bulk write operations.",
    });
  }

  // Handle MongoDB Command Error
  if (err.name === "MongoCommandError") {
    return res.status(400).json({
      success: false,
      message: "Command error. Please check your command syntax.",
    });
  }

  // Handle MongoDB Parse Error
  if (err.name === "MongoParseError") {
    return res.status(400).json({
      success: false,
      message: "Parse error. Please check your query or connection string.",
    });
  }

  // Handle other types of errors
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "An unexpected error occurred",
  });
};

export default CatchError;
