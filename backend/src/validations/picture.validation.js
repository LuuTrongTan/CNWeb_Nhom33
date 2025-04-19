const Joi = require('joi');
const { objectId } = require('./custom.validation');

const getPictures = {
  query: Joi.object().keys({
    productId: Joi.string(),
    link: Joi.string(),
    createAt: Joi.date(),
    public_id: Joi.string(),
  }),
};

const getPictureById = {
  params: Joi.object().keys({
    id: Joi.required().custom(objectId),
  }),
};

const deletePicture = {
  params: Joi.object().keys({
    id: Joi.required().custom(objectId),
  }),
};

module.exports = {
  getPictures,
  getPictureById,
  deletePicture,
};
