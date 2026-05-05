function sendServerError(res, error) {
  console.error(error.message);
  return res.status(500).json({ error: 'Something went wrong. Please try again.' });
}

module.exports = sendServerError;
