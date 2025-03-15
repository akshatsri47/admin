"use client";
import React, { useState, useEffect } from "react";

export interface Recommendation {
  id: string;
  title: string;
  description: string;
}

export const RecommendationTable: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Editing state
  const [editingRecId, setEditingRecId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");

  // Fetch recommendations
  const fetchRecommendations = async () => {
    try {
      const response = await fetch("/api/recommendations");
      if (!response.ok) {
        throw new Error("Failed to fetch recommendations");
      }
      const data: Recommendation[] = await response.json();
      setRecommendations(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  // Delete recommendation
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this recommendation?")) return;
    try {
      const response = await fetch(`/api/recommendations/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete recommendation");
      }
      setRecommendations((prev) => prev.filter((r) => r.id !== id));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    }
  };

  // Start editing
  const handleEdit = (rec: Recommendation) => {
    setEditingRecId(rec.id);
    setEditedTitle(rec.title);
    setEditedDescription(rec.description);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingRecId(null);
    setEditedTitle("");
    setEditedDescription("");
  };

  // Save editing
  const handleSaveEdit = async (id: string) => {
    try {
      const response = await fetch(`/api/recommendations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editedTitle,
          description: editedDescription,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update recommendation");
      }
      setRecommendations((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, title: editedTitle, description: editedDescription }
            : r
        )
      );
      handleCancelEdit();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Recommendations</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-2 border-b font-medium text-left">ID</th>
            <th className="px-4 py-2 border-b font-medium text-left">Title</th>
            <th className="px-4 py-2 border-b font-medium text-left">Description</th>
            <th className="px-4 py-2 border-b font-medium text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {recommendations.map((rec) => (
            <tr key={rec.id}>
              <td className="px-4 py-2 border-b">{rec.id}</td>
              <td className="px-4 py-2 border-b">
                {editingRecId === rec.id ? (
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="border rounded px-2 py-1"
                  />
                ) : (
                  rec.title
                )}
              </td>
              <td className="px-4 py-2 border-b">
                {editingRecId === rec.id ? (
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="border rounded px-2 py-1 w-full"
                  />
                ) : (
                  rec.description
                )}
              </td>
              <td className="px-4 py-2 border-b">
                {editingRecId === rec.id ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSaveEdit(rec.id)}
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
                      onClick={() => handleEdit(rec)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(rec.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
          {recommendations.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-2 text-center">
                No recommendations available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
