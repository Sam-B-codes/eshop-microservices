import { Request, Response, NextFunction } from "express";
import uploadService from "../services/upload.service";

export const uploadImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "Please select an image.",
      });
      return;
    }

    const result = await uploadService.uploadImage(
      req.file.buffer,
      "eshop/products"
    );

    res.status(200).json({
      success: true,
      image: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      },
    });
  } catch (error) {
    next(error);
  }
};