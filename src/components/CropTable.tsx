"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

export interface Crop {
  id: string;
  name: string;
  imageUrl: string;
}

export const CropTable: React.FC = () => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Editing state
  const [editingCropId, setEditingCropId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedImageUrl, setEditedImageUrl] = useState("");

  // Fetch crops
  const fetchCrops = async () => {
    try {
      const response = await fetch("/api/crops");
      if (!response.ok) {
        throw new Error("Failed to fetch crops");
      }
      const data: Crop[] = await response.json();
      setCrops(data);
    } catch (err: unknown) {
      setError(err as string);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, []);

  // Delete crop
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this crop?")) return;
    try {
      const response = await fetch(`/api/crops/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to delete crop");
      }
      setCrops((prev) => prev.filter((crop) => crop.id !== id));
    } catch (err: unknown) {
      setError(err as string);
    }
  };

  // Start editing
  const handleEdit = (crop: Crop) => {
    setEditingCropId(crop.id);
    setEditedName(crop.name);
    setEditedImageUrl(crop.imageUrl);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingCropId(null);
    setEditedName("");
    setEditedImageUrl("");
  };

  // Save editing
  const handleSaveEdit = async (id: string) => {
    try {
      const response = await fetch(`/api/crops/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editedName, imageUrl: editedImageUrl }),
      });
      if (!response.ok) {
        throw new Error("Failed to update crop");
      }
      setCrops((prevCrops) =>
        prevCrops.map((crop) =>
          crop.id === id
            ? { ...crop, name: editedName, imageUrl: editedImageUrl }
            : crop
        )
      );
      handleCancelEdit();
    } catch (err: unknown) {
      setError(err as string);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Crops</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-2 border-b font-medium text-left">ID</th>
            <th className="px-4 py-2 border-b font-medium text-left">Name</th>
            <th className="px-4 py-2 border-b font-medium text-left">Image</th>
            <th className="px-4 py-2 border-b font-medium text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {crops.map((crop) => (
            <tr key={crop.id}>
              <td className="px-4 py-2 border-b">{crop.id}</td>
              <td className="px-4 py-2 border-b">
                {editingCropId === crop.id ? (
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="border rounded px-2 py-1"
                  />
                ) : (
                  crop.name
                )}
              </td>
              <td className="px-4 py-2 border-b">
                {editingCropId === crop.id ? (
                  <input
                    type="text"
                    value={editedImageUrl}
                    onChange={(e) => setEditedImageUrl(e.target.value)}
                    className="border rounded px-2 py-1"
                  />
                ) : (
                  <Image
                    src={crop.imageUrl}
                    alt={crop.name}
                    width={64}
                    height={64}
                    className="h-16 w-auto object-cover"
                  />
                )}
              </td>
              <td className="px-4 py-2 border-b">
                {editingCropId === crop.id ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSaveEdit(crop.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(crop)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(crop.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
          {crops.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-2 text-center">
                No crops available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
