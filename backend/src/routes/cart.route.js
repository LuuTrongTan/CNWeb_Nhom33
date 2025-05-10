const express = require('express');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const cartValidation = require('../validations/cart.validation');
const cartController = require('../controllers/cart.controller');

const router = express.Router();

// Tất cả các routes đều yêu cầu xác thực
router.use(auth());

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Quản lý giỏ hàng
 */

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Lấy giỏ hàng của người dùng
 *     description: Lấy thông tin giỏ hàng của người dùng đã đăng nhập.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', cartController.getUserCart);

/**
 * @swagger
 * /cart/items:
 *   post:
 *     summary: Thêm sản phẩm vào giỏ hàng
 *     description: Thêm sản phẩm mới hoặc cập nhật số lượng sản phẩm đã có trong giỏ hàng.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *               selectedSize:
 *                 type: string
 *               selectedColor:
 *                 type: string
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
router.post('/items', validate(cartValidation.addToCart), cartController.addToCart);

/**
 * @swagger
 * /cart/items:
 *   put:
 *     summary: Cập nhật sản phẩm trong giỏ hàng
 *     description: Cập nhật số lượng, kích thước hoặc màu sắc của sản phẩm trong giỏ hàng.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *               selectedSize:
 *                 type: string
 *               selectedColor:
 *                 type: string
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/items', validate(cartValidation.updateCartItem), cartController.updateCartItem);

/**
 * @swagger
 * /cart/items/{productId}:
 *   delete:
 *     summary: Xóa sản phẩm khỏi giỏ hàng
 *     description: Xóa một sản phẩm khỏi giỏ hàng.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của sản phẩm
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/items/:productId', validate(cartValidation.removeCartItem), cartController.removeCartItem);

/**
 * @swagger
 * /cart:
 *   delete:
 *     summary: Xóa toàn bộ giỏ hàng
 *     description: Xóa tất cả sản phẩm trong giỏ hàng.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/', cartController.clearCart);

/**
 * @swagger
 * /cart/sync:
 *   post:
 *     summary: Đồng bộ giỏ hàng từ localStorage
 *     description: Đồng bộ giỏ hàng từ localStorage sau khi đăng nhập.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                     - quantity
 *                   properties:
 *                     id:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                     selectedSize:
 *                       type: string
 *                     selectedColor:
 *                       type: string
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cart:
 *                   $ref: '#/components/schemas/Cart'
 *                 warnings:
 *                   type: array
 *                   items:
 *                     type: string
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/sync', validate(cartValidation.syncCartFromLocal), cartController.syncCartFromLocal);

module.exports = router; 