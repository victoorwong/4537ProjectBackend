const { User } = require("../models/User");

exports.trackUsage = async (req, res, next) => {
  const userId = req.user?.userId;
  const method = req.method.toLowerCase();

  if (!userId) return next();

  if (method === "get" || method === "post") {
    await User.findByIdAndUpdate(userId, {
      $inc: { [`${method}Requests`]: 1 },
    });
  }

  next();
};
