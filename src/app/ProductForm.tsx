"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import axios, { AxiosError } from "axios";

interface ProductFormData {
  name: string;
  price: string;
  description: string;
  category: string;
  stock: string;
  images: File[];
}

export default function ProductForm() {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    price: "",
    description: "",
    category: "",
    stock: "",
    images: [],
  });

  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<string>(""); // ✅ Success message state

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, images: Array.from(e.target.files) });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(""); // Reset success message on new submission

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("price", formData.price);
      data.append("description", formData.description);
      data.append("category", formData.category);
      data.append("stock", formData.stock);
      formData.images.forEach((image) => data.append("images", image));

      await axios.post("/api/product", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Product added successfully! 🎉"); // ✅ Set success message
      setFormData({
        name: "",
        price: "",
        description: "",
        category: "",
        stock: "",
        images: [],
      }); // ✅ Clear the form after submission
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error("Axios Error:", error.response?.data || error.message);
        setError(error.response?.data?.message || "Failed to add product");
      } else {
        console.error("Unknown Error:", error);
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        name="name"
        type="text"
        placeholder="Product Name"
        className="border p-2"
        value={formData.name}
        onChange={handleChange}
      />
      <input
        name="price"
        type="number"
        placeholder="Price"
        className="border p-2"
        value={formData.price}
        onChange={handleChange}
      />
      <input
        name="category"
        type="text"
        placeholder="Category"
        className="border p-2"
        value={formData.category}
        onChange={handleChange}
      />
      <input
        name="stock"
        type="number"
        placeholder="Stock"
        className="border p-2"
        value={formData.stock}
        onChange={handleChange}
      />
      <textarea
        name="description"
        placeholder="Description"
        className="border p-2"
        value={formData.description}
        onChange={handleChange}
      />
      <input
        type="file"
        multiple
        accept="image/*"
        className="border p-2"
        onChange={handleImageChange}
      />
      <button
        type="submit"
        className="btn bg-green-500 text-white p-2 rounded"
        disabled={loading}
      >
        {loading ? "Adding..." : "Add Product"}
      </button>

      {success && <p className="text-green-500">{success}</p>} {/* ✅ Success message */}
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
}
