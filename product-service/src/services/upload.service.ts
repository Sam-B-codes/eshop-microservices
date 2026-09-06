import cloudinary from "../config/cloudinary";
import { UploadApiResponse } from "cloudinary";

class UploadService {
  async uploadImage(
    buffer: Buffer,
    folder: string
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              return reject(error);
            }

            resolve(result as UploadApiResponse);
          }
        )
        .end(buffer);
    });
  }
}

export default new UploadService();