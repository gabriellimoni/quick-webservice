const http = require("http");
const getPathBlocksBySlash = require("./getPathBlocksBySlash");

module.exports = {
  build() {
    const routes = [];

    const handleRequest = async (req, res) => {
      const url = req.url;
      const method = req.method.toLowerCase();
      const currentRoute = resolveRoute(url);

      if (!currentRoute) {
        res.writeHead(404);
        res.write("Not found path ");
        res.write(url);
        return res.end();
      }
      if (method !== currentRoute.method) {
        res.write(`Cannot ${method.toUpperCase()} `);
        res.write(url);
        return res.end();
      }

      req.params = currentRoute.params;

      await handleRequestChain(req, res, currentRoute.chain);
    };

    const resolveRoute = (url) => {
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

    const handleRequestChain = async (req, res, funcs) => {
      let currentResponse = null;
      for (let i = 0; i < funcs.length; i++) {
        const currentFunc = funcs[i];
        currentResponse = await currentFunc(req, res);
        if (res.finished) break;
      }
      if (!currentResponse) {
        res.writeHead(200);
        return res.end();
      }
      res.writeHead(currentResponse.status ? currentResponse.status : 200);
      res.write(
        currentResponse.data
          ? currentResponse.data
          : currentResponse
          ? currentResponse
          : ""
      );
      res.end();
    };

    const server = http.createServer(handleRequest);

    return {
      get(path, ...funcs) {
        routes.push({
          path: path,
          method: "get",
          chain: funcs,
        });
      },
      listen(port, callback) {
        server.listen(port, callback);
      },
      close() {
        server.close();
      },
      server,
    };
  },
};
