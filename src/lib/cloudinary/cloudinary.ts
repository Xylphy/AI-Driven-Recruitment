import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadFile(file: File, folder: string) {
  let resourceType: "auto" | "image" | "video" | "raw" = "raw";
  let specificOptions: Record<string, string> = {};

  if (file.type.startsWith("image/")) {
    resourceType = "image";
  } else if (file.type.startsWith("video/")) {
    resourceType = "video";
  } else if (
    file.type.startsWith("application/pdf") ||
    file.type.startsWith("application/")
  ) {
    resourceType = "raw";
    specificOptions = {
      format: file.name.split(".").pop() || "pdf",
    };
  } else if (file.type.startsWith("audio/")) {
    resourceType = "video";
  }

  const result = await cloudinary.uploader.upload(
    `data:${file.type};base64,${Buffer.from(await file.arrayBuffer()).toString(
      "base64",
    )}`,
    {
      unique_filename: true,
      folder: folder,
      public_id: `${Date.now()}_${file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .toLowerCase()}`,
      resource_type: resourceType,
      ...specificOptions,
    },
  );
  return result.public_id;
}

export async function deleteFile(publicId: string) {
  await cloudinary.uploader.destroy(publicId);
}

export async function getFileInfo(publicId: string) {
  const resourceTypes = ["raw", "image", "video"] as const;

  for (const resourceType of resourceTypes) {
    try {
      const result = await cloudinary.api.resource(publicId, {
        resource_type: resourceType,
      });
      return {
        publicId: result.public_id,
        url: result.secure_url,
        format: result.format,
        bytes: result.bytes,
        createdAt: result.created_at,
        resourceType: result.resource_type,
        width: result.width,
        height: result.height,
      };
    } catch {}
  }

  throw new Error(`Resource not found: ${publicId}`);
}
