"use client";

import { useState, useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print"; // FIX: Updated usage below
import { format, subDays } from "date-fns";
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
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { SalesSummaryPrintTemplate } from "@/components/Template/sales/SalesSummaryPrintTemplate";


// --- MOCK DATA ---
const MOCK_TRANSACTIONS = [
  { id: "INV-00123", date: "2023-10-27 14:35", customer: "Alice Johnson", total: 75.50, discount: 5.00, net: 70.50, type: "Card", cashier: "John Doe", status: "Sales" },
  { id: "INV-00122", date: "2023-10-27 14:30", customer: "Bob Williams", total: -25.00, discount: 0.00, net: -25.00, type: "Return", cashier: "Jane Smith", status: "Return" },
  { id: "INV-00121", date: "2023-10-27 14:22", customer: "Charlie Brown", total: 120.00, discount: 10.00, net: 110.00, type: "Cash", cashier: "John Doe", status: "Sales" },
  { id: "INV-00120", date: "2023-10-27 14:15", customer: "Diana Prince", total: 45.25, discount: 0.00, net: 45.25, type: "Credit", cashier: "Jane Smith", status: "Sales" },
  { id: "INV-00119", date: "2023-10-27 14:05", customer: "Eve Adams", total: 200.00, discount: 20.00, net: 180.00, type: "Card", cashier: "John Doe", status: "Sales" },
  { id: "INV-00118", date: "2023-10-27 13:58", customer: "Frank Miller", total: 15.00, discount: 0.00, net: 15.00, type: "Cash", cashier: "Jane Smith", status: "Sales" },
  { id: "INV-00117", date: "2023-10-27 13:45", customer: "Grace Lee", total: 88.50, discount: 8.50, net: 80.00, type: "Card", cashier: "John Doe", status: "Sales" },
];

export default function DailySalesSummaryPage() {
  // --- STATES ---
  const [date, setDate] = useState({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [data, setData] = useState(MOCK_TRANSACTIONS);
  const [filteredData, setFilteredData] = useState(MOCK_TRANSACTIONS);
  
  // Filter States
  const [branch, setBranch] = useState("all");
  const [user, setUser] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [amountRange, setAmountRange] = useState([0, 1000]);
  const [paymentFilter, setPaymentFilter] = useState("all");

  // --- STATS CALCULATION ---
  const stats = {
    totalSales: filteredData.reduce((acc, curr) => acc + curr.total, 0),
    totalTransactions: filteredData.length,
    avgValue: (filteredData.reduce((acc, curr) => acc + curr.total, 0) / (filteredData.length || 1)).toFixed(2),
    totalDiscounts: filteredData.reduce((acc, curr) => acc + curr.discount, 0),
    paymentBreakdown: {
      cash: 55, card: 35, credit: 10 
    }
  };

  // --- PRINTING LOGIC (FIXED) ---
  const printRef = useRef(null);
  
  // Use contentRef directly in the options object
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Sales_Report",
  });

  // --- CSV EXPORT LOGIC ---
  const handleExportCSV = () => {
    const headers = ["Invoice No", "Date", "Customer", "Total", "Discount", "Net", "Type", "Cashier"];
    const rows = filteredData.map(item => [
      item.id, item.date, item.customer, item.total, item.discount, item.net, item.type, item.cashier
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sales_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- FILTER LOGIC ---
  useEffect(() => {
    let result = data;

    if (searchQuery) {
      result = result.filter(item => 
        item.customer.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (paymentFilter !== 'all') {
      result = result.filter(item => item.type.toLowerCase() === paymentFilter);
    }

    // Amount Range Logic (Absolute value to handle returns)
    result = result.filter(item => Math.abs(item.total) >= amountRange[0] && Math.abs(item.total) <= amountRange[1]);

    setFilteredData(result);
  }, [searchQuery, paymentFilter, amountRange, data]);


  // --- RENDER HELPERS ---
  const PaymentBar = () => (
    <div className="w-full">
      <div className="h-4 w-full flex rounded-full overflow-hidden mb-2">
        <div style={{ width: `${stats.paymentBreakdown.cash}%` }} className="bg-emerald-500 h-full" />
        <div style={{ width: `${stats.paymentBreakdown.card}%` }} className="bg-blue-500 h-full" />
        <div style={{ width: `${stats.paymentBreakdown.credit}%` }} className="bg-amber-500 h-full" />
      </div>
      <div className="flex justify-between text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>Cash</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div>Card</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div>Credit</div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 p-8 bg-slate-50 min-h-screen space-y-8 font-sans text-slate-900">
      
      {/* HIDDEN PRINT TEMPLATE 
        The 'display: none' ensures it doesn't clutter the UI, 
        but the DOM element exists for react-to-print to grab.
      */}
      <div style={{ display: "none" }}>
        <SalesSummaryPrintTemplate ref={printRef} data={filteredData} dateRange={date} stats={stats} />
      </div>

      {/* --- HEADER --- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Daily Sales Summary</h1>
          <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
            <span>Reports</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-medium">Sales Performance</span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => handlePrint()} variant="outline" className="bg-white text-slate-700 border-slate-200 shadow-sm gap-2 hover:bg-slate-50">
            <FileText className="h-4 w-4" /> Export PDF
          </Button>
          <Button onClick={handleExportCSV} variant="outline" className="bg-white text-slate-700 border-slate-200 shadow-sm gap-2 hover:bg-slate-50">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button onClick={() => handlePrint()} className="bg-slate-900 text-white shadow-sm gap-2 hover:bg-slate-800">
            <Printer className="h-4 w-4" /> Print Report
          </Button>
        </div>
      </div>

      {/* --- FILTERS & CONTROLS --- */}
      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-6 space-y-6">
          
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            
            {/* DATE RANGE PICKER */}
            <div className="flex-1 space-y-2 w-full lg:w-auto">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date Range</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal h-10 border-slate-200",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "LLL dd, y")} -{" "}
                          {format(date.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(date.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* FILTERS */}
            <div className="w-full lg:w-[200px] space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Branch</label>
              <Select value={branch} onValueChange={setBranch}>
                <SelectTrigger className="h-10 bg-white border-slate-200"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stores</SelectItem>
                  <SelectItem value="main">Main Branch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full lg:w-[200px] space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">User</label>
              <Select value={user} onValueChange={setUser}>
                <SelectTrigger className="h-10 bg-white border-slate-200"><SelectValue placeholder="All Users" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="john">John Doe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ADVANCED FILTER POPOVER */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-10 border-dashed border-slate-300 text-slate-600 gap-2">
                  <SlidersHorizontal className="h-4 w-4" /> Advanced
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="end">
                <div className="space-y-4">
                  <h4 className="font-semibold leading-none text-slate-900">Advanced Filters</h4>
                  <div className="space-y-2">
                    <Label className="text-xs">Amount Range ($)</Label>
                    <Slider defaultValue={[0, 1000]} max={5000} step={10} value={amountRange} onValueChange={setAmountRange} />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>${amountRange[0]}</span>
                      <span>${amountRange[1]}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Payment Method</Label>
                    <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                      <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="return">Returns</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button size="sm" className="w-full mt-2" onClick={() => {setPaymentFilter("all"); setAmountRange([0,5000])}}>Reset Filters</Button>
                </div>
              </PopoverContent>
            </Popover>

            <Button className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-6 shadow-sm">
                Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* --- SUMMARY DASHBOARD --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <Card className="border-none shadow-sm bg-white p-4 flex flex-col justify-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Sales</p>
            <h3 className="text-2xl font-bold text-slate-900">${stats.totalSales.toLocaleString()}</h3>
         </Card>
         <Card className="border-none shadow-sm bg-white p-4 flex flex-col justify-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Transactions</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats.totalTransactions}</h3>
         </Card>
         <Card className="border-none shadow-sm bg-white p-4 flex flex-col justify-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Returns</p>
            <h3 className="text-2xl font-bold text-red-600">${Math.abs(stats.totalDiscounts).toFixed(2)}</h3>
         </Card>
         <Card className="border-none shadow-sm bg-white p-4 flex flex-col justify-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Payment Breakdown</p>
            <PaymentBar />
         </Card>
      </div>

      {/* --- DATA TABLE --- */}
      <Card className="border-none shadow-sm bg-white">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                    placeholder="Search invoice or customer..." 
                    className="pl-9 bg-slate-50 border-slate-200 h-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="text-sm text-slate-500">
                Showing <span className="font-bold text-slate-900">{filteredData.length}</span> transactions
            </div>
        </div>
        <CardContent className="p-0">
            <Table>
                <TableHeader className="bg-slate-50 border-b border-slate-100">
                    <TableRow>
                        <TableHead className="w-[180px] pl-6 font-semibold text-slate-600">Date</TableHead>
                        <TableHead className="font-semibold text-slate-600">Invoice No</TableHead>
                        <TableHead className="font-semibold text-slate-600">Customer</TableHead>
                        <TableHead className="font-semibold text-slate-600">Total</TableHead>
                        <TableHead className="font-semibold text-slate-600">Discount</TableHead>
                        <TableHead className="font-semibold text-slate-600">Net Amount</TableHead>
                        <TableHead className="font-semibold text-slate-600">Payment</TableHead>
                        <TableHead className="text-right pr-6 font-semibold text-slate-600">Cashier</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredData.length > 0 ? filteredData.map((item) => {
                        const isReturn = item.status === 'Return';
                        return (
                            <TableRow key={item.id} className="hover:bg-slate-50 transition-colors border-b border-slate-50">
                                <TableCell className="pl-6 py-3 text-slate-600">{item.date}</TableCell>
                                <TableCell className="font-medium text-slate-900">{item.id}</TableCell>
                                <TableCell className="text-slate-600">{item.customer}</TableCell>
                                <TableCell className={isReturn ? "text-red-600" : "text-slate-600"}>${item.total.toFixed(2)}</TableCell>
                                <TableCell className="text-slate-600">${item.discount.toFixed(2)}</TableCell>
                                <TableCell className={`font-bold ${isReturn ? "text-red-600" : "text-slate-900"}`}>${item.net.toFixed(2)}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={
                                        item.type === 'Card' ? "bg-blue-50 text-blue-700 border-blue-100" :
                                        item.type === 'Cash' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                        "bg-red-50 text-red-700 border-red-100"
                                    }>
                                        {item.type}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right pr-6 text-slate-600">{item.cashier}</TableCell>
                            </TableRow>
                        );
                    }) : (
                        <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center text-slate-500 italic">
                                No transactions match your filters.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Pagination */}
            <div className="px-6 py-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <Button variant="outline" size="sm" disabled><ChevronLeft className="h-4 w-4 mr-1"/> Previous</Button>
                <Button variant="outline" size="sm">Next <ChevronRight className="h-4 w-4 ml-1"/></Button>
            </div>
        </CardContent>
      </Card>

    </div>
  );
}