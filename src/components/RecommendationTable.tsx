"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";

// Interfaces
export interface Recommendation {
  id: string;
  cropId: string;
  diseaseId: string;
  productIds: string[];
}

export interface Crop {
  id: string;
  name: string;
  imageUrl: string;
}

export interface Disease {
  id: string;
  name: string;
  imageUrl: string;
  cropId: string;
}

export interface Product {
  id: string;
  name: string;
  images?: string[];
}

interface EditRecommendationProps {
  initialRecommendation?: Recommendation;
}

export const RecommendationTable: React.FC<EditRecommendationProps> = ({
  initialRecommendation,
}) => {
  // Default values if no initial recommendation is passed.
  const initialRec = initialRecommendation || { id: "", cropId: "", diseaseId: "", productIds: [] };

  // Prepopulate state from the initial recommendation.
  const [recCropId, setRecCropId] = useState(initialRec.cropId);
  const [recDiseaseId, setRecDiseaseId] = useState(initialRec.diseaseId);
  const [selectedProducts, setSelectedProducts] = useState<string[]>(initialRec.productIds);
  const [recMessage, setRecMessage] = useState("");

  // Data for selection
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState<boolean>(true);
  const [productsError, setProductsError] = useState<string>("");

  const [recCrops, setRecCrops] = useState<Crop[]>([]);
  const [recCropsLoading, setRecCropsLoading] = useState<boolean>(true);
  const [recCropsError, setRecCropsError] = useState<string>("");

  const [recDiseases, setRecDiseases] = useState<Disease[]>([]);
  const [recDiseasesLoading, setRecDiseasesLoading] = useState<boolean>(false);
  const [recDiseasesError, setRecDiseasesError] = useState<string>("");

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get<{ data: Product[] }>("/api/product");
        setProducts(res.data.data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setProductsError("Error fetching products");
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Fetch crops
  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const res = await axios.get<Crop[]>("/api/crops");
        setRecCrops(res.data);
      } catch (err) {
        console.error("Error fetching crops:", err);
        setRecCropsError("Error fetching crops");
      } finally {
        setRecCropsLoading(false);
      }
    };
    fetchCrops();
  }, []);

  // Fetch diseases for selected crop
  useEffect(() => {
    if (!recCropId) {
      setRecDiseases([]);
      return;
    }
    setRecDiseasesLoading(true);
    const fetchDiseases = async () => {
      try {
        const res = await axios.get<Disease[]>(`/api/diseases?cropId=${recCropId}`);
        setRecDiseases(res.data);
      } catch (err) {
        console.error("Error fetching diseases:", err);
        setRecDiseasesError("Error fetching diseases");
      } finally {
        setRecDiseasesLoading(false);
      }
    };
    fetchDiseases();
  }, [recCropId]);

  // Handler to toggle product selection
  const handleProductToggle = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  // Handler for crop selection: if a new crop is selected, clear disease selection.
  const handleRecCropSelect = (id: string) => {
    setRecCropId((prev) => (prev === id ? "" : id));
    if (recCropId !== id) {
      setRecDiseaseId("");
    }
  };

  // Handler for disease selection
  const handleRecDiseaseSelect = (id: string) => {
    setRecDiseaseId((prev) => (prev === id ? "" : id));
  };

  // Submit updated recommendation via PUT.
  const handleRecSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/recommendations/${initialRec.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cropId: recCropId,
          diseaseId: recDiseaseId,
          productIds: selectedProducts,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        // Update the state based on the API response.
        setRecMessage(`Recommendation updated successfully, id: ${data.id}`);
        // If the API returns updated productIds, use them; otherwise, keep the current selection.
        setRecCropId(data.cropId || recCropId);
        setRecDiseaseId(data.diseaseId || recDiseaseId);
        setSelectedProducts(data.productIds || selectedProducts);
      } else {
        setRecMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      setRecMessage("An unexpected error occurred.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Edit Recommendation</h2>
      <form onSubmit={handleRecSubmit} className="space-y-4">
        {/* Crop Selection */}
        <div>
          <label className="block text-gray-700 mb-2">Select Crop:</label>
          {recCropsLoading ? (
            <p>Loading crops...</p>
          ) : recCropsError ? (
            <p className="text-red-600">{recCropsError}</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {recCrops.map((crop) => (
                <label
                  key={crop.id}
                  className={`relative border rounded p-2 flex flex-col items-center cursor-pointer hover:shadow-lg transition ${
                    recCropId === crop.id ? "border-indigo-600" : "border-gray-300"
                  }`}
                  onClick={() => handleRecCropSelect(crop.id)}
                >
                  <input
                    type="checkbox"
                    checked={recCropId === crop.id}
                    onChange={() => handleRecCropSelect(crop.id)}
                    className="absolute top-2 right-2"
                  />
                  {crop.imageUrl ? (
                    <Image
                      src={crop.imageUrl}
                      alt={crop.name}
                      width={80}
                      height={80}
                      className="object-cover rounded"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                      No Image
                    </div>
                  )}
                  <p className="mt-2 text-sm font-medium text-gray-800 text-center">
                    {crop.name}
                  </p>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Disease Selection */}
        <div>
          <label className="block text-gray-700 mb-2">Select Disease:</label>
          {!recCropId ? (
            <p className="text-gray-500">Please select a crop first.</p>
          ) : recDiseasesLoading ? (
            <p>Loading diseases...</p>
          ) : recDiseasesError ? (
            <p className="text-red-600">{recDiseasesError}</p>
          ) : recDiseases.length === 0 ? (
            <p className="text-gray-500">No diseases available for this crop.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {recDiseases.map((disease) => (
                <label
                  key={disease.id}
                  className={`relative border rounded p-2 flex flex-col items-center cursor-pointer hover:shadow-lg transition ${
                    recDiseaseId === disease.id ? "border-indigo-600" : "border-gray-300"
                  }`}
                  onClick={() => handleRecDiseaseSelect(disease.id)}
                >
                  <input
                    type="checkbox"
                    checked={recDiseaseId === disease.id}
                    onChange={() => handleRecDiseaseSelect(disease.id)}
                    className="absolute top-2 right-2"
                  />
                  {disease.imageUrl ? (
                    <Image
                      src={disease.imageUrl}
                      alt={disease.name}
                      width={80}
                      height={80}
                      className="object-cover rounded"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                      No Image
                    </div>
                  )}
                  <p className="mt-2 text-sm font-medium text-gray-800 text-center">
                    {disease.name}
                  </p>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Product Selection */}
        <div>
          <label className="block text-gray-700 mb-2">Select Products:</label>
          {productsLoading ? (
            <p>Loading products...</p>
          ) : productsError ? (
            <p className="text-red-600">{productsError}</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {products.map((product) => (
                <label
                  key={product.id}
                  className="relative border rounded p-2 flex flex-col items-center cursor-pointer hover:shadow-lg transition"
                >
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => handleProductToggle(product.id)}
                    className="absolute top-2 right-2"
                  />
                  {product.images && product.images.length > 0 ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      width={80}
                      height={80}
                      className="object-cover rounded"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                      No Image
                    </div>
                  )}
                  <p className="mt-2 text-sm font-medium text-gray-800 text-center">
                    {product.name}
                  </p>
                </label>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
        >
          Update Recommendation
        </button>
      </form>
      {recMessage && (
        <p className="mt-4 text-center text-sm text-green-600">{recMessage}</p>
      )}
    </div>
  );
};
