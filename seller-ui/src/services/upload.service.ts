import api from "@/services/api";

export interface UploadedImage {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

interface UploadResponse {
  success: boolean;
  image: UploadedImage;
}

export const uploadImage = async (
  file: File
): Promise<UploadedImage> => {
  const formData = new FormData();

  formData.append("image", file);

  try {
    const response = await api.post<UploadResponse>(
      "/upload",
      formData
    );

    console.log("UPLOAD RESPONSE:", response.data);

    return response.data.image;
  } catch (error: any) {
    console.error(
      "UPLOAD ERROR:",
      error.response?.data || error.message
    );

    throw error;
  }
};