"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import {
  Printer,
  Download,
  MoreHorizontal,
  Edit,
  FileText,
  Upload,
  Search,
  ClipboardCheck,
  Eye,
  FileIcon,
  Image as ImageIcon,
  X,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";
import { useReactToPrint } from "react-to-print";
import { PurchaseOrderTemplate } from "@/components/Template/PurchaseOrderTemplate";

// --- 1. MOCK API & DATA ---

const MOCK_DB = {
  "PO-000123": {
    id: "PO-000123",
    status: "Partially Received",
    supplier: {
      name: "Global Tech Inc.",
      code: "SUP-001",
      contact: "John Doe",
      phone: "+1 234 567 890",
      email: "contact@globaltech.com",
      address: "123 Tech Park, Silicon Valley, CA",
    },
    details: {
      poDate: "Oct 26, 2023",
      expectedDate: "Nov 10, 2023",
      createdBy: "Admin User",
      paymentTerms: "Net 30",
      notes: "Please expedite shipping if possible.",
    },
    items: [
      {
        code: "PM-001",
        barcode: "8899001122",
        name: "Pro Wireless Mouse",
        ordered: 10,
        received: 5,
        price: 45.0,
        total: 450.0,
      },
      {
        code: "MK-002",
        barcode: "8899003344",
        name: "Mechanical Keyboard",
        ordered: 5,
        received: 5,
        price: 89.99,
        total: 449.95,
      },
      {
        code: "WEBC-003",
        barcode: "8899005566",
        name: "4K Webcam",
        ordered: 8,
        received: 8,
        price: 120.0,
        total: 960.0,
      },
    ],
    financials: {
      subtotal: 1859.95,
      discount: 0.0,
      tax: 93.0,
      other: 15.0,
      grandTotal: 1967.95,
    },
    grnHistory: [
      {
        id: "GRN-000210",
        date: "Nov 01, 2023",
        createdBy: "Warehouse Staff",
        status: "Completed",
      },
    ],
    timeline: [
      {
        title: "Status updated to Partially Received",
        by: "System",
        date: "Nov 01, 2023",
      },
      {
        title: "GRN-000210 Created",
        by: "Warehouse Staff",
        date: "Nov 01, 2023",
      },
      {
        title: "Created",
        by: "Admin User",
        date: "Oct 26, 2023",
      },
    ],
    attachments: [
      {
        id: 1,
        name: "quote_v2.pdf",
        size: "1.2 MB",
        type: "application/pdf",
        url: "#", // Mock URL
      },
      {
        id: 2,
        name: "damaged_box_sample.jpg",
        size: "2.4 MB",
        type: "image/jpeg",
        url: "https://via.placeholder.com/800x600", // Placeholder image for demo
      },
    ],
  },
  // Example of a "New" PO
  "PO-NEW": {
    id: "PO-NEW",
    status: "Pending",
    supplier: {
      name: "Eco Supplies Ltd.",
      code: "SUP-005",
      contact: "Jane Smith",
      phone: "+1 987 654 321",
      email: "sales@ecosupplies.com",
      address: "45 Green Way, Portland, OR",
    },
    details: {
      poDate: "Nov 24, 2023",
      expectedDate: "Dec 01, 2023",
      createdBy: "Manager",
      paymentTerms: "Due on Receipt",
      notes: "",
    },
    items: [
      {
        code: "PP-500",
        barcode: "123456789",
        name: "Recycled Paper Ream",
        ordered: 100,
        received: 0,
        price: 5.0,
        total: 500.0,
      },
    ],
    financials: {
      subtotal: 500.0,
      discount: 0.0,
      tax: 0.0,
      other: 0.0,
      grandTotal: 500.0,
    },
    grnHistory: [],
    timeline: [
      {
        title: "Created",
        by: "Manager",
        date: "Nov 24, 2023",
      },
    ],
    attachments: [],
  },
};

async function fetchPO(id) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  return MOCK_DB[id] || MOCK_DB["PO-000123"]; // Default to main mock if not found
}

// --- 2. HELPER: Attachment Item ---
const AttachmentItem = ({ file }) => {
  const isImage = file.type.startsWith("image/");

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg bg-white hover:bg-gray-50 transition-colors group">
      <div className="flex items-center gap-3 overflow-hidden">
        {/* Thumbnail Logic */}
        <div className="h-10 w-10 rounded bg-gray-100 flex-shrink-0 overflow-hidden border flex items-center justify-center">
          {isImage ? (
            <img
              src={file.url}
              alt={file.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <FileIcon className="h-5 w-5 text-blue-500" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate max-w-[150px] sm:max-w-[200px]">
            {file.name}
          </p>
          <p className="text-xs text-muted-foreground">{file.size}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {/* View Action (Only for Images mostly, or handled via browser for PDF) */}
        {isImage ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-blue-600"
                title="View Full Screen"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-black border-none">
              <div className="relative w-full h-[80vh] flex items-center justify-center">
                 <img
                    src={file.url}
                    alt={file.name}
                    className="max-w-full max-h-full object-contain"
                  />
                  <DialogClose className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white">
                    <X className="h-4 w-4"/>
                  </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-400 hover:text-blue-600"
            title="View File"
            onClick={() => window.open(file.url, "_blank")}
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-400 hover:text-green-600"
          title="Download"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default function PurchaseOrderView() {
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [poData, setPoData] = useState(null);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState("");

const printComponentRef = useRef();

const handlePrint = useReactToPrint({
    contentRef: printComponentRef, // <--- User requested syntax
    documentTitle: poData ? `PO_${poData.id}` : "PurchaseOrder",
  });

  // 1. Fetch Data
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      // Fallback to PO-000123 if no param is present (for demo purposes)
      const id = params?.poid || "PO-000123";
      const data = await fetchPO(id);
      setPoData(data);
      setIsLoading(false);
    };
    load();
  }, [params]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-500 font-medium">Loading Order...</span>
      </div>
    );
  }
  
if (!poData) return <div>Not Found</div>;

  const isNew = poData.status === "Pending";

  // 2. Filter Items Logic (Name, Code/SKU, Barcode)
  const filteredItems = poData.items.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.code.toLowerCase().includes(query) ||
      (item.barcode && item.barcode.toLowerCase().includes(query))
    );
  });

  // Helper to determine badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-700 border-green-200";
      case "Partially Received": return "bg-amber-100 text-amber-700 border-amber-200";
      case "Pending": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Cancelled": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700";
    }
  };


  return (
    <div className="flex-1 space-y-6 p-6 bg-gray-50/50 min-h-screen">
      
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Purchase Order #{poData.id}
            </h1>
            <Badge
              variant="secondary"
              className={`px-3 ${getStatusColor(poData.status)}`}
            >
              {poData.status}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Created on {poData.details.poDate}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-white hidden sm:flex">
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
          
          {/* Only show Generate GRN if not fully received or cancelled */}
          {poData.status !== "Cancelled" && (
            <Link href={`/purchase/good-received-notes/${poData.id}`}>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <ClipboardCheck className="mr-2 h-4 w-4" /> 
                    {isNew ? "Receive Goods" : "Generate GRN"}
                </Button>
            </Link>
          )}
          <div className="hidden">
        <PurchaseOrderTemplate ref={printComponentRef} data={poData} />
      </div>

          <div className="flex items-center border rounded-md bg-white ml-2 shadow-sm">
            <Button variant="ghost" size="icon" className="h-9 w-9 border-r rounded-none hover:bg-gray-50">
              <Printer className="h-4 w-4 text-gray-500" />
            </Button>
            <Button onClick={handlePrint} variant="ghost" size="icon" className="h-9 w-9 border-r rounded-none hover:bg-gray-50">
              <Download className="h-4 w-4 text-gray-500" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none hover:bg-gray-50">
                  <MoreHorizontal className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Cancel Order</DropdownMenuItem>
                <DropdownMenuItem>Email Supplier</DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* --- Info Cards --- */}
      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Supplier Details */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                Supplier Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-muted-foreground">Name</span>
                  <span className="col-span-2 font-medium text-gray-900">{poData.supplier.name}</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-muted-foreground">Code</span>
                  <span className="col-span-2 font-mono text-xs bg-gray-100 px-2 py-0.5 rounded w-fit text-gray-700">{poData.supplier.code}</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-muted-foreground">Contact</span>
                  <span className="col-span-2 text-gray-900">{poData.supplier.contact}</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="col-span-2 text-gray-900">{poData.supplier.phone}</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-muted-foreground">Email</span>
                  <a href={`mailto:${poData.supplier.email}`} className="col-span-2 text-blue-600 hover:underline truncate">{poData.supplier.email}</a>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-muted-foreground">Address</span>
                  <span className="col-span-2 text-gray-900">{poData.supplier.address}</span>
                </div>
              </div>
            </div>

            {/* PO Details */}
            <div className="border-t md:border-t-0 md:border-l md:pl-8 pt-6 md:pt-0 border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Order Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-muted-foreground">PO Number</span>
                  <span className="col-span-2 font-bold text-gray-900">{poData.id}</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-muted-foreground">Date</span>
                  <span className="col-span-2 text-gray-900">{poData.details.poDate}</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-muted-foreground">Expected</span>
                  <span className="col-span-2 text-gray-900">{poData.details.expectedDate}</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-muted-foreground">Created By</span>
                  <span className="col-span-2 flex items-center gap-2">
                     <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700">
                        {poData.details.createdBy.charAt(0)}
                     </div>
                     {poData.details.createdBy}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-muted-foreground">Payment</span>
                  <span className="col-span-2 text-gray-900">{poData.details.paymentTerms}</span>
                </div>
                {poData.details.notes && (
                    <div className="grid grid-cols-3 gap-4">
                    <span className="text-muted-foreground">Notes</span>
                    <span className="col-span-2 text-amber-700 bg-amber-50 p-2 rounded-md text-xs">
                        {poData.details.notes}
                    </span>
                    </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --- Order Items Table --- */}
      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50">
          <CardTitle className="text-lg font-semibold">Order Items</CardTitle>
          
          {/* SEARCH BAR */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
             <div className="relative w-full sm:w-[300px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
                <Input 
                    placeholder="Search by Name, SKU, or Barcode..." 
                    className="pl-9 h-9 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
          </div>
        </CardHeader>
        <CardContent className="px-0">
           <Table>
              <TableHeader className="bg-gray-50/50">
                 <TableRow>
                    <TableHead className="pl-6 text-xs uppercase font-semibold text-gray-500">Product</TableHead>
                    <TableHead className="text-xs uppercase font-semibold text-gray-500">Code / SKU</TableHead>
                    <TableHead className="text-right text-xs uppercase font-semibold text-gray-500">Ordered</TableHead>
                    
                    {/* Hide "Received" column if New PO */}
                    {!isNew && (
                        <TableHead className="text-right text-xs uppercase font-semibold text-gray-500">Received</TableHead>
                    )}
                    
                    <TableHead className="text-right text-xs uppercase font-semibold text-gray-500">Unit Price</TableHead>
                    <TableHead className="text-right pr-6 text-xs uppercase font-semibold text-gray-500">Total</TableHead>
                 </TableRow>
              </TableHeader>
              <TableBody>
                 {filteredItems.length > 0 ? (
                     filteredItems.map((item, idx) => (
                        <TableRow key={idx} className="border-b border-gray-50 hover:bg-gray-50/50">
                            <TableCell className="pl-6">
                                <div className="font-medium text-gray-900">{item.name}</div>
                                <div className="text-xs text-muted-foreground md:hidden">{item.code}</div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                <div className="font-mono text-xs text-gray-600 bg-gray-100 w-fit px-1.5 py-0.5 rounded">
                                    {item.code}
                                </div>
                                {item.barcode && (
                                    <div className="text-[10px] text-gray-400 mt-0.5">
                                        {item.barcode}
                                    </div>
                                )}
                            </TableCell>
                            <TableCell className="text-right font-medium text-gray-700">{item.ordered}</TableCell>
                            
                            {/* Hide Received Cell if New PO */}
                            {!isNew && (
                                <TableCell className="text-right">
                                    <span className={item.received < item.ordered ? "text-amber-600 font-bold" : "text-green-600 font-bold"}>
                                        {item.received}
                                    </span>
                                    {item.received < item.ordered && (
                                        <span className="text-[10px] text-amber-500 block">
                                            {item.ordered - item.received} Pending
                                        </span>
                                    )}
                                </TableCell>
                            )}

                            <TableCell className="text-right text-gray-600">${item.price.toFixed(2)}</TableCell>
                            <TableCell className="text-right pr-6 font-semibold text-gray-900">${item.total.toFixed(2)}</TableCell>
                        </TableRow>
                    ))
                 ) : (
                    <TableRow>
                        <TableCell colSpan={isNew ? 5 : 6} className="h-24 text-center text-gray-500">
                            No items found matching "{searchQuery}"
                        </TableCell>
                    </TableRow>
                 )}
              </TableBody>
           </Table>

           {/* Financial Footer */}
           <div className="flex justify-end p-6 bg-gray-50/30">
              <div className="w-64 space-y-2">
                 <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${poData.financials.subtotal.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="font-medium text-green-600">-${poData.financials.discount.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (5%)</span>
                    <span className="font-medium">${poData.financials.tax.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Other Charges</span>
                    <span className="font-medium">${poData.financials.other.toFixed(2)}</span>
                 </div>
                 <Separator className="my-2"/>
                 <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Grand Total</span>
                    <span>${poData.financials.grandTotal.toFixed(2)}</span>
                 </div>
              </div>
           </div>
        </CardContent>
      </Card>

      {/* --- GRN History (Hide if New/Pending) --- */}
      {!isNew && (
        <Card className="border-none shadow-sm bg-white">
            <CardHeader className="px-6 py-4">
                <CardTitle className="text-base font-semibold">GRN History</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-2">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow>
                            <TableHead className="pl-6 text-xs uppercase">GRN #</TableHead>
                            <TableHead className="text-xs uppercase">Date</TableHead>
                            <TableHead className="text-xs uppercase">Created By</TableHead>
                            <TableHead className="text-xs uppercase">Status</TableHead>
                            <TableHead className="text-right pr-6 text-xs uppercase">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {poData.grnHistory.length > 0 ? (
                            poData.grnHistory.map((grn) => (
                                <TableRow key={grn.id}>
                                    <TableCell className="pl-6 font-medium text-blue-600">{grn.id}</TableCell>
                                    <TableCell>{grn.date}</TableCell>
                                    <TableCell>{grn.createdBy}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{grn.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <Button variant="ghost" size="sm" className="h-7 text-xs border">View GRN</Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                                    No Goods Received Notes generated yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      )}

      {/* --- Bottom Row --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* Timeline */}
         <Card className="lg:col-span-2 border-none shadow-sm bg-white">
            <CardHeader>
                <CardTitle className="text-base font-semibold">Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative border-l-2 border-gray-100 ml-3 space-y-8 pb-2">
                    {poData.timeline.map((event, idx) => (
                        <div key={idx} className="relative pl-8">
                             <div className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-white ${idx === 0 ? "bg-blue-500" : "bg-gray-200"}`}></div>
                             <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{event.title}</p>
                                    <p className="text-xs text-gray-500">by {event.by} on {event.date}</p>
                                </div>
                             </div>
                        </div>
                    ))}
                </div>
            </CardContent>
         </Card>

         {/* Attachments */}
         <Card className="border-none shadow-sm bg-white">
            <CardHeader>
                <CardTitle className="text-base font-semibold">Attachments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 {/* List existing attachments */}
                 {poData.attachments.length > 0 ? (
                    poData.attachments.map((file) => (
                        <AttachmentItem key={file.id} file={file} />
                    ))
                 ) : (
                    <div className="text-sm text-gray-400 text-center py-4 italic">
                        No attachments found.
                    </div>
                 )}

                 {/* Upload Area */}
                 <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-all group">
                     <div className="bg-gray-50 p-3 rounded-full mb-2 group-hover:bg-blue-100 transition-colors">
                        <Upload className="h-6 w-6 text-gray-400 group-hover:text-blue-600" />
                     </div>
                     <span className="text-sm font-medium text-gray-900 group-hover:text-blue-700">Click to Upload</span>
                     <span className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG (Max 5MB)</span>
                 </div>
            </CardContent>
         </Card>

      </div>
    </div>
  );
}