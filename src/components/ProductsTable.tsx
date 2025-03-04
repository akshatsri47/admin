"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import EditProductModal from "../app/Edit";
import { Product } from "../../types/types";

export default function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [expandedCells, setExpandedCells] = useState<{ [key: string]: boolean }>({});
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get<{ data: Product[] }>("/api/product");
      setProducts(res.data.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const toggleExpand = (id: string, field: string) => {
    setExpandedCells((prev) => ({
      ...prev,
      [`${id}-${field}`]: !prev[`${id}-${field}`],
    }));
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleUpdateProduct = async (e: React.FormEvent, selectedImages: File[]) => {
    e.preventDefault();
    if (!editingProduct) return;
  
    try {
      const formData = new FormData();
  
      // Append text fields
      formData.append("name", editingProduct.name);
      formData.append("description", editingProduct.description);
      formData.append("category", editingProduct.category);
      formData.append("manufacturer", editingProduct.manufacturer);
      formData.append("composition", editingProduct.composition);
      formData.append("method", editingProduct.dosage.method);
  
      // Append arrays
      editingProduct.commonlyUsedFor.forEach((item) => formData.append("commonlyUsedFor", item));
      editingProduct.avoidForCrops.forEach((item) => formData.append("avoidForCrops", item));
      editingProduct.benefits.forEach((item) => formData.append("benefits", item));
  
      // Append newly uploaded images (ONLY NEW IMAGES)
      selectedImages.forEach((image) => {
        formData.append("images", image);
      });
  
      await axios.put(`/api/product/${editingProduct.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      setModalOpen(false);
      fetchProducts(); // Refresh product list
    } catch (err) {
      console.error("Error updating product:", err);
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/product/${id}`);
      setProducts(products.filter((product) => product.id !== id));
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  return (
    <div className="p-4 bg-gray-100 h-full">
      <h1 className="text-xl font-semibold mb-4">Products</h1>
      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 uppercase text-sm">
            <tr>
              <th className="py-3 px-4 border-b">Name</th>
              <th className="py-3 px-4 border-b">Description</th>
              <th className="py-3 px-4 border-b">Category</th>
              <th className="py-3 px-4 border-b">Manufacturer</th>
              <th className="py-3 px-4 border-b">Composition</th>
              <th className="py-3 px-4 border-b">Commonly Used For</th>
              <th className="py-3 px-4 border-b">Avoid For Crops</th>
              <th className="py-3 px-4 border-b">Benefits</th>
              <th className="py-3 px-4 border-b">Method</th>
              <th className="py-3 px-4 border-b">Images</th>
              <th className="py-3 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm">
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product.id} className="border-b last:border-0 hover:bg-gray-50">
                  {[
                    { key: "name", value: product.name },
                    { key: "description", value: product.description },
                    { key: "category", value: product.category },
                    { key: "manufacturer", value: product.manufacturer },
                    { key: "composition", value: product.composition },
                    { key: "commonlyUsedFor", value: product.commonlyUsedFor?.join(", ") || "N/A" },
                    { key: "avoidForCrops", value: product.avoidForCrops?.join(", ") || "N/A" },
                    { key: "benefits", value: product.benefits?.join(", ") || "N/A" },
                    { key: "method", value: product.dosage?.method || "N/A" },
                  ].map(({ key, value }) => (
                    <td
                      key={key}
                      className="py-2 px-4 cursor-pointer hover:bg-gray-200 transition"
                      onClick={() => toggleExpand(product.id, key)}
                    >
                      {expandedCells[`${product.id}-${key}`] ? (
                        <span className="whitespace-normal block">{value}</span>
                      ) : (
                        <span className="whitespace-nowrap overflow-hidden text-ellipsis block w-40">{value}</span>
                      )}
                    </td>
                  ))}

                  {/* Images */}
                  <td className="py-2 px-4">
                    <div className="flex flex-wrap gap-2 max-w-[200px] overflow-x-auto">
                      {product.images?.length > 0 ? (
                        product.images.map((img, i) => (
                          <Image
                            key={i}
                            src={img}
                            alt={`product-img-${i}`}
                            width={60}
                            height={60}
                            className="object-cover rounded border shadow-md"
                          />
                        ))
                      ) : (
                        <span className="text-gray-400">No Image</span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-2 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditClick(product)}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="py-4 px-4 text-center text-gray-500">No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && editingProduct && (
        <EditProductModal product={editingProduct} setProduct={setEditingProduct} onUpdate={handleUpdateProduct} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}
