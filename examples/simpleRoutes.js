const qws = require("../");

const app = qws.build();

app.get("/", function () {
  return { data: { hello: "World!" } };
});

app.listen(3000);
