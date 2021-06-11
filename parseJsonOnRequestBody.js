const getDataFromRequest = require("./getDataFromRequest");

module.exports = async function (req) {
  let data = await getDataFromRequest(req);
  if (typeof data === "string") {
    try {
      const jsonData = JSON.parse(data);
      req.body = jsonData;
    } catch (error) {
      req.body = data;
    }
  }
};
