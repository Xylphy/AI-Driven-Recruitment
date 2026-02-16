import { randomUUID } from "node:crypto";
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
      public_id: `${randomUUID()}_${file.name
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

function normalizeToPublicId(value: string) {
  const trimmed = value.trim();

  // If already a public_id, return as-is
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return trimmed.replace(/^\/+|\/+$/g, "");
  }

  // If URL, extract segment after /upload/(v123/)...
  const url = new URL(trimmed);
  const parts = url.pathname.split("/").filter(Boolean);
  const uploadIdx = parts.indexOf("upload");

  if (uploadIdx < 0) return trimmed.replace(/^\/+|\/+$/g, "");

  const afterUpload = parts.slice(uploadIdx + 1);
  if (/^v\d+$/.test(afterUpload[0] ?? "")) afterUpload.shift();

  return decodeURIComponent(afterUpload.join("/")).replace(/^\/+|\/+$/g, "");
}

export async function getFileInfo(publicIdOrUrl: string) {
  const resourceTypes = ["raw", "image", "video"] as const;
  const normalized = normalizeToPublicId(publicIdOrUrl);
  const withoutExt = normalized.replace(/\.[^/.]+$/, "");
  const candidates = Array.from(new Set([normalized, withoutExt]));

  for (const candidate of candidates) {
    for (const resourceType of resourceTypes) {
      try {
        const result = await cloudinary.api.resource(candidate, {
          resource_type: resourceType,
          type: "upload",
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
      } catch {
        // try next candidate/resource type
      }
    }
  }

  throw new Error(`Resource not found: ${publicIdOrUrl}`);
}

export async function moveFile(publicIdOrUrl: string) {
  const fileInfo = await getFileInfo(publicIdOrUrl);
  const newFolder =
    fileInfo.resourceType === "video" ? "transcripts" : "resumes";

  const fileName = fileInfo.publicId.split("/").pop();
  const newPublicId = `${newFolder}/${fileName}`;

  const result = await cloudinary.uploader.rename(
    fileInfo.publicId,
    newPublicId,
    {
      resource_type: fileInfo.resourceType,
      type: "upload",
      overwrite: false,
      invalidate: true,
    },
  );

  await cloudinary.uploader.explicit(result.public_id, {
    resource_type: fileInfo.resourceType,
    type: "upload",
    asset_folder: newFolder,
  });

  return result.public_id;
}
