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
  MonitorX,
  Calculator,
  Maximize,
  Minimize,
  Archive, // For Hold List / Sale List
  PackageSearch, // For Check Stock
  Printer, // For Reprint
  ArrowLeftRight, // For Transfer
  Undo, // For Return
  Tag, // For Change Price & Voucher
  FlaskConical, // For Branch Item
  ChevronDown,
} from "lucide-react";

// --- Mock Data ---
const MOCK_PRODUCTS = [
  {
    id: "1",
    barcode: "8990001001",
    name: "Espresso",
    size: "Short",
    retailPrice: 450.0,
    wholesalePrice: 400.0,
    imageUrl:
      "https://images.unsplash.com/photo-1579992308814-569b01534026?q=80&w=2592&auto=format&fit=crop",
  },
  {
    id: "2",
    barcode: "8990001002",
    name: "Latte",
    size: "Tall",
    retailPrice: 600.0,
    wholesalePrice: 550.0,
    imageUrl:
      "https://images.unsplash.com/photo-1563868013082-af329a4993a2?q=80&w=2592&auto=format&fit=crop",
  },
  {
    id: "3",
    barcode: "8990001003",
    name: "Cappuccino",
    size: "Grande",
    retailPrice: 600.0,
    wholesalePrice: 550.0,
    imageUrl:
      "https://images.unsplash.com/photo-1517701552125-7853223aa125?q=80&w=2538&auto=format&fit=crop",
  },
  {
    id: "4",
    barcode: "8990001004",
    name: "Croissant",
    size: "Regular",
    retailPrice: 550.0,
    wholesalePrice: 500.0,
    imageUrl:
      "https://images.unsplash.com/photo-1587241321921-91a834d6d194?q=80&w=2700&auto=format&fit=crop",
  },
  {
    id: "5",
    barcode: "8990001005",
    name: "Iced Americano",
    size: "Venti",
    retailPrice: 500.0,
    wholesalePrice: 450.0,
    imageUrl:
      "https://images.unsplash.com/photo-1517701552125-7853223aa125?q=80&w=2538&auto=format&fit=crop",
  },
  {
    id: "6",
    barcode: "8990001006",
    name: "Chocolate Muffin",
    size: "Large",
    retailPrice: 650.0,
    wholesalePrice: 600.0,
    imageUrl:
      "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=2564&auto=format&fit=crop",
  },
];
const MOCK_CUSTOMERS = [
  { id: "1", name: "Nimal Perera", phone: "0771234567" },
  { id: "2", name: "Sunil Traders", phone: "0112345678" },
  { id: "3", name: "Kamala Silva", phone: "0718901234" },
];
const MOCK_USERS = [
  { id: "user1", name: "Kasun" },
  { id: "user2", name: "Ayesha" },
  { id: "user3", name: "Admin" },
];

// --- State Management ---
function appReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const { product } = action.payload;
      const price = state.isWholesale
        ? product.wholesalePrice
        : product.retailPrice;
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
    case "TOGGLE_WHOLESALE": {
      const { isWholesale } = action.payload;
      const updatedCart = state.cart.map((item) => {
        const product = MOCK_PRODUCTS.find((p) => p.id === item.id);
        if (!product) return item;
        return {
          ...item,
          price: isWholesale ? product.wholesalePrice : product.retailPrice,
        };
      });
      return {
        ...state,
        isWholesale,
        cart: updatedCart,
      };
    }
    case "CLEAR_CART":
      return { ...state, customer: null, cart: [], isWholesale: false };
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
                <div className="text-left">
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {customer.phone}
                  </p>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
const UserSelector = ({ users, selectedUser, onSelectUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative w-full">
      <Button
        variant="outline"
        className="h-16 w-full justify-between items-center text-left bg-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div>
          <p className="text-xs text-slate-500">Sold By</p>
          <p className="font-semibold text-slate-800">
            {selectedUser ? selectedUser.name : "Select User"}
          </p>
        </div>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </Button>
      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border rounded-lg shadow-xl z-10 p-2">
          <div className="max-h-48 overflow-y-auto">
            {users.map((user) => (
              <Button
                key={user.id}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  onSelectUser(user);
                  setIsOpen(false);
                }}
              >
                {user.name}
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
    <CardContent className="p-0 flex-1 flex flex-col">
      <div className="overflow-hidden">
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
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col bg-white">
        <div className="flex justify-between items-start mb-1">
          <p className="font-semibold text-sm text-slate-800 flex-1">
            {product.name}
          </p>
          {product.size && (
            <Badge
              variant="secondary"
              className="ml-2 shrink-0 text-xs bg-blue-50 text-blue-700 border border-blue-200"
            >
              {product.size}
            </Badge>
          )}
        </div>
        <div className="mt-auto pt-2">
          <p className="text-blue-600 font-bold">
            LKR {product.retailPrice.toFixed(2)}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
);
const ProductCardSimple = ({ product, onAddToCart }) => (
  <button
    onClick={() => onAddToCart(product)}
    className="w-full text-left p-3 border border-slate-200/80 bg-white rounded-lg hover:border-blue-400 hover:bg-blue-50/50 transition-colors flex justify-between items-center group"
  >
    <div>
      <p className="font-semibold text-sm text-slate-800 group-hover:text-blue-800">
        {product.name}
      </p>
      <p className="text-xs text-slate-500">{product.size}</p>
    </div>
    <div className="text-right">
      <p className="font-bold text-sm text-blue-600">
        LKR {product.retailPrice.toFixed(2)}
      </p>
    </div>
  </button>
);
const CartItemCard = forwardRef(
  ({ item, dispatch, isSelected, onEnterPress }, ref) => {
    const netTotal = item.price * item.quantity * (1 - item.discount / 100);
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
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onEnterPress();
      }
    };
    return (
      <div
        className={clsx(
          "group flex items-center gap-x-4 p-2 rounded-lg border-2 transition-all duration-200",
          isSelected
            ? "bg-blue-50 border-blue-500 shadow-md"
            : "bg-white border-transparent hover:border-slate-200"
        )}
      >
        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800 truncate">{item.name}</p>
          <p className="text-xs text-slate-500">
            {item.barcode} {item.size && `• ${item.size}`}
          </p>
        </div>

        {/* Price */}
        <div className="w-24 shrink-0 text-right">
          <label className="text-xs text-slate-500 block">Price</label>
          <p className="font-medium text-sm text-slate-700">
            {item.price.toFixed(2)}
          </p>
        </div>

        {/* Quantity */}
        <div className="flex shrink-0 items-center gap-1.5 w-[120px]">
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

        {/* Discount */}
        <div className="w-24 shrink-0">
          <label className="text-xs text-slate-500 block text-center">
            Discount
          </label>
          <div className="relative">
            <Input
              type="number"
              value={item.discount}
              onChange={(e) => handleDiscountChange(Number(e.target.value))}
              className="h-8 w-full text-center text-sm p-1 bg-white pr-5"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
              %
            </span>
          </div>
        </div>

        {/* Amount */}
        <div className="w-32 shrink-0 text-right">
          <label className="text-xs text-slate-500 block">Amount</label>
          <p className="font-bold text-lg text-blue-700">
            {netTotal.toFixed(2)}
          </p>
        </div>

        {/* Delete Button */}
        <div className="w-8 shrink-0">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-red-500/70 hover:text-red-600 hover:bg-red-100 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
            onClick={() => dispatch({ type: "REMOVE_ITEM", payload: item.id })}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }
);
CartItemCard.displayName = "CartItemCard";
const CalculatorModal = ({ onClose }) => {
  const [displayValue, setDisplayValue] = useState("0");
  const [operator, setOperator] = useState(null);
  const [previousValue, setPreviousValue] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const handleNumberClick = (num) => {
    if (waitingForOperand) {
      setDisplayValue(String(num));
      setWaitingForOperand(false);
    } else {
      setDisplayValue(displayValue === "0" ? String(num) : displayValue + num);
    }
  };
  const handleOperatorClick = (op) => {
    const inputValue = parseFloat(displayValue);
    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operator) {
      const result = performCalculation();
      setPreviousValue(result);
      setDisplayValue(String(result));
    }
    setWaitingForOperand(true);
    setOperator(op);
  };
  const performCalculation = () => {
    const inputValue = parseFloat(displayValue);
    if (operator === "+") return previousValue + inputValue;
    if (operator === "-") return previousValue - inputValue;
    if (operator === "*") return previousValue * inputValue;
    if (operator === "/") return previousValue / inputValue;
    return inputValue;
  };
  const handleEqualsClick = () => {
    if (!operator) return;
    const result = performCalculation();
    setDisplayValue(String(result));
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  };
  const handleClearClick = () => {
    setDisplayValue("0");
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  };
  const handleDecimalClick = () => {
    if (!displayValue.includes(".")) setDisplayValue(displayValue + ".");
  };
  const calcButtons = [
    "7",
    "8",
    "9",
    "/",
    "4",
    "5",
    "6",
    "*",
    "1",
    "2",
    "3",
    "-",
    "0",
    ".",
    "=",
    "+",
  ];
  const handleButtonClick = (btn) => {
    if (!isNaN(parseInt(btn))) handleNumberClick(btn);
    else if (["/", "*", "-", "+"].includes(btn)) handleOperatorClick(btn);
    else if (btn === "=") handleEqualsClick();
    else if (btn === ".") handleDecimalClick();
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-80"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Calculator</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4">
          <div className="bg-slate-100 text-right text-4xl font-mono p-4 rounded-lg mb-4 break-all">
            {displayValue}
          </div>
          <div className="grid grid-cols-4 gap-2">
            <Button
              onClick={handleClearClick}
              className="col-span-4 h-14 text-xl bg-amber-500 hover:bg-amber-600"
            >
              C
            </Button>
            {calcButtons.map((btn) => (
              <Button
                key={btn}
                onClick={() => handleButtonClick(btn)}
                variant={
                  isNaN(parseInt(btn)) && btn !== "." ? "secondary" : "outline"
                }
                className="h-14 text-xl"
              >
                {btn}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
const ReprintModal = ({ onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-xl shadow-2xl w-full max-w-md"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-bold text-slate-800">Reprint Invoice</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-6 text-center">
        <p className="text-slate-600">
          A list of recent invoices and held sales would appear here.
        </p>
      </div>
    </div>
  </div>
);

// --- Main POS Page Component ---
export default function PosPage() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [editMode, setEditMode] = useState("search");
  const [selectedCartIndex, setSelectedCartIndex] = useState(0);
  const [showProductImages, setShowProductImages] = useState(true);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isReprintModalOpen, setIsReprintModalOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [adjustment, setAdjustment] = useState(0);
  const [cashIn, setCashIn] = useState(0);
  const [soldBy, setSoldBy] = useState(null);
  const [wholesaleDiscount, setWholesaleDiscount] = useState(0);

  const searchInputRef = useRef(null);
  const cartItemRefs = useRef(new Map());
  const initialState = { cart: [], customer: null, isWholesale: false };
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setProducts(MOCK_PRODUCTS);
    setCustomers(MOCK_CUSTOMERS);
    setUsers(MOCK_USERS);
    setSoldBy(MOCK_USERS[0]);
    searchInputRef.current?.focus();
  }, []);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const totals = state.cart.reduce(
    (acc, item) => {
      const grossTotal = item.price * item.quantity;
      const itemDiscountAmount = grossTotal * (item.discount / 100);
      acc.subtotal += grossTotal;
      acc.totalItemDiscount += itemDiscountAmount;
      return acc;
    },
    { subtotal: 0, totalItemDiscount: 0 }
  );

  const wholesaleDiscountAmount = state.isWholesale
    ? totals.subtotal * (wholesaleDiscount / 100)
    : 0;
  const totalDiscount = totals.totalItemDiscount + wholesaleDiscountAmount;
  const subtotalAfterDiscounts = totals.subtotal - totalDiscount;
  const tax = subtotalAfterDiscounts * 0.08;
  const grandTotal = subtotalAfterDiscounts + tax;
  const netTotal = grandTotal + adjustment;
  const balance = cashIn > 0 ? cashIn - netTotal : 0;

  const handleAddToCart = (product) => {
    const existingItemIndex = state.cart.findIndex(
      (item) => item.id === product.id
    );

    if (existingItemIndex > -1) {
      // If item exists, focus it in the cart
      setSelectedCartIndex(existingItemIndex);
      const existingItem = state.cart[existingItemIndex];
      const itemRef = cartItemRefs.current.get(existingItem.id);
      if (itemRef) {
        itemRef.focus();
        itemRef.select();
        itemRef
          .closest(".group")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      setEditMode("cart");
    }

    dispatch({ type: "ADD_ITEM", payload: { product } });
    setProductSearch("");
  };

  const handleSelectCustomer = (customer) => {
    dispatch({ type: "SET_CUSTOMER", payload: customer });
  };
  const resetSale = () => {
    dispatch({ type: "CLEAR_CART" });
    setAdjustment(0);
    setCashIn(0);
    setWholesaleDiscount(0);
    searchInputRef.current?.focus();
    setEditMode("search");
  };
  const focusOnSearch = () => {
    setEditMode("search");
    searchInputRef.current?.focus();
    searchInputRef.current?.select();
  };
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  const handleWholesaleToggle = () => {
    const nextIsWholesale = !state.isWholesale;
    dispatch({
      type: "TOGGLE_WHOLESALE",
      payload: { isWholesale: nextIsWholesale },
    });
    if (!nextIsWholesale) {
      setWholesaleDiscount(0);
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () =>
      setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
  }, []);
  useEffect(() => {
    // This effect runs ONLY when a NEW item is added (cart length changes)
    if (state.cart.length > 0) {
      const lastItem = state.cart[state.cart.length - 1];
      const lastItemRef = cartItemRefs.current.get(lastItem.id);
      if (lastItemRef && document.activeElement !== searchInputRef.current) {
        lastItemRef.focus();
        lastItemRef.select();
        setEditMode("cart");
        setSelectedCartIndex(state.cart.length - 1);
      }
    }
  }, [state.cart.length]);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === "q" || e.key === "Q") && (e.ctrlKey || !e.metaKey)) {
        e.preventDefault();
        focusOnSearch();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        if (isCalculatorOpen) setIsCalculatorOpen(false);
        else if (isReprintModalOpen) setIsReprintModalOpen(false);
        else if (state.cart.length > 0) {
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
  }, [
    editMode,
    selectedCartIndex,
    state.cart,
    focusOnSearch,
    isCalculatorOpen,
    isReprintModalOpen,
  ]);

  const utilityActions = [
    {
      label: "Hold Sale",
      icon: ListRestart,
      action: () => alert("Sale Held (placeholder)"),
    },
    {
      label: "Sale List",
      icon: Archive,
      action: () => alert("Show Hold List (placeholder)"),
    },
    {
      label: "Check Stock",
      icon: PackageSearch,
      action: () => alert("Navigate to Stock Page (placeholder)"),
    },
    {
      label: "Reprint",
      icon: Printer,
      action: () => setIsReprintModalOpen(true),
    },
    {
      label: "Return",
      icon: Undo,
      action: () => alert("Open Return Interface (placeholder)"),
    },
    {
      label: "Branch Item",
      icon: FlaskConical,
      action: () => alert("Branch Item Action (placeholder)"),
    },
    {
      label: "Transfer",
      icon: ArrowLeftRight,
      action: () => {},
      disabled: true,
    },
    { label: "Change Price", icon: Tag, action: () => {}, disabled: true },
  ];

  return (
    <>
      <div className="flex h-screen flex-col items-center justify-center bg-slate-100 p-4 text-center lg:hidden">
        <MonitorX className="h-16 w-16 text-slate-400" />
        <h1 className="mt-6 text-2xl font-bold text-slate-800">
          Optimal Experience on Larger Screens
        </h1>
        <p className="mt-2 max-w-sm text-slate-600">
          This POS system is designed for tablets and desktops. Please switch to
          a larger device to continue.
        </p>
      </div>

      <div className="hidden h-screen flex-col bg-slate-50 font-sans lg:flex">
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <ResizablePanelGroup
            direction="horizontal"
            className="flex-1 lg:flex"
          >
            <ResizablePanel defaultSize={35} minSize={30}>
              <aside className="flex flex-col h-full border-r border-slate-200/60 bg-white">
                <header className="p-4 border-b border-slate-200/60">
                  <div className="space-y-3">
                    <div className="relative w-full">
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
            <ResizableHandle
              withHandle
              className="bg-slate-100 hidden lg:flex"
            />
            <ResizablePanel defaultSize={65} minSize={40}>
              <main className="flex flex-col h-full">
                <header className="p-4 border-b border-slate-200/60 bg-white/80 backdrop-blur-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <ShoppingCart className="h-6 w-6 text-blue-600" />
                      <div>
                        <h2 className="text-xl font-bold text-slate-800">
                          Current Sale
                        </h2>
                        <p className="text-xs text-slate-500 -mt-0.5">
                          {currentDateTime.toLocaleString()}
                        </p>
                      </div>
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
                      <div className="flex items-center gap-2">
                        <Button
                          variant={state.isWholesale ? "secondary" : "outline"}
                          size="sm"
                          className="h-9 bg-white data-[state=active]:bg-white"
                          onClick={handleWholesaleToggle}
                        >
                          Wholesale
                        </Button>
                        {state.isWholesale && (
                          <div className="relative">
                            <Input
                              type="number"
                              placeholder="Discount"
                              className="h-9 w-28 pl-2 pr-7 text-sm bg-white"
                              value={wholesaleDiscount || ""}
                              onChange={(e) =>
                                setWholesaleDiscount(
                                  Math.max(0, Number(e.target.value))
                                )
                              }
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                              %
                            </span>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 bg-white"
                        onClick={() => setIsCalculatorOpen(true)}
                      >
                        <Calculator className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 bg-white"
                        onClick={toggleFullScreen}
                      >
                        {isFullScreen ? (
                          <Minimize className="h-4 w-4" />
                        ) : (
                          <Maximize className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 text-red-600 hover:text-red-700 hover:bg-red-50/80 border-red-200/80 bg-white"
                        onClick={resetSale}
                      >
                        <X className="h-4 w-4 mr-1.5" /> Clear
                      </Button>
                    </div>
                  </div>
                </header>
                <div className="flex-1 p-4 overflow-y-auto bg-slate-100/60">
                  {state.cart.length > 0 ? (
                    <div className="space-y-2 max-w-full mx-auto">
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
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-7xl mx-auto items-start">
                      <div className="lg:col-span-7 flex flex-col gap-3">
                        <div className="grid grid-cols-3 lg:grid-cols-4 gap-2">
                          {utilityActions.map((action) => (
                            <Button
                              key={action.label}
                              variant="outline"
                              className="h-16 flex-col gap-1.5 text-xs bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                              onClick={action.action}
                              disabled={action.disabled}
                            >
                              <action.icon className="h-5 w-5" />
                              <span className="text-center leading-tight">
                                {action.label}
                              </span>
                            </Button>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <UserSelector
                            users={users}
                            selectedUser={soldBy}
                            onSelectUser={setSoldBy}
                          />
                          <Button
                            variant="outline"
                            className="h-16 flex-col justify-center gap-1.5 text-xs bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800"
                          >
                            <CreditCard className="h-5 w-5 text-indigo-600" />
                            <span>Pay by Card</span>
                          </Button>
                          <Button
                            variant="outline"
                            className="h-16 flex-col justify-center gap-1.5 text-xs bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800"
                          >
                            <Wallet className="h-5 w-5 text-emerald-600" />
                            <span>Pay by Cash</span>
                          </Button>
                          <Button
                            variant="outline"
                            className="h-16 flex-col justify-center gap-1.5 text-xs bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800"
                          >
                            <Tag className="h-5 w-5 text-orange-500" />
                            <span>Pay by Voucher</span>
                          </Button>
                        </div>
                        <Button className="h-20 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3">
                          <DollarSign className="h-7 w-7" />
                          <span>PAY NOW (LKR {netTotal.toFixed(2)})</span>
                        </Button>
                      </div>
                      <div className="lg:col-span-5 space-y-2.5 bg-slate-50/80 p-4 rounded-xl border border-slate-200/80">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Subtotal</span>
                          <span className="font-medium text-slate-800">
                            LKR {totals.subtotal.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Item Discounts</span>
                          <span className="font-medium text-red-600">
                            - LKR {totals.totalItemDiscount.toFixed(2)}
                          </span>
                        </div>
                        {state.isWholesale && wholesaleDiscount > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">
                              Wholesale Discount ({wholesaleDiscount}%)
                            </span>
                            <span className="font-medium text-red-600">
                              - LKR {wholesaleDiscountAmount.toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Tax (8%)</span>
                          <span className="font-medium text-slate-800">
                            LKR {tax.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-base font-semibold pt-2 border-t mt-2">
                          <span className="text-slate-800">Grand Total</span>
                          <span className="text-slate-900">
                            LKR {grandTotal.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-600">Adjustment</span>
                          <Input
                            type="number"
                            className="h-8 max-w-[120px] text-right bg-white"
                            value={adjustment}
                            onChange={(e) =>
                              setAdjustment(parseFloat(e.target.value) || 0)
                            }
                          />
                        </div>
                        <div className="flex justify-between text-2xl font-bold text-blue-700 pt-3 border-t border-slate-200 mt-3">
                          <span className="text-slate-900">Net Total</span>
                          <span>LKR {netTotal.toFixed(2)}</span>
                        </div>
                        <div className="col-span-2 md:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1.5">
                              Cash In
                            </label>
                            <Input
                              type="number"
                              placeholder="0.00"
                              className="h-12 text-lg font-semibold bg-white"
                              value={cashIn || ""}
                              onChange={(e) =>
                                setCashIn(parseFloat(e.target.value) || 0)
                              }
                            />
                          </div>
                          <div className="text-right">
                            <label className="text-sm font-medium text-slate-700 block mb-1.5">
                              Balance
                            </label>
                            <div className="h-12 flex items-center justify-end rounded-lg bg-emerald-100 text-emerald-700 font-bold text-3xl px-4">
                              {balance.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </footer>
              </main>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
        {isCalculatorOpen && (
          <CalculatorModal onClose={() => setIsCalculatorOpen(false)} />
        )}
        {isReprintModalOpen && (
          <ReprintModal onClose={() => setIsReprintModalOpen(false)} />
        )}
      </div>
    </>
  );
}
