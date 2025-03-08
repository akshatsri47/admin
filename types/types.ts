
export interface Product {
  id: string;                 // Firestore-generated Product ID
  name: string;               // Product Name (e.g., 'Bayer Evergol Xtend')
  description: string;        // Detailed Product Description          
  category: string;           // Category (e.g., 'Seed Treatment')
  pricing:Pricing[];
  images: string[];           // Array of image URLs
  createdAt: string;          // Timestamp of product creation
  manufacturer: string;       // Manufacturer Name (e.g., 'Bayer Crop Science')
  composition: string;        // Composition / Technical details
  commonlyUsedFor: string[];  // List of crops commonly used for (e.g., ['corn', 'soybean', 'cereals', 'pulses', 'rice'])
  avoidForCrops: string[]; 
  search?:string;
  keywords?:string[];  // Crops to avoid usage (e.g., ['wheat', 'hybrid seed'])
  dosage?: {
    method: string;           // Dosage method (e.g., 'Mix with water and rub on seeds')
    dosage:{dose:string,acre:string}
  };
  lowercategory?:string;
  benefits: string[];  
  discount?:number
  imageUrls?:string[]
      // List of product benefits
}

export interface Pricing{
  price:number,
  packageSize:string
}

  export interface User {
    id: string;         // Firestore-generated User ID
    email: string;      // User Email
    name: string;       // User Name
    password: string;   // Hashed Password (should be hashed before storing)
    cart: CartItem[];   // Array of Cart Items
  }
  
  
  export interface CartItem {
    productId: string; // ID of the product in the cart
    quantity: number;  // Number of items added
    price: number;     // Price at the time of adding
    name: string;      // Product name (to avoid extra Firestore reads)
    image: string;     // Main product image
    addedAt: string;   // Timestamp when added to cart
  }
  
  
  export interface Order {
    id: string;         // Firestore-generated Order ID
    userId: string;     // ID of the user who placed the order
    items: CartItem[];  // Array of ordered items
    totalAmount: number;// Total price of the order
    status: "pending" | "processing" | "shipped" | "delivered"; // Order status
    createdAt: string;  // Timestamp of order creation
  }
  
  
  export interface Payment {
    id: string;         // Firestore-generated Payment ID
    orderId: string;    // ID of the related order
    amount: number;     // Total payment amount
    status: "pending" | "completed" | "failed"; // Payment status
    createdAt: string;  // Timestamp of payment
  }
  
  
  export interface Review {
    id: string;         // Firestore-generated Review ID
    userId: string;     // ID of the user who left the review
    productId: string;  // ID of the reviewed product
    rating: number;     // Rating (1-5)
    comment: string;    // Review comment
    createdAt: string;  // Timestamp of review submission
  }
  