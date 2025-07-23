import { supabase } from "./supabase";

export async function uploadImage(file: File, folder = "") {
  const filePath = `${folder}/${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from("images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from("images")
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}