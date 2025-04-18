const errorMessage = (res, error) => {
    res.status(error.status ? error.status : 500).json({
      name: error.name,
      message: error.message,
    });
  };

  module.exports = errorMessage;