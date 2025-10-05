"use client";

import { useState, useEffect, useReducer, useRef, forwardRef } from "react";
import clsx from "clsx";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import {
  Trash2,
  Plus,
  Minus,
  ListRestart,
  Search,
  X,
  CreditCard,
  Wallet,
  ImageIcon,
  Users,
  ShoppingCart,
  DollarSign,
  List,
} from "lucide-react";

// --- Mock Data (Unchanged) ---
const MOCK_PRODUCTS = [
  {
    id: "1",
    barcode: "8990001001",
    name: "Espresso",
    size: "Short",
    retailPrice: 450.0,
    wholesalePrice: 400.0,
    imageUrl:
      "https://images.unsplash.com/photo-1579992308814-569b01534026?q=80&w=2592&auto-format&fit=crop",
  },
  {
    id: "2",
    barcode: "8990001002",
    name: "Latte",
    size: "Tall",
    retailPrice: 600.0,
    wholesalePrice: 550.0,
    imageUrl:
      "https://images.unsplash.com/photo-1563868013082-af329a4993a2?q=80&w=2592&auto-format&fit=crop",
  },
  {
    id: "3",
    barcode: "8990001003",
    name: "Cappuccino",
    size: "Grande",
    retailPrice: 600.0,
    wholesalePrice: 550.0,
    imageUrl:
      "https://images.unsplash.com/photo-1517701552125-7853223aa125?q=80&w=2538&auto-format&fit=crop",
  },
  {
    id: "4",
    barcode: "8990001004",
    name: "Croissant",
    size: "Regular",
    retailPrice: 550.0,
    wholesalePrice: 500.0,
    imageUrl:
      "https://images.unsplash.com/photo-1587241321921-91a834d6d194?q=80&w=2700&auto-format&fit=crop",
  },
  {
    id: "5",
    barcode: "8990001005",
    name: "Iced Americano",
    size: "Venti",
    retailPrice: 500.0,
    wholesalePrice: 450.0,
    imageUrl:
      "https://images.unsplash.com/photo-1517701552125-7853223aa125?q=80&w=2538&auto-format&fit=crop",
  },
  {
    id: "6",
    barcode: "8990001006",
    name: "Chocolate Muffin",
    size: "Large",
    retailPrice: 650.0,
    wholesalePrice: 600.0,
    imageUrl:
      "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=2564&auto-format&fit=crop",
  },
];
const MOCK_CUSTOMERS = [
  { id: "1", name: "Nimal Perera", phone: "0771234567" },
  { id: "2", name: "Sunil Traders", phone: "0112345678" },
  { id: "3", name: "Kamala Silva", phone: "0718901234" },
];

// --- State Management (Unchanged) ---
function appReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const { product, priceTier } = action.payload;
      const price =
        priceTier === "retail" ? product.retailPrice : product.wholesalePrice;
      const existingItemIndex = state.cart.findIndex(
        (item) => item.id === product.id
      );
      if (existingItemIndex > -1) {
        const updatedCart = [...state.cart];
        updatedCart[existingItemIndex].quantity += 1;
        return { ...state, cart: updatedCart };
      }
      return {
        ...state,
        cart: [
          ...state.cart,
          {
            id: product.id,
            barcode: product.barcode,
            name: product.name,
            size: product.size,
            quantity: 1,
            price: price,
            discount: 0,
          },
        ],
      };
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        cart: state.cart.filter((item) => item.id !== action.payload),
      };
    case "UPDATE_ITEM":
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.id === action.payload.id ? { ...item, ...action.payload } : item
        ),
      };
    case "SET_CUSTOMER":
      return { ...state, customer: action.payload };
    case "SET_PRICE_TIER": {
      return {
        ...state,
        priceTier: action.payload,
        cart: state.cart.map((item) => {
          const product = MOCK_PRODUCTS.find((p) => p.id === item.id);
          return {
            ...item,
            price:
              action.payload === "retail"
                ? product.retailPrice
                : product.wholesalePrice,
          };
        }),
      };
    }
    case "CLEAR_CART":
      return { ...state, customer: null, cart: [] };
    default:
      return state;
  }
}

// --- UI Sub-components ---
const CustomerSelector = ({
  customers,
  selectedCustomer,
  onSelectCustomer,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );
  return (
    <div className="relative">
      <Button
        variant="outline"
        className="h-11 w-full justify-start gap-3 text-left bg-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Users className="h-5 w-5 text-slate-400" />
        <div className="flex-1">
          <p className="font-semibold text-slate-800 truncate text-sm">
            {selectedCustomer ? selectedCustomer.name : "Walk-in Customer"}
          </p>
          <p className="text-xs text-slate-500">
            {selectedCustomer
              ? selectedCustomer.phone
              : "Select a customer profile"}
          </p>
        </div>
      </Button>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-xl z-10 p-2">
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-2"
          />
          <div className="max-h-48 overflow-y-auto">
            {filteredCustomers.map((customer) => (
              <Button
                key={customer.id}
                variant="ghost"
                className="w-full justify-start h-auto py-2"
                onClick={() => {
                  onSelectCustomer(customer);
                  setIsOpen(false);
                  setSearchTerm("");
                }}
              >
                {" "}
                <div className="text-left">
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {customer.phone}
                  </p>
                </div>{" "}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
const ProductCardWithImage = ({ product, onAddToCart }) => (
  <Card
    onClick={() => onAddToCart(product)}
    className="cursor-pointer group border-slate-200/80 hover:border-blue-400/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 h-full flex flex-col overflow-hidden"
  >
    {" "}
    <CardContent className="p-0 flex-1 flex flex-col">
      {" "}
      <div className="overflow-hidden">
        {" "}
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-32 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-32 flex items-center justify-center bg-slate-100 rounded-t-lg">
            <ImageIcon className="h-8 w-8 text-slate-400" />
          </div>
        )}{" "}
      </div>{" "}
      <div className="p-3 flex-1 flex flex-col bg-white">
        {" "}
        <div className="flex justify-between items-start mb-1">
          {" "}
          <p className="font-semibold text-sm text-slate-800 flex-1">
            {product.name}
          </p>{" "}
          {product.size && (
            <Badge
              variant="secondary"
              className="ml-2 shrink-0 text-xs bg-blue-50 text-blue-700 border border-blue-200"
            >
              {product.size}
            </Badge>
          )}{" "}
        </div>{" "}
        <div className="mt-auto pt-2">
          {" "}
          <p className="text-blue-600 font-bold">
            LKR {product.retailPrice.toFixed(2)}
          </p>{" "}
          <p className="text-xs text-slate-500">
            Wholesale: LKR {product.wholesalePrice.toFixed(2)}
          </p>{" "}
        </div>{" "}
      </div>{" "}
    </CardContent>{" "}
  </Card>
);
const ProductCardSimple = ({ product, onAddToCart }) => (
  <button
    onClick={() => onAddToCart(product)}
    className="w-full text-left p-3 border border-slate-200/80 bg-white rounded-lg hover:border-blue-400 hover:bg-blue-50/50 transition-colors flex justify-between items-center group"
  >
    {" "}
    <div>
      {" "}
      <p className="font-semibold text-sm text-slate-800 group-hover:text-blue-800">
        {product.name}
      </p>{" "}
      <p className="text-xs text-slate-500">{product.size}</p>{" "}
    </div>{" "}
    <div className="text-right">
      {" "}
      <p className="font-bold text-sm text-blue-600">
        LKR {product.retailPrice.toFixed(2)}
      </p>{" "}
      <p className="text-xs text-slate-500">
        WS: {product.wholesalePrice.toFixed(2)}
      </p>{" "}
    </div>{" "}
  </button>
);

// --- CartItemCard with UI & Workflow Fixes ---
const CartItemCard = forwardRef(
  ({ item, dispatch, isSelected, onEnterPress }, ref) => {
    const discountAmount = item.price * item.quantity * (item.discount / 100);
    const netTotal = item.price * item.quantity - discountAmount;

    const handleQuantityChange = (newQuantity) => {
      const quantity = Math.max(0, newQuantity);
      if (quantity === 0) dispatch({ type: "REMOVE_ITEM", payload: item.id });
      else
        dispatch({ type: "UPDATE_ITEM", payload: { id: item.id, quantity } });
    };
    const handleDiscountChange = (newDiscount) => {
      const discount = Math.max(0, Math.min(100, newDiscount));
      dispatch({ type: "UPDATE_ITEM", payload: { id: item.id, discount } });
    };
    // FIX: Added KeyDown handler to listen for "Enter"
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onEnterPress();
      }
    };

    return (
      <div
        className={clsx(
          "p-4 rounded-xl border-2 transition-all duration-200",
          isSelected
            ? "bg-blue-50 border-blue-500 shadow-lg"
            : "bg-white border-transparent hover:border-slate-200"
        )}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            {/* FIX: Increased product name size */}
            <p className="font-bold text-lg text-slate-800">{item.name}</p>
            <div className="flex items-center gap-x-2 text-xs text-slate-500 mt-1">
              <span>{item.barcode}</span>
              {item.size && (
                <>
                  <span>&bull;</span>
                  <span>{item.size}</span>
                </>
              )}
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-red-500/80 hover:text-red-600 hover:bg-red-100 shrink-0 -mt-1 -mr-1"
            onClick={() => dispatch({ type: "REMOVE_ITEM", payload: item.id })}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-3 items-end">
          <div>
            <label className="text-xs text-slate-500 block">Price</label>
            {/* FIX: Reduced price font size */}
            <p className="font-medium text-sm text-slate-700">
              LKR {item.price.toFixed(2)}
            </p>
          </div>
          {/* FIX: Made quantity input flexible to prevent hiding on resize */}
          <div className="flex items-center gap-1.5 min-w-[110px]">
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 bg-white flex-shrink-0"
              onClick={() => handleQuantityChange(item.quantity - 1)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              ref={ref}
              onKeyDown={handleKeyDown}
              type="number"
              value={item.quantity}
              onChange={(e) => handleQuantityChange(Number(e.target.value))}
              className="h-8 w-full min-w-0 text-center text-base font-semibold p-0 bg-white"
            />
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 bg-white flex-shrink-0"
              onClick={() => handleQuantityChange(item.quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div>
            <label className="text-xs text-slate-500 block">Discount %</label>
            <Input
              type="number"
              value={item.discount}
              onChange={(e) => handleDiscountChange(Number(e.target.value))}
              className="h-8 w-full md:w-20 text-center text-sm p-1 bg-white"
            />
          </div>
          <div className="hidden lg:block">
            <label className="text-xs text-slate-500 block">
              Discount Amt.
            </label>
            <p className="font-medium text-red-600">
              - LKR {discountAmount.toFixed(2)}
            </p>
          </div>
          <div className="col-span-2 md:col-span-1 lg:col-span-2 text-right">
            <label className="text-xs text-slate-500 block">Amount</label>
            <p className="font-bold text-2xl text-blue-700">
              LKR {netTotal.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    );
  }
);
CartItemCard.displayName = "CartItemCard";

// --- Main POS Page Component ---
export default function PosPage() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [editMode, setEditMode] = useState("search");
  const [selectedCartIndex, setSelectedCartIndex] = useState(0);
  const [showProductImages, setShowProductImages] = useState(true);
  const searchInputRef = useRef(null);
  const cartItemRefs = useRef(new Map());
  const initialState = { cart: [], customer: null, priceTier: "retail" };
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    setProducts(MOCK_PRODUCTS);
    setCustomers(MOCK_CUSTOMERS);
    searchInputRef.current?.focus();
  }, []);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );
  const totals = state.cart.reduce(
    (acc, item) => {
      const grossTotal = item.price * item.quantity;
      const discountAmount = grossTotal * (item.discount / 100);
      acc.subtotal += grossTotal;
      acc.totalDiscount += discountAmount;
      return acc;
    },
    { subtotal: 0, totalDiscount: 0 }
  );
  const tax = (totals.subtotal - totals.totalDiscount) * 0.08;
  const total = totals.subtotal - totals.totalDiscount + tax;

  // FIX: Removed focus from handleAddToCart to allow useEffect to manage it
  const handleAddToCart = (product) => {
    dispatch({
      type: "ADD_ITEM",
      payload: { product, priceTier: state.priceTier },
    });
    setProductSearch("");
    // searchInputRef.current?.focus(); // <-- THIS LINE WAS REMOVED
  };

  const handleSelectCustomer = (customer) => {
    dispatch({ type: "SET_CUSTOMER", payload: customer });
  };
  const resetSale = () => {
    dispatch({ type: "CLEAR_CART" });
    searchInputRef.current?.focus();
    setEditMode("search");
  };

  // FIX: This function now correctly returns focus to the search bar
  const focusOnSearch = () => {
    setEditMode("search");
    searchInputRef.current?.focus();
    searchInputRef.current?.select();
  };

  // FIX: This effect now correctly focuses on the new item's quantity input
  useEffect(() => {
    if (state.cart.length > 0) {
      const lastItem = state.cart[state.cart.length - 1];
      const lastItemRef = cartItemRefs.current.get(lastItem.id);
      // Only shift focus if the search bar isn't the active element (e.g., after a click)
      if (lastItemRef && document.activeElement !== searchInputRef.current) {
        lastItemRef.focus();
        lastItemRef.select();
        setEditMode("cart");
        setSelectedCartIndex(state.cart.length - 1);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.cart.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === "q" || e.key === "Q") && (e.ctrlKey || !e.metaKey)) {
        e.preventDefault();
        focusOnSearch();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        if (state.cart.length > 0) {
          setEditMode("cart");
          setSelectedCartIndex(0);
          cartItemRefs.current.get(state.cart[0].id)?.focus();
        }
      }
      if (editMode === "cart" && state.cart.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          const nextIndex = Math.min(
            state.cart.length - 1,
            selectedCartIndex + 1
          );
          setSelectedCartIndex(nextIndex);
          cartItemRefs.current.get(state.cart[nextIndex].id)?.focus();
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          const prevIndex = Math.max(0, selectedCartIndex - 1);
          setSelectedCartIndex(prevIndex);
          cartItemRefs.current.get(state.cart[prevIndex].id)?.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editMode, selectedCartIndex, state.cart, focusOnSearch]);

  return (
    <div className="flex h-screen flex-col bg-slate-50 font-sans">
      <header className="flex items-center justify-between border-b bg-white p-4 lg:hidden shadow-sm">
        <h1 className="text-xl font-bold text-slate-800">POS System</h1>
        <Badge
          variant="secondary"
          className="px-2 py-1 bg-blue-100 text-blue-800 border-blue-200"
        >
          <ShoppingCart className="h-3 w-3 mr-1.5" />
          {state.cart.length}
        </Badge>
      </header>
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="flex-1 lg:flex">
          <ResizablePanel defaultSize={35} minSize={30}>
            <aside className="flex flex-col h-full border-r border-slate-200/60 bg-white">
              <header className="p-4 border-b border-slate-200/60">
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      ref={searchInputRef}
                      placeholder="Search products... (Ctrl+Q)"
                      className="pl-11 h-12 text-base bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      onFocus={() => setEditMode("search")}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
                    <CustomerSelector
                      customers={customers}
                      selectedCustomer={state.customer}
                      onSelectCustomer={handleSelectCustomer}
                    />
                    <Button
                      variant="outline"
                      className="h-11 bg-white"
                      onClick={() => setShowProductImages(!showProductImages)}
                      title={
                        showProductImages
                          ? "Switch to list view"
                          : "Switch to grid view"
                      }
                    >
                      {showProductImages ? (
                        <List className="h-5 w-5" />
                      ) : (
                        <ImageIcon className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </header>
              <div className="flex-1 p-4 overflow-y-auto bg-slate-50/50">
                {showProductImages ? (
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredProducts.map((p) => (
                      <ProductCardWithImage
                        key={p.id}
                        product={p}
                        onAddToCart={handleAddToCart}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {filteredProducts.map((p) => (
                      <ProductCardSimple
                        key={p.id}
                        product={p}
                        onAddToCart={handleAddToCart}
                      />
                    ))}
                  </div>
                )}
              </div>
            </aside>
          </ResizablePanel>
          <ResizableHandle withHandle className="bg-slate-100 hidden lg:flex" />
          <ResizablePanel defaultSize={65} minSize={40}>
            <main className="flex flex-col h-full">
              <header className="p-4 border-b border-slate-200/60 bg-white/80 backdrop-blur-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                    <h2 className="text-xl font-bold text-slate-800">
                      Current Sale
                    </h2>
                    {state.cart.length > 0 && (
                      <Badge
                        variant="secondary"
                        className="px-2.5 py-1 text-sm bg-blue-100 text-blue-800 border-blue-200"
                      >
                        {state.cart.length} items
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="hidden md:flex rounded-lg border bg-slate-100 p-0.5">
                      <Button
                        variant={
                          state.priceTier === "retail" ? "secondary" : "ghost"
                        }
                        className="h-8 rounded-md text-sm shadow-sm bg-white data-[state=active]:bg-white"
                        onClick={() =>
                          dispatch({
                            type: "SET_PRICE_TIER",
                            payload: "retail",
                          })
                        }
                      >
                        Retail
                      </Button>
                      <Button
                        variant={
                          state.priceTier === "wholesale"
                            ? "secondary"
                            : "ghost"
                        }
                        className="h-8 rounded-md text-sm data-[state=active]:bg-white"
                        onClick={() =>
                          dispatch({
                            type: "SET_PRICE_TIER",
                            payload: "wholesale",
                          })
                        }
                      >
                        Wholesale
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 text-red-600 hover:text-red-700 hover:bg-red-50/80 border-red-200/80 bg-white"
                      onClick={resetSale}
                    >
                      <X className="h-4 w-4 mr-1.5" />
                      Clear
                    </Button>
                  </div>
                </div>
              </header>
              <div className="flex-1 p-4 overflow-y-auto bg-slate-100/60">
                {state.cart.length > 0 ? (
                  <div className="space-y-4 max-w-5xl mx-auto">
                    {state.cart.map((item, index) => (
                      <CartItemCard
                        key={item.id}
                        item={item}
                        dispatch={dispatch}
                        isSelected={
                          editMode === "cart" && selectedCartIndex === index
                        }
                        onEnterPress={focusOnSearch}
                        ref={(el) => {
                          if (el) cartItemRefs.current.set(item.id, el);
                          else cartItemRefs.current.delete(item.id);
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <ShoppingCart className="h-20 w-20 mb-4 opacity-10" />
                    <p className="text-lg font-medium mb-2">
                      Your cart is empty
                    </p>
                    <p className="text-sm text-center">
                      Add products from the left panel to begin a sale.
                    </p>
                  </div>
                )}
              </div>
              <footer className="border-t border-slate-200/60 bg-white/80 backdrop-blur-sm p-4 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.02)]">
                {state.cart.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-7xl mx-auto items-center">
                    {" "}
                    <div className="lg:col-span-5 space-y-2.5 bg-slate-50/80 p-4 rounded-xl border border-slate-200/80">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Subtotal</span>
                        <span className="font-medium text-slate-800">
                          LKR {totals.subtotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Discount</span>
                        <span className="font-medium text-red-600">
                          - LKR {totals.totalDiscount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Tax (8%)</span>
                        <span className="font-medium text-slate-800">
                          LKR {tax.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xl font-bold text-blue-700 pt-3 border-t border-slate-200 mt-3">
                        <span className="text-slate-900">Total</span>
                        <span>LKR {total.toFixed(2)}</span>
                      </div>
                    </div>{" "}
                    <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-3">
                      <Button
                        variant="outline"
                        className="h-16 flex-col gap-1 text-xs bg-white"
                      >
                        <ListRestart className="h-5 w-5 text-amber-600" />
                        Hold Sale
                      </Button>
                      <Button
                        variant="outline"
                        className="h-16 flex-col gap-1 text-xs bg-white"
                      >
                        <CreditCard className="h-5 w-5 text-indigo-600" />
                        Pay by Card
                      </Button>
                      <Button
                        variant="outline"
                        className="h-16 flex-col gap-1 text-xs bg-white"
                      >
                        <Wallet className="h-5 w-5 text-emerald-600" />
                        Pay by Cash
                      </Button>
                      <Button className="h-16 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all flex-col gap-1 col-span-2 md:col-span-1">
                        <DollarSign className="h-6 w-6" />
                        PAY
                      </Button>
                    </div>{" "}
                  </div>
                )}
              </footer>
            </main>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
