"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";

interface CloudinaryCredentials {
  apiKey: string;
  timestamp: number;
  signature: string;
  cloudName: string;
}

const Dashboard = () => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [cloudinaryCredentials, setCloudinaryCredentials] = useState<CloudinaryCredentials | null>(null);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch Cloudinary credentials on mount
  useEffect(() => {
    const fetchCloudinaryCredentials = async () => {
      try {
        const response = await axios.get("/api/signature");
        setCloudinaryCredentials(response.data);
      } catch (err) {
        console.error("Failed to fetch Cloudinary credentials:", err);
        setError("Failed to initialize image upload service");
      }
    };

    fetchCloudinaryCredentials();
  }, []);

  // Handle file selection (multiple images allowed)
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedImages(Array.from(e.target.files));
    }
  };

  // Handle form submission to upload images
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!cloudinaryCredentials) {
      setError("Cloudinary credentials not loaded");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const uploadPromises = selectedImages.map(async (image) => {
        const formData = new FormData();
        formData.append("file", image);
        formData.append("api_key", cloudinaryCredentials.apiKey);
        formData.append("timestamp", cloudinaryCredentials.timestamp.toString());
        formData.append("signature", cloudinaryCredentials.signature);
        formData.append("folder", "products");

        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudinaryCredentials.cloudName}/image/upload`,
          formData
        );

        return response.data.secure_url;
      });

      // Wait for all uploads to complete
      const urls = await Promise.all(uploadPromises);
      setUploadedImageUrls(urls);
    } catch (err: any) {
      console.error("Error uploading images:", err);
      setError("Failed to upload images");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label htmlFor="images" className="block text-lg font-medium mb-2">
            Select Images:
          </label>
          <input
            type="file"
            id="images"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded cursor-pointer bg-gray-50"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload Images"}
        </button>
      </form>

      <div>
        <h2 className="text-xl font-semibold mb-4">Uploaded Images</h2>
        <div className="flex flex-wrap gap-4">
          {uploadedImageUrls.map((url, index) => (
            <div key={index} className="w-48">
              <img src={url} alt={`Uploaded ${index}`} className="w-full h-auto rounded shadow-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
