"use client"
import React from "react";
import Image from "next/image";

export default function ProductsTable() {
  // Dummy data to illustrate each field
  const products = [
    {
      name: "Product A",
      description: "A short description of Product A",
      category: "Category 1",
      manufacturer: "Manufacturer A",
      composition: "Compound X",
      commonlyUsedFor: ["Wheat", "Corn"],
      avoidForCrops: ["Tomato"],
      benefits: ["Fast Growth", "High Yield"],
      method: "Spray",
      dosage: [
        { dose: "10ml", arce: "1 acre" },
        { dose: "15ml", arce: "2 acres" },
      ],
      pricing: [
        { packageSize: "1kg", price: 100 },
        { packageSize: "2kg", price: 180 },
      ],
      images: ["/img1.jpg", "/img2.jpg"],
    },
    {
      name: "Product B",
      description: "Another product description",
      category: "Category 2",
      manufacturer: "Manufacturer B",
      composition: "Compound Y",
      commonlyUsedFor: ["Rice", "Barley"],
      avoidForCrops: ["Onion", "Potato"],
      benefits: ["Improves Soil", "Eco-Friendly"],
      method: "Soil Application",
      dosage: [{ dose: "5g", arce: "1 acre" }],
      pricing: [{ packageSize: "500g", price: 60 }],
      images: ["/img2.jpg"],
    },
  ];

  return (
    <div className="p-4 bg-gray-100 h-full ">
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
              <th className="py-3 px-4 border-b">Dosage</th>
              <th className="py-3 px-4 border-b">Pricing</th>
              <th className="py-3 px-4 border-b">Images</th>
              <th className="py-3 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm">
            {products.map((product, idx) => (
              <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-2 px-4">{product.name}</td>
                <td className="py-2 px-4">{product.description}</td>
                <td className="py-2 px-4">{product.category}</td>
                <td className="py-2 px-4">{product.manufacturer}</td>
                <td className="py-2 px-4">{product.composition}</td>
                <td className="py-2 px-4">
                  {product.commonlyUsedFor.join(", ")}
                </td>
                <td className="py-2 px-4">{product.avoidForCrops.join(", ")}</td>
                <td className="py-2 px-4">{product.benefits.join(", ")}</td>
                <td className="py-2 px-4">{product.method}</td>
                <td className="py-2 px-4">
                  {product.dosage.map((d) => `${d.dose} / ${d.arce}`).join(", ")}
                </td>
                <td className="py-2 px-4">
                  {product.pricing
                    .map((p) => `${p.packageSize} @ ${p.price}`)
                    .join(", ")}
                </td>
                <td className="py-2 px-4">
                  <div className="flex space-x-2">
                    {product.images.map((img, i) => (
                      <Image
                        key={i}
                        src={img}
                        alt={`product-img-${i}`}
                        width={50}
                        height={50}
                        className="object-cover rounded"
                      />
                    ))}
                  </div>
                </td>
                <td className="py-2 px-4">
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                      Edit
                    </button>
                    <button className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={13} className="py-4 px-4 text-center text-gray-500">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
