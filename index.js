const http = require("http");
const handleRequestChain = require("./handleRequestChain");
const parseJsonOnRequestBody = require("./parseJsonOnRequestBody");
const resolveRoute = require("./resolveRoute");

module.exports = {
  build() {
    const routes = [];

    const handleRequest = async (req, res) => {
      const url = req.url;
      const method = req.method.toLowerCase();
      const currentRoute = resolveRoute(url, routes);
      await parseJsonOnRequestBody(req);

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

    const server = http.createServer(handleRequest);
    server.setTimeout(1000);

    return {
      get(path, ...funcs) {
        routes.push({
          path: path,
          method: "get",
          chain: funcs,
        });
      },
      post(path, ...funcs) {
        routes.push({
          path: path,
          method: "post",
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
