module.exports = function (path) {
  const allPaths = path.split("/");
  return allPaths.filter((path) => path.trim() !== "");
};
