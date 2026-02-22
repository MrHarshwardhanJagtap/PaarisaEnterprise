// import React, { useState, useEffect } from 'react';
// import { User, UserRole } from '../types';
// import { Plus, Search, Edit2, Trash2, Calendar, Package, Printer } from 'lucide-react';
// import { API_ENDPOINTS } from './config'; // Import config


// interface InventoryProps {
//   user: User;
// }

// const Inventory: React.FC<InventoryProps> = ({ user }) => {
//   const [items, setItems] = useState<any[]>([]);
//   const [showModal, setShowModal] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [editingItem, setEditingItem] = useState<any>(null);
  
//   const [formData, setFormData] = useState<any>({
//     name: '',
//     cost: 0, 
//     stock: 0,
//   });

//   const API_URL = `${API_ENDPOINTS.PRODUCTS}`;

//   useEffect(() => {
//     fetchItems();
//   }, [user.id]);

//   const fetchItems = async () => {
//     try {
//       const res = await fetch(`${API_URL}/${user.id}`);
//       const data = await res.json();
//       const mappedData = data.map((item: any) => ({
//         ...item,
//         id: item._id
//       }));
//       setItems(mappedData);
//     } catch (error) {
//       console.error("Error fetching inventory:", error);
//     }
//   };

//   const openAddModal = () => {
//     setEditingItem(null);
//     setFormData({ name: '', cost: 0, stock: 0 });
//     setShowModal(true);
//   };

//   const openEditModal = (item: any) => {
//     setEditingItem(item);
//     setFormData({ name: item.name, cost: item.cost, stock: item.stock });
//     setShowModal(true);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
    
//     try {
//       if (editingItem) {
//         const response = await fetch(`${API_URL}/${editingItem.id}`, {
//           method: 'PUT',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             name: formData.name,
//             cost: formData.cost,
//             stock: formData.stock
//           }),
//         });
//         if (response.ok) fetchItems();
//       } else {
//         const response = await fetch(API_URL, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             ownerId: user.id,
//             name: formData.name,
//             cost: formData.cost,
//             stock: formData.stock
//           }),
//         });
//         if (response.ok) fetchItems();
//       }

//       setShowModal(false);
//       setFormData({ name: '', cost: 0, stock: 0 });
//       setEditingItem(null);

//     } catch (error) {
//       console.error("Error saving item:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleDelete = async (id: string) => {
//     if (confirm('Are you sure you want to delete this item?')) {
//       try {
//         await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
//         setItems(items.filter(i => i.id !== id));
//       } catch (error) {
//         console.error("Error deleting item:", error);
//       }
//     }
//   };

//   const handlePrint = () => {
//     window.print();
//   };

//   const filteredItems = items.filter(i => 
//     (i.name || '').toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   // Calculate Totals for Print Report
//   const totalStockValue = filteredItems.reduce((acc, item) => acc + (item.cost * item.stock), 0);
//   const totalItemsCount = filteredItems.reduce((acc, item) => acc + item.stock, 0);

//   return (
//     <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
//       {/* Print Styles */}
//       <style>
//         {`
//           @media print {
//             body * { visibility: hidden; height: 0; overflow: hidden; }
//             #print-area, #print-area * { visibility: visible; height: auto; }
//             #print-area { 
//               position: absolute; 
//               left: 0; 
//               top: 0; 
//               width: 100%; 
//               padding: 40px;
//             }
//             @page { size: A4; margin: 0; }
//           }
//         `}
//       </style>

//       <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
//         <div>
//           <h1 className="text-3xl font-black text-gray-900 tracking-tight">
//             {user.role === UserRole.MANUFACTURER ? 'Bottle Management' : 'Stock & Price'}
//           </h1>
//           <p className="text-gray-600 font-medium">Manage your product inventory and valuation.</p>
//         </div>
        
//         <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
//             <button 
//                 onClick={handlePrint}
//                 className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-4 rounded-[1.25rem] font-bold flex items-center justify-center gap-2 transition-all shadow-sm w-full sm:w-auto"
//             >
//                 <Printer size={20} />
//                 Print Stock
//             </button>
//             <button 
//             onClick={openAddModal}
//             className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-[1.25rem] font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98] w-full sm:w-auto"
//             >
//             <Plus size={24} />
//             {user.role === UserRole.MANUFACTURER ? 'Create New Bottle' : 'Receive Stock'}
//             </button>
//         </div>
//       </header>

//       <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
//         <div className="p-6 border-b border-gray-100 bg-gray-50/30">
//           <div className="relative max-w-md w-full">
//             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
//             <input 
//               type="text" 
//               placeholder="Filter by name..." 
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400"
//             />
//           </div>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full text-left min-w-[800px]">
//             <thead className="bg-gray-50/80 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
//               <tr>
//                 <th className="px-8 py-5 w-24">Sr. No</th> {/* Added Sr No Column */}
//                 <th className="px-8 py-5">Product Info</th>
//                 <th className="px-8 py-5">Inventory</th>
//                 <th className="px-8 py-5">{user.role === UserRole.MANUFACTURER ? 'Cost (ea)' : 'Purchase Price'}</th>
//                 <th className="px-8 py-5">Activity</th>
//                 <th className="px-8 py-5 text-right">Action</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100">
//               {filteredItems.map((item, index) => (
//                 <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
//                   <td className="px-8 py-6 font-bold text-gray-400">
//                     {index + 1} {/* Serial Number Logic */}
//                   </td>
//                   <td className="px-8 py-6">
//                     <div className="flex items-center gap-4">
//                       <div className="w-12 h-12 bg-indigo-50/50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100/50 shadow-sm">
//                         <Package size={22} />
//                       </div>
//                       <div>
//                         <p className="text-sm font-black text-gray-900 leading-tight">{item.name}</p>
//                         <p className="text-[10px] font-bold text-gray-400 mt-0.5">#{item.id.slice(0, 8).toUpperCase()}</p>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-8 py-6">
//                     <div className="flex flex-col">
//                       <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-black ${
//                         item.stock < 50 ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
//                       }`}>
//                         {item.stock} Units
//                       </span>
//                     </div>
//                   </td>
//                   <td className="px-8 py-6">
//                     <div className="flex items-center gap-1.5 text-base font-black text-gray-900">
//                       <span className="text-gray-400 text-sm">₹</span>
//                       {item.cost.toFixed(2)}
//                     </div>
//                   </td>
//                   <td className="px-8 py-6">
//                     <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
//                       <Calendar size={14} className="text-gray-400" />
//                       {new Date(item.lastUpdated).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
//                     </div>
//                   </td>
//                   <td className="px-8 py-6 text-right">
//                     <div className="flex items-center justify-end gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
//                       <button 
//                         onClick={() => openEditModal(item)}
//                         className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100"
//                       >
//                         <Edit2 size={18} />
//                       </button>
//                       <button 
//                         onClick={() => handleDelete(item.id)}
//                         className="p-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100"
//                       >
//                         <Trash2 size={18} />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Add/Edit Modal */}
//       {showModal && (
//         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
//           <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setShowModal(false)} />
//           <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 border border-white/20">
//             <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
//               <h2 className="text-2xl font-black text-gray-900">
//                 {editingItem ? 'Edit Bottle' : 'Add Entry'}
//               </h2>
//               <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
//                 <Plus size={28} className="rotate-45" />
//               </button>
//             </div>
//             <form onSubmit={handleSubmit} className="p-8 space-y-6">
//               <div>
//                 <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Product Name</label>
//                 <input 
//                   type="text" 
//                   required
//                   placeholder="e.g. 500ml PET Clear"
//                   value={formData.name}
//                   onChange={(e) => setFormData({...formData, name: e.target.value})}
//                   className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 font-bold text-gray-900 transition-all"
//                 />
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
//                     {user.role === UserRole.MANUFACTURER ? 'Unit Cost (₹)' : 'Buy Price (₹)'}
//                   </label>
//                   <input 
//                     type="number" 
//                     step="0.01"
//                     required
//                     placeholder="0.00"
//                     value={formData.cost}
//                     onChange={(e) => setFormData({...formData, cost: parseFloat(e.target.value)})}
//                     className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 font-bold text-gray-900 transition-all"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Stock Level</label>
//                   <input 
//                     type="number" 
//                     required
//                     placeholder="0"
//                     value={formData.stock}
//                     onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
//                     className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 font-bold text-gray-900 transition-all"
//                   />
//                 </div>
//               </div>
//               <div className="pt-4">
//                 <button 
//                   type="submit" 
//                   disabled={isLoading}
//                   className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-70"
//                 >
//                   {isLoading ? 'Saving...' : (editingItem ? 'Update Bottle' : 'Save Inventory Entry')}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* FULL PAGE STOCK REPORT PRINT LAYOUT */}
//       <div id="print-area" className="hidden print:block fixed inset-0 bg-white z-[9999] w-full">
//         <div className="w-full h-auto flex flex-col max-w-4xl mx-auto">
//             {/* Header */}
//             <div className="flex justify-between items-start mb-8 border-b-2 border-gray-800 pb-6">
//                 <div>
//                     <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">INVENTORY REPORT</h1>
//                     <p className="text-lg font-bold text-gray-800">Paaris Enterprises</p>
//                     <p className="text-gray-500 text-sm mt-1">Stock Valuation & Status</p>
//                 </div>
//                 <div className="text-right">
//                     <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Report Date</span>
//                     <span className="font-medium text-gray-900">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
//                 </div>
//             </div>

//             {/* Stats Summary for Print */}
//             <div className="flex gap-10 mb-8 p-4 bg-gray-50 border border-gray-100 rounded-xl">
//                 <div>
//                     <p className="text-xs font-bold text-gray-500 uppercase">Total Items</p>
//                     <p className="text-xl font-black text-gray-900">{filteredItems.length}</p>
//                 </div>
//                 <div>
//                     <p className="text-xs font-bold text-gray-500 uppercase">Total Stock Count</p>
//                     <p className="text-xl font-black text-gray-900">{totalItemsCount}</p>
//                 </div>
//                 <div>
//                     <p className="text-xs font-bold text-gray-500 uppercase">Total Valuation</p>
//                     <p className="text-xl font-black text-indigo-600">₹{totalStockValue.toLocaleString('en-IN')}</p>
//                 </div>
//             </div>

//             {/* Table */}
//             <table className="w-full text-left border-collapse">
//                 <thead>
//                     <tr className="border-b-2 border-gray-200">
//                         <th className="py-3 text-sm font-bold text-gray-600 uppercase tracking-wider w-16">Sr. No</th>
//                         <th className="py-3 text-sm font-bold text-gray-600 uppercase tracking-wider">Product Name</th>
//                         <th className="py-3 text-center text-sm font-bold text-gray-600 uppercase tracking-wider">Stock</th>
//                         <th className="py-3 text-right text-sm font-bold text-gray-600 uppercase tracking-wider">Unit Cost</th>
//                         <th className="py-3 text-right text-sm font-bold text-gray-600 uppercase tracking-wider">Total Value</th>
//                     </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-100">
//                     {filteredItems.map((item, idx) => (
//                         <tr key={idx}>
//                             <td className="py-3 text-gray-500 font-bold">{idx + 1}</td>
//                             <td className="py-3 text-gray-900 font-bold">{item.name}</td>
//                             <td className="py-3 text-center font-medium">
//                                 {item.stock} <span className="text-xs text-gray-400">units</span>
//                             </td>
//                             <td className="py-3 text-right text-gray-600">₹{item.cost.toFixed(2)}</td>
//                             <td className="py-3 text-right font-bold text-gray-900">₹{(item.stock * item.cost).toLocaleString('en-IN')}</td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>

//             {/* Footer */}
//             <div className="mt-10 border-t border-gray-200 pt-4 text-center">
//                 <p className="text-xs text-gray-400">Generated by TrustLayerr</p>
//             </div>
//         </div>
//       </div>

//     </div>
//   );
// };

  // export default Inventory;
  import React, { useState, useEffect } from 'react';
  import { User, UserRole } from '../types';
  import { 
    Plus, Search, Edit2, Trash2, Calendar, Package, Printer, History, 
    AlertTriangle, FileText, X, TrendingUp, ArrowDownRight, ArrowUpRight, 
    User as UserIcon, Clock, BarChart3, ChevronLeft, ChevronRight
  } from 'lucide-react';
  import { API_ENDPOINTS } from './config';

  interface InventoryProps {
    user: User;
  }

  const Inventory: React.FC<InventoryProps> = ({ user }) => {
    const [items, setItems] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [stockLogs, setStockLogs] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    
    // State to control what gets printed ('list' or 'history')
    const [printContent, setPrintContent] = useState<'list' | 'history'>('list');

    // Monthly Sales Modal
    const [showMonthlySalesModal, setShowMonthlySalesModal] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(() => {
      const now = new Date();
      return { month: now.getMonth(), year: now.getFullYear() };
    });

    const [formData, setFormData] = useState<any>({
      name: '',
      cost: 0, 
      stock: 0,
    });

    const API_URL = `${API_ENDPOINTS.PRODUCTS}`;
    const ORDER_API = `${API_ENDPOINTS.ORDERS}`;
    const STOCK_LOG_API = `${API_ENDPOINTS.STOCK_LOGS}`;

    useEffect(() => {
      fetchData();
    }, [user.id]);

    const fetchData = async () => {
      try {
        // 1. Fetch Products
        const res = await fetch(`${API_URL}/${user.id}`);
        const data = await res.json();
        const mappedData = data.map((item: any) => ({
          ...item,
          id: item._id
        }));
        setItems(mappedData);

        // 2. Fetch Orders
        const orderRes = await fetch(`${ORDER_API}/${user.id}`);
        const orderData = await orderRes.json();
        setOrders(orderData);

        // 3. Fetch Stock Logs
        const stockLogRes = await fetch(`${STOCK_LOG_API}/${user.id}`);
        const stockLogData = await stockLogRes.json();
        setStockLogs(stockLogData);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };


    // --- GENERATE DAILY LOGS ---
    const getDailyLogs = () => {
      const logs: any[] = [];

      // 1. Log Sales (Stock Out) from Orders
      orders.forEach(order => {
          order.items.forEach((orderItem: any) => {
              const product = items.find(i => i.id === orderItem.bottleId);
              if (product) {
                  logs.push({
                      date: new Date(order.date),
                      type: 'SALE',
                      productName: product.name,
                      quantity: orderItem.quantity,
                      detail: `Order by ${order.toName}`,
                      value: orderItem.unitPrice * orderItem.quantity
                  });
              }
          });
      });

      // 2. Log Stock Changes from StockLog Database (ADD and EDIT events)
      stockLogs.forEach(log => {
          logs.push({
              date: new Date(log.timestamp),
              type: log.type,
              productName: log.productName,
              quantity: Math.abs(log.quantityChange),
              detail: log.detail || (log.type === 'ADD' ? 'Stock Added' : 'Stock Edited'),
              value: log.newCost * log.newStock,
              quantityChange: log.quantityChange
          });
      });

      // Sort by Date Descending (Newest first)
      return logs.sort((a, b) => b.date.getTime() - a.date.getTime());
    };

    // Group logs by Date string for display
    const groupLogsByDate = (logs: any[]) => {
        const groups: { [key: string]: any[] } = {};
        logs.forEach(log => {
            const dateStr = log.date.toLocaleDateString('en-IN', { 
                weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' 
            });
            if (!groups[dateStr]) groups[dateStr] = [];
            groups[dateStr].push(log);
        });
        return groups;
    };

    const openAddModal = () => {
      setEditingItem(null);
      setFormData({ name: '', cost: 0, stock: 0 });
      setShowModal(true);
    };

    const openEditModal = (item: any) => {
      setEditingItem(item);
      setFormData({ name: item.name, cost: item.cost, stock: item.stock });
      setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      // Validate that stock and cost are not negative
      if (formData.stock < 0) {
        alert('Stock level cannot be negative!');
        return;
      }
      if (formData.cost < 0) {
        alert('Cost/Price cannot be negative!');
        return;
      }

      setIsLoading(true);

      try {
        const body = {
          name: formData.name,
          cost: formData.cost,
          stock: formData.stock,
          // When saving, the backend usually updates 'updatedAt', which will reflect in our logs
        };

        if (editingItem) {
          await fetch(`${API_URL}/${editingItem.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
        } else {
          await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...body, ownerId: user.id }),
          });
        }
        
        await fetchData(); // Refresh data
        setShowModal(false);
        setFormData({ name: '', cost: 0, stock: 0 });
        setEditingItem(null);

      } catch (error) {
        console.error("Error saving item:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const handleDelete = async (id: string) => {
      if (confirm('Are you sure you want to delete this item?')) {
        try {
          await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
          setItems(items.filter(i => i.id !== id));
        } catch (error) {
          console.error("Error deleting item:", error);
        }
      }
    };

    const handlePrintList = () => {
      setPrintContent('list');
      setTimeout(() => window.print(), 100);
    };

    const handlePrintHistory = () => {
      setPrintContent('history');
      setTimeout(() => window.print(), 100);
    };

    const filteredItems = items.filter(i => 
      (i.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalStockValue = filteredItems.reduce((acc, item) => acc + (item.cost * item.stock), 0);
    const totalItemsCount = filteredItems.reduce((acc, item) => acc + item.stock, 0);
    const lowStockItems = filteredItems.filter(i => i.stock < 50);

    const logs = getDailyLogs();
    const groupedLogs = groupLogsByDate(logs);

    // --- MONTHLY SALES SUMMARY ---
    const getMonthlySales = () => {
      const { month, year } = selectedMonth;
      const salesMap: { [productName: string]: { quantity: number; revenue: number } } = {};

      orders.forEach(order => {
        const orderDate = new Date(order.date);
        if (orderDate.getMonth() === month && orderDate.getFullYear() === year) {
          order.items.forEach((orderItem: any) => {
            const product = items.find(i => i.id === orderItem.bottleId);
            const productName = product ? product.name : 'Unknown Product';
            if (!salesMap[productName]) {
              salesMap[productName] = { quantity: 0, revenue: 0 };
            }
            salesMap[productName].quantity += orderItem.quantity;
            salesMap[productName].revenue += orderItem.quantity * orderItem.unitPrice;
          });
        }
      });

      return Object.entries(salesMap)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.quantity - a.quantity);
    };

    const monthlySales = showMonthlySalesModal ? getMonthlySales() : [];
    const totalMonthlySoldQty = monthlySales.reduce((acc, s) => acc + s.quantity, 0);
    const totalMonthlyRevenue = monthlySales.reduce((acc, s) => acc + s.revenue, 0);

    const monthLabel = new Date(selectedMonth.year, selectedMonth.month).toLocaleString('en-IN', { month: 'long', year: 'numeric' });

    const goToPrevMonth = () => {
      setSelectedMonth(prev => {
        const d = new Date(prev.year, prev.month - 1);
        return { month: d.getMonth(), year: d.getFullYear() };
      });
    };
    const goToNextMonth = () => {
      setSelectedMonth(prev => {
        const d = new Date(prev.year, prev.month + 1);
        return { month: d.getMonth(), year: d.getFullYear() };
      });
    };

    return (
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
        {/* Print Styles */}
        <style>
          {`
            @media print {
              body * { visibility: hidden; height: 0; overflow: hidden; }
              #print-area, #print-area * { visibility: visible; height: auto; }
              #print-area { 
                position: absolute; 
                left: 0; 
                top: 0; 
                width: 100%; 
                padding: 40px;
              }
              @page { size: A4; margin: 0; }
            }
          `}
        </style>

        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              {user.role === UserRole.MANUFACTURER ? 'Bottle Management' : 'Stock & Price'}
            </h1>
            <p className="text-gray-600 font-medium">Manage your product inventory and valuation.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <button 
                  onClick={() => setShowMonthlySalesModal(true)}
                  className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-4 rounded-[1.25rem] font-bold flex items-center justify-center gap-2 transition-all shadow-sm w-full sm:w-auto"
              >
                  <BarChart3 size={20} />
                  Monthly Sales
              </button>

              <button 
                  onClick={() => setShowHistoryModal(true)}
                  className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-4 rounded-[1.25rem] font-bold flex items-center justify-center gap-2 transition-all shadow-sm w-full sm:w-auto"
              >
                  <History size={20} />
                  Daily Logs
              </button>

              <button 
                  onClick={handlePrintList}
                  className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-4 rounded-[1.25rem] font-bold flex items-center justify-center gap-2 transition-all shadow-sm w-full sm:w-auto"
              >
                  <Printer size={20} />
                  Print Stock
              </button>
              <button 
                  onClick={openAddModal}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-[1.25rem] font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98] w-full sm:w-auto"
              >
                  <Plus size={24} />
                  {user.role === UserRole.MANUFACTURER ? 'Create New Bottle' : 'Receive Stock'}
              </button>
          </div>
        </header>

        {/* Main Table */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 bg-gray-50/30">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Filter by name..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-gray-50/80 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                <tr>
                  <th className="px-8 py-5 w-24">Sr. No</th>
                  <th className="px-8 py-5">Product Info</th>
                  <th className="px-8 py-5">Inventory</th>
                  <th className="px-8 py-5">{user.role === UserRole.MANUFACTURER ? 'Cost (ea)' : 'Purchase Price'}</th>
                  <th className="px-8 py-5">Last Update</th>
                  <th className="px-8 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6 font-bold text-gray-400">{index + 1}</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50/50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100/50 shadow-sm">
                          <Package size={22} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900 leading-tight">{item.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 mt-0.5">#{item.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-black ${
                          item.stock < 50 ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}>
                          {item.stock} Units
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-1.5 text-base font-black text-gray-900">
                        <span className="text-gray-400 text-sm">₹</span>
                        {item.cost.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                        <Calendar size={14} className="text-gray-400" />
                        {new Date(item.updatedAt || item.lastUpdated).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEditModal(item)}
                          className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setShowModal(false)} />
            <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 border border-white/20">
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-2xl font-black text-gray-900">
                  {editingItem ? 'Edit Bottle' : 'Add Entry'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <Plus size={28} className="rotate-45" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Product Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. 500ml PET Clear"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 font-bold text-gray-900 transition-all"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                      {user.role === UserRole.MANUFACTURER ? 'Unit Cost (₹)' : 'Buy Price (₹)'}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="0.00"
                      value={formData.cost}
                      onChange={(e) => setFormData({...formData, cost: parseFloat(e.target.value)})}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 font-bold text-gray-900 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Stock Level</label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 font-bold text-gray-900 transition-all"
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-70"
                  >
                    {isLoading ? 'Saving...' : (editingItem ? 'Update Bottle' : 'Save Inventory Entry')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* NEW: DAILY LOGS MODAL */}
        {showHistoryModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowHistoryModal(false)} />
              <div className="bg-white rounded-[2rem] w-full max-w-3xl h-[85vh] shadow-2xl relative z-10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
                      <div>
                          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                              <History className="text-indigo-600" />
                              Daily Stock Logs
                          </h2>
                          <p className="text-gray-500 font-medium text-sm mt-1">Chronological history of Stock Added & Sales.</p>
                      </div>
                      <div className="flex items-center gap-3">
                          <button onClick={handlePrintHistory} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors">
                              <Printer size={18} /> Print
                          </button>
                          <button onClick={() => setShowHistoryModal(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                              <X size={20} className="text-gray-600" />
                          </button>
                      </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-gray-50/30">
                      <div className="space-y-8">
                          {Object.keys(groupedLogs).map((dateStr) => (
                              <div key={dateStr}>
                                  {/* Date Header */}
                                  <div className="flex items-center gap-3 mb-4">
                                      <div className="h-px bg-gray-200 flex-1"></div>
                                      <span className="text-xs font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                                          {dateStr}
                                      </span>
                                      <div className="h-px bg-gray-200 flex-1"></div>
                                  </div>

                                  {/* Logs for this Date */}
                                  <div className="space-y-3">
                                      {groupedLogs[dateStr].map((log: any, idx: number) => {
                                          const isAdd = log.type === 'ADD';
                                          const isSale = log.type === 'SALE';
                                          const isEdit = log.type === 'EDIT';
                                          const bgColor = isAdd ? 'bg-emerald-50 text-emerald-600' : isSale ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600';
                                          const textColor = isAdd ? 'text-emerald-600' : isSale ? 'text-rose-600' : 'text-blue-600';
                                          const quantityDisplay = log.quantityChange !== undefined ? log.quantityChange : (isAdd ? log.quantity : -log.quantity);

                                          return (
                                              <div key={idx} className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group">
                                                  <div className="flex items-center gap-4">
                                                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgColor}`}>
                                                          {isAdd ? <ArrowUpRight size={20} /> : isSale ? <ArrowDownRight size={20} /> : <Edit2 size={20} />}
                                                      </div>
                                                      <div>
                                                          <p className="text-sm font-black text-gray-900">{log.productName}</p>
                                                          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mt-0.5">
                                                              <Clock size={12} />
                                                              {log.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                              <span>{log.detail}</span>
                                                          </div>
                                                      </div>
                                                  </div>
                                                  <div className="text-right">
                                                      <p className={`text-base font-black ${textColor}`}>
                                                          {quantityDisplay > 0 ? '+' : ''}{quantityDisplay}
                                                      </p>
                                                  </div>
                                              </div>
                                          );
                                      })}
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
        )}

        {/* MONTHLY SALES MODAL */}
        {showMonthlySalesModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMonthlySalesModal(false)} />
              <div className="bg-white rounded-[2rem] w-full max-w-2xl h-[80vh] shadow-2xl relative z-10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  
                  <div className="p-6 border-b border-gray-100 bg-gray-50/80">
                      <div className="flex justify-between items-center">
                          <div>
                              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                  <BarChart3 className="text-indigo-600" />
                                  Monthly Sales
                              </h2>
                              <p className="text-gray-500 font-medium text-sm mt-1">Product-wise sales summary per month.</p>
                          </div>
                          <button onClick={() => setShowMonthlySalesModal(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                              <X size={20} className="text-gray-600" />
                          </button>
                      </div>

                      {/* Month Picker */}
                      <div className="flex items-center justify-center gap-4 mt-5">
                          <button onClick={goToPrevMonth} className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 transition-colors">
                              <ChevronLeft size={20} className="text-gray-600" />
                          </button>
                          <span className="text-lg font-black text-gray-900 min-w-[180px] text-center">
                              {monthLabel}
                          </span>
                          <button onClick={goToNextMonth} className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 transition-colors">
                              <ChevronRight size={20} className="text-gray-600" />
                          </button>
                      </div>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                      {/* Summary Stats */}
                      <div className="p-6 border-b border-gray-100 bg-white">
                          <div className="grid grid-cols-2 gap-4">
                              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
                                  <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">Total Items Sold</p>
                                  <p className="text-2xl font-black text-indigo-700 mt-1">{totalMonthlySoldQty}</p>
                              </div>
                              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                                  <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">Total Revenue</p>
                                  <p className="text-2xl font-black text-emerald-700 mt-1">₹{totalMonthlyRevenue.toLocaleString('en-IN')}</p>
                              </div>
                          </div>
                      </div>

                      {/* Product-wise Table */}
                      <div className="p-6">
                          {monthlySales.length === 0 ? (
                              <div className="text-center py-16">
                                  <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
                                  <p className="text-lg font-black text-gray-400">No sales in {monthLabel}</p>
                                  <p className="text-sm text-gray-400 mt-1">Try selecting a different month.</p>
                              </div>
                          ) : (
                              <table className="w-full text-left">
                                  <thead>
                                      <tr className="border-b-2 border-gray-100">
                                          <th className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest w-12">#</th>
                                          <th className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                                          <th className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Qty Sold</th>
                                          <th className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Revenue</th>
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-50">
                                      {monthlySales.map((sale, idx) => (
                                          <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                              <td className="py-4 text-sm font-bold text-gray-400">{idx + 1}</td>
                                              <td className="py-4">
                                                  <div className="flex items-center gap-3">
                                                      <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 border border-indigo-100/50">
                                                          <Package size={16} />
                                                      </div>
                                                      <span className="text-sm font-black text-gray-900">{sale.name}</span>
                                                  </div>
                                              </td>
                                              <td className="py-4 text-center">
                                                  <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-black bg-rose-50 text-rose-700 border border-rose-100">
                                                      {sale.quantity} units
                                                  </span>
                                              </td>
                                              <td className="py-4 text-right">
                                                  <span className="text-sm font-black text-gray-900">₹{sale.revenue.toLocaleString('en-IN')}</span>
                                              </td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          )}
                      </div>
                  </div>
              </div>
          </div>
        )}

        {/* PRINT AREA */}
        <div id="print-area" className="hidden print:block fixed inset-0 bg-white z-[9999] w-full">
          <div className="w-full h-auto flex flex-col max-w-4xl mx-auto">
              <div className="flex justify-between items-start mb-8 border-b-2 border-gray-800 pb-6">
                  <div>
                      <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                          {printContent === 'list' ? 'INVENTORY REPORT' : 'DAILY STOCK LOGS'}
                      </h1>
                      <p className="text-lg font-bold text-gray-800">Paaris Enterprises</p>
                      <p className="text-gray-500 text-sm mt-1">{printContent === 'list' ? 'Current Stock Snapshot' : 'Chronological Stock Movement'}</p>
                  </div>
                  <div className="text-right">
                      <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Generated On</span>
                      <span className="font-medium text-gray-900">{new Date().toLocaleString('en-IN')}</span>
                  </div>
              </div>

              {printContent === 'list' ? (
                  <>
                      <div className="flex gap-10 mb-8 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                          <div><p className="text-xs font-bold text-gray-500 uppercase">Items</p><p className="text-xl font-black text-gray-900">{filteredItems.length}</p></div>
                          <div><p className="text-xs font-bold text-gray-500 uppercase">Total Stock</p><p className="text-xl font-black text-gray-900">{totalItemsCount}</p></div>
                          <div><p className="text-xs font-bold text-gray-500 uppercase">Valuation</p><p className="text-xl font-black text-indigo-600">₹{totalStockValue.toLocaleString('en-IN')}</p></div>
                      </div>
                      <table className="w-full text-left border-collapse">
                          <thead>
                              <tr className="border-b-2 border-gray-200">
                                  <th className="py-3 text-sm font-bold text-gray-600 uppercase w-12">#</th>
                                  <th className="py-3 text-sm font-bold text-gray-600 uppercase">Product</th>
                                  <th className="py-3 text-center text-sm font-bold text-gray-600 uppercase">Stock</th>
                                  <th className="py-3 text-right text-sm font-bold text-gray-600 uppercase">Cost</th>
                                  <th className="py-3 text-right text-sm font-bold text-gray-600 uppercase">Value</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                              {filteredItems.map((item, idx) => (
                                  <tr key={idx}>
                                      <td className="py-3 text-gray-500 font-bold">{idx + 1}</td>
                                      <td className="py-3 text-gray-900 font-bold">{item.name}</td>
                                      <td className="py-3 text-center font-medium">{item.stock}</td>
                                      <td className="py-3 text-right text-gray-600">₹{item.cost.toFixed(2)}</td>
                                      <td className="py-3 text-right font-bold text-gray-900">₹{(item.stock * item.cost).toLocaleString('en-IN')}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </>
              ) : (
                  <div className="space-y-6">
                      {logs.map((log: any, idx: number) => {
                          const quantityDisplay = log.quantityChange !== undefined ? log.quantityChange : (log.type === 'ADD' ? log.quantity : -log.quantity);
                          const colorClass = log.type === 'ADD' ? 'text-emerald-700' : log.type === 'SALE' ? 'text-rose-700' : 'text-blue-700';

                          return (
                              <div key={idx} className="border-b border-gray-100 pb-2 mb-2 flex justify-between items-center">
                                  <div>
                                      <p className="text-xs font-bold text-gray-500">{log.date.toLocaleString()}</p>
                                      <p className="text-sm font-bold text-gray-900">{log.productName} - {log.detail}</p>
                                  </div>
                                  <div className={`font-bold ${colorClass}`}>
                                      {quantityDisplay > 0 ? '+' : ''}{quantityDisplay}
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              )}

              <div className="mt-10 border-t border-gray-200 pt-4 text-center">
                  <p className="text-xs text-gray-400">Generated by TrustLayerr</p>
              </div>
          </div>
        </div>

      </div>
    );
  };

  export default Inventory;