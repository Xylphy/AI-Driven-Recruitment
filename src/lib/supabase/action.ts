import { randomUUID } from "node:crypto";
import { createClientServer } from "./supabase";

type FileLocation = {
  bucket: string;
  path: string;
};

export async function uploadFile(file: File, folder: string) {
  const supabase = await createClientServer();
  const fileName = `${randomUUID()}_${file.name
    .replace(/[^a-zA-Z0-9_.-]/g, "_")
    .toLowerCase()}`;

  const filePath = `${folder}/${fileName}`;

  const { data, error } = await supabase.storage
    .from("applications")
    .upload(filePath, file);

  if (error) throw new Error(`Upload failed: ${error.message}`);
  return data.fullPath;
}

export async function deleteFile(fileLocation: FileLocation) {
  const supabase = await createClientServer(true); // service role needed
  const { error } = await supabase.storage
    .from(fileLocation.bucket)
    .remove([fileLocation.path]);

  if (error) throw new Error(`Delete failed: ${error.message}`);
}

export async function getFileInfo(fileLocation: FileLocation) {
  const supabase = await createClientServer();
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
