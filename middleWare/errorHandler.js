

export const errorHandler = (err, req, res, next) => { //error always comes first
  let statusCode = err.statusCode || 500

  let message = err.message

  if(err.name === 'ValidationError') {
    statusCode = 400;
     message = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  if (err.code === 11000) {
    statusCode = 400;
    const msg = Object.values(err.keyValue).join(' ,');
    message = `${msg} already exists`
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : null
  })
}