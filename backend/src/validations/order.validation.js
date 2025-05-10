const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createOrder = {
  body: Joi.object().keys({
    items: Joi.array()
      .items(
        Joi.object().keys({
          product: Joi.string().required().custom(objectId),
          name: Joi.string().required(),
          price: Joi.number().required().min(0),
          quantity: Joi.number().required().min(1),
          image: Joi.string().required(),
          color: Joi.string().allow('', null),
          size: Joi.string().allow('', null),
        })
      )
      .required(),
    shippingAddress: Joi.object()
      .keys({
        fullName: Joi.string().required(),
        address: Joi.string().required(),
        city: Joi.string().required(),
        district: Joi.string().required(),
        ward: Joi.string().required(),
        phone: Joi.string().required(),
      })
      .required(),
    paymentMethod: Joi.string().valid('cod', 'banking', 'momo', 'card').required(),
    shippingMethod: Joi.string().valid('standard', 'fast', 'express').required(),
    totalItemsPrice: Joi.number().required().min(0),
    shippingPrice: Joi.number().required().min(0),
    notes: Joi.string().allow('', null),
  }),
};

const getOrder = {
  params: Joi.object().keys({
    orderId: Joi.string().custom(objectId),
  }),
};

const updateOrderStatus = {
  params: Joi.object().keys({
    orderId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      status: Joi.string().valid('pending', 'processing', 'shipped', 'delivered', 'cancelled').required(),
    })
    .min(1),
};

module.exports = {
  createOrder,
  getOrder,
  updateOrderStatus,
}; 