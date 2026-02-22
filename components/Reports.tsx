import React, { useState, useEffect } from 'react';
import { User, Order } from '../types';
import { Download, FileSpreadsheet, Calendar, TrendingUp, Package } from 'lucide-react';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { API_ENDPOINTS } from './config'; // Import config


interface ReportsProps {
  user: User;
}

interface ProductStats {
  name: string;
  totalQty: number;
  totalRevenue: number;
}

const Reports: React.FC<ReportsProps> = ({ user }) => {
  const [fromDate, setFromDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isLoading, setIsLoading] = useState(false);
  const [topProducts, setTopProducts] = useState<ProductStats[]>([]);

  // Fetch data for the insights panel
  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.ORDERS}/${user.id}`);
        const data = await response.json();
        
        const productMap = new Map<string, ProductStats>();

        data.forEach((order: any) => {
            // Handle both old single-item and new multi-item structures
            const items = order.items && order.items.length > 0 
                ? order.items 
                : [{ bottleName: order.bottleName, quantity: order.quantity, unitPrice: order.unitPrice }];

            items.forEach((item: any) => {
                const current = productMap.get(item.bottleName) || {
                    name: item.bottleName,
                    totalQty: 0,
                    totalRevenue: 0
                };
                
                const qty = Number(item.quantity) || 0;
                const price = Number(item.unitPrice) || 0;

                current.totalQty += qty;
                current.totalRevenue += (qty * price);
                
                productMap.set(item.bottleName, current);
            });
        });

        // Convert to array, sort by Revenue, and take TOP 3
        const sorted = Array.from(productMap.values())
          .sort((a, b) => b.totalRevenue - a.totalRevenue)
          .slice(0, 3); // UPDATED: strictly top 3

        setTopProducts(sorted);
      } catch (error) {
        console.error("Failed to load insights", error);
      }
    };
    fetchInsights();
  }, [user.id]);

  const exportToCSV = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.ORDERS}/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      const allOrders = data.map((o: any) => ({ ...o, id: o._id }));

      const filtered = allOrders.filter((o: Order) => {
        const orderDate = new Date(o.date);
        const rangeStart = startOfDay(new Date(fromDate));
        const rangeEnd = endOfDay(new Date(toDate));
        return isWithinInterval(orderDate, { start: rangeStart, end: rangeEnd });
      });

      if (filtered.length === 0) {
        alert("No data found for the selected range");
        setIsLoading(false);
        return;
      }

      const rows: any[] = [];
      filtered.forEach((o: Order) => {
         const items = (o.items && o.items.length > 0) ? o.items : null;

         if (items) {
             items.forEach((item: any) => {
                 rows.push([
                     o.id,
                     format(new Date(o.date), 'yyyy-MM-dd HH:mm'),
                     o.toName,
                     item.bottleName,
                     item.quantity,
                     item.unitPrice,
                     item.quantity * item.unitPrice,
                     item.itemProfit || 0
                 ]);
             });
         } else {
             rows.push([
                 o.id,
                 format(new Date(o.date), 'yyyy-MM-dd HH:mm'),
                 o.toName,
                 o.bottleName || 'Unknown',
                 o.quantity || 0,
                 o.unitPrice || 0,
                 o.totalAmount || 0,
                 o.profit || 0
             ]);
         }
      });

      const headers = ['Order ID', 'Date', 'Customer', 'Product', 'Qty', 'Unit Price', 'Total', 'Profit'];
      
      let csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n"
        + rows.map(r => r.join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Report_${user.username}_${fromDate}_to_${toDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error(error);
      alert("Error generating report");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Export</h1>
        <p className="text-gray-500">Generate analysis reports and track product performance.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Excel Export */}
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-green-50 p-3 rounded-2xl text-green-600">
              <FileSpreadsheet size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Excel Export</h2>
              <p className="text-sm text-gray-400">Download order history CSV</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">From Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="date" 
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">To Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="date" 
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={exportToCSV}
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-100 group disabled:opacity-50"
            >
              <Download size={20} className="group-hover:-translate-y-0.5 transition-transform" />
              {isLoading ? 'Generating...' : 'Download Excel Report'}
            </button>
          </div>
        </div>

        {/* Right Column: Top 3 Products */}
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-6">
             <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
               <TrendingUp size={24} />
             </div>
             <div>
               <h2 className="text-xl font-bold text-gray-900">Top 3 Products</h2>
               <p className="text-sm text-gray-400">By total revenue generated</p>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((prod, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-4">
                      {/* Rank Indicator */}
                      <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-black ${
                        idx === 0 ? 'bg-amber-100 text-amber-600' : 
                        idx === 1 ? 'bg-gray-200 text-gray-600' : 
                        'bg-orange-100 text-orange-600'
                      }`}>
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="font-bold text-gray-900">{prod.name}</p>
                        <div className="flex items-center gap-1 text-xs font-bold text-gray-400">
                           <Package size={12} />
                           {prod.totalQty} sold
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-indigo-600">₹{prod.totalRevenue.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2 py-10">
                 <Package size={40} className="opacity-20" />
                 <p className="font-medium">No sales data available yet.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Reports;