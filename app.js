const express = require("express");
const mongoose = require("mongoose");

const placesRoutes = require("./routes/places-routes");
const userRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//resolve CORS issue
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Mothods", "GET, POST, PATCH, DELETE");
  next();
});

app.use("/api/places", placesRoutes);
app.use("/api/users", userRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  next(error);
});
app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

const PORT = process.env.PORT || 5000;
mongoose
  .connect(
    "mongodb://dinesh:RQm23SzI4hKjVZn6@nodejscluster-shard-00-00.pt0ox.mongodb.net:27017,nodejscluster-shard-00-01.pt0ox.mongodb.net:27017,nodejscluster-shard-00-02.pt0ox.mongodb.net:27017/places?ssl=true&replicaSet=atlas-ffvd6b-shard-0&authSource=admin&retryWrites=true&w=majority"
  )
  .then(() => {
    app.listen(PORT, () =>
      console.log(`Server is up and running in port ${PORT}.`)
    );
  })
  .catch((error) => console.log(error));
