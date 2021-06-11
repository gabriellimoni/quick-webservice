const getPathBlocksBySlash = require("./getPathBlocksBySlash");

module.exports = function (url, routes) {
  const simpleRoute = routes.find(
    (route) => route.path.toLowerCase() === url.toLowerCase()
  );
  if (simpleRoute) return simpleRoute;

  if (url.charAt(url.length - 1) === "/") {
    url = url.slice(0, url.length - 1);
  }

  const whichIndexHasParamsSeekUrl = [];
  const seekUrlpPathBlocks = getPathBlocksBySlash(url);
  for (let i = 0; i < seekUrlpPathBlocks.length; i++) {
    const thisPathBlock = seekUrlpPathBlocks[i];
    if (thisPathBlock.charAt(0) === ":") {
      whichIndexHasParamsSeekUrl.push(i);
    }
  }
  for (const route of routes) {
    let match = true;
    const pathBlocks = getPathBlocksBySlash(route.path);

    if (pathBlocks.length !== seekUrlpPathBlocks.length) continue;

    const whichIndexHasParams = [];
    for (let i = 0; i < pathBlocks.length; i++) {
      const thisPathBlock = pathBlocks[i];
      if (thisPathBlock.charAt(0) === ":") {
        whichIndexHasParams.push(i);
      }
    }
    for (let i = 0; i < whichIndexHasParamsSeekUrl.length; i++) {
      if (whichIndexHasParamsSeekUrl[i] !== whichIndexHasParams[i]) {
        match = false;
      }
    }
    if (match) {
      const params = {};
      whichIndexHasParams.forEach((indexWithParam) => {
        params[pathBlocks[indexWithParam].slice(1)] =
          seekUrlpPathBlocks[indexWithParam];
      });
      return {
        ...route,
        params,
      };
    }
  }
  return undefined;
};
