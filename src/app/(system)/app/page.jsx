// src/app/pos/page.tsx
"use client";

import { useState, useEffect, useReducer } from "react";
import { Input } from "@/components/ui/input";
import { DashboardLayoutSkeleton } from "@/app/skeletons/Dashboard-skeleton";
import { ProductCard } from "@/components/pos/product-card";
import { CartDisplay } from "@/components/pos/cart-display";
import { PosScreenSkeleton } from "@/components/pos/pos-screen-skeleton";

// --- Mock Data ---
// In a real app, this would come from an API
const MOCK_PRODUCTS = [
  {
    id: "1",
    name: "Espresso",
    price: 450.0,
    stock: 100,
    imageUrl:
      "https://images.unsplash.com/photo-1579992305393-3a7d2c801124?q=80&w=400",
  },
  {
    id: "2",
    name: "Latte",
    price: 600.0,
    stock: 100,
    imageUrl:
      "https://images.unsplash.com/photo-1561729864-500851214227?q=80&w=400",
  },
  {
    id: "3",
    name: "Cappuccino",
    price: 600.0,
    stock: 100,
    imageUrl:
      "https://images.unsplash.com/photo-1557006021-b45654010a3e?q=80&w=400",
  },
  {
    id: "4",
    name: "Croissant",
    price: 550.0,
    stock: 50,
    imageUrl:
      "https://images.unsplash.com/photo-1587241321921-91a834d6d194?q=80&w=400",
  },
  {
    id: "5",
    name: "Brownie",
    price: 700.0,
    stock: 40,
    imageUrl:
      "https://images.unsplash.com/photo-1627834377411-8da5f4f8993a?q=80&w=400",
  },
  {
    id: "6",
    name: "Iced Tea",
    price: 500.0,
    stock: 80,
    imageUrl:
      "https://images.unsplash.com/photo-1556679343-c7306c19761a?q=80&w=400",
  },
  {
    id: "7",
    name: "Affogato",
    price: 850.0,
    stock: 30,
    imageUrl:
      "https://images.unsplash.com/photo-1626081974738-984c37482701?q=80&w=400",
  },
  {
    id: "8",
    name: "Muffin",
    price: 650.0,
    stock: 45,
    imageUrl:
      "https://images.unsplash.com/photo-1550617931-e2223b3a6283?q=80&w=400",
  },
];

// --- Cart State Management (Reducer) ---
function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_TO_CART": {
      const existingItem = state.find((item) => item.id === action.payload.id);
      if (existingItem) {
        return state.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...state, { ...action.payload, quantity: 1 }];
    }
    case "REMOVE_FROM_CART":
      return state.filter((item) => item.id !== action.payload);
    case "INCREMENT_QUANTITY":
      return state.map((item) =>
        item.id === action.payload
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    case "DECREMENT_QUANTITY":
      return state
        .map((item) =>
          item.id === action.payload
            ? { ...item, quantity: Math.max(1, item.quantity - 1) } // Prevents quantity < 1
            : item
        )
        .filter((item) => item.quantity > 0); // Optionally remove if quantity becomes 0
    default:
      return state;
  }
}

export default function PosPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [cart, dispatch] = useReducer(cartReducer, []);

  // Simulate fetching data on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setProducts(MOCK_PRODUCTS);
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleAddToCart = (product) => {
    dispatch({ type: "ADD_TO_CART", payload: product });
  };

  if (isLoading) {
    return <PosScreenSkeleton />;
  }

  return (
    <div className="h-screen w-full bg-muted/40 flex flex-col">
      <header className="flex h-14 items-center justify-between border-b bg-background px-4">
        {/* You can add header elements here */}
        <h1 className="font-bold text-lg">POS Terminal - Colombo, Sri Lanka</h1>
      </header>
      <main className="grid flex-1 grid-cols-1 lg:grid-cols-3 gap-4 p-4 overflow-auto">
        {/* Left Column */}
        <div className="lg:col-span-1">
          <CartDisplay cart={cart} dispatch={dispatch} />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Input placeholder="Search products..." />
          <div className="grid flex-1 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 overflow-y-auto">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
