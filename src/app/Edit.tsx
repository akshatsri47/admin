import { useState } from "react";
import { Pricing, Product } from "../../types/types";

import Image from "next/image";

interface EditProductModalProps {
  product: Product;
  setProduct: React.Dispatch<React.SetStateAction<Product | null>>;
  onUpdate: (e: React.FormEvent, selectedImages: File[]) => void;
  onClose: () => void;
  isUploading?: boolean; // Add this prop to the interface
}

const EditProductModal: React.FC<EditProductModalProps> = ({ 
  product, 
  setProduct, 
  onUpdate, 
  onClose,
  isUploading = false // Provide a default value
}) => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

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
        <form onSubmit={(e) => onUpdate(e, selectedImages)} className="space-y-3">
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
          <input
            type="text"
            value={product.category}
            onChange={(e) => setProduct({ ...product, category: e.target.value })}
            className="w-full border p-2 rounded"
            placeholder="Category"
          />
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