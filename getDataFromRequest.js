module.exports = function (req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (buffer) => {
      data += buffer.toString();
    });
    req.on("end", function () {
      resolve(data);
    });
  });
};
