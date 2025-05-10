const Joi = require('joi');
const { objectId } = require('./custom.validation');

const addToCart = {
  body: Joi.object().keys({
    productId: Joi.string().required().custom(objectId),
    quantity: Joi.number().integer().min(1).required(),
    selectedSize: Joi.string().allow(null, ''),
    selectedColor: Joi.string().allow(null, ''),
  }),
};

const updateCartItem = {
  body: Joi.object().keys({
    productId: Joi.string().required().custom(objectId),
    cartItemId: Joi.string().allow(null, ''),
    quantity: Joi.number().integer().min(1),
    selectedSize: Joi.string().allow(null, ''),
    selectedColor: Joi.string().allow(null, ''),
  }),
};

const removeCartItem = {
  params: Joi.object().keys({
    productId: Joi.string().required(),
  }),
};

const syncCartFromLocal = {
  body: Joi.object().keys({
    items: Joi.array().items(
      Joi.object().keys({
        id: Joi.string().required().custom(objectId),
        quantity: Joi.number().integer().min(1).required(),
        selectedSize: Joi.string().allow(null, ''),
        selectedColor: Joi.string().allow(null, ''),
      })
    ).required(),
  }),
};

module.exports = {
  addToCart,
  updateCartItem,
  removeCartItem,
  syncCartFromLocal,
}; 