import { Router } from "express";
import { upload } from "../middleware/upload.middleware";
import { uploadImage } from "../controllers/upload.controller";
// import { isAuthenticated, isAuthenticated } from "../middleware/auth.middleware"; 
import { authorizeRoles } from "../middleware/role.middleware";
import { isAuthenticated } from "../middleware/auth.middleware";

const router = Router();



/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload product image
 *     description: Uploads a single product image to Cloudinary. Only authenticated sellers can upload images.
 *     tags:
 *       - Upload
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 url:
 *                   type: string
 *                   example: https://res.cloudinary.com/demo/image/upload/v123456789/product.jpg
 *                 publicId:
 *                   type: string
 *                   example: products/abc123xyz
 *       400:
 *         description: No image uploaded
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
// router.post(
//   "/",
//   isAuthenticated,
//   authorizeRoles("seller"),
//   upload.single("image"),
//   uploadImage
// );
router.post(
  "/",
  isAuthenticated,
  authorizeRoles("seller"),
  upload.single("image"),
  (req, res, next) => {
    console.log("========== UPLOAD DEBUG ==========");
    console.log("FILE:", req.file);
    console.log("BODY:", req.body);
    console.log("==================================");

    next();
  },
  uploadImage
);
export default router;