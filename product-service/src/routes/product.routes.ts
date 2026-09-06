import { Router } from "express";


import {
    createProduct,
    getSellerProducts,
      getPublicProducts,
      getPublicProductBySlug,
  getPublicCategories,
    getProductById,
    updateProduct,
    deleteProduct,
    getPublicProductFilters,
    
  } from "../controllers/product.controller";

import { isAuthenticated } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";


const router = Router();



/***************************************************
 * PRODUCT ROUTES
 ***************************************************/

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     description: Creates a new product for the authenticated seller.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *               - price
 *               - stock
 *               - status
 *               - images
 *             properties:
 *               title:
 *                 type: string
 *                 example: Nike Air Max
 *               description:
 *                 type: string
 *                 example: Premium running shoes with lightweight cushioning.
 *               category:
 *                 type: string
 *                 example: Shoes
 *               brand:
 *                 type: string
 *                 example: Nike
 *               price:
 *                 type: number
 *                 example: 199.99
 *               discountPrice:
 *                 type: number
 *                 example: 149.99
 *               stock:
 *                 type: integer
 *                 example: 25
 *               sku:
 *                 type: string
 *                 example: NK-001
 *               status:
 *                 type: string
 *                 enum:
 *                   - DRAFT
 *                   - PUBLISHED
 *                 example: DRAFT
 *               images:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - url
 *                     - publicId
 *                   properties:
 *                     url:
 *                       type: string
 *                       format: uri
 *                       example: https://example.com/image1.jpg
 *                     publicId:
 *                       type: string
 *                       example: nike-air-max-1
 *                 example:
 *                   - url: https://example.com/image1.jpg
 *                     publicId: nike-air-max-1
 *                   - url: https://example.com/image2.jpg
 *                     publicId: nike-air-max-2
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - running
 *                   - sports
 *           example:
 *             title: Nike Air Max
 *             description: Premium running shoes with lightweight cushioning.
 *             category: Shoes
 *             brand: Nike
 *             price: 199.99
 *             discountPrice: 149.99
 *             stock: 25
 *             sku: NK-001
 *             status: DRAFT
 *             images:
 *               - url: https://example.com/image1.jpg
 *                 publicId: nike-air-max-1
 *               - url: https://example.com/image2.jpg
 *                 publicId: nike-air-max-2
 *             tags:
 *               - running
 *               - sports
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Validation Error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */


router.post(
  "/",
  isAuthenticated,
  authorizeRoles("seller"),
  createProduct
);


/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products of the logged-in seller
 *     description: Returns a paginated list of products belonging to the authenticated seller. Supports search and filtering.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         description: Page number
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         description: Number of products per page
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: search
 *         required: false
 *         description: Search by product title or brand
 *         schema:
 *           type: string
 *           example: nike
 *       - in: query
 *         name: status
 *         required: false
 *         description: Filter by product status
 *         schema:
 *           type: string
 *           enum:
 *             - DRAFT
 *             - PUBLISHED
 *             - OUT_OF_STOCK
 *             - ARCHIVED
 *           example: DRAFT
 *       - in: query
 *         name: category
 *         required: false
 *         description: Filter by product category
 *         schema:
 *           type: string
 *           example: Shoes
 *     responses:
 *       200:
 *         description: Products fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                 total:
 *                   type: integer
 *                   example: 25
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 3
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.get(
  "/",
  isAuthenticated,
  authorizeRoles("seller"),
  getSellerProducts
);


/**
 * @swagger
 * /api/products/public:
 *   get:
 *     summary: Get public products
 *     description: >
 *       Returns published products for the customer storefront.
 *       Supports search, category, brand, price range, availability,
 *       sorting, and pagination.
 *     tags:
 *       - Public Products
 *
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 12
 *         description: Number of products per page
 *
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search products by title, description, brand, or category
 *
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter products by category
 *         example: Shoes
 *
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: Filter products by brand
 *         example: Nike
 *
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Minimum customer-facing product price
 *         example: 2000
 *
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Maximum customer-facing product price
 *         example: 10000
 *
 *       - in: query
 *         name: availability
 *         schema:
 *           type: string
 *           enum:
 *             - IN_STOCK
 *             - OUT_OF_STOCK
 *         description: Filter products by stock availability
 *
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum:
 *             - newest
 *             - price-low
 *             - price-high
 *           default: newest
 *         description: Sort published products
 *
 *     responses:
 *       200:
 *         description: Public products fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *
 *                       sellerId:
 *                         type: string
 *
 *                       title:
 *                         type: string
 *                         example: Nike Air Max 270
 *
 *                       slug:
 *                         type: string
 *                         example: demo-nike-air-max-270
 *
 *                       description:
 *                         type: string
 *
 *                       category:
 *                         type: string
 *                         example: Shoes
 *
 *                       brand:
 *                         type: string
 *                         nullable: true
 *                         example: Nike
 *
 *                       price:
 *                         type: number
 *                         example: 12999
 *
 *                       discountPrice:
 *                         type: number
 *                         nullable: true
 *                         example: 9999
 *
 *                       stock:
 *                         type: integer
 *                         example: 18
 *
 *                       images:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             url:
 *                               type: string
 *                             publicId:
 *                               type: string
 *
 *                       tags:
 *                         type: array
 *                         items:
 *                           type: string
 *
 *                       status:
 *                         type: string
 *                         example: PUBLISHED
 *
 *                       available:
 *                         type: boolean
 *                         example: true
 *
 *                       availability:
 *                         type: string
 *                         enum:
 *                           - IN_STOCK
 *                           - OUT_OF_STOCK
 *
 *                       hasDiscount:
 *                         type: boolean
 *                         example: true
 *
 *                       discountPercentage:
 *                         type: number
 *                         example: 23
 *
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 41
 *
 *                     page:
 *                       type: integer
 *                       example: 1
 *
 *                     limit:
 *                       type: integer
 *                       example: 12
 *
 *                     pages:
 *                       type: integer
 *                       example: 4
 *
 *       400:
 *         description: Invalid price range
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: minPrice cannot be greater than maxPrice
 *
 *       500:
 *         description: Internal server error
 */
router.get(
  "/public",
  getPublicProducts
);


/**
 * @swagger
 * /api/products/public/categories:
 *   get:
 *     summary: Get public product categories
 *     description: >
 *       Returns unique categories containing published products.
 *       Draft and archived products are not used.
 *     tags:
 *       - Public Products
 *     responses:
 *       200:
 *         description: Categories fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example:
 *                     - Electronics
 *                     - Fashion
 *                     - Shoes
 *       500:
 *         description: Internal Server Error
 */
router.get(
  "/public/categories",
  getPublicCategories
);



/**
 * @swagger
 * /api/products/public/filters:
 *   get:
 *     summary: Get public product filter metadata
 *     description: >
 *       Returns filter metadata for the customer product listing page.
 *       Only PUBLISHED products are considered when generating categories,
 *       brands, price range, and availability counts.
 *     tags:
 *       - Public Products
 *
 *     responses:
 *       200:
 *         description: Public product filters fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 filters:
 *                   type: object
 *                   properties:
 *
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example:
 *                         - Beauty
 *                         - Clothing
 *                         - Electronics
 *                         - Shoes
 *
 *                     brands:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example:
 *                         - Apple
 *                         - Nike
 *                         - Sony
 *                         - Samsung
 *
 *                     priceRange:
 *                       type: object
 *                       properties:
 *                         min:
 *                           type: number
 *                           example: 599
 *
 *                         max:
 *                           type: number
 *                           example: 67999
 *
 *                     availability:
 *                       type: object
 *                       properties:
 *                         inStock:
 *                           type: integer
 *                           example: 38
 *
 *                         outOfStock:
 *                           type: integer
 *                           example: 2
 *
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.get(
  "/public/filters",
  getPublicProductFilters
);


/**
 * @swagger
 * /api/products/public/{slug}:
 *   get:
 *     summary: Get a public product by slug
 *     description: >
 *       Returns a single published product for the customer storefront
 *       using the product slug.
 *       Only products with status PUBLISHED are accessible.
 *       Draft, archived, or otherwise unpublished products are not exposed.
 *     tags:
 *       - Public Products
 *
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         description: Unique product slug
 *         schema:
 *           type: string
 *         example: nike-air-max-1725012345678
 *
 *     responses:
 *       200:
 *         description: Public product fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 product:
 *                   type: object
 *                   properties:
 *
 *                     id:
 *                       type: string
 *                       example: 66d1a55c52c4b124fae12345
 *
 *                     sellerId:
 *                       type: string
 *                       example: 66d1a55c52c4b124fae98765
 *
 *                     title:
 *                       type: string
 *                       example: Nike Air Max 270
 *
 *                     slug:
 *                       type: string
 *                       example: nike-air-max-1725012345678
 *
 *                     description:
 *                       type: string
 *                       example: Premium running shoes with lightweight cushioning.
 *
 *                     category:
 *                       type: string
 *                       example: Shoes
 *
 *                     brand:
 *                       type: string
 *                       nullable: true
 *                       example: Nike
 *
 *                     price:
 *                       type: number
 *                       example: 12999
 *
 *                     discountPrice:
 *                       type: number
 *                       nullable: true
 *                       example: 9999
 *
 *                     stock:
 *                       type: integer
 *                       example: 18
 *
 *                     images:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           url:
 *                             type: string
 *                             format: uri
 *                             example: https://example.com/nike-air-max.jpg
 *
 *                           publicId:
 *                             type: string
 *                             example: products/nike-air-max
 *
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example:
 *                         - running
 *                         - sports
 *                         - shoes
 *
 *                     status:
 *                       type: string
 *                       enum:
 *                         - PUBLISHED
 *                       example: PUBLISHED
 *
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-08-31T10:30:00.000Z
 *
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-08-31T10:30:00.000Z
 *
 *                     available:
 *                       type: boolean
 *                       example: true
 *
 *                     availability:
 *                       type: string
 *                       enum:
 *                         - IN_STOCK
 *                         - OUT_OF_STOCK
 *                       example: IN_STOCK
 *
 *                     hasDiscount:
 *                       type: boolean
 *                       example: true
 *
 *                     discountPercentage:
 *                       type: integer
 *                       example: 23
 *
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *
 *                 message:
 *                   type: string
 *                   example: Product not found
 *
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.get(
  "/public/:slug",
  getPublicProductBySlug
);



/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a single product
 *     description: Get a product by ID for the authenticated seller.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Product ID
 *         schema:
 *           type: string
 *           example: 6a739819b2a5f14eaf2c32b9
 *     responses:
 *       200:
 *         description: Product found successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
router.get(
  "/:id",
  isAuthenticated,
  authorizeRoles("seller"),
  getProductById
);


/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product
 *     description: Updates an existing product belonging to the authenticated seller.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Product ID
 *         schema:
 *           type: string
 *         example: 6a739819b2a5f14eaf2c32b9
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Nike Air Max Updated
 *               description:
 *                 type: string
 *                 example: Updated premium running shoes.
 *               category:
 *                 type: string
 *                 example: Shoes
 *               brand:
 *                 type: string
 *                 example: Nike
 *               price:
 *                 type: number
 *                 example: 150.99
 *               discountPrice:
 *                 type: number
 *                 example: 129.99
 *               stock:
 *                 type: integer
 *                 example: 50
 *               sku:
 *                 type: string
 *                 example: NK-001
 *               status:
 *                 type: string
 *                 enum:
 *                   - DRAFT
 *                   - PUBLISHED
 *                 example: PUBLISHED
 *               images:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - url
 *                     - publicId
 *                   properties:
 *                     url:
 *                       type: string
 *                       format: uri
 *                       example: https://example.com/image1.jpg
 *                     publicId:
 *                       type: string
 *                       example: nike-air-max-1
 *                 example:
 *                   - url: https://example.com/image1.jpg
 *                     publicId: nike-air-max-1
 *                   - url: https://example.com/image2.jpg
 *                     publicId: nike-air-max-2
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - running
 *                   - sports
 *           example:
 *             title: Nike Air Max Updated
 *             description: Updated premium running shoes.
 *             category: Shoes
 *             brand: Nike
 *             price: 150.99
 *             discountPrice: 129.99
 *             stock: 50
 *             sku: NK-001
 *             status: PUBLISHED
 *             images:
 *               - url: https://example.com/image1.jpg
 *                 publicId: nike-air-max-1
 *               - url: https://example.com/image2.jpg
 *                 publicId: nike-air-max-2
 *             tags:
 *               - running
 *               - sports
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Product updated successfully
 *                 product:
 *                   type: object
 *       400:
 *         description: Validation Error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal Server Error
 */
router.put(
  "/:id",
  isAuthenticated,
  authorizeRoles("seller"),
  updateProduct
);


/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     description: Deletes a product belonging to the authenticated seller.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 6a6a142bf746f40815aba1fe
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Product deleted successfully
 *       404:
 *         description: Product not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.delete(
  "/:id",
  isAuthenticated,
  authorizeRoles("seller"),
  deleteProduct
);
export default router;