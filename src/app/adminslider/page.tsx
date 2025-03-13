"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, Edit } from "lucide-react";
import Image from "next/image";

interface Slide {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  bgColor: string;
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
  });

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
      setEditingSlide(null);
    } catch (error) {
      console.error("Error updating slide:", error);
    }
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
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {slides.map((slide) => (
            <tr key={slide.id} className="hover:bg-gray-100">
              <td className="border border-gray-300 px-4 py-2">
                <Image src={slide.imageUrl} alt={slide.title} width={80} height={50} className="rounded" />
              </td>
              <td className="border border-gray-300 px-4 py-2">{slide.title}</td>
              <td className="border border-gray-300 px-4 py-2">{slide.description}</td>
              <td className="border border-gray-300 px-4 py-2">
                <a href={slide.link} className="text-blue-500 underline" target="_blank">
                  {slide.link}
                </a>
              </td>
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
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-md shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4">Edit Slide</h3>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Title"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
            />

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
            />

            <input
              type="text"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="Image URL"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
            />

            <input
              type="text"
              name="link"
              value={formData.link}
              onChange={handleChange}
              placeholder="Link"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditingSlide(null)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
