"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

export interface Disease {
  id: string;
  name: string;
  imageUrl: string;
  cropId: string;
}

export const DiseaseTable: React.FC = () => {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Editing state
  const [editingDiseaseId, setEditingDiseaseId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedImageUrl, setEditedImageUrl] = useState("");
  const [editedCropId, setEditedCropId] = useState("");

  // Fetch diseases
  const fetchDiseases = async () => {
    try {
      const response = await fetch("/api/diseases");
      if (!response.ok) {
        throw new Error("Failed to fetch diseases");
      }
      const data: Disease[] = await response.json();
      setDiseases(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  useEffect(() => {
    fetchDiseases();
  }, []);

  // Delete disease
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this disease?")) return;
    try {
      const response = await fetch(`/api/diseases/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to delete disease");
      }
      setDiseases((prev) => prev.filter((d) => d.id !== id));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  // Start editing
  const handleEdit = (disease: Disease) => {
    setEditingDiseaseId(disease.id);
    setEditedName(disease.name);
    setEditedImageUrl(disease.imageUrl);
    setEditedCropId(disease.cropId);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingDiseaseId(null);
    setEditedName("");
    setEditedImageUrl("");
    setEditedCropId("");
  };

  // Save editing
  const handleSaveEdit = async (id: string) => {
    try {
      const response = await fetch(`/api/diseases/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editedName,
          imageUrl: editedImageUrl,
          cropId: editedCropId,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update disease");
      }
      setDiseases((prev) =>
        prev.map((d) =>
          d.id === id
            ? { ...d, name: editedName, imageUrl: editedImageUrl, cropId: editedCropId }
            : d
        )
      );
      handleCancelEdit();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Diseases</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-2 border-b font-medium text-left">ID</th>
            <th className="px-4 py-2 border-b font-medium text-left">Name</th>
            <th className="px-4 py-2 border-b font-medium text-left">Image</th>
            <th className="px-4 py-2 border-b font-medium text-left">Crop ID</th>
            <th className="px-4 py-2 border-b font-medium text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {diseases.map((disease) => (
            <tr key={disease.id}>
              <td className="px-4 py-2 border-b">{disease.id}</td>
              <td className="px-4 py-2 border-b">
                {editingDiseaseId === disease.id ? (
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="border rounded px-2 py-1"
                  />
                ) : (
                  disease.name
                )}
              </td>
              <td className="px-4 py-2 border-b">
                {editingDiseaseId === disease.id ? (
                  <input
                    type="text"
                    value={editedImageUrl}
                    onChange={(e) => setEditedImageUrl(e.target.value)}
                    className="border rounded px-2 py-1"
                  />
                ) : (
                  <Image
                    src={disease.imageUrl}
                    alt={disease.name}
                    width={64}
                    height={64}
                    className="object-cover rounded"
                  />
                )}
              </td>
              <td className="px-4 py-2 border-b">
                {editingDiseaseId === disease.id ? (
                  <input
                    type="text"
                    value={editedCropId}
                    onChange={(e) => setEditedCropId(e.target.value)}
                    className="border rounded px-2 py-1"
                  />
                ) : (
                  disease.cropId
                )}
              </td>
              <td className="px-4 py-2 border-b">
                {editingDiseaseId === disease.id ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSaveEdit(disease.id)}
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
                      onClick={() => handleEdit(disease)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(disease.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
          {diseases.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-2 text-center">
                No diseases available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
