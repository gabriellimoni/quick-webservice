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
