"use client";

import { useState, useMemo, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import {
  Printer,
  FileText,
  Download,
  Search,
  Calendar as CalendarIcon,
  ChevronDown,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  Briefcase,
  TrendingUp,
  ChevronLeft,
  ChevronRight
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
import { Badge } from "@/components/ui/badge";
import { SalesBySupplierPrintTemplate } from "@/components/Template/sales/SalesBySupplierTemplate";


// --- MOCK DATA (Sri Lankan Context) ---
const MOCK_SUPPLIERS = [
  { id: 1, name: "Global Tech Inc.", category: "Electronics", sold: 320, totalSales: 12500000.00, discount: 150000.00, netSales: 12350000.00, profit: 3200000.00 },
  { id: 2, name: "Fashion Forward Pvt Ltd", category: "Apparel", sold: 250, totalSales: 8500000.00, discount: 500000.00, netSales: 8000000.00, profit: 2400000.00 },
  { id: 3, name: "Home Essentials Co.", category: "Home & Living", sold: 180, totalSales: 6250000.00, discount: 25000.00, netSales: 6225000.00, profit: 1800000.00 },
  { id: 4, name: "Gadget Masters", category: "Electronics", sold: 155, totalSales: 4800000.00, discount: 80000.00, netSales: 4720000.00, profit: 950000.00 },
  { id: 5, name: "Organic Foods Ltd.", category: "Groceries", sold: 450, totalSales: 3500000.00, discount: 10000.00, netSales: 3490000.00, profit: 850000.00 },
  { id: 6, name: "Office Pro Supplies", category: "Stationery", sold: 95, totalSales: 1200000.00, discount: 5000.00, netSales: 1195000.00, profit: 350000.00 },
  { id: 7, name: "Lanka Footwear", category: "Apparel", sold: 120, totalSales: 2100000.00, discount: 100000.00, netSales: 2000000.00, profit: 600000.00 },
];

// LKR Formatter
const formatLKR = (val) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(val);

export default function SalesBySupplierPage() {
  // --- STATE ---
  const [date, setDate] = useState({ from: new Date(2023, 9, 1), to: new Date() });
  const [store, setStore] = useState("All Branches");
  const [category, setCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // --- FILTER LOGIC ---
  const filteredData = useMemo(() => {
    return MOCK_SUPPLIERS.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = category === "All" || item.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, category]);

  // --- STATS & CHART CALCULATION ---
  const stats = useMemo(() => {
    const totalSales = filteredData.reduce((acc, curr) => acc + curr.totalSales, 0);
    const totalProfit = filteredData.reduce((acc, curr) => acc + curr.profit, 0);
    const topSupplier = [...filteredData].sort((a, b) => b.totalSales - a.totalSales)[0];
    const activeSuppliers = filteredData.length;

    return { totalSales, totalProfit, topSupplier, activeSuppliers };
  }, [filteredData]);

  // Top 5 for Chart
  const chartData = useMemo(() => {
    return [...filteredData]
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 5)
      .map(item => ({ name: item.name, sales: item.totalSales }));
  }, [filteredData]);

  // --- PRINT ENGINE ---
  const printRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Sales_By_Supplier_Report",
  });

  // --- CSV EXPORT ---
  const handleExportCSV = () => {
    const headers = ["Supplier Name", "Category", "Items Sold", "Total Sales", "Discount", "Net Sales", "Total Profit", "Avg Sale/Product"];
    const rows = filteredData.map(item => [
      item.name, 
      item.category, 
      item.sold, 
      item.totalSales, 
      item.discount, 
      item.netSales, 
      item.profit, 
      (item.netSales / item.sold).toFixed(2)
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "sales_by_supplier.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 p-8 bg-slate-50 min-h-screen space-y-8 font-sans text-slate-900">
      
      {/* HIDDEN PRINT TEMPLATE */}
      <SalesBySupplierPrintTemplate 
        ref={printRef} 
        data={filteredData} 
        stats={stats} 
        filters={{ store, category }}
      />

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Sales Summary By Supplier</h1>
          <p className="text-slate-500 mt-1">Analyze vendor performance and procurement profitability.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handlePrint} variant="outline" className="bg-white border-slate-200 shadow-sm gap-2 text-slate-700 hover:bg-slate-50">
            <FileText className="h-4 w-4" /> Export PDF
          </Button>
          <Button onClick={handleExportCSV} variant="outline" className="bg-white border-slate-200 shadow-sm gap-2 text-slate-700 hover:bg-slate-50">
            <Download className="h-4 w-4" /> Export Excel
          </Button>
          <Button onClick={handlePrint} className="bg-slate-900 text-white shadow-sm gap-2 hover:bg-slate-800">
            <Printer className="h-4 w-4" /> Print Report
          </Button>
        </div>
      </div>

      {/* --- FILTERS --- */}
      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-5 items-end">
            
            {/* Date Range */}
            <div className="space-y-2 flex-1 min-w-[220px]">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date Range</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-10 border-slate-200 bg-slate-50/50", !date && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
                      {date?.from ? (date.to ? <>{format(date.from, "LLL dd")} - {format(date.to, "LLL dd")}</> : format(date.from, "LLL dd")) : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={2} />
                  </PopoverContent>
                </Popover>
            </div>

            {/* Supplier Name */}
            <div className="space-y-2 flex-1 min-w-[200px]">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Supplier Name</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Search supplier..." 
                    className="pl-9 h-10 border-slate-200 bg-slate-50/50 focus:bg-white transition-colors"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
            </div>

            {/* Dropdowns */}
            <div className="space-y-2 w-full lg:w-[180px]">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-10 border-slate-200 bg-slate-50/50"><SelectValue placeholder="All" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Categories</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Apparel">Apparel</SelectItem>
                    <SelectItem value="Groceries">Groceries</SelectItem>
                  </SelectContent>
                </Select>
            </div>

            <div className="space-y-2 w-full lg:w-[180px]">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Store</label>
                <Select value={store} onValueChange={setStore}>
                  <SelectTrigger className="h-10 border-slate-200 bg-slate-50/50"><SelectValue placeholder="All" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Branches">All Branches</SelectItem>
                    <SelectItem value="Colombo">Colombo Main</SelectItem>
                    <SelectItem value="Kandy">Kandy City</SelectItem>
                  </SelectContent>
                </Select>
            </div>

            <div className="pb-1">
               <span className="text-sm text-blue-600 cursor-pointer hover:underline font-medium flex items-center">
                  Advanced Filters <ChevronDown className="ml-1 h-3 w-3" />
               </span>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* --- KPI METRICS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Sales from Suppliers</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-2">{formatLKR(stats.totalSales)}</h3>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top Performing Supplier</p>
            <h3 className="text-xl font-bold text-slate-900 mt-2 truncate" title={stats.topSupplier?.name}>{stats.topSupplier?.name || "-"}</h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
               <TrendingUp className="h-3 w-3 text-emerald-500"/> Highest Revenue
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suppliers with Sales</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-2">{stats.activeSuppliers}</h3>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overall Gross Profit</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-2">{formatLKR(stats.totalProfit)}</h3>
          </CardContent>
        </Card>
      </div>

      {/* --- CHART SECTION --- */}
      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-slate-800">Top 5 Suppliers by Sales</CardTitle>
        </CardHeader>
        <CardContent className="pl-0 pr-6 pb-6 pt-4">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                <YAxis dataKey="name" type="category" width={150} stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                  formatter={(value) => [formatLKR(value), "Sales"]}
                />
                <Bar dataKey="sales" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* --- DATA TABLE --- */}
      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <div className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 border-b border-slate-200">
              <TableRow>
                <TableHead className="pl-6 py-4 font-semibold text-slate-600">Supplier Name</TableHead>
                <TableHead className="text-center font-semibold text-slate-600">Total Products Sold</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Total Sales</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Total Discount</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Net Sales</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Total Profit</TableHead>
                <TableHead className="text-right pr-6 font-semibold text-slate-600">Avg. Sale/Product</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-50 last:border-0">
                    <TableCell className="pl-6 py-4 font-medium text-slate-900">{item.name}</TableCell>
                    <TableCell className="text-center text-slate-700">{item.sold}</TableCell>
                    <TableCell className="text-right text-slate-600 font-medium">{formatLKR(item.totalSales)}</TableCell>
                    <TableCell className="text-right text-red-600">({formatLKR(item.discount)})</TableCell>
                    <TableCell className="text-right font-bold text-slate-900">{formatLKR(item.netSales)}</TableCell>
                    <TableCell className="text-right font-bold text-emerald-600">{formatLKR(item.profit)}</TableCell>
                    <TableCell className="text-right pr-6 text-slate-600">{formatLKR(item.netSales / (item.sold || 1))}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-slate-500 italic">
                    No suppliers match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
            <p className="text-sm text-slate-500">Showing {filteredData.length} results</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8 bg-white text-slate-600" disabled>Previous</Button>
              <Button variant="outline" size="sm" className="h-8 bg-white text-slate-600" disabled>Next</Button>
            </div>
          </div>
        </div>
      </Card>

    </div>
  );
}