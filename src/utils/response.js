/**
 * Mengirim response sukses ke client
 *
 * @param {object} res - Express response object
 * @param {string} message - Pesan response yang akan dikirim ke client
 * @param {*} [data=null] - Data response (opsional)
 * @param {number} [statusCode=200] - HTTP status code
 * @returns {object} Express response
 */
export const successResponse = (
  res,
  message,
  data = null,
  statusCode = 200,
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Mengirim response error ke client
 *
 * @param {object} res - Express response object
 * @param {string} message - Pesan error
 * @param {number} [statusCode=400] - HTTP status code
 * @returns {object} Express response
 */
export const errorResponse = (res, message, statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};
