module.exports = async function (req, res, funcs) {
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
  handleResponse(currentResponse, req, res);
};

function handleResponse(currentResponse, req, res) {
  if (res.finished) return;
  if (currentResponse && currentResponse.status) {
    res.writeHead(currentResponse.status);
  } else {
    res.writeHead(200);
  }

  if (currentResponse && typeof currentResponse === "string") {
    res.write(currentResponse);
  } else if (
    currentResponse &&
    !currentResponse.status &&
    typeof currentResponse === "object"
  ) {
    res.writeHead(res.statusCode, { "Content-Type": "application/json" });
    res.write(JSON.stringify(currentResponse));
  } else if (currentResponse && currentResponse.data) {
    if (typeof currentResponse.data === "string") {
      res.write(currentResponse.data);
    } else if (typeof currentResponse.data === "object") {
      res.writeHead(res.statusCode, { "Content-Type": "application/json" });
      res.write(JSON.stringify(currentResponse.data));
    }
  }

  res.end();
}
