const http = require("http");
const resolveRoute = require("./resolveRoute");

module.exports = {
  build() {
    const routes = [];

    const handleRequest = async (req, res) => {
      const url = req.url;
      const method = req.method.toLowerCase();
      const currentRoute = resolveRoute(url, routes);

      if (!currentRoute) {
        res.writeHead(404);
        res.write(`Not found path ${url}`);
        return res.end();
      }
      if (method !== currentRoute.method) {
        res.writeHead(404);
        res.write(`Cannot ${method.toUpperCase()} ${url}`);
        return res.end();
      }

      req.params = currentRoute.params;

      await handleRequestChain(req, res, currentRoute.chain);
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
