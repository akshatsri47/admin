"use client";

import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import axios, { AxiosError } from "axios";
import Link from "next/link";

interface ProductFormData {
  name: string;
  description: string;
  category: string;
  manufacturer: string;
  composition: string;
  commonlyUsedFor: string[];
  tags: string[];
  avoidForCrops: string[];
  benefits: string[];
  method: string;
  dosage: { dose: string; arce: string }[];
  pricing: { packageSize: string; price: number }[];
  images: File[];
  imageUrls: string[];
}

interface CloudinaryCredentials {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
}

export default function ProductForm() {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    category: "",
    manufacturer: "",
    composition: "",
    commonlyUsedFor: [],
    tags:[],
    avoidForCrops: [],
    benefits: [],
    method: "",
    dosage: [],
    pricing: [],
    images: [],
    imageUrls: [],
  });

  const [cloudinaryCredentials, setCloudinaryCredentials] = useState<CloudinaryCredentials | null>(null);
  const [uploadingImages, setUploadingImages] = useState<boolean>(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const [pricing, setPricing] = useState<{ packageSize: string; price: number }>(
    {
      packageSize: "",
      price: 0,
    }
  );

  const [dose, setDose] = useState<{ dose: string; arce: string }>({
    dose: "",
    arce: "",
  });

  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  // Fetch Cloudinary credentials on component mount
  useEffect(() => {
    const fetchCloudinaryCredentials = async () => {
      try {
        const response = await axios.get('/api/signature');
        setCloudinaryCredentials(response.data);
      } catch (error) {
        console.error("Failed to fetch Cloudinary credentials:", error);
        setError("Failed to initialize image upload service");
      }
    };

    fetchCloudinaryCredentials();
  }, []);

  // -------------------------
  // Handlers (unchanged)
  // -------------------------
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Updated image handler
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedImages(files);
      setFormData({ ...formData, images: files });
    }
  };

  // New function to upload images to Cloudinary
  const uploadImagesToCloudinary = async () => {
    if (!cloudinaryCredentials || selectedImages.length === 0) return [];

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      const uploadPromises = selectedImages.map(async (image) => {
        const formData = new FormData();
        formData.append('file', image);
        formData.append('api_key', cloudinaryCredentials.apiKey);
        formData.append('timestamp', cloudinaryCredentials.timestamp.toString());
        formData.append('signature', cloudinaryCredentials.signature);
        formData.append('folder', 'products');

        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudinaryCredentials.cloudName}/image/upload`,
          formData
        );

        return response.data.secure_url;
      });

      const results = await Promise.all(uploadPromises);
      uploadedUrls.push(...results);
    } catch (error) {
      console.error("Error uploading images to Cloudinary:", error);
      setError("Failed to upload images");
    } finally {
      setUploadingImages(false);
    }

    return uploadedUrls;
  };

  const handlePricingChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPricing({ ...pricing, [e.target.name]: e.target.value });
  };

  const handleDoseChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDose({ ...dose, [e.target.name]: e.target.value });
  };

  const addPricing = () => {
    setFormData({ ...formData, pricing: [...formData.pricing, pricing] });
    setPricing({ packageSize: "", price: 0 });
  };

  const addDose = () => {
    setFormData({ ...formData, dosage: [...formData.dosage, dose] });
    setDose({ dose: "", arce: "" });
  };

  // Updated submit handler to use Cloudinary
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // First upload images to Cloudinary
      const imageUrls = await uploadImagesToCloudinary();
      
      if (imageUrls.length === 0 && selectedImages.length > 0) {
        throw new Error("Failed to upload images");
      }

      const data = new FormData();
      
      // Add all the existing fields as before
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'images') {
          // Skip the original images array as we've uploaded to Cloudinary
          return;
        } else if (Array.isArray(value) || typeof value === "object") {
          data.append(key, JSON.stringify(value));
        } else {
          data.append(key, value as string);
        }
      });

      // Add the image URLs from Cloudinary
      imageUrls.forEach(url => {
        data.append("imageUrls[]", url);
      });

      await axios.post("/api/product", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess(true);
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        setError(error.response?.data?.message || "Failed to add product");
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };
  

  // -------------------------
  // Render
  // -------------------------
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#F8F9FA] min-h-screen w-full flex flex-col text-black"
    >
      {/* Header / Top Bar */}
      <header className="w-full flex items-center justify-between p-4 bg-white shadow-sm">
        <h1 className="text-xl font-semibold">Add New Product</h1>
        <div className="flex items-center gap-2">
          <Link 
            href="/product" 
            className="px-4 py-2 border border-gray-300 text-black rounded hover:bg-gray-100 inline-block text-center"
          >
            View Product
          </Link>

          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-black rounded hover:bg-green-600"
            disabled={loading || uploadingImages}
          >
            {loading ? "Adding..." : uploadingImages ? "Uploading Images..." : "Add Product"}
          </button>
        </div>
      </header>

      {/* Main Content: 2-column layout on large screens */}
      <main className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {/* LEFT COLUMN - unchanged */}
        <section className="bg-white rounded-md shadow p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-gray-700 mb-2">Product Info</h2>

          {/* Product info fields - unchanged */}
          {/* Name */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Product Name</label>
            <input
              name="name"
              type="text"
              placeholder="Product Name"
              className="border border-gray-300 rounded px-3 py-2 text-sm"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Description</label>
            <textarea
              name="description"
              placeholder="Description"
              className="border border-gray-300 rounded px-3 py-2 text-sm h-20 resize-none"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* Manufacturer */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Manufacturer</label>
            <input
              name="manufacturer"
              type="text"
              placeholder="Manufacturer"
              className="border border-gray-300 rounded px-3 py-2 text-sm"
              value={formData.manufacturer}
              onChange={handleChange}
            />
          </div>

          {/* Composition */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Composition</label>
            <input
              name="composition"
              type="text"
              placeholder="Composition"
              className="border border-gray-300 rounded px-3 py-2 text-sm"
              value={formData.composition}
              onChange={handleChange}
            />
          </div>

          {/* Commonly Used For */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">
              Commonly Used For
            </label>
            <input
              name="commonlyUsedFor"
              type="text"
              placeholder='E.g. ["Wheat","Corn"]'
              className="border border-gray-300 rounded px-3 py-2 text-sm"
              // We'll store a comma-separated string in state, then parse it on submit if needed
              value={(formData.commonlyUsedFor as unknown) as string}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">
              Tags
            </label>
            <input
              name="tags"
              type="text"
              placeholder='E.g. ["weed","insetcidicde"]'
              className="border border-gray-300 rounded px-3 py-2 text-sm"
              // We'll store a comma-separated string in state, then parse it on submit if needed
              value={(formData.tags as unknown) as string}
              onChange={handleChange}
            />
          </div>

          {/* Avoid For Crops */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">
              Avoid For Crops
            </label>
            <input
              name="avoidForCrops"
              type="text"
              placeholder='E.g. ["Tomato"]'
              className="border border-gray-300 rounded px-3 py-2 text-sm"
              value={(formData.avoidForCrops as unknown) as string}
              onChange={handleChange}
            />
          </div>

          {/* Benefits */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Benefits</label>
            <input
              name="benefits"
              type="text"
              placeholder='E.g. ["Fast Growth","High Yield"]'
              className="border border-gray-300 rounded px-3 py-2 text-sm"
              value={(formData.benefits as unknown) as string}
              onChange={handleChange}
            />
          </div>

          {/* Method */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Method</label>
            <input
              name="method"
              type="text"
              placeholder="Method"
              className="border border-gray-300 rounded px-3 py-2 text-sm"
              value={formData.method}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* RIGHT COLUMN: UPLOAD IMAGE - updated */}
        <section className="bg-white rounded-md shadow p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-gray-700 mb-2">Upload Image</h2>

          {/* Image Preview - updated to show selected images */}
          <div className="w-full h-48 border border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 mb-2 overflow-hidden">
            {selectedImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 p-2 w-full h-full">
                {selectedImages.map((image, index) => (
                  <div key={index} className="relative h-full">
                    <img 
                      src={URL.createObjectURL(image)} 
                      alt={`Preview ${index}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-sm">Image Preview</span>
            )}
          </div>

          {/* File input - unchanged */}
          <input
            type="file"
            multiple
            accept="image/*"
            className="border border-gray-300 rounded px-3 py-2 text-sm
                       file:mr-3 file:py-1 file:px-2 file:border file:border-gray-300
                       file:text-sm file:font-semibold file:bg-gray-50
                       hover:file:bg-gray-100"
            onChange={handleImageChange}
          />
          <p className="text-xs text-gray-500">
            Images will be uploaded directly to Cloudinary when you submit the form
          </p>
        </section>

        {/* BOTTOM LEFT: PRICING & STOCK (reusing your pricing + dose) - unchanged */}
        <section className="bg-white rounded-md shadow p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-gray-700 mb-2">Pricing And Stock</h2>

          {/* Pricing row */}
          <div className="flex flex-col md:flex-row gap-2">
            <input
              name="packageSize"
              type="text"
              placeholder="Package Size"
              className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
              onChange={handlePricingChange}
              value={pricing.packageSize}
            />
            <input
              name="price"
              type="number"
              placeholder="Price"
              className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
              onChange={handlePricingChange}
              value={pricing.price}
            />
            <button
              type="button"
              onClick={addPricing}
              className="bg-gray-100 border border-gray-300 rounded px-3 py-2 text-sm
                         hover:bg-gray-200"
            >
              Add Pricing
            </button>
          </div>
          {formData.pricing.length > 0 && (
            <ul className="mt-3 list-disc pl-5 text-sm text-gray-700">
              {formData.pricing.map((p, index) => (
                <li key={index} className="flex justify-between">
                  {`${p.packageSize} - ₹${p.price}`}
                </li>
              ))}
            </ul>
          )}

          {/* Dose row */}
          <div className="flex flex-col md:flex-row gap-2">
            <input
              name="dose"
              type="text"
              placeholder="Dose"
              className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
              onChange={handleDoseChange}
              value={dose.dose}
            />
            <input
              name="arce"
              type="text"
              placeholder="Arce"
              className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
              onChange={handleDoseChange}
              value={dose.arce}
            />
            <button
              type="button"
              onClick={addDose}
              className="bg-gray-100 border border-gray-300 rounded px-3 py-2 text-sm
                         hover:bg-gray-200"
            >
              Add Dose
            </button>
          </div>
          {formData.dosage.length > 0 && (
            <ul className="mt-3 list-disc pl-5 text-sm text-gray-700">
              {formData.dosage.map((d, index) => (
                <li key={index} className="flex justify-between">
                  {`${d.dose} - ${d.arce}`}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* BOTTOM RIGHT: CATEGORY - unchanged */}
        <section className="bg-white rounded-md shadow p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-gray-700 mb-2">Category</h2>

          {/* Category Input */}
          <input
            name="category"
            type="text"
            placeholder="Product Category"
            className="border border-gray-300 rounded px-3 py-2 text-sm"
            value={formData.category}
            onChange={handleChange}
          />

          {/* Example 'Add Category' button to mimic the design */}
          <button
            type="button"
            className="bg-gray-100 border border-gray-300 rounded px-3 py-2 text-sm
                       hover:bg-gray-200 w-full sm:w-auto"
          >
            Add Category
          </button>
        </section>
      </main>

      {/* Error / Success messages at the bottom */}
      <div className="px-6 pb-6">
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        {success && (
          <p className="text-green-600 text-sm mt-2">Product added successfully!</p>
        )}
      </div>
    </form>
  );
}