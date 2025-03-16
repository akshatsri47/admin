"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, Edit, Upload, X } from "lucide-react";
import Image from "next/image";

interface Slide {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  bgColor: string;
  buttonText: string;
}

export default function AdminSliders() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [formData, setFormData] = useState<Slide>({
    id: "",
    title: "",
    description: "",
    imageUrl: "",
    link: "",
    bgColor: "",
    buttonText: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const response = await axios.get("/api/sliders");
      setSlides(response.data);
    } catch (error) {
      console.error("Error fetching slides:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this slide?")) return;
    try {
      await axios.delete(`/api/sliders?id=${id}`);
      setSlides(slides.filter((slide) => slide.id !== id));
    } catch (error) {
      console.error("Error deleting slide:", error);
    }
  };

  
  const handleEdit = (slide: Slide) => {
    setEditingSlide(slide);
    setFormData(slide);
    setPreviewImage(slide.imageUrl);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    if (!formData.id) return;

    try {
      await axios.put("/api/sliders", formData);
      setSlides((prev) =>
        prev.map((slide) => (slide.id === formData.id ? formData : slide))
      );
      resetEditForm();
    } catch (error) {
      console.error("Error updating slide:", error);
    }
  };

  const resetEditForm = () => {
    setEditingSlide(null);
    setPreviewImage(null);
    setUploadProgress(0);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      setIsUploading(true);
      
      // Get signature from your API
      const signatureResponse = await axios.get("/api/signature");
      const { signature, timestamp, cloudName, apiKey } = signatureResponse.data;

      // Create form data for upload
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("signature", signature);
      uploadFormData.append("timestamp", timestamp.toString());
      uploadFormData.append("api_key", apiKey);
      uploadFormData.append("folder", "products");

      // Upload to Cloudinary with progress tracking
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        uploadFormData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      // Update form data with the Cloudinary URL
      setFormData(prevFormData => ({
        ...prevFormData,
        imageUrl: response.data.secure_url
      }));
      setIsUploading(false);
    } catch (error) {
      console.error("Error uploading image:", error);
      setIsUploading(false);
      alert("Failed to upload image. Please try again.");
    }
  };

  const removeImage = () => {
    setPreviewImage(null);
    setFormData(prevFormData => ({
      ...prevFormData,
      imageUrl: ""
    }));
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Manage Sliders</h2>

      <table className="w-full border-collapse border border-gray-300 shadow-lg rounded-md">
        <thead className="bg-gray-200">
          <tr>
            <th className="border border-gray-300 px-4 py-2">Image</th>
            <th className="border border-gray-300 px-4 py-2">Title</th>
            <th className="border border-gray-300 px-4 py-2">Description</th>
            <th className="border border-gray-300 px-4 py-2">Link</th>
            <th className="border border-gray-300 px-4 py-2">Button Text</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {slides.map((slide) => (
            <tr key={slide.id} className="hover:bg-gray-100">
              <td className="border border-gray-300 px-4 py-2">
                {slide.imageUrl && (
                  <Image 
                    src={slide.imageUrl} 
                    alt={slide.title} 
                    width={80} 
                    height={50} 
                    className="rounded" 
                  />
                )}
              </td>
              <td className="border border-gray-300 px-4 py-2">{slide.title}</td>
              <td className="border border-gray-300 px-4 py-2">{slide.description}</td>
              <td className="border border-gray-300 px-4 py-2">
                <a href={slide.link} className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">
                  {slide.link}
                </a>
              </td>
              <td className="border border-gray-300 px-4 py-2">{slide.buttonText}</td>
              <td className="border border-gray-300 px-4 py-2 flex gap-2">
                <button
                  onClick={() => handleEdit(slide)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  <Edit className="w-4 h-4 inline-block" />
                </button>
                <button
                  onClick={() => handleDelete(slide.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4 inline-block" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingSlide && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">Edit Slide</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
              <div className="flex items-center gap-2">
                {previewImage ? (
                  <div className="relative w-32 h-20 border rounded">
                    <Image
                      src={previewImage}
                      alt="Preview"
                      fill
                      className="object-cover rounded"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <label
                      htmlFor="imageUpload"
                      className="flex items-center gap-2 cursor-pointer bg-blue-50 border border-blue-300 text-blue-600 px-4 py-2 rounded hover:bg-blue-100"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Image</span>
                    </label>
                    <input
                      id="imageUpload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
              {isUploading && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Uploading: {uploadProgress}%
                  </p>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Title"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
              <input
                type="text"
                name="link"
                value={formData.link}
                onChange={handleChange}
                placeholder="Link"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
              <input
                type="text"
                name="buttonText"
                value={formData.buttonText || ""}
                onChange={handleChange}
                placeholder="Button Text"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
              <input
                type="text"
                name="bgColor"
                value={formData.bgColor}
                onChange={handleChange}
                placeholder="Background Color (e.g. #ff0000)"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={resetEditForm}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}