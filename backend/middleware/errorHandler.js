/**
 * Centralized error handler middleware.
 * Prevents internal errors or Gemini API details from leaking to the frontend.
 */
function errorHandler(err, req, res, next) {
  console.error('====================================================');
  console.error('🔴 BACKEND ERROR DETECTED');
  console.error(`Type: ${err.name || 'Error'}`);
  console.error(`Message: ${err.message}`);
  if (err.stack) {
    console.error('Stack Trace:');
    console.error(err.stack);
  }
  console.error('====================================================');

  const isProduction = process.env.NODE_ENV === 'production';
  
  res.status(err.status || 500).json({
    success: false,
    error: "Your Future Mentor is reflecting. Please try again in a moment.",
    details: isProduction ? null : {
      message: err.message,
      type: err.name,
      stack: err.stack ? err.stack.split('\n') : []
    }
  });
}

module.exports = errorHandler;
