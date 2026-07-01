export function successResponse(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
  });
}

export function errorResponse(res, message, code = "SERVER_ERROR", statusCode = 500) {
  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      code,
    },
  });
}

export function paginatedResponse(res, items, total, page, limit) {
  return res.status(200).json({
    success: true,
    data: {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}
