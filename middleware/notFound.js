const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route not found: ${req.method} ${req.originalUrl}`,
      code: "NOT_FOUND",
    },
  });
};

export default notFound;
