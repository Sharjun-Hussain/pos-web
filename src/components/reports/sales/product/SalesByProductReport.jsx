"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useReactToPrint } from "react-to-print"; // Modern usage
import {
  Printer,
  FileText,
  Download,
  Search,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { SalesByProductPrintTemplate } from "@/components/Template/sales/SalesByProductTemplate";

// Import the template


// --- MOCK DATA ---
const MOCK_PRODUCTS = [
  { id: 1, name: "Pro Wireless Mouse", sku: "LOG-M512", category: "Electronics", brand: "Logitech", sold: 85, price: 89.99, sales: 7649.15, profit: 2125.00 },
  { id: 2, name: "Classic Crew T-Shirt", sku: "APP-TS01-BLK", category: "Apparel", brand: "Nike", sold: 72, price: 25.00, sales: 1800.00, profit: 900.00 },
  { id: 3, name: "4K Gaming Monitor", sku: "MON-4K-27-G", category: "Electronics", brand: "Dell", sold: 30, price: 749.99, sales: 22499.70, profit: 4500.00 },
  { id: 4, name: "USB-C Hub", sku: "ACC-HUB-C7", category: "Accessories", brand: "Anker", sold: 68, price: 45.50, sales: 3094.00, profit: 1360.00 },
  { id: 5, name: "Organic Whole Bean Coffee", sku: "COF-WB-ORG-1", category: "Groceries", brand: "Lavazza", sold: 110, price: 15.99, sales: 1758.90, profit: 660.00 },
  { id: 6, name: "Ergonomic Office Chair", sku: "FUR-CHR-88B", category: "Furniture", brand: "Herman Miller", sold: 15, price: 350.00, sales: 5250.00, profit: 1125.00 },
  { id: 7, name: "Bluetooth Speaker", sku: "AUD-BT-SPK", category: "Electronics", brand: "JBL", sold: 45, price: 120.00, sales: 5400.00, profit: 1800.00 },
  { id: 8, name: "Running Shoes", sku: "SHOE-RUN-09", category: "Apparel", brand: "Adidas", sold: 25, price: 110.00, sales: 2750.00, profit: 1250.00 },
];

export default function SalesByProductPage() {
  // --- STATES ---
  const [date, setDate] = useState({ from: new Date(2023, 9, 1), to: new Date() });
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [brand, setBrand] = useState("All");
  const [store, setStore] = useState("All Branches");
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);

  // --- FILTER LOGIC ---
  const filteredData = useMemo(() => {
    return MOCK_PRODUCTS.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = category === "All" || item.category === category;
      const matchesBrand = brand === "All" || item.brand === brand;
      return matchesSearch && matchesCategory && matchesBrand;
    });
  }, [searchQuery, category, brand]);

  // --- STATS CALCULATION ---
  const stats = useMemo(() => {
    const totalSold = filteredData.reduce((acc, curr) => acc + curr.sold, 0);
    const totalRevenue = filteredData.reduce((acc, curr) => acc + curr.sales, 0);
    const totalProfit = filteredData.reduce((acc, curr) => acc + curr.profit, 0);
    const topSellingItem = [...filteredData].sort((a, b) => b.sold - a.sold)[0];
    const topRevenueItem = [...filteredData].sort((a, b) => b.sales - a.sales)[0];

    return { totalSold, totalRevenue, totalProfit, topSellingItem, topRevenueItem };
  }, [filteredData]);

  // --- CHART DATA PREP (Top 5) ---
  const chartData = useMemo(() => {
    return [...filteredData]
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5)
      .map(item => ({ name: item.name, sold: item.sold }));
  }, [filteredData]);

  // --- PRINT FUNCTIONALITY (FIXED) ---
  const printRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef, // Updated syntax
    documentTitle: "Sales_By_Product_Report",
  });

  // --- CSV EXPORT ---
  const handleExportCSV = () => {
    const headers = ["Product Name", "SKU", "Category", "Brand", "Qty Sold", "Unit Price", "Total Sales", "Total Profit"];
    const rows = filteredData.map(item => [
      item.name, item.sku, item.category, item.brand, item.sold, item.price, item.sales, item.profit
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sales_by_product.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 p-8 bg-slate-50 min-h-screen space-y-6 font-sans text-slate-900">
      
      {/* HIDDEN PRINT TEMPLATE */}
      <SalesByProductPrintTemplate 
        ref={printRef} 
        data={filteredData} 
        stats={stats}
        filters={{ store, category, brand }}
      />

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sales by Product</h1>
          <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
            <span>Reports</span>
            <span className="text-slate-300">/</span>
            <span>Sales</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-medium">Sales by Product</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => handlePrint()} variant="outline" className="bg-white border-slate-200 shadow-sm gap-2 hover:bg-slate-50">
            <FileText className="h-4 w-4 text-slate-600" /> Export PDF
          </Button>
          <Button onClick={handleExportCSV} variant="outline" className="bg-white border-slate-200 shadow-sm gap-2 hover:bg-slate-50">
            <Download className="h-4 w-4 text-slate-600" /> Export Excel
          </Button>
          <Button onClick={() => handlePrint()} variant="outline" className="bg-white border-slate-200 shadow-sm gap-2 hover:bg-slate-50">
            <Printer className="h-4 w-4 text-slate-600" /> Print
          </Button>
        </div>
      </div>

      {/* --- FILTERS SECTION --- */}
      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="pb-2 pt-6 px-6 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Filters</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-blue-600 hover:text-blue-700 h-8 px-2"
            onClick={() => setIsFiltersCollapsed(!isFiltersCollapsed)}
          >
            {isFiltersCollapsed ? "Expand" : "Collapse"}
            {isFiltersCollapsed ? <ChevronDown className="ml-1 h-4 w-4"/> : <ChevronUp className="ml-1 h-4 w-4"/>}
          </Button>
        </CardHeader>
        
        {!isFiltersCollapsed && (
          <CardContent className="px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              {/* Date Range */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Date Range</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-10 border-slate-200", !date && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                      {date?.from ? format(date.from, "LLL dd, y") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={2} />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Product Search */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Product</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Name or SKU" 
                    className="pl-9 h-10 bg-white border-slate-200"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-10 bg-white border-slate-200"><SelectValue placeholder="All" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Apparel">Apparel</SelectItem>
                    <SelectItem value="Groceries">Groceries</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Brand */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Brand</label>
                <Select value={brand} onValueChange={setBrand}>
                  <SelectTrigger className="h-10 bg-white border-slate-200"><SelectValue placeholder="All" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Logitech">Logitech</SelectItem>
                    <SelectItem value="Nike">Nike</SelectItem>
                    <SelectItem value="Dell">Dell</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Store */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Store</label>
                <Select value={store} onValueChange={setStore}>
                  <SelectTrigger className="h-10 bg-white border-slate-200"><SelectValue placeholder="All Branches" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Branches">All Branches</SelectItem>
                    <SelectItem value="Main Store">Main Store</SelectItem>
                    <SelectItem value="Online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mt-4">
              <span className="text-sm text-blue-600 cursor-pointer hover:underline font-medium flex items-center w-fit">
                Advanced Filters <ChevronDown className="ml-1 h-3 w-3" />
              </span>
            </div>
          </CardContent>
        )}
      </Card>

      {/* --- SUMMARY CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Products Sold</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.totalSold.toLocaleString()}</h3>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Top Selling Product</p>
            <h3 className="text-xl font-bold text-slate-900 mt-2 truncate" title={stats.topSellingItem?.name}>{stats.topSellingItem?.name || "N/A"}</h3>
            <p className="text-xs text-slate-400 mt-1">{stats.topSellingItem?.sold || 0} units sold</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Highest Revenue Product</p>
            <h3 className="text-xl font-bold text-slate-900 mt-2 truncate" title={stats.topRevenueItem?.name}>{stats.topRevenueItem?.name || "N/A"}</h3>
            <p className="text-xs text-slate-400 mt-1">${(stats.topRevenueItem?.sales || 0).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Profit</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-2">${stats.totalProfit.toLocaleString()}</h3>
          </CardContent>
        </Card>
      </div>

      {/* --- CHART --- */}
      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Top 5 Selling Products (by Quantity)</CardTitle>
        </CardHeader>
        <CardContent className="pl-0 pr-6 pb-6">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" width={150} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="sold" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* --- TABLE --- */}
      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 border-b border-slate-100">
              <TableRow>
                <TableHead className="pl-6 py-4 font-semibold text-slate-600">Product Name</TableHead>
                <TableHead className="font-semibold text-slate-600">SKU</TableHead>
                <TableHead className="font-semibold text-slate-600">Category</TableHead>
                <TableHead className="text-center font-semibold text-slate-600">Qty Sold</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Unit Price</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Total Sales</TableHead>
                <TableHead className="text-right pr-6 font-semibold text-slate-600">Total Profit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50 transition-colors border-b border-slate-50">
                    <TableCell className="pl-6 py-4 font-medium text-slate-900">{item.name}</TableCell>
                    <TableCell className="text-slate-500 text-xs font-mono">{item.sku}</TableCell>
                    <TableCell className="text-slate-600">{item.category}</TableCell>
                    <TableCell className="text-center text-slate-700">{item.sold}</TableCell>
                    <TableCell className="text-right text-slate-600">${item.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-medium text-slate-900">${item.sales.toLocaleString()}</TableCell>
                    <TableCell className="text-right pr-6 font-bold text-green-600">${item.profit.toLocaleString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-slate-500 italic">No products found matching filters.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">Showing {filteredData.length} results</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}