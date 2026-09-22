import { useState, useEffect } from "react";
import axios from "axios";
import { Pricing, Product } from "../../types/types";

import Image from "next/image";

interface EditProductModalProps {
  product: Product;
  setProduct: React.Dispatch<React.SetStateAction<Product | null>>;
  onUpdate: (e: React.FormEvent, selectedImages: File[], selectedStickerImage: File | null) => void;
  onClose: () => void;
  isUploading?: boolean; // Add this prop to the interface
}

interface ProductReview {
  name: string;
  rating: number;
  comment: string;
  date?: string;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ 
  product, 
  setProduct, 
  onUpdate, 
  onClose,
  isUploading = false // Provide a default value
}) => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedStickerImage, setSelectedStickerImage] = useState<File | null>(null);
  const [review, setReview] = useState<ProductReview>({
    name: "",
    rating: 5,
    comment: "",
    date: "",
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState<boolean>(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("/api/product");
        const uniqueCategories = Array.from(
          new Set(
            res.data.data.map((p: Product) => 
               p.category ? p.category.trim() : ""
            ).filter(Boolean)
          )
        ) as string[];
        setExistingCategories(uniqueCategories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  if (!product) return null;
  console.log(setUploadProgress)

  // Handles image file selection
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      // console.log(uploadedImageUrls)
      setSelectedImages(files); // Store files in state
    }
  };

  const handleStickerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedStickerImage(e.target.files?.[0] || null);
  };

  const addReview = () => {
    if (!review.name || !review.comment) return;
    setProduct({
      ...product,
      reviews: [...(product.reviews || []), { ...review, rating: Number(review.rating) }],
    });
    setReview({ name: "", rating: 5, comment: "", date: "" });
  };

  const updateReview = (index: number, field: keyof ProductReview, value: string) => {
    const nextReviews = [...(product.reviews || [])];
    nextReviews[index] = {
      ...nextReviews[index],
      [field]: field === "rating" ? Number(value) : value,
    };
    setProduct({ ...product, reviews: nextReviews });
  };

  const removeReview = (index: number) => {
    setProduct({
      ...product,
      reviews: (product.reviews || []).filter((_, reviewIndex) => reviewIndex !== index),
    });
  };

  const removeExistingImage = (index: number) => {
    setProduct({
      ...product,
      images: (product.images || []).filter((_, imageIndex) => imageIndex !== index),
    });
  };

  // Upload images to Cloudinary before form submission
  // const uploadImagesToCloudinary = async () => {
  //   if (selectedImages.length === 0) {
  //     // If no new images, return existing ones
  //     return product.images || [];
  //   }

  //   setUploadProgress(0);

  //   try {
  //     // Get the signature from the server
  //     const { data: signatureData } = await axios.get('/api/cloudinary');
  //     const { signature, timestamp, cloudName, apiKey } = signatureData;

  //     // Upload each image to Cloudinary
  //     const uploadedUrls: string[] = [];

  //     for (let i = 0; i < selectedImages.length; i++) {
  //       const file = selectedImages[i];
  //       const formData = new FormData();
        
  //       formData.append('file', file);
  //       formData.append('signature', signature);
  //       formData.append('timestamp', timestamp.toString());
  //       formData.append('api_key', apiKey);
  //       formData.append('folder', 'products');

  //       const response = await axios.post(
  //         `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
  //         formData,
  //         {
  //           onUploadProgress: (progressEvent) => {
  //             const total = progressEvent.total ?? 1; // Fallback to 1 if undefined
  //             const percentCompleted = Math.round(
  //               ((i * 100) + (progressEvent.loaded * 100 / total)) / selectedImages.length
  //             );
  //             setUploadProgress(percentCompleted);
  //           }
  //         }
  //       );

  //       uploadedUrls.push(response.data.secure_url);
  //     }

  //     // Combine with existing images if needed
  //     const allImageUrls = [...uploadedUrls, ...(product.images || [])];
  //     setUploadedImageUrls(allImageUrls);
      
  //     return allImageUrls;
  //   } catch (error) {
  //     console.error('Error uploading images to Cloudinary:', error);
  //     return product.images || []; // Return existing images on error
  //   }
  // };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Edit Product</h2>
        <form onSubmit={(e) => onUpdate(e, selectedImages, selectedStickerImage)} className="space-y-3">
          <input
            type="text"
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
            className="w-full border p-2 rounded"
            placeholder="Product Name"
            required
          />
          <textarea
            value={product.description}
            onChange={(e) => setProduct({ ...product, description: e.target.value })}
            className="w-full border p-2 rounded"
            placeholder="Description"
          />
          <div className="flex flex-col gap-2 border p-3 rounded bg-gray-50">
            <label className="text-sm font-semibold text-gray-700">Category</label>
            {isAddingCategory ? (
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={product.category}
                  onChange={(e) => setProduct({ ...product, category: e.target.value })}
                  className="w-full border p-2 rounded"
                  placeholder="New Category"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(false)}
                  className="text-xs text-red-500 self-start hover:underline"
                >
                  Cancel Adding New Option
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <select
                  value={product.category}
                  onChange={(e) => setProduct({ ...product, category: e.target.value })}
                  className="w-full border p-2 rounded bg-white"
                >
                  <option value="" disabled>Select a category</option>
                  {existingCategories.map((cat, idx) => (
                    <option key={idx} value={cat}>
                      {cat}
                    </option>
                  ))}
                  {/* If the current product category isn't in the list for some reason, show it */}
                  {product.category && !existingCategories.includes(product.category) && (
                    <option value={product.category}>{product.category}</option>
                  )}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingCategory(true);
                    setProduct({ ...product, category: "" });
                  }}
                  className="text-xs text-blue-500 self-start hover:underline"
                >
                  + Add New Category Option
                </button>
              </div>
            )}
          </div>
          <input
            type="text"
            value={product.manufacturer}
            onChange={(e) => setProduct({ ...product, manufacturer: e.target.value })}
            className="w-full border p-2 rounded"
            placeholder="Manufacturer"
          />
          <input
            type="text"
            value={product.composition}
            onChange={(e) => setProduct({ ...product, composition: e.target.value })}
            className="w-full border p-2 rounded"
            placeholder="Composition"
          />

          {/* Dosage Method */}
          <input
            type="text"
            value={product.dosage?.method || ""}
            onChange={(e) => {
              // Update the method while keeping the existing dosage data
              if (product.dosage) {
                setProduct({
                  ...product,
                  dosage: {
                    ...product.dosage,
                    method: e.target.value
                  }
                });
              } else {
                // If dosage doesn't exist yet, create it with default empty values
                setProduct({
                  ...product,
                  dosage: {
                    method: e.target.value,
                    dosage: {dose: "", acre: ""}
                  }
                });
              }
            }}
            className="w-full border p-2 rounded"
            placeholder="Dosage Method"
          />

          {/* Dosage */}
          <h3 className="text-sm font-semibold">Dosage</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              value={product.dosage?.dosage?.dose || ""}
              onChange={(e) => {
                // Update the dose while keeping everything else
                if (product.dosage) {
                  setProduct({
                    ...product,
                    dosage: {
                      ...product.dosage,
                      dosage: {
                        ...product.dosage.dosage,
                        dose: e.target.value
                      }
                    }
                  });
                } else {
                  // If dosage doesn't exist yet, create it
                  setProduct({
                    ...product,
                    dosage: {
                      method: "",
                      dosage: {
                        dose: e.target.value,
                        acre: ""
                      }
                    }
                  });
                }
              }}
              className="w-1/2 border p-2 rounded"
              placeholder="Dose (e.g. 100 gm)"
            />
            <input
              type="text"
              value={product.dosage?.dosage?.acre || ""}
              onChange={(e) => {
                // Update the acre while keeping everything else
                if (product.dosage) {
                  setProduct({
                    ...product,
                    dosage: {
                      ...product.dosage,
                      dosage: {
                        ...product.dosage.dosage,
                        acre: e.target.value
                      }
                    }
                  });
                } else {
                  // If dosage doesn't exist yet, create it
                  setProduct({
                    ...product,
                    dosage: {
                      method: "",
                      dosage: {
                        dose: "",
                        acre: e.target.value
                      }
                    }
                  });
                }
              }}
              className="w-1/2 border p-2 rounded"
              placeholder="Acre (e.g. 50 Kg Seed)"
            />
          </div>

          {/* Pricing */}
          <h3 className="text-sm font-semibold">Pricing</h3>
          {(product.pricing || []).map((price: Pricing, index: number) => (
            <div key={index} className="flex space-x-2">
              <input
                type="text"
                value={price.packageSize}
                onChange={(e) => {
                  const newPricing = [...(product.pricing || [])];
                  newPricing[index].packageSize = e.target.value;
                  setProduct({ ...product, pricing: newPricing });
                }}
                className="w-1/2 border p-2 rounded"
                placeholder="Package Size"
              />
              <input
                type="number"
                value={price.price}
                onChange={(e) => {
                  const newPricing = [...(product.pricing || [])];
                  newPricing[index].price = Number(e.target.value);
                  setProduct({ ...product, pricing: newPricing });
                }}
                className="w-1/2 border p-2 rounded"
                placeholder="Price"
              />
            </div>
          ))}

          {/* Add new pricing button */}
          <button
            type="button"
            onClick={() => {
              const newPricing = [...(product.pricing || []), { packageSize: "", price: 0 }];
              setProduct({ ...product, pricing: newPricing });
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            + Add Pricing Option
          </button>

          {/* Discount */}
          <div className="flex flex-col gap-1 border border-orange-200 bg-orange-50 rounded-lg p-3 mt-2">
            <label className="text-sm font-semibold text-orange-800 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500"><path d="M9 15 15 9"/><circle cx="9.5" cy="9.5" r=".5" fill="currentColor"/><circle cx="14.5" cy="14.5" r=".5" fill="currentColor"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>
              Product Discount (%)
            </label>
            <p className="text-xs text-orange-600 mb-1">Set to 0 to remove. The frontend applies the higher of this or any active global coupon.</p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="-100"
                max="100"
                value={product.discount ?? 0}
                onChange={(e) =>
                  setProduct({ ...product, discount: Math.min(100, Math.max(-100, Number(e.target.value))) })
                }
                className="border border-orange-300 bg-white rounded px-3 py-1.5 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="0"
              />
              <span className="text-sm font-medium text-orange-700">
                {(product.discount ?? 0) > 0
                  ? `${product.discount}% OFF active`
                  : "No discount"}
              </span>
            </div>
          </div>

          {/* COD Availability */}
          <div className="flex items-start gap-3 border border-green-200 bg-green-50 rounded-lg p-3 mt-2">
            <input
              id="editCodAvailable"
              type="checkbox"
              checked={product.codAvailable ?? true}
              onChange={(e) => setProduct({ ...product, codAvailable: e.target.checked })}
              className="mt-1 h-4 w-4 accent-green-600 cursor-pointer"
            />
            <label htmlFor="editCodAvailable" className="text-sm text-green-900 cursor-pointer">
              <span className="font-semibold">Allow Cash on Delivery (COD)</span>
              <span className="block text-xs text-green-700 mt-0.5">
                If unchecked, customers can only buy this product via online payment. COD orders: customer pays 15% online upfront, remaining 85% on delivery.
              </span>
            </label>
          </div>
          <div className="mt-3">
            <label className="block text-sm font-semibold text-green-900">Payment eligibility</label>
            <select value={product.paymentEligibility ?? (product.codAvailable === false ? "PREPAID_ONLY" : "PARTIAL_COD_AND_PREPAID")} onChange={(e) => setProduct({ ...product, paymentEligibility: e.target.value as Product["paymentEligibility"], codAvailable: e.target.value !== "PREPAID_ONLY" })} className="mt-1 w-full border rounded px-3 py-2">
              <option value="FULL_COD_ALLOWED">Full COD Allowed</option><option value="PARTIAL_COD_ONLY">Partial COD Only — 15% Advance</option><option value="PREPAID_ONLY">Prepaid Only — Full Online Payment</option><option value="FULL_COD_AND_PREPAID">Full COD and Prepaid Allowed</option><option value="PARTIAL_COD_AND_PREPAID">Partial COD and Prepaid Allowed</option>
            </select>
          </div>

          <div className="flex flex-col gap-3 border border-green-200 bg-green-50 rounded-lg p-3 mt-2">
            <h3 className="text-sm font-semibold text-green-900">Trust Badge, Sticker & Reviews</h3>
            <input
              type="text"
              value={product.stickerLabel || ""}
              onChange={(e) => setProduct({ ...product, stickerLabel: e.target.value })}
              className="w-full border p-2 rounded"
              placeholder="Top Seller Sticker Text"
            />
            <input
              type="text"
              value={product.trustedFarmers || ""}
              onChange={(e) => setProduct({ ...product, trustedFarmers: e.target.value })}
              className="w-full border p-2 rounded"
              placeholder="Trusted Farmers Count (e.g. 638+)"
            />
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={product.rating ?? 4.6}
                onChange={(e) => setProduct({ ...product, rating: Number(e.target.value) })}
                className="w-1/2 border p-2 rounded"
                placeholder="Rating"
              />
              <input
                type="number"
                min="0"
                value={product.verifiedReviewsCount ?? 148}
                onChange={(e) => setProduct({ ...product, verifiedReviewsCount: Number(e.target.value) })}
                className="w-1/2 border p-2 rounded"
                placeholder="Verified Reviews Count"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sticker Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleStickerImageUpload}
                className="w-full border p-2 rounded"
                disabled={isUploading}
              />
              {(selectedStickerImage || product.stickerImage) && (
                <div className="mt-2 flex items-center gap-3">
                  <div className="relative h-14 w-36 overflow-hidden rounded border bg-white">
                    <Image
                      src={selectedStickerImage ? URL.createObjectURL(selectedStickerImage) : product.stickerImage || ""}
                      alt="Sticker Preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStickerImage(null);
                      setProduct({ ...product, stickerImage: "" });
                    }}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove Sticker
                  </button>
                </div>
              )}
            </div>

            <div className="border-t border-green-200 pt-3">
              <p className="text-sm font-semibold text-green-900 mb-2">Reviews</p>
              <div className="grid grid-cols-1 gap-2">
                <input
                  type="text"
                  value={review.name}
                  onChange={(e) => setReview({ ...review, name: e.target.value })}
                  className="w-full border p-2 rounded"
                  placeholder="Reviewer Name"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={review.rating}
                    onChange={(e) => setReview({ ...review, rating: Number(e.target.value) })}
                    className="w-1/2 border p-2 rounded"
                    placeholder="Rating"
                  />
                  <input
                    type="text"
                    value={review.date}
                    onChange={(e) => setReview({ ...review, date: e.target.value })}
                    className="w-1/2 border p-2 rounded"
                    placeholder="Date"
                  />
                </div>
                <textarea
                  value={review.comment}
                  onChange={(e) => setReview({ ...review, comment: e.target.value })}
                  className="w-full border p-2 rounded"
                  placeholder="Review"
                />
                <button
                  type="button"
                  onClick={addReview}
                  className="text-sm text-blue-600 hover:text-blue-800 text-left"
                >
                  + Add Review
                </button>
              </div>

              {(product.reviews || []).length > 0 && (
                <div className="mt-3 space-y-3">
                  {(product.reviews || []).map((item, index) => (
                    <div key={index} className="rounded border bg-white p-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateReview(index, "name", e.target.value)}
                        className="mb-2 w-full border p-2 rounded"
                        placeholder="Name"
                      />
                      <div className="mb-2 flex gap-2">
                        <input
                          type="number"
                          min="1"
                          max="5"
                          step="0.1"
                          value={item.rating}
                          onChange={(e) => updateReview(index, "rating", e.target.value)}
                          className="w-1/2 border p-2 rounded"
                          placeholder="Rating"
                        />
                        <input
                          type="text"
                          value={item.date || ""}
                          onChange={(e) => updateReview(index, "date", e.target.value)}
                          className="w-1/2 border p-2 rounded"
                          placeholder="Date"
                        />
                      </div>
                      <textarea
                        value={item.comment}
                        onChange={(e) => updateReview(index, "comment", e.target.value)}
                        className="w-full border p-2 rounded"
                        placeholder="Review"
                      />
                      <button
                        type="button"
                        onClick={() => removeReview(index)}
                        className="mt-2 text-sm text-red-600 hover:text-red-800"
                      >
                        Remove Review
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Images Section */}
          <h3 className="text-sm font-semibold">Upload Images</h3>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full border p-2 rounded"
            disabled={isUploading}
          />

          {/* Preview Selected Images */}
          {selectedImages.length > 0 && (
            <div>
              <p className="text-sm font-medium">Selected Images ({selectedImages.length})</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedImages.map((file, index) => (
                  <div key={index} className="relative w-16 h-16">
                    <Image 
                      src={URL.createObjectURL(file)} 
                      alt={`preview-${index}`}
                      fill
                      className="object-cover rounded border"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Existing Images */}
          {product.images && product.images.length > 0 && (
            <div>
              <p className="text-sm font-medium">Existing Images ({product.images.length})</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {product.images.map((img, i) => (
                  <div key={i} className="relative w-16 h-16">
                    <Image
                      src={img}
                      alt={`existing-img-${i}`}
                      fill
                      className="object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(i)}
                      className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white shadow"
                      aria-label="Remove product image"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-center mt-1">{uploadProgress}% - Uploading images...</p>
            </div>
          )}

          {/* Submit & Cancel */}
          <div className="flex space-x-2 pt-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="w-1/2 bg-gray-400 text-white py-2 rounded hover:bg-gray-500"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="w-1/2 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              disabled={isUploading}
            >
              {isUploading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
