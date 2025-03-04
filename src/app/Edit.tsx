import { useState } from "react";
import { Product } from "../../types/types";


interface EditProductModalProps {
  product:  any;
  setProduct: React.Dispatch<React.SetStateAction<any>>;
  onUpdate: (e: React.FormEvent, selectedImages: File[]) => void;
  onClose: () => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ product, setProduct, onUpdate, onClose }) => {
  if (!product) return null;

  // State to store selected images
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  // Handles image file selection
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedImages(files); // Store files in state
    }
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg w-96 max-h-[80vh] overflow-y-auto">
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
         {/* Dosage Method */}
<input
  type="text"
  value={product.dosage?.method || ""}
  onChange={(e) =>
    setProduct({
      ...product,
      dosage: { ...product.dosage, method: e.target.value },
    })
  }
  className="w-full border p-2 rounded"
  placeholder="Dosage Method"
/>

{/* Dosage Array */}
<h3 className="text-sm font-semibold">Dosage</h3>
{product.dosage?.dosage?.map((doseEntry: { dose: string; acre: string }, index: number) => (
  <div key={index} className="flex space-x-2">
    <input
      type="text"
      value={doseEntry.dose}
      onChange={(e) => {
        const newDosage = [...product.dosage.dosage];
        newDosage[index].dose = e.target.value;
        setProduct({ ...product, dosage: { ...product.dosage, dosage: newDosage } });
      }}
      className="w-1/2 border p-2 rounded"
      placeholder="Dose (e.g. 100 gm)"
    />
    <input
      type="text"
      value={doseEntry.acre}
      onChange={(e) => {
        const newDosage = [...product.dosage.dosage];
        newDosage[index].acre = e.target.value;
        setProduct({ ...product, dosage: { ...product.dosage, dosage: newDosage } });
      }}
      className="w-1/2 border p-2 rounded"
      placeholder="Acre (e.g. 50 Kg Seed)"
    />
  </div>
))}


          {/* Pricing */}
          <h3 className="text-sm font-semibold">Pricing</h3>
          {product.pricing.map((price: any, index: number) => (
            <div key={index} className="flex space-x-2">
              <input
                type="text"
                value={price.packageSize}
                onChange={(e) => {
                  const newPricing = [...product.pricing];
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
                  const newPricing = [...product.pricing];
                  newPricing[index].price = Number(e.target.value);
                  setProduct({ ...product, pricing: newPricing });
                }}
                className="w-1/2 border p-2 rounded"
                placeholder="Price"
              />
            </div>
          ))}

          {/* Images Section */}
          <h3 className="text-sm font-semibold">Upload Images</h3>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full border p-2 rounded"
          />

          {/* Preview Selected Images */}
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedImages.map((file, index) => (
              <div key={index} className="relative">
                <img src={URL.createObjectURL(file)} alt="preview" className="w-16 h-16 rounded border" />
              </div>
            ))}
          </div>

          {/* Submit & Cancel */}
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
            Save Changes
          </button>
          <button type="button" onClick={onClose} className="w-full bg-gray-400 text-white py-2 rounded hover:bg-gray-500 mt-2">
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
