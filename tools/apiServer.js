/* eslint-disable no-console */
const jsonServer = require("json-server");
const server = jsonServer.create();
const path = require("path");
const router = jsonServer.router(path.join(__dirname, "db.json"));
var db = require("./db.json");

// Can pass a limited number of options to this to override (some) defaults. See https://github.com/typicode/json-server#api
const middlewares = jsonServer.defaults({
  // Display json-server's built in homepage when json-server starts.
  static: "node_modules/json-server/dist",
});

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// To handle POST, PUT and PATCH you need to use a body-parser. Using JSON Server's bodyParser
server.use(jsonServer.bodyParser);

// Simulate delay on all requests
server.use(function (req, res, next) {
  setTimeout(next, 100);
});

// Declaring custom routes below. Add custom routes before JSON Server router
server.post("/Account/Login", (req, res) => {
  if (req.method === "POST") {
    const error = validateModel(req.body);

    if (error) {
      res.status(405).send(error);
    } else {
      const username = req.body["Username"];
      const user = db.user;

      if (user.Username == username) {
        res.status(201).jsonp(user);
      } else {
        res.status(400).jsonp({
          error: "Unauthorized",
        });
      }
    }
  }
});

server.post("/Account/RequestResetPassword", function (req, res) {
  res.status(200).send({
    Url: "A mail with the change password link has been sent to your account",
  });
});

server.get("/apeximagegen", function (req, res) {
  res.status(200).sendFile(__dirname + "/sample.png");
});

server.get("/Content/GetProjects", function (req, res) {
  res.status(200).send(db.brands);
});

server.get("/Content/GetContentRevisions", function (req, res) {
  res.status(200).send(db.years);
});

server.get("/Content/GetModels", function (req, res) {
  res.status(200).send(db.models);
});

// Use default router
server.use(router);

// Start server
const port = 3001;
server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
});

// Centralized logic
function validateModel(model) {
  if (!model.Username) return "Username is required.";
  if (!model.Password) return "Password is required.";
  return "";
}
