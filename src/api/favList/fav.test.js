const jwt = require("jsonwebtoken");
const clonServer = require("supertest");
const app = require("../../app");
const { connect, disconnected, cleanup } = require("../../db.js");
const User = require("../user/user.model");
const mongoose = require("mongoose");

describe("Fav", () => {
  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => {
    await disconnected();
  });

  beforeEach(async () => {
    await cleanup();
  });

  it("should create a new list of favorites correctly", async () => {
    const user = await loginUser();
    const authHeader = createHeader(user);
    const fav = {
      name: "listname",
      favs: [
        { title: "fav title", description: "fav description", link: "alink" },
        { title: "fav title2", description: "fav description2", link: "alink" },
      ],
    };
    const res = await clonServer(app)
      .post("/api/favs")
      .set("Authorization", authHeader)
      .send(fav);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("favList");
  });

  it("should require authorization in order to create new fav list", async () => {
    const fav = { title: "fav title", description: "fav description" };
    const res = await clonServer(app).post("/api/favs").send(fav);

    expect(res.statusCode).toBe(400);
  });

  it("should not create fav with invalid token", async () => {
    const fav = { title: "fav title", description: "fav description" };
    const res = await clonServer(app)
      .post("/api/favs")
      .set("Authorization", "Bearer NotValidToken")
      .send(fav);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch("Invalid Token");
  });

  it("should not create fav with valid token but invalid user", async () => {
    const fav = { title: "fav title", description: "fav description" };
    const res = await clonServer(app)
      .post("/api/favs")
      .set(
        "Authorization",
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzNDVkYmE5ZjcyZTJkOWEwNjIyODFhMyIsImlhdCI6MTY2NTY2NTA1MH0.svPEnLZaboHdJ2gGomGVISNZjDd6wPhOnJ1mUlTAEZI"
      )
      .send(fav);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch("No user found");
  });

  it("should find a fav correctly while auth and favId ok", async () => {
    const user = await loginUser();
    const authHeader = createHeader(user);
    const fav = {
      name: "listname",
      favs: [
        { title: "fav title", description: "fav description", link: "alink" },
        { title: "fav title2", description: "fav description2", link: "alink" },
      ],
    };
    const res = await clonServer(app)
      .post("/api/favs")
      .set("Authorization", authHeader)
      .send(fav);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("favList");

    const response = await clonServer(app)
      .get(`/api/favs/${res.body.favList._id}`)
      .set("Authorization", authHeader)
      .send(fav);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("fav");
  });

  it("should not find a fav correctly if user does not exist", async () => {
    const user = await loginUser();
    const authHeader = createHeader(user);
    const fav = {
      name: "listname",
      favs: [
        { title: "fav title", description: "fav description", link: "alink" },
        { title: "fav title2", description: "fav description2", link: "alink" },
      ],
    };
    const res = await clonServer(app)
      .post("/api/favs")
      .set("Authorization", authHeader)
      .send(fav);

    const response = await clonServer(app)
      .get(`/api/favs/${res.body.favList._id}`)
      .set(
        "Authorization",
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzNDVkYmE5ZjcyZTJkOWEwNjIyODFhMyIsImlhdCI6MTY2NTY2NTA1MH0.svPEnLZaboHdJ2gGomGVISNZjDd6wPhOnJ1mUlTAEZI"
      );

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toMatch("No user found");
  });

  it("should not find fav when fav does not exist", async () => {
    const user = await loginUser();
    const authHeader = createHeader(user);
    const notValidid = mongoose.Types.ObjectId("4edd40c86762e0fb12000003");

    const response = await clonServer(app)
      .get(`/api/favs/${notValidid}`)
      .set("Authorization", authHeader)
      .send();

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toMatch("No fav list found");
  });

  it("should not allow user that did not created the list", async () => {
    const user = await loginUser();
    const authHeader = createHeader(user);
    const fav = {
      name: "listname",
      favs: [
        { title: "fav title", description: "fav description", link: "alink" },
        { title: "fav title2", description: "fav description2", link: "alink" },
      ],
    };
    const res = await clonServer(app)
      .post("/api/favs")
      .set("Authorization", authHeader)
      .send(fav);

    const user2 = await loginUser("otroemail@email.com");
    const authHeader2 = createHeader(user2);

    const response = await clonServer(app)
      .get(`/api/favs/${res.body.favList._id}`)
      .set("Authorization", authHeader2)
      .send(fav);

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toMatch("User not authorized to this list");
  });

  it("should deleted a created fav", async () => {
    const user = await loginUser();
    const authHeader = createHeader(user);
    const fav = {
      name: "listname",
      favs: [
        { title: "fav title", description: "fav description", link: "alink" },
        { title: "fav title2", description: "fav description2", link: "alink" },
      ],
    };
    const res = await clonServer(app)
      .post("/api/favs")
      .set("Authorization", authHeader)
      .send(fav);

    const response = await clonServer(app)
      .delete(`/api/favs/${res.body.favList._id}`)
      .set("Authorization", authHeader)
      .send(fav);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toMatch("Sucssesfully deleted");
  });

  it("should not delete a fav is user do not create it", async () => {
    const user = await loginUser();
    const authHeader = createHeader(user);
    const fav = {
      name: "listname",
      favs: [
        { title: "fav title", description: "fav description", link: "alink" },
        { title: "fav title2", description: "fav description2", link: "alink" },
      ],
    };
    const res = await clonServer(app)
      .post("/api/favs")
      .set("Authorization", authHeader)
      .send(fav);

    const user2 = await loginUser("otroemail@email.com");
    const authHeader2 = createHeader(user2);

    const response = await clonServer(app)
      .delete(`/api/favs/${res.body.favList._id}`)
      .set("Authorization", authHeader2)
      .send(fav);

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toMatch("User not authorized to this list");
  });

  it("should list all de fav created by a user", async () => {
    const user = await loginUser();
    const authHeader = createHeader(user);
    const fav = {
      name: "listname",
      favs: [
        { title: "fav title", description: "fav description", link: "alink" },
        { title: "fav title2", description: "fav description2", link: "alink" },
      ],
    };
    await clonServer(app)
      .post("/api/favs")
      .set("Authorization", authHeader)
      .send(fav);

    await clonServer(app)
      .post("/api/favs")
      .set("Authorization", authHeader)
      .send(fav);

    const response = await clonServer(app)
      .get(`/api/favs`)
      .set("Authorization", authHeader)
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("favs");
    expect(response.body.favs.length).toEqual(2);
  });
});

async function loginUser(email = "jhondoe@email.com") {
  const newUser = {
    email,
    password: "Diego123*",
  };

  const user = await User.create(newUser);

  return user;
}

function createHeader(user) {
  const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
    expiresIn: 60 * 60 * 24,
  });

  return `Bearer ${token}`;
}


