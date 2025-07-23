"use client";

import { useState } from "react";
import { uploadImage } from "@/lib/uploadImage";
import { supabase } from "@/lib/supabase";

const categories = [
  "Courses",
  "Tools",
  "UI kits & templates",
  "Fonts",
  "Icons",
  "Colors",
  "Illustrations",
  "Images",
  "Mockups",
  "Typography",
  "Inspirations",
  "Community & blogs",
  "Podcasts",
  "Job boards",
];

export default function UploadPage() {
  const [mode, setMode] = useState<"resource" | "inspiration">("resource");

  // Shared
  const [link, setLink] = useState("");
  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("");
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const publicUrl = await uploadImage(file);
      setImage(publicUrl);
    } catch (err) {
      console.error(err);
      setStatus("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const fetchMetadata = async () => {
    if (!link) {
      setStatus("Please enter a link to fetch metadata");
      return;
    }
    setStatus("Fetching metadata...");
    try {
      const res = await fetch(`/api/fetch-og?url=${encodeURIComponent(link)}`);
      if (!res.ok) throw new Error("Failed to fetch metadata");
      const data = await res.json();
      if (data.title) setTitle(data.title);
      if (data.image) setImage(data.image);
      setStatus("Metadata fetched successfully");
    } catch (err) {
      console.error(err);
      setStatus("Failed to fetch metadata");
    }
  };

  const handleSubmit = async () => {
    if (!title || !link) {
      setStatus("Link and title are required");
      return;
    }
    setUploading(true);
    try {
      const table = mode === "resource" ? "resources" : "inspirations";
      const payload =
        mode === "resource"
          ? { title, link, meta_image: image, category }
          : { title, link, image };

      const { error } = await supabase.from(table).insert(payload);
      if (error) throw error;
      setStatus("Uploaded successfully!");
      setLink(""); setTitle(""); setImage(""); setCategory("");
    } catch (err) {
      console.error(err);
      setStatus("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-semibold mb-6">Admin Upload</h1>

      {/* Mode Toggle */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setMode("resource")}
          className={`px-4 py-2 rounded ${
            mode === "resource" ? "bg-black text-white" : "bg-gray-100"
          }`}
        >
          Upload Resource
        </button>
        <button
          onClick={() => setMode("inspiration")}
          className={`px-4 py-2 rounded ${
            mode === "inspiration" ? "bg-black text-white" : "bg-gray-100"
          }`}
        >
          Upload Inspiration
        </button>
      </div>

      {/* Form */}
      <input
        type="text"
        placeholder="Link"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        className="w-full mb-2 border px-3 py-2 rounded"
      />
      <button
        onClick={fetchMetadata}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
        type="button"
      >
        Fetch Metadata
      </button>
      <input
        type="text"
        placeholder={mode === "resource" ? "Title" : "Website Name"}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full mb-2 border px-3 py-2 rounded"
      />

      {mode === "resource" && (
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full mb-4 border px-3 py-2 rounded"
        >
          <option value="">Select category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      )}

      <input type="file" onChange={handleFileUpload} className="mb-4" />

      {image && (
        <img
          src={image}
          alt="Preview"
          className="w-full max-h-64 object-cover rounded mb-4"
        />
      )}

      <button
        onClick={handleSubmit}
        disabled={uploading}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {status && <p className="mt-2 text-sm text-gray-600">{status}</p>}
    </div>
  );
}