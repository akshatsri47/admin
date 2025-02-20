import ProductForm from "./ProductForm";

export default function Page() {
  return (
    <div className="container mx-auto p-4 px-24">
      <h1 className="text-2xl font-bold">Add Product</h1>
      <ProductForm />
    </div>
  );
}
