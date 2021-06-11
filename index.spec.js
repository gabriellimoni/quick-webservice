const QuickWebservice = require("./index");
const request = require("supertest");

let quickWebservice = QuickWebservice.build();

beforeEach(() => {
  quickWebservice = QuickWebservice.build();
});
afterEach(() => {
  quickWebservice.close();
});

describe("GET routes", () => {
  test("Should return 200 and string data on text response", async () => {
    quickWebservice.get("/", () => {
      return "body-response";
    });
    quickWebservice.listen(3000);

    const response = await request(quickWebservice.server).get("/");
    expect(response.status).toBe(200);
    expect(response.text).toBe("body-response");
  });

  test("Should return 303 and data on text response", async () => {
    quickWebservice.get("/303", () => {
      return { status: 303, data: "body-response" };
    });
    quickWebservice.listen(3000);

    const response = await request(quickWebservice.server).get("/303");
    expect(response.status).toBe(303);
    expect(response.text).toBe("body-response");
  });

  test("Should return 200 and no data if no response is provided", async () => {
    quickWebservice.get("/", () => {
      return;
    });
    quickWebservice.listen(3000);

    const response = await request(quickWebservice.server).get("/");
    expect(response.status).toBe(200);
    expect(response.text).toBe("");
  });

  test("Should parse one route param correctly", async () => {
    quickWebservice.get("/param/:myParam", ({ params }) => {
      return params.myParam;
    });
    quickWebservice.listen(3000);

    const response = await request(quickWebservice.server).get(
      "/param/paramToTest"
    );
    expect(response.text).toBe("paramToTest");
  });

  test("Should parse many route param correctly", async () => {
    quickWebservice.get(
      "/param/:myParam1/:myParam2/another-path/:myParam3",
      ({ params }) => {
        return `${params.myParam1}-${params.myParam2}-${params.myParam3}`;
      }
    );
    quickWebservice.listen(3000);

    const response = await request(quickWebservice.server).get(
      "/param/firstParam/secondParam/another-path/thirdParam"
    );
    expect(response.text).toBe("firstParam-secondParam-thirdParam");
  });

  test("Should return 404 if url not found", async () => {
    quickWebservice.get("/", () => {
      return;
    });
    quickWebservice.listen(3000);

    const response = await request(quickWebservice.server).get(
      "/not-existent-route"
    );
    expect(response.status).toBe(404);
    expect(response.text).toBe("Not found path /not-existent-route");
  });

  test("Should return 404 if method not allowed", async () => {
    quickWebservice.get("/", () => {
      return;
    });
    quickWebservice.listen(3000);

    const response = await request(quickWebservice.server).post("/");
    expect(response.status).toBe(404);
    expect(response.text).toBe("Cannot POST /");
  });

  test("Should return json object if json sent on data", async () => {
    quickWebservice.get("/", () => {
      return { status: 200, data: { some: "json" } };
    });
    quickWebservice.listen(3000);

    const response = await request(quickWebservice.server).get("/");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ some: "json" });
  });

  test("Should return json object if json return", async () => {
    quickWebservice.get("/", () => {
      return { some: "json" };
    });
    quickWebservice.listen(3000);

    const response = await request(quickWebservice.server).get("/");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ some: "json" });
  });
});

describe("POST routes", () => {
  test("Should return 200", async () => {
    quickWebservice.post("/", () => {
      return "body-response";
    });
    quickWebservice.listen(3000);

    const response = await request(quickWebservice.server).post("/");
    expect(response.status).toBe(200);
    expect(response.text).toBe("body-response");
  });

  test("Should parse json data on request body params", async () => {
    quickWebservice.post("/", (req) => {
      return req.body;
    });
    quickWebservice.listen(3000);

    const response = await request(quickWebservice.server).post("/").send({
      my: "data",
    });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ my: "data" });
  });

  test("Should not json data on request body params", async () => {
    quickWebservice.post("/", (req) => {
      return req.body;
    });
    quickWebservice.listen(3000);

    const response = await request(quickWebservice.server)
      .post("/")
      .send("my-data");
    expect(response.status).toBe(200);
    expect(response.text).toBe("my-data");
  });
});
