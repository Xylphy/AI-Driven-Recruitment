import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadFile(file: File, folder: string) {
  const uploadOptions = {
    unique_filename: true,
    overwrite: true,
    folder: folder,
  };

  const result = await cloudinary.uploader.upload(
    // URI
    `data:${file.type};base64,${Buffer.from(await file.arrayBuffer()).toString(
      "base64"
    )}`,
    uploadOptions
  );
  return result.public_id;
}

export async function deleteFile(publicId: string) {
  await cloudinary.uploader.destroy(publicId);
}

// /**
//  * @deprecated
//  */
// export async function getFileUrl(publicId: string) {
//   // const result = await cloudinary.api.resource(publicId);
//   // Implement more here
// }