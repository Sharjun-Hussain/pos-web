"use client";

import { useState, useEffect, useReducer, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  UserPlus,
  Trash2,
  Plus,
  Minus,
  FileText,
  ListRestart,
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

// --- Mock Data (Replace with your API calls) ---
const MOCK_PRODUCTS = [
  {
    id: "1",
    barcode: "8990001001",
    name: "Espresso",
    retailPrice: 450.0,
    wholesalePrice: 400.0,
  },
  {
    id: "2",
    barcode: "8990001002",
    name: "Latte",
    retailPrice: 600.0,
    wholesalePrice: 550.0,
  },
  {
    id: "3",
    barcode: "8990001003",
    name: "Cappuccino",
    retailPrice: 600.0,
    wholesalePrice: 550.0,
  },
  {
    id: "4",
    barcode: "8990001004",
    name: "Croissant",
    retailPrice: 550.0,
    wholesalePrice: 500.0,
  },
  {
    id: "5",
    barcode: "8990001005",
    name: "Iced Americano",
    retailPrice: 500.0,
    wholesalePrice: 450.0,
  },
  {
    id: "6",
    barcode: "8990001006",
    name: "Chocolate Muffin",
    retailPrice: 650.0,
    wholesalePrice: 600.0,
  },
];

const MOCK_CUSTOMERS = [
  { id: "1", name: "Nimal Perera", phone: "0771234567" },
  { id: "2", name: "Sunil Traders", phone: "0112345678" },
  { id: "3", name: "Kamala Silva", phone: "0718901234" },
];

// --- State Management with useReducer ---
function appReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const { product, priceTier } = action.payload;
      const price =
        priceTier === "retail" ? product.retailPrice : product.wholesalePrice;
      const existingItem = state.cart.find((item) => item.id === product.id);
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return {
        ...state,
        cart: [
          ...state.cart,
          { id: product.id, name: product.name, quantity: 1, price },
        ],
      };
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        cart: state.cart.filter((item) => item.id !== action.payload),
      };
    case "UPDATE_QUANTITY": {
      const { id, quantity } = action.payload;
      if (quantity <= 0)
        return { ...state, cart: state.cart.filter((item) => item.id !== id) };
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.id === id ? { ...item, quantity } : item
        ),
      };
    }
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

function CustomerDialog({ customers, onSelectCustomer }) {
  const [searchTerm, setSearchTerm] = useState("");
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Select Customer</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-4">
        <Input
          placeholder="Search by name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
          {filteredCustomers.map((customer) => (
            <Button
              key={customer.id}
              variant="ghost"
              className="justify-start"
              onClick={() => onSelectCustomer(customer)}
            >
              <div className="text-left">
                <p>{customer.name}</p>
                <p className="text-xs text-muted-foreground">
                  {customer.phone}
                </p>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </DialogContent>
  );
}

export default function PosPage() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const searchInputRef = useRef(null);
  const searchWrapperRef = useRef(null);

  const initialState = { cart: [], customer: null, priceTier: "retail" };
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Debounce search input
  useEffect(() => {
    if (searchQuery.length < 1) {
      setIsSearchOpen(false);
      return;
    }
    const handler = setTimeout(() => {
      const results = MOCK_PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.barcode.includes(searchQuery)
      );
      setSearchResults(results);
      setIsSearchOpen(results.length > 0);
      setHighlightedIndex(-1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Keyboard Shortcuts and Global Click Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "F2") {
        e.preventDefault();
        console.log("ACTION: Process Cash Payment");
      }
      if (e.key === "F3") {
        e.preventDefault();
        console.log("ACTION: Process Card Payment");
      }
      if (e.key === "F4") {
        e.preventDefault();
        console.log("ACTION: Hold Sale");
      }

      if (isSearchOpen) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setHighlightedIndex((prev) => (prev + 1) % searchResults.length);
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setHighlightedIndex(
            (prev) => (prev - 1 + searchResults.length) % searchResults.length
          );
        }
        if (e.key === "Enter" && highlightedIndex > -1) {
          e.preventDefault();
          handleAddToCart(searchResults[highlightedIndex]);
        }
        if (e.key === "Escape") {
          setIsSearchOpen(false);
        }
      }
    };
    const handleClickOutside = (e) => {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(e.target)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchOpen, searchResults, highlightedIndex]);

  // Simulate fetching initial data
  useEffect(() => {
    setTimeout(() => {
      setProducts(MOCK_PRODUCTS);
      setCustomers(MOCK_CUSTOMERS);
      searchInputRef.current?.focus();
    }, 500);
  }, []);

  const handleAddToCart = (product) => {
    dispatch({
      type: "ADD_ITEM",
      payload: { product, priceTier: state.priceTier },
    });
    setSearchQuery("");
    setIsSearchOpen(false);
    searchInputRef.current?.focus();
  };

  const handleSelectCustomer = (customer) => {
    dispatch({ type: "SET_CUSTOMER", payload: customer });
    setIsCustomerModalOpen(false);
  };

  const subtotal = state.cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <Dialog open={isCustomerModalOpen} onOpenChange={setIsCustomerModalOpen}>
      <div className="h-screen bg-muted/20 flex flex-col text-sm">
        {/* TOP COMMAND BAR */}
        <header className="flex items-center gap-3 border-b bg-background p-3">
          <SidebarTrigger />
          <div className="relative flex-1" ref={searchWrapperRef}>
            <Input
              ref={searchInputRef}
              placeholder="Scan Barcode or Search Products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 text-base"
            />
            {isSearchOpen && (
              <div className="absolute top-full mt-1 w-full bg-background border rounded-md shadow-lg z-10">
                {searchResults.map((product, index) => (
                  <button
                    key={product.id}
                    onClick={() => handleAddToCart(product)}
                    className={`w-full text-left p-3 hover:bg-muted ${
                      highlightedIndex === index ? "bg-muted" : ""
                    }`}
                  >
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      LKR {product.retailPrice.toFixed(2)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
          <DialogTrigger asChild>
            <Button variant="ghost" className="h-11 px-3">
              <UserPlus className="mr-2 h-4 w-4" />
              {state.customer ? state.customer.name.split(" ")[0] : "Customer"}
            </Button>
          </DialogTrigger>
        </header>

        {/* MAIN AREA */}
        <main className="flex-1 p-3 overflow-hidden">
          <Card className="h-full flex flex-col">
            <CardContent className="p-0 flex-1 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[55%]">Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.cart.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium py-2">
                        {item.name}
                      </TableCell>
                      <TableCell className="py-2">
                        LKR {item.price.toFixed(2)}
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-6 w-6"
                            onClick={() =>
                              dispatch({
                                type: "UPDATE_QUANTITY",
                                payload: {
                                  id: item.id,
                                  quantity: item.quantity - 1,
                                },
                              })
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-base font-semibold">
                            {item.quantity}
                          </span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-6 w-6"
                            onClick={() =>
                              dispatch({
                                type: "UPDATE_QUANTITY",
                                payload: {
                                  id: item.id,
                                  quantity: item.quantity + 1,
                                },
                              })
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold py-2">
                        LKR {(item.price * item.quantity).toFixed(2)}
                      </TableCell>
                      <TableCell className="py-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-red-500"
                          onClick={() =>
                            dispatch({ type: "REMOVE_ITEM", payload: item.id })
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {state.cart.length === 0 && (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Scan or search to begin a new sale.
                </div>
              )}
            </CardContent>
          </Card>
        </main>

        {/* FOOTER ACTION BAR */}
        <footer className="grid grid-cols-12 gap-3 border-t bg-background p-3">
          <div className="col-span-5 flex flex-col justify-center space-y-1">
            <div className="flex justify-between text-md">
              <span className="text-muted-foreground">Subtotal</span>
              <span>LKR {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-md">
              <span className="text-muted-foreground">Tax</span>
              <span>LKR {tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-primary">
              <span>Total</span>
              <span>LKR {total.toFixed(2)}</span>
            </div>
          </div>
          <div className="col-span-7 grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="h-full flex-col gap-1 text-base"
            >
              <ListRestart className="h-5 w-5" />
              Hold (F4)
            </Button>
            <Button
              variant="destructive"
              className="h-full flex-col gap-1 text-base"
              onClick={() => dispatch({ type: "CLEAR_CART" })}
            >
              Cancel
            </Button>
            <div className="flex rounded-md border h-full">
              <Button
                variant={state.priceTier === "retail" ? "secondary" : "ghost"}
                className="h-full flex-1 rounded-r-none"
                onClick={() =>
                  dispatch({ type: "SET_PRICE_TIER", payload: "retail" })
                }
              >
                Retail
              </Button>
              <Button
                variant={
                  state.priceTier === "wholesale" ? "secondary" : "ghost"
                }
                className="h-full flex-1 rounded-l-none"
                onClick={() =>
                  dispatch({ type: "SET_PRICE_TIER", payload: "wholesale" })
                }
              >
                Wholesale
              </Button>
            </div>
            <Button className="h-full col-span-3 text-xl font-bold bg-green-600 hover:bg-green-700">
              PAY (F2/F3)
            </Button>
          </div>
        </footer>
      </div>
      <CustomerDialog
        customers={customers}
        onSelectCustomer={handleSelectCustomer}
      />
    </Dialog>
  );
}
