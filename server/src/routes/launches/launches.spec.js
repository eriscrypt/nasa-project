const request = require("supertest");
const app = require("../../app");
const { mongoConnect, mongoDisconnect } = require("../../services/mongo");

describe("Launches API", () => {
  beforeAll(async () => {
    await mongoConnect();
  });

  afterAll(async () => {
    await mongoDisconnect();
  });

  describe("Test GET /launches", () => {
    test("It should respond with 200 success", async () => {
      const response = await request(app)
        .get("/v1/launches")
        .expect(200)
        .expect("Content-Type", /json/);
    });
  });

  describe("Test POST /launches", () => {
    const completeLaunchDate = {
      mission: "USS Enterprise",
      rocket: "NCC 1701-D",
      target: "Kepler-62 f",
      launchDate: "January 5, 2028",
    };

    const completeLaunchWithoutDate = {
      mission: "USS Enterprise",
      rocket: "NCC 1701-D",
      target: "Kepler-62 f",
    };

    const launchDataWithInvalidDate = {
      mission: "USS Enterprise",
      rocket: "NCC 1701-D",
      target: "Kepler-62 f",
      launchDate: "invaliddate",
    };

    test("It should respond with 200 success", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(completeLaunchDate)
        .expect(201)
        .expect("Content-Type", /json/);

      const requestDate = new Date(completeLaunchDate.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();

      expect(requestDate).toBe(responseDate);
      expect(response.body).toMatchObject(completeLaunchWithoutDate);
    });

    test("It should catch missin required proporties", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(completeLaunchWithoutDate)
        .expect(400)
        .expect("Content-Type", /json/);

      expect(response.body).toStrictEqual({
        error: "Missing required launch property",
      });
    });

    test("It should catch invalid dates", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDataWithInvalidDate)
        .expect(400)
        .expect("Content-Type", /json/);

      expect(response.body).toStrictEqual({
        error: "Invalid launch date",
      });
    });
  });
});
