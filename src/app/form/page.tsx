"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";

type Product = {
  id: string;
  name: string;
  images?: string[];
  lowercategory?: string;
};

type Crop = {
  id: string;
  name: string;
  imageUrl: string;
};

type Disease = {
  id: string;
  name: string;
  imageUrl: string;
  cropId: string;
};

const AddPage = () => {
  // Tab state: "crop", "disease", "recommendation"
  const [activeTab, setActiveTab] = useState<"crop" | "disease" | "recommendation">("crop");

  // Crop Form States
  const [cropName, setCropName] = useState("");
  const [cropImageUrl, setCropImageUrl] = useState("");
  const [cropMessage, setCropMessage] = useState("");

  // Disease Form States
  const [diseaseName, setDiseaseName] = useState("");
  const [diseaseImageUrl, setDiseaseImageUrl] = useState("");
  const [diseaseCropId, setDiseaseCropId] = useState("");
  const [diseaseMessage, setDiseaseMessage] = useState("");

  // Recommendation Form States
  const [recCropId, setRecCropId] = useState("");
  const [recDiseaseId, setRecDiseaseId] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [recMessage, setRecMessage] = useState("");

  // States for Product fetching/selection
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState<boolean>(true);
  const [productsError, setProductsError] = useState<string>("");

  // States for Crop selection (used in Disease & Recommendation forms)
  const [recCrops, setRecCrops] = useState<Crop[]>([]);
  const [recCropsLoading, setRecCropsLoading] = useState<boolean>(true);
  const [recCropsError, setRecCropsError] = useState<string>("");

  // States for Disease selection in Recommendation Form
  const [recDiseases, setRecDiseases] = useState<Disease[]>([]);
  const [recDiseasesLoading, setRecDiseasesLoading] = useState<boolean>(false);
  const [recDiseasesError, setRecDiseasesError] = useState<string>("");

  // Fetch Products
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

  // Fetch Crops (used in Disease & Recommendation forms)
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

  // Fetch Diseases for selected crop in Recommendation Form
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

  // Handlers for form submissions
  const handleCropSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/crops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: cropName, imageUrl: cropImageUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        setCropMessage(`Crop added successfully, id: ${data.id}`);
        setCropName("");
        setCropImageUrl("");
        // Optionally, refetch crops to update selection grids
      } else {
        setCropMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setCropMessage("An unexpected error occurred.");
    }
  };

  const handleDiseaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/diseases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: diseaseName,
          imageUrl: diseaseImageUrl,
          cropId: diseaseCropId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setDiseaseMessage(`Disease added successfully, id: ${data.id}`);
        setDiseaseName("");
        setDiseaseImageUrl("");
        setDiseaseCropId("");
      } else {
        setDiseaseMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setDiseaseMessage("An unexpected error occurred.");
    }
  };

  const handleRecSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cropId: recCropId,
          diseaseId: recDiseaseId,
          productIds: selectedProducts,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setRecMessage(`Recommendation added successfully, id: ${data.id}`);
        setRecCropId("");
        setRecDiseaseId("");
        setSelectedProducts([]);
      } else {
        setRecMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setRecMessage("An unexpected error occurred.");
    }
  };

  // Toggle selection for products (multiple selection allowed)
  const handleProductToggle = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  // For Recommendation Form: handle crop selection (only one allowed)
  const handleRecCropSelect = (id: string) => {
    setRecCropId((prev) => (prev === id ? "" : id));
    if (recCropId !== id) {
      setRecDiseaseId("");
    }
  };

  // For Recommendation Form: handle disease selection (only one allowed)
  const handleRecDiseaseSelect = (id: string) => {
    setRecDiseaseId((prev) => (prev === id ? "" : id));
  };

  // For Disease Form: handle crop selection (only one allowed)
  const handleDiseaseCropSelect = (id: string) => {
    setDiseaseCropId((prev) => (prev === id ? "" : id));
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-10">
          Add Crop, Disease, and Recommendation
        </h1>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8 border-b">
          <button
            onClick={() => setActiveTab("crop")}
            className={`mx-2 px-4 py-2 border-b-2 focus:outline-none ${
              activeTab === "crop"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-indigo-600"
            }`}
          >
            Crop
          </button>
          <button
            onClick={() => setActiveTab("disease")}
            className={`mx-2 px-4 py-2 border-b-2 focus:outline-none ${
              activeTab === "disease"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-indigo-600"
            }`}
          >
            Disease
          </button>
          <button
            onClick={() => setActiveTab("recommendation")}
            className={`mx-2 px-4 py-2 border-b-2 focus:outline-none ${
              activeTab === "recommendation"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-indigo-600"
            }`}
          >
            Recommendation
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === "crop" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Add Crop</h2>
            <form onSubmit={handleCropSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700">Name:</label>
                <input
                  type="text"
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Image URL:</label>
                <input
                  type="text"
                  value={cropImageUrl}
                  onChange={(e) => setCropImageUrl(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
              >
                Add Crop
              </button>
            </form>
            {cropMessage && (
              <p className="mt-4 text-center text-sm text-green-600">
                {cropMessage}
              </p>
            )}
          </div>
        )}

        {activeTab === "disease" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Add Disease</h2>
            <form onSubmit={handleDiseaseSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700">Name:</label>
                <input
                  type="text"
                  value={diseaseName}
                  onChange={(e) => setDiseaseName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Image URL:</label>
                <input
                  type="text"
                  value={diseaseImageUrl}
                  onChange={(e) => setDiseaseImageUrl(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              {/* Replace Crop ID input with Crop selection grid */}
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
                          diseaseCropId === crop.id ? "border-indigo-600" : "border-gray-300"
                        }`}
                        onClick={() => handleDiseaseCropSelect(crop.id)}
                      >
                        <input
                          type="checkbox"
                          checked={diseaseCropId === crop.id}
                          onChange={() => handleDiseaseCropSelect(crop.id)}
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
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
              >
                Add Disease
              </button>
            </form>
            {diseaseMessage && (
              <p className="mt-4 text-center text-sm text-green-600">
                {diseaseMessage}
              </p>
            )}
          </div>
        )}

        {activeTab === "recommendation" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Add Recommendation</h2>
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
                Add Recommendation
              </button>
            </form>
            {recMessage && (
              <p className="mt-4 text-center text-sm text-green-600">
                {recMessage}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddPage;
