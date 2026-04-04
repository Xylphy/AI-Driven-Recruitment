import { randomUUID } from "node:crypto";
import { createClientServer } from "./server";

type FileLocation = {
  bucket: string;
  path: string;
};

export async function uploadFile(
  file: File,
  prefix: string = "",
  bucket: string,
) {
  const supabase = await createClientServer(true);
  const fileName = `${randomUUID()}_${file.name
    .replace(/[^a-zA-Z0-9_.-]/g, "_")
    .toLowerCase()}`;

  const filePath = `${prefix}${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (error) {
    console.error("Supabase upload error full:", error);
    throw new Error(
      `Upload failed: ${error.message} | ${JSON.stringify(error)}`,
    );
  }
  return data.fullPath;
}

export async function deleteFile(fileLocation: FileLocation) {
  const supabase = await createClientServer(true); // service role needed
  const { error } = await supabase.storage
    .from(fileLocation.bucket)
    .remove([fileLocation.path]);

  return !error;
}

export async function getFileInfo(fileLocation: FileLocation) {
  const supabase = await createClientServer(true);
  const { data, error } = await supabase.storage
    .from(fileLocation.bucket)
    .info(fileLocation.path);

  if (error) throw new Error(`Fetch info failed: ${error.message}`);
  return data;
}

export async function moveFile(fileLocation: FileLocation, newBucket: string) {
  const supabase = await createClientServer(true); // service role

  // Download from source
  const { data, error: downloadError } = await supabase.storage
    .from(fileLocation.bucket)
    .download(fileLocation.path);

  if (downloadError)
    throw new Error(`Download failed: ${downloadError.message}`);

  // Upload to destination
  const { error: uploadError } = await supabase.storage
    .from(newBucket)
    .upload(fileLocation.path, data);

  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

  // Delete from source
  await supabase.storage.from(fileLocation.bucket).remove([fileLocation.path]);

  return `${newBucket}/${fileLocation.path}`;
}
