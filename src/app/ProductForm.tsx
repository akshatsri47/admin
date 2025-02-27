"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";

interface ProductFormData {
  name: string;
  description: string;
  category: string;
  manufacturer: string;
  composition: string;
  commonlyUsedFor: string[];
  avoidForCrops: string[];
  benefits: string[];
  method: string;
  dosage: { dose: string; arce: string }[];
  pricing: { packageSize: string; price: number }[];
  images: File[];
}

export default function ProductForm() {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    category: "",
    manufacturer: "",
    composition: "",
    commonlyUsedFor: [],
    avoidForCrops: [],
    benefits: [],
    method: "",
    dosage: [],
    pricing: [],
    images: []
  });

  const [pricing, setPricing] = useState<{ packageSize: string; price: number }>({
    packageSize: "",
    price: 0,
  });

  const [dose, setDose] = useState<{ dose: string; arce: string }>({
    dose: "",
    arce: "",
  });

  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value.split(",").map((item) => item.trim()),
    });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, images: Array.from(e.target.files) });
    }
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "images" && Array.isArray(value)) {
          value.forEach((image: File) => data.append("images", image));
        } else if (Array.isArray(value) || typeof value === 'object') {
          data.append(key, JSON.stringify(value));
        } else {
          data.append(key, value as string);
        }
      });

      await axios.post("/api/product", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      router.push("/product");
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        setError(error.response?.data?.message || "Failed to add product");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {Object.keys(formData).map((field) =>
        field !== "images" && field !== "pricing" && field !== "dosage" ? (
          <input
            key={field}
            name={field}
            type="text"
            placeholder={field}
            className="border p-2"
            onChange={handleChange}
          />
        ) : null
      )}

      <input
        type="file"
        multiple
        accept="image/*"
        className="border p-2"
        onChange={handleImageChange}
      />

      <div className="flex gap-2">
        <input
          name="packageSize"
          type="text"
          placeholder="Package Size"
          className="border p-2"
          onChange={handlePricingChange}
          value={pricing.packageSize}
        />
        <input
          name="price"
          type="number"
          placeholder="Price"
          className="border p-2"
          onChange={handlePricingChange}
          value={pricing.price}
        />
        <button
          type="button"
          className="btn bg-blue-500 text-white p-2 rounded"
          onClick={addPricing}
        >
          Add Pricing
        </button>
      </div>

      <div className="flex gap-2">
        <input
          name="dose"
          type="text"
          placeholder="Dose"
          className="border p-2"
          onChange={handleDoseChange}
          value={dose.dose}
        />
        <input
          name="arce"
          type="text"
          placeholder="Arce"
          className="border p-2"
          onChange={handleDoseChange}
          value={dose.arce}
        />
        <button
          type="button"
          className="btn bg-blue-500 text-white p-2 rounded"
          onClick={addDose}
        >
          Add Dose
        </button>
      </div>

      <button
        type="submit"
        className="btn bg-green-500 text-white p-2 rounded"
        disabled={loading}
      >
        {loading ? "Adding..." : "Add Product"}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
}
