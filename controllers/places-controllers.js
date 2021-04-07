const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const mongooseUniqueValidator = require("mongoose-unique-validator");
const HttpError = require("../models/http-error");
const Place = require("../models/place");
const User = require("../models/user");

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a place",
      500
    );
    return next(error);
  }

  if (!place) {
    return next(
      new HttpError("Could not find the place for provided place id", 404)
    );
  }
  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let places;
  try {
    places = await Place.find({ creator: userId });
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find the place for provided user id",
      500
    );
  }
  if (!places || places.length === 0) {
    return next(
      new HttpError("Could not find the places for provided user id", 404)
    );
    //throw(error) and next(error) is same but with async handler we cannot use throw.
  }
  res.json({
    places: places.map((place) => place.toObject({ getters: true })),
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  const { title, description, coordinates, address, creator } = req.body;
  //const title = req.body.title;
  const createdPlace = new Place({
    title,
    description,
    image:
      "https://www.templepurohit.com/wp-content/uploads/2016/05/Changu_Narayan_Temple.jpg",
    location: coordinates,
    address,
    creator,
  });
  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, creating place failed. Please try again latter.",
      500
    );
    return next(error);
  }

  if (!user) {
    return next(
      new HttpError("Could not find the creator for provided id", 404)
    );
  }
  //console.log(user);
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
    res
      .status(201)
      .json({ createdPlace: createdPlace.toObject({ getters: true }) });
  } catch (err) {
    const error = new HttpError(
      "Creating place failed, please try aganin later",
      500
    );
    return next(error);
  }
};
const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError("Invalid inputs passed, please check your data.", 422);
  }
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update the place",
      500
    );
    return next(error);
  }
  place.title = req.body.title;
  place.description = req.body.description;
  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update the place",
      500
    );
    return next(error);
  }
  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId).populate("creator");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a place",
      500
    );
    return next(error);
  }
  if (!place) {
    return next(
      new HttpError("Could not find the place for provided place id", 404)
    );
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete the place",
      500
    );
  }
  res.status(200).json({ message: "Place deleted" });
};

module.exports.getPlaceById = getPlaceById;
module.exports.getPlacesByUserId = getPlacesByUserId;
module.exports.createPlace = createPlace;
module.exports.updatePlace = updatePlace;
module.exports.deletePlace = deletePlace;
