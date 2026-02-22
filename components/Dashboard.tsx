//Option 1


// import React, { useState, useEffect } from 'react';
// import { User, Order, UserRole } from '../types';
// import { API_ENDPOINTS } from './config'; 

// import { 
//   ChevronLeft, 
//   ChevronRight, 
//   Users, 
//   PackageCheck,
//   Calendar as CalendarIcon,
//   Plus,
//   Edit2,
//   X,
//   TrendingUp,
//   Wallet,
//   AlertCircle,
//   Maximize2
// } from 'lucide-react';
// import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday, isSameMonth, isSameYear, parse } from 'date-fns';

// interface DashboardProps {
//   user: User;
// }

// const Dashboard: React.FC<DashboardProps> = ({ user }) => {
//   const [currentMonth, setCurrentMonth] = useState(new Date());
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  
//   // Modal States
//   const [showOrderModal, setShowOrderModal] = useState(false);
//   const [showDayDetailModal, setShowDayDetailModal] = useState(false); // NEW: Day Detail Modal
//   const [inventory, setInventory] = useState<any[]>([]);
//   const [editingOrder, setEditingOrder] = useState<Order | null>(null);

//   // Form State
//   const [customerName, setCustomerName] = useState('');
//   const [newOrderStatus, setNewOrderStatus] = useState('Pending'); 
//   const [orderItems, setOrderItems] = useState([{ bottleId: '', quantity: 1, unitPrice: 0 }]);

//   const ORDER_API = `${API_ENDPOINTS.ORDERS}`;
//   const PRODUCT_API = `${API_ENDPOINTS.PRODUCTS}`;

//   useEffect(() => {
//     fetchData();
//   }, [user.id]);

//   const fetchData = async () => {
//     try {
//       const res = await fetch(`${ORDER_API}/${user.id}`);
//       const data = await res.json();
//       setOrders(data.map((o: any) => ({ ...o, id: o._id })));

//       const invRes = await fetch(`${PRODUCT_API}/${user.id}`);
//       const invData = await invRes.json();
//       setInventory(invData.map((i: any) => ({ ...i, id: i._id })));
//     } catch (error) {
//       console.error("Dashboard error:", error);
//     }
//   };

//   const days = eachDayOfInterval({
//     start: startOfMonth(currentMonth),
//     end: endOfMonth(currentMonth),
//   });

//   const getOrdersForDate = (date: Date) => {
//     return orders.filter(order => isSameDay(new Date(order.date), date));
//   };

//   // --- STATS CALCULATIONS ---
//   const getOrderProfit = (order: any) => {
//     return order.totalProfit !== undefined ? order.totalProfit : (order.profit || 0);
//   };

//   const totalProfit = orders.reduce((sum, order) => sum + getOrderProfit(order), 0);

//   const monthlyProfit = orders
//     .filter(order => isSameMonth(new Date(order.date), currentMonth))
//     .reduce((sum, order) => sum + getOrderProfit(order), 0);

//   const yearlyProfit = orders
//     .filter(order => isSameYear(new Date(order.date), currentMonth))
//     .reduce((sum, order) => sum + getOrderProfit(order), 0);

//   const totalOrders = orders.length;
//   const uniqueCustomers = new Set(orders.map(order => order.toName)).size;

//   const totalPending = orders
//     .filter(order => order.status !== 'Completed')
//     .reduce((sum, order) => sum + order.totalAmount, 0);

//   // --- HELPER FOR FONT SIZING ---
//   // Reduces font size if number is too long to fit in box
//   const getValueFontSize = (value: number) => {
//     const len = value.toLocaleString('en-IN').length;
//     if (len > 12) return 'text-lg';
//     if (len > 9) return 'text-xl';
//     return 'text-2xl md:text-3xl';
//   };

//   // --- HANDLERS ---

//   const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.value) {
//       setCurrentMonth(parse(e.target.value, 'yyyy-MM', new Date()));
//     }
//   };

//   const handleDayClick = (day: Date) => {
//     setSelectedDate(day);
//     setShowDayDetailModal(true); // Open the popup
//   };

//   const openAddModal = () => {
//     setEditingOrder(null);
//     setCustomerName('');
//     setNewOrderStatus('Pending');
//     setOrderItems([{ bottleId: '', quantity: 1, unitPrice: 0 }]);
//     setShowOrderModal(true);
//   };

//   const openEditModal = (order: Order) => {
//     // Close day modal if open to prevent overlap issues
//     setShowDayDetailModal(false);
    
//     setEditingOrder(order);
//     setCustomerName(order.toName);
//     setNewOrderStatus(order.status === 'Completed' ? 'Completed' : 'Pending');
//     if (order.items && order.items.length > 0) {
//       setOrderItems(order.items.map(i => ({
//         bottleId: i.bottleId,
//         quantity: i.quantity,
//         unitPrice: i.unitPrice
//       })));
//     } else {
//       // @ts-ignore
//       setOrderItems([{ bottleId: order.bottleId, quantity: order.quantity, unitPrice: order.unitPrice }]);
//     }
//     setShowOrderModal(true);
//   };

//   const handleItemChange = (index: number, field: string, value: any) => {
//     const newItems = [...orderItems];
//     // @ts-ignore
//     newItems[index][field] = value;
//     setOrderItems(newItems);
//   };

//   const addItemRow = () => {
//     setOrderItems([...orderItems, { bottleId: '', quantity: 1, unitPrice: 0 }]);
//   };

//   const removeItemRow = (index: number) => {
//     if (orderItems.length > 1) {
//       setOrderItems(orderItems.filter((_, i) => i !== index));
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (orderItems.some(i => !i.bottleId || i.quantity <= 0)) {
//       alert("Please check item details");
//       return;
//     }

//     try {
//       if (editingOrder) {
//         if(!confirm("Editing will replace the old order. Continue?")) return;
//         await fetch(`${ORDER_API}/${editingOrder.id}`, { method: 'DELETE' });
//       }

//       const response = await fetch(ORDER_API, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           fromId: user.id,
//           toName: customerName,
//           items: orderItems,
//           type: user.role === UserRole.MANUFACTURER ? 'M2D' : 'D2S',
//           date: selectedDate || new Date(),
//           status: newOrderStatus 
//         }),
//       });

//       if (response.ok) {
//         setShowOrderModal(false);
//         fetchData(); 
//       } else {
//         const d = await response.json();
//         alert(d.message || "Failed");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Error saving order");
//     }
//   };

//   return (
//     <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
//       <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Welcome, {user.username}</h1>
//           <p className="text-gray-600 font-medium">Overview for {format(currentMonth, 'MMMM yyyy')}</p>
//         </div>
        
//         <div className="flex bg-white border border-gray-200 rounded-2xl p-1 shadow-sm self-start sm:self-center">
//            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
//              <ChevronLeft size={20} className="text-gray-600" />
//            </button>
           
//            <div className="relative px-4 py-2 min-w-[140px] text-center group cursor-pointer flex items-center justify-center">
//              <span className="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors pointer-events-none">
//                 {format(currentMonth, 'MMMM yyyy')}
//              </span>
//              <input 
//                type="month" 
//                value={format(currentMonth, 'yyyy-MM')}
//                onChange={handleMonthChange}
//                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                title="Change Month"
//              />
//            </div>

//            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
//              <ChevronRight size={20} className="text-gray-600" />
//            </button>
//         </div>
//       </header>

//       {/* --- FINANCIAL STATS ROW --- */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
//         {/* Monthly Profit */}
//         <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center space-x-5 relative overflow-hidden">
//           <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl shadow-inner font-black text-xl z-10"><CalendarIcon size={24} /></div>
//           <div className="z-10 min-w-0 flex-1">
//             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest truncate">Profit ({format(currentMonth, 'MMM')})</p>
//             <p className={`${getValueFontSize(monthlyProfit)} font-black text-gray-900 tracking-tight truncate`} title={`₹${monthlyProfit.toLocaleString('en-IN')}`}>
//                 ₹{monthlyProfit.toLocaleString('en-IN')}
//             </p>
//           </div>
//         </div>

//         {/* Yearly Profit */}
//         <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center space-x-5 relative overflow-hidden">
//           <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl shadow-inner font-black text-xl z-10"><TrendingUp size={24} /></div>
//           <div className="z-10 min-w-0 flex-1">
//             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest truncate">Profit ({format(currentMonth, 'yyyy')})</p>
//             <p className={`${getValueFontSize(yearlyProfit)} font-black text-gray-900 tracking-tight truncate`} title={`₹${yearlyProfit.toLocaleString('en-IN')}`}>
//                 ₹{yearlyProfit.toLocaleString('en-IN')}
//             </p>
//           </div>
//         </div>

//         {/* Pending Payments */}
//         <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center space-x-5 relative overflow-hidden">
//           <div className="p-4 bg-red-50 text-red-600 rounded-2xl shadow-inner font-black text-xl z-10"><AlertCircle size={24} /></div>
//           <div className="z-10 min-w-0 flex-1">
//             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest truncate">Pending Payments</p>
//             <p className={`${getValueFontSize(totalPending)} font-black text-red-600 tracking-tight truncate`} title={`₹${totalPending.toLocaleString('en-IN')}`}>
//                 ₹{totalPending.toLocaleString('en-IN')}
//             </p>
//           </div>
//         </div>

//         {/* Lifetime Profit */}
//         <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center space-x-5 relative overflow-hidden">
//           <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl shadow-inner font-black text-xl z-10"><Wallet size={24} /></div>
//           <div className="z-10 min-w-0 flex-1">
//             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest truncate">Lifetime Profit</p>
//             <p className={`${getValueFontSize(totalProfit)} font-black text-gray-900 tracking-tight truncate`} title={`₹${totalProfit.toLocaleString('en-IN')}`}>
//                 ₹{totalProfit.toLocaleString('en-IN')}
//             </p>
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <div className="lg:col-span-2 bg-white p-5 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
//           <div className="flex items-center justify-between mb-8">
//             <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
//               <CalendarIcon size={24} className="text-indigo-600" />
//               Order Calendar
//             </h2>
//           </div>
//           <div className="overflow-x-auto -mx-5 md:-mx-8 px-5 md:px-8 pb-4">
//             <div className="min-w-[500px]">
//               <div className="grid grid-cols-7 gap-2 mb-4">
//                 {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
//                   <div key={day} className="text-center text-[10px] font-black text-gray-400 uppercase tracking-tighter">{day}</div>
//                 ))}
//               </div>
//               <div className="grid grid-cols-7 gap-2">
//                 {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, idx) => (
//                   <div key={`empty-${idx}`} className="h-20 md:h-28 bg-gray-50/40 rounded-2xl border border-transparent"></div>
//                 ))}
//                 {days.map((day, idx) => {
//                   const dayOrders = getOrdersForDate(day);
//                   const isDateSelected = isSameDay(day, selectedDate || new Date(0));
                  
//                   // Calculate Profit for this day
//                   const dayProfit = dayOrders.reduce((acc, o) => acc + getOrderProfit(o), 0);

//                   return (
//                     <button
//                       key={idx}
//                       onClick={() => handleDayClick(day)} // UPDATED: Opens Modal
//                       className={`h-20 md:h-28 p-1.5 md:p-3 border transition-all relative rounded-2xl flex flex-col items-center justify-between gap-1 group ${
//                         isDateSelected 
//                           ? 'border-indigo-600 ring-4 ring-indigo-50 bg-indigo-50/20' 
//                           : 'border-gray-100 hover:border-indigo-200 bg-white shadow-sm'
//                       }`}
//                     >
//                       <span className={`text-xs md:text-sm font-bold ${isToday(day) ? 'text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded-lg' : isDateSelected ? 'text-indigo-800' : 'text-gray-500'}`}>
//                         {format(day, 'd')}
//                       </span>
                      
//                       {/* Order Count Bubble */}
//                       {dayOrders.length > 0 ? (
//                         <div className="flex flex-col items-center gap-1 w-full">
//                            {/* Daily Profit Pill - UPDATED SIZE */}
//                            <div className="bg-emerald-100 text-emerald-800 text-[9px] md:text-[10px] font-extrabold px-1.5 py-0.5 rounded-md w-full text-center truncate tracking-tight shadow-sm border border-emerald-200" title={`Profit: ₹${dayProfit.toLocaleString('en-IN')}`}>
//                              +₹{dayProfit.toLocaleString('en-IN')}
//                            </div>
//                            <div className="bg-indigo-600 text-[8px] md:text-[10px] text-white py-0.5 px-2 rounded-full font-black leading-none opacity-80">
//                              {dayOrders.length}
//                            </div>
//                         </div>
//                       ) : (
//                         <div className="flex-1"></div>
//                       )}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* SIDE PANEL (NOW JUST MONTH SUMMARY / ACTIONS) */}
//         <div className="bg-white p-5 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between">
//           <div>
//              <h2 className="text-xl font-black text-gray-900 mb-2">Month Overview</h2>
//              <p className="text-gray-500 text-sm font-medium mb-6">Summary for {format(currentMonth, 'MMMM yyyy')}</p>
             
//              <div className="space-y-4">
//                 <div className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center">
//                     <span className="text-gray-500 font-bold text-sm">Orders</span>
//                     <span className="text-gray-900 font-black text-lg">{orders.filter(o => isSameMonth(new Date(o.date), currentMonth)).length}</span>
//                 </div>
//                 <div className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center">
//                     <span className="text-gray-500 font-bold text-sm">Revenue</span>
//                     <span className="text-indigo-600 font-black text-lg">₹{orders.filter(o => isSameMonth(new Date(o.date), currentMonth)).reduce((acc, o) => acc + o.totalAmount, 0).toLocaleString('en-IN')}</span>
//                 </div>
//              </div>
//           </div>

//           <div className="mt-8">
//              <button 
//                 onClick={openAddModal}
//                 className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-transform active:scale-95 flex items-center justify-center gap-2"
//              >
//                <Plus size={20} />
//                Create New Order
//              </button>
//           </div>
//         </div>
//       </div>

//       {/* --- DAY DETAIL MODAL (POPUP) --- */}
//       {showDayDetailModal && selectedDate && (
//         <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
//             <div className="bg-white rounded-[2rem] w-full max-w-2xl h-[85vh] shadow-2xl flex flex-col overflow-hidden relative">
                
//                 {/* Header */}
//                 <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
//                     <div>
//                         <h2 className="text-2xl font-black text-gray-900 tracking-tight">Details: {format(selectedDate, 'MMM do')}</h2>
//                         <p className="text-gray-500 font-medium text-xs mt-1">{format(selectedDate, 'EEEE, yyyy')}</p>
//                     </div>
//                     <button onClick={() => setShowDayDetailModal(false)} className="p-2 bg-white rounded-full hover:bg-gray-200 transition-colors shadow-sm">
//                         <X size={20} className="text-gray-600" />
//                     </button>
//                 </div>

//                 <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-gray-50/30">
//                     {/* PURPLE SUMMARY BOX (PROFIT ONLY) */}
//                     <div className="p-8 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl shadow-xl text-white mb-8 text-center relative overflow-hidden">
//                         <div className="relative z-10">
//                             <p className="text-indigo-200 text-xs font-bold uppercase tracking-[0.2em] mb-3">Net Profit</p>
//                             {/* Smart sizing for profit inside the box */}
//                             <p className={`${getValueFontSize(getOrdersForDate(selectedDate).reduce((s, o) => s + getOrderProfit(o), 0))} font-black text-white leading-none`}>
//                                 +₹{getOrdersForDate(selectedDate).reduce((s, o) => s + getOrderProfit(o), 0).toLocaleString('en-IN')}
//                             </p>
//                             <div className="mt-4 inline-block bg-white/20 px-4 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm">
//                                 {getOrdersForDate(selectedDate).length} Order{getOrdersForDate(selectedDate).length !== 1 && 's'} Processed
//                             </div>
//                         </div>
//                         {/* Decorative Circle */}
//                         <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
//                     </div>

//                     {/* ORDER LIST */}
//                     <div className="space-y-4">
//                         {getOrdersForDate(selectedDate).length > 0 ? (
//                             getOrdersForDate(selectedDate).map(order => (
//                                 <div key={order.id} className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group">
//                                     <div className="flex justify-between items-start mb-3">
//                                         <div className="flex items-center gap-2">
//                                             <span className="bg-indigo-50 text-indigo-600 text-[10px] font-mono font-bold px-2 py-1 rounded-lg">
//                                                 #{order.id.slice(-6).toUpperCase()}
//                                             </span>
//                                             <span className="text-xs font-bold text-gray-400">
//                                                 {format(new Date(order.date), 'h:mm a')}
//                                             </span>
//                                         </div>
//                                         <button 
//                                             onClick={() => openEditModal(order)}
//                                             className="text-gray-300 hover:text-indigo-600 transition-colors"
//                                         >
//                                             <Edit2 size={16} />
//                                         </button>
//                                     </div>

//                                     <h3 className="text-lg font-black text-gray-900 mb-3">{order.toName}</h3>

//                                     {/* Items */}
//                                     <div className="bg-gray-50 rounded-xl p-3 mb-3 space-y-1">
//                                         {order.items && order.items.length > 0 ? (
//                                             order.items.map((item: any, i: number) => (
//                                                 <div key={i} className="flex justify-between text-xs text-gray-600">
//                                                     <span className="font-bold">{item.bottleName}</span>
//                                                     <span>x{item.quantity}</span>
//                                                 </div>
//                                             ))
//                                         ) : (
//                                             <div className="flex justify-between text-xs text-gray-600">
//                                                 {/* @ts-ignore */}
//                                                 <span className="font-bold">{order.bottleName}</span>
//                                                 {/* @ts-ignore */}
//                                                 <span>x{order.quantity}</span>
//                                             </div>
//                                         )}
//                                     </div>

//                                     {/* Footer */}
//                                     <div className="flex justify-between items-center border-t border-gray-100 pt-3">
//                                         <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider ${order.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
//                                             {order.status === 'Completed' ? 'Paid' : 'Pending'}
//                                         </span>
//                                         <span className="text-lg font-black text-gray-900">
//                                             ₹{order.totalAmount.toLocaleString('en-IN')}
//                                         </span>
//                                     </div>
//                                 </div>
//                             ))
//                         ) : (
//                             <div className="text-center py-10 text-gray-400">
//                                 <PackageCheck size={40} className="mx-auto mb-3 opacity-20" />
//                                 <p className="font-bold text-sm">No orders on this date.</p>
//                             </div>
//                         )}
//                     </div>
//                 </div>
                
//                 {/* Floating Add Button in Modal */}
//                 <div className="p-4 border-t border-gray-100 bg-white">
//                     <button 
//                         onClick={openAddModal}
//                         className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
//                     >
//                         <Plus size={18} /> Add New Order
//                     </button>
//                 </div>
//             </div>
//         </div>
//       )}

//       {/* CREATE ORDER MODAL */}
//       {showOrderModal && (
//         <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
//           <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
//             {/* ... (Existing Create Order Modal Code) ... */}
//             <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
//               <h2 className="text-xl font-bold text-gray-900">
//                 {editingOrder ? 'Edit Order' : `New Order for ${selectedDate ? format(selectedDate, 'MMM do') : ''}`}
//               </h2>
//               <button onClick={() => setShowOrderModal(false)} className="text-gray-400 hover:text-gray-600">
//                 <X size={24} />
//               </button>
//             </div>
            
//             <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
//               <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Customer Name</label>
//                     <input 
//                       type="text" 
//                       required 
//                       value={customerName}
//                       onChange={e => setCustomerName(e.target.value)}
//                       className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Payment Status</label>
//                     <select 
//                         value={newOrderStatus}
//                         onChange={(e) => setNewOrderStatus(e.target.value)}
//                         className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
//                     >
//                         <option value="Pending">Pending</option>
//                         <option value="Completed">Completed</option>
//                     </select>
//                   </div>
//               </div>

//               <div className="space-y-3">
//                 <div className="flex justify-between items-center">
//                    <label className="block text-xs font-bold text-gray-500 uppercase">Items</label>
//                    <button type="button" onClick={addItemRow} className="text-indigo-600 text-xs font-bold">+ Add Item</button>
//                 </div>
//                 {orderItems.map((item, idx) => (
//                   <div key={idx} className="flex gap-2 items-center">
//                     <select 
//                       value={item.bottleId}
//                       onChange={e => handleItemChange(idx, 'bottleId', e.target.value)}
//                       className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
//                       required
//                     >
//                       <option value="">Select Product</option>
//                       {inventory.map(inv => (
//                         <option key={inv.id} value={inv.id}>{inv.name}</option>
//                       ))}
//                     </select>
//                     <input 
//                       type="number" 
//                       min="1" 
//                       placeholder="Qty" 
//                       value={item.quantity}
//                       onChange={e => handleItemChange(idx, 'quantity', parseInt(e.target.value))}
//                       className="w-16 px-2 py-2 border border-gray-200 rounded-lg text-sm"
//                       required
//                     />
//                     <input 
//                       type="number" 
//                       step="0.01" 
//                       placeholder="Price" 
//                       value={item.unitPrice}
//                       onChange={e => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value))}
//                       className="w-20 px-2 py-2 border border-gray-200 rounded-lg text-sm"
//                       required
//                     />
//                     {orderItems.length > 1 && (
//                       <button type="button" onClick={() => removeItemRow(idx)} className="text-red-400 hover:text-red-600">
//                         <X size={16} />
//                       </button>
//                     )}
//                   </div>
//                 ))}
//               </div>

//               <div className="pt-4">
//                 <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold">
//                   {editingOrder ? 'Update Order' : 'Create Order'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Dashboard;




// Option 2

// import React, { useState, useEffect } from 'react';
// import { User, Order, UserRole } from '../types';
// import { API_ENDPOINTS } from './config'; 

// import { 
//   ChevronLeft, 
//   ChevronRight, 
//   Users, 
//   PackageCheck,
//   Calendar as CalendarIcon,
//   Plus,
//   Edit2,
//   X,
//   TrendingUp,
//   Wallet,
//   AlertCircle,
//   IndianRupee
// } from 'lucide-react';
// import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday, isSameMonth, isSameYear, parse } from 'date-fns';

// interface DashboardProps {
//   user: User;
// }

// const Dashboard: React.FC<DashboardProps> = ({ user }) => {
//   const [currentMonth, setCurrentMonth] = useState(new Date());
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  
//   // Modal States
//   const [showOrderModal, setShowOrderModal] = useState(false);
//   const [showDayDetailModal, setShowDayDetailModal] = useState(false);
//   const [inventory, setInventory] = useState<any[]>([]);
//   const [editingOrder, setEditingOrder] = useState<Order | null>(null);

//   // Form State
//   const [customerName, setCustomerName] = useState('');
//   const [newOrderStatus, setNewOrderStatus] = useState('Pending'); 
//   const [orderItems, setOrderItems] = useState([{ bottleId: '', quantity: 1, unitPrice: 0 }]);

//   const ORDER_API = `${API_ENDPOINTS.ORDERS}`;
//   const PRODUCT_API = `${API_ENDPOINTS.PRODUCTS}`;

//   useEffect(() => {
//     fetchData();
//   }, [user.id]);

//   const fetchData = async () => {
//     try {
//       const res = await fetch(`${ORDER_API}/${user.id}`);
//       const data = await res.json();
//       setOrders(data.map((o: any) => ({ ...o, id: o._id })));

//       const invRes = await fetch(`${PRODUCT_API}/${user.id}`);
//       const invData = await invRes.json();
//       setInventory(invData.map((i: any) => ({ ...i, id: i._id })));
//     } catch (error) {
//       console.error("Dashboard error:", error);
//     }
//   };

//   const days = eachDayOfInterval({
//     start: startOfMonth(currentMonth),
//     end: endOfMonth(currentMonth),
//   });

//   const getOrdersForDate = (date: Date) => {
//     return orders.filter(order => isSameDay(new Date(order.date), date));
//   };

//   // --- STATS CALCULATIONS ---
//   const getOrderProfit = (order: any) => {
//     return order.totalProfit !== undefined ? order.totalProfit : (order.profit || 0);
//   };

//   const totalProfit = orders.reduce((sum, order) => sum + getOrderProfit(order), 0);

//   const monthlyProfit = orders
//     .filter(order => isSameMonth(new Date(order.date), currentMonth))
//     .reduce((sum, order) => sum + getOrderProfit(order), 0);

//   const yearlyProfit = orders
//     .filter(order => isSameYear(new Date(order.date), currentMonth))
//     .reduce((sum, order) => sum + getOrderProfit(order), 0);

//   const totalOrders = orders.length;
//   const uniqueCustomers = new Set(orders.map(order => order.toName)).size;

//   const totalPending = orders
//     .filter(order => order.status !== 'Completed')
//     .reduce((sum, order) => sum + order.totalAmount, 0);

//   // --- HELPER FOR SMART FONT SIZING ---
//   // Returns a Tailwind class string based on the length of the number
//   const getSmartFontSize = (val: number) => {
//     const str = val.toLocaleString('en-IN');
//     const len = str.length;
    
//     if (len > 14) return 'text-sm';
//     if (len > 11) return 'text-lg';
//     if (len > 9) return 'text-xl';
//     return 'text-2xl'; // Default for normal numbers
//   };

//   // --- HANDLERS ---

//   const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.value) {
//       setCurrentMonth(parse(e.target.value, 'yyyy-MM', new Date()));
//     }
//   };

//   const handleDayClick = (day: Date) => {
//     setSelectedDate(day);
//     setShowDayDetailModal(true);
//   };

//   const openAddModal = () => {
//     setEditingOrder(null);
//     setCustomerName('');
//     setNewOrderStatus('Pending');
//     setOrderItems([{ bottleId: '', quantity: 1, unitPrice: 0 }]);
//     setShowOrderModal(true);
//   };

//   const openEditModal = (order: Order) => {
//     setShowDayDetailModal(false); // Close day popup
//     setEditingOrder(order);
//     setCustomerName(order.toName);
//     setNewOrderStatus(order.status === 'Completed' ? 'Completed' : 'Pending');
//     if (order.items && order.items.length > 0) {
//       setOrderItems(order.items.map(i => ({
//         bottleId: i.bottleId,
//         quantity: i.quantity,
//         unitPrice: i.unitPrice
//       })));
//     } else {
//       // @ts-ignore
//       setOrderItems([{ bottleId: order.bottleId, quantity: order.quantity, unitPrice: order.unitPrice }]);
//     }
//     setShowOrderModal(true);
//   };

//   const handleItemChange = (index: number, field: string, value: any) => {
//     const newItems = [...orderItems];
//     // @ts-ignore
//     newItems[index][field] = value;
//     setOrderItems(newItems);
//   };

//   const addItemRow = () => {
//     setOrderItems([...orderItems, { bottleId: '', quantity: 1, unitPrice: 0 }]);
//   };

//   const removeItemRow = (index: number) => {
//     if (orderItems.length > 1) {
//       setOrderItems(orderItems.filter((_, i) => i !== index));
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (orderItems.some(i => !i.bottleId || i.quantity <= 0)) {
//       alert("Please check item details");
//       return;
//     }
//     try {
//       if (editingOrder) {
//         if(!confirm("Editing will replace the old order. Continue?")) return;
//         await fetch(`${ORDER_API}/${editingOrder.id}`, { method: 'DELETE' });
//       }
//       const response = await fetch(ORDER_API, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           fromId: user.id,
//           toName: customerName,
//           items: orderItems,
//           type: user.role === UserRole.MANUFACTURER ? 'M2D' : 'D2S',
//           date: selectedDate || new Date(),
//           status: newOrderStatus 
//         }),
//       });
//       if (response.ok) {
//         setShowOrderModal(false);
//         fetchData(); 
//       } else {
//         const d = await response.json();
//         alert(d.message || "Failed");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Error saving order");
//     }
//   };

//   return (
//     <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
//       <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Welcome, {user.username}</h1>
//           <p className="text-gray-600 font-medium">Overview for {format(currentMonth, 'MMMM yyyy')}</p>
//         </div>
        
//         <div className="flex bg-white border border-gray-200 rounded-2xl p-1 shadow-sm self-start sm:self-center">
//            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
//              <ChevronLeft size={20} className="text-gray-600" />
//            </button>
           
//            <div className="relative px-4 py-2 min-w-[140px] text-center group cursor-pointer flex items-center justify-center">
//              <span className="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors pointer-events-none">
//                 {format(currentMonth, 'MMMM yyyy')}
//              </span>
//              <input 
//                type="month" 
//                value={format(currentMonth, 'yyyy-MM')}
//                onChange={handleMonthChange}
//                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                title="Change Month"
//              />
//            </div>

//            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
//              <ChevronRight size={20} className="text-gray-600" />
//            </button>
//         </div>
//       </header>

//       {/* --- FINANCIAL STATS ROW --- */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
//         {/* Monthly Profit */}
//         <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center space-x-4 relative overflow-hidden">
//           <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-inner font-black text-xl z-10 shrink-0"><CalendarIcon size={24} /></div>
//           <div className="z-10 min-w-0 flex-1">
//             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Profit ({format(currentMonth, 'MMM')})</p>
//             {/* Auto-Sizing Font */}
//             <p className={`${getSmartFontSize(monthlyProfit)} font-black text-gray-900 tracking-tight leading-none break-words`}>
//                 ₹{monthlyProfit.toLocaleString('en-IN')}
//             </p>
//           </div>
//         </div>

//         {/* Yearly Profit */}
//         <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center space-x-4 relative overflow-hidden">
//           <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl shadow-inner font-black text-xl z-10 shrink-0"><TrendingUp size={24} /></div>
//           <div className="z-10 min-w-0 flex-1">
//             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Profit ({format(currentMonth, 'yyyy')})</p>
//             <p className={`${getSmartFontSize(yearlyProfit)} font-black text-gray-900 tracking-tight leading-none break-words`}>
//                 ₹{yearlyProfit.toLocaleString('en-IN')}
//             </p>
//           </div>
//         </div>

//         {/* Pending Payments */}
//         <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center space-x-4 relative overflow-hidden">
//           <div className="p-3 bg-red-50 text-red-600 rounded-2xl shadow-inner font-black text-xl z-10 shrink-0"><AlertCircle size={24} /></div>
//           <div className="z-10 min-w-0 flex-1">
//             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Pending Payments</p>
//             <p className={`${getSmartFontSize(totalPending)} font-black text-red-600 tracking-tight leading-none break-words`}>
//                 ₹{totalPending.toLocaleString('en-IN')}
//             </p>
//           </div>
//         </div>

//         {/* Lifetime Profit */}
//         <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center space-x-4 relative overflow-hidden">
//           <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shadow-inner font-black text-xl z-10 shrink-0"><Wallet size={24} /></div>
//           <div className="z-10 min-w-0 flex-1">
//             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Lifetime Profit</p>
//             <p className={`${getSmartFontSize(totalProfit)} font-black text-gray-900 tracking-tight leading-none break-words`}>
//                 ₹{totalProfit.toLocaleString('en-IN')}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* --- OPERATIONAL STATS ROW --- */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
//         <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center space-x-5">
//           <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl shadow-inner"><PackageCheck size={28} /></div>
//           <div>
//             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Orders Placed</p>
//             <p className="text-2xl font-black text-gray-900 tracking-tight">{totalOrders}</p>
//           </div>
//         </div>
//         <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center space-x-5">
//           <div className="p-4 bg-violet-50 text-violet-600 rounded-2xl shadow-inner"><Users size={28} /></div>
//           <div>
//             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{user.role === UserRole.MANUFACTURER ? 'Active Distributors' : 'Active SMEs'}</p>
//             <p className="text-2xl font-black text-gray-900 tracking-tight">{uniqueCustomers}</p>
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* CALENDAR */}
//         <div className="lg:col-span-2 bg-white p-5 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
//           <div className="flex items-center justify-between mb-8">
//             <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
//               <CalendarIcon size={24} className="text-indigo-600" />
//               Order Calendar
//             </h2>
//           </div>
//           <div className="overflow-x-auto -mx-5 md:-mx-8 px-5 md:px-8 pb-4">
//             <div className="min-w-[500px]">
//               <div className="grid grid-cols-7 gap-2 mb-4">
//                 {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
//                   <div key={day} className="text-center text-[10px] font-black text-gray-400 uppercase tracking-tighter">{day}</div>
//                 ))}
//               </div>
//               <div className="grid grid-cols-7 gap-2">
//                 {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, idx) => (
//                   <div key={`empty-${idx}`} className="h-20 md:h-28 bg-gray-50/40 rounded-2xl border border-transparent"></div>
//                 ))}
//                 {days.map((day, idx) => {
//                   const dayOrders = getOrdersForDate(day);
//                   const isDateSelected = isSameDay(day, selectedDate || new Date(0));
                  
//                   const dayProfit = dayOrders.reduce((acc, o) => acc + getOrderProfit(o), 0);

//                   return (
//                     <button
//                       key={idx}
//                       onClick={() => handleDayClick(day)} 
//                       className={`h-20 md:h-28 p-1.5 md:p-3 border transition-all relative rounded-2xl flex flex-col items-center justify-between gap-1 group ${
//                         isDateSelected 
//                           ? 'border-indigo-600 ring-4 ring-indigo-50 bg-indigo-50/20' 
//                           : 'border-gray-100 hover:border-indigo-200 bg-white shadow-sm'
//                       }`}
//                     >
//                       <span className={`text-xs md:text-sm font-bold ${isToday(day) ? 'text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded-lg' : isDateSelected ? 'text-indigo-800' : 'text-gray-500'}`}>
//                         {format(day, 'd')}
//                       </span>
                      
//                       {dayOrders.length > 0 ? (
//                         <div className="flex flex-col items-center gap-1 w-full">
//                            {/* Daily Profit Pill */}
//                            <div className="bg-emerald-100 text-emerald-800 text-[10px] md:text-xs font-extrabold px-1.5 py-0.5 rounded-md w-full text-center truncate tracking-tight shadow-sm border border-emerald-200">
//                              +₹{dayProfit.toLocaleString('en-IN')}
//                            </div>
//                            <div className="bg-indigo-600 text-[8px] md:text-[10px] text-white py-0.5 px-2 rounded-full font-black leading-none opacity-80">
//                              {dayOrders.length}
//                            </div>
//                         </div>
//                       ) : (
//                         <div className="flex-1"></div>
//                       )}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* SIDE PANEL - MONTH SUMMARY */}
//         <div className="bg-white p-5 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between">
//           <div>
//              <h2 className="text-xl font-black text-gray-900 mb-2">Month Overview</h2>
//              <p className="text-gray-500 text-sm font-medium mb-6">Summary for {format(currentMonth, 'MMMM yyyy')}</p>
             
//              <div className="space-y-4">
//                 <div className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center">
//                     <span className="text-gray-500 font-bold text-sm">Total Orders</span>
//                     <span className="text-gray-900 font-black text-lg">{orders.filter(o => isSameMonth(new Date(o.date), currentMonth)).length}</span>
//                 </div>
//                 <div className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center">
//                     <span className="text-gray-500 font-bold text-sm">Total Revenue</span>
//                     <span className="text-indigo-600 font-black text-lg">₹{orders.filter(o => isSameMonth(new Date(o.date), currentMonth)).reduce((acc, o) => acc + o.totalAmount, 0).toLocaleString('en-IN')}</span>
//                 </div>
//              </div>
//           </div>

//           <div className="mt-8">
//              <button 
//                 onClick={openAddModal}
//                 className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-transform active:scale-95 flex items-center justify-center gap-2"
//              >
//                <Plus size={20} />
//                Create New Order
//              </button>
//           </div>
//         </div>
//       </div>

//       {/* --- DAY DETAIL POPUP MODAL --- */}
//       {showDayDetailModal && selectedDate && (
//         <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
//             <div className="bg-white rounded-[2rem] w-full max-w-2xl h-[85vh] shadow-2xl flex flex-col overflow-hidden relative">
                
//                 {/* Header */}
//                 <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
//                     <div>
//                         <h2 className="text-2xl font-black text-gray-900 tracking-tight">Details: {format(selectedDate, 'MMM do')}</h2>
//                         <p className="text-gray-500 font-medium text-xs mt-1">{format(selectedDate, 'EEEE, yyyy')}</p>
//                     </div>
//                     <button onClick={() => setShowDayDetailModal(false)} className="p-2 bg-white rounded-full hover:bg-gray-200 transition-colors shadow-sm">
//                         <X size={20} className="text-gray-600" />
//                     </button>
//                 </div>

//                 <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-gray-50/30">
                    
//                     {/* SUMMARY CARDS (Sales & Profit) */}
//                     {getOrdersForDate(selectedDate).length > 0 && (
//                         <div className="grid grid-cols-2 gap-4 mb-6">
//                             <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
//                                 <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Sales</p>
//                                 <p className="text-xl font-black text-gray-900">
//                                     ₹{getOrdersForDate(selectedDate).reduce((s, o) => s + o.totalAmount, 0).toLocaleString('en-IN')}
//                                 </p>
//                             </div>
//                             <div className="p-5 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl shadow-lg text-white">
//                                 <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-1">Net Profit</p>
//                                 <p className="text-xl font-black">
//                                     +₹{getOrdersForDate(selectedDate).reduce((s, o) => s + getOrderProfit(o), 0).toLocaleString('en-IN')}
//                                 </p>
//                             </div>
//                         </div>
//                     )}

//                     {/* ORDER LIST */}
//                     <div className="space-y-4">
//                         {getOrdersForDate(selectedDate).length > 0 ? (
//                             getOrdersForDate(selectedDate).map(order => (
//                                 <div key={order.id} className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group">
//                                     <div className="flex justify-between items-start mb-3">
//                                         <div className="flex items-center gap-2">
//                                             <span className="bg-indigo-50 text-indigo-600 text-[10px] font-mono font-bold px-2 py-1 rounded-lg">
//                                                 #{order.id.slice(-6).toUpperCase()}
//                                             </span>
//                                             <span className="text-xs font-bold text-gray-400">
//                                                 {format(new Date(order.date), 'h:mm a')}
//                                             </span>
//                                         </div>
//                                         <button 
//                                             onClick={() => openEditModal(order)}
//                                             className="text-gray-300 hover:text-indigo-600 transition-colors"
//                                         >
//                                             <Edit2 size={16} />
//                                         </button>
//                                     </div>

//                                     <h3 className="text-lg font-black text-gray-900 mb-3">{order.toName}</h3>

//                                     {/* Items Table */}
//                                     <div className="bg-gray-50 rounded-xl p-3 mb-3 space-y-1">
//                                         {order.items && order.items.length > 0 ? (
//                                             order.items.map((item: any, i: number) => (
//                                                 <div key={i} className="flex justify-between text-xs text-gray-600 border-b border-gray-200/50 last:border-0 pb-1 last:pb-0">
//                                                     <span className="font-bold">{item.bottleName}</span>
//                                                     <span>x{item.quantity}</span>
//                                                 </div>
//                                             ))
//                                         ) : (
//                                             <div className="flex justify-between text-xs text-gray-600">
//                                                 {/* @ts-ignore */}
//                                                 <span className="font-bold">{order.bottleName}</span>
//                                                 {/* @ts-ignore */}
//                                                 <span>x{order.quantity}</span>
//                                             </div>
//                                         )}
//                                     </div>

//                                     {/* Footer */}
//                                     <div className="flex justify-between items-center border-t border-gray-100 pt-3">
//                                         <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider ${order.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
//                                             {order.status === 'Completed' ? 'Paid' : 'Pending'}
//                                         </span>
//                                         <span className="text-lg font-black text-indigo-600">
//                                             ₹{order.totalAmount.toLocaleString('en-IN')}
//                                         </span>
//                                     </div>
//                                 </div>
//                             ))
//                         ) : (
//                             <div className="text-center py-10 text-gray-400">
//                                 <PackageCheck size={40} className="mx-auto mb-3 opacity-20" />
//                                 <p className="font-bold text-sm">No orders on this date.</p>
//                             </div>
//                         )}
//                     </div>
//                 </div>
                
//                 {/* Floating Add Button in Modal */}
//                 <div className="p-4 border-t border-gray-100 bg-white">
//                     <button 
//                         onClick={openAddModal}
//                         className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
//                     >
//                         <Plus size={18} /> Add New Order
//                     </button>
//                 </div>
//             </div>
//         </div>
//       )}

//       {/* CREATE ORDER MODAL */}
//       {showOrderModal && (
//         <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
//           <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
//             <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
//               <h2 className="text-xl font-bold text-gray-900">
//                 {editingOrder ? 'Edit Order' : `New Order for ${selectedDate ? format(selectedDate, 'MMM do') : ''}`}
//               </h2>
//               <button onClick={() => setShowOrderModal(false)} className="text-gray-400 hover:text-gray-600">
//                 <X size={24} />
//               </button>
//             </div>
            
//             <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
//               <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Customer Name</label>
//                     <input 
//                       type="text" 
//                       required 
//                       value={customerName}
//                       onChange={e => setCustomerName(e.target.value)}
//                       className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Payment Status</label>
//                     <select 
//                         value={newOrderStatus}
//                         onChange={(e) => setNewOrderStatus(e.target.value)}
//                         className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
//                     >
//                         <option value="Pending">Pending</option>
//                         <option value="Completed">Completed</option>
//                     </select>
//                   </div>
//               </div>

//               <div className="space-y-3">
//                 <div className="flex justify-between items-center">
//                    <label className="block text-xs font-bold text-gray-500 uppercase">Items</label>
//                    <button type="button" onClick={addItemRow} className="text-indigo-600 text-xs font-bold">+ Add Item</button>
//                 </div>
//                 {orderItems.map((item, idx) => (
//                   <div key={idx} className="flex gap-2 items-center">
//                     <select 
//                       value={item.bottleId}
//                       onChange={e => handleItemChange(idx, 'bottleId', e.target.value)}
//                       className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
//                       required
//                     >
//                       <option value="">Select Product</option>
//                       {inventory.map(inv => (
//                         <option key={inv.id} value={inv.id}>{inv.name}</option>
//                       ))}
//                     </select>
//                     <input 
//                       type="number" 
//                       min="1" 
//                       placeholder="Qty" 
//                       value={item.quantity}
//                       onChange={e => handleItemChange(idx, 'quantity', parseInt(e.target.value))}
//                       className="w-16 px-2 py-2 border border-gray-200 rounded-lg text-sm"
//                       required
//                     />
//                     <input 
//                       type="number" 
//                       step="0.01" 
//                       placeholder="Price" 
//                       value={item.unitPrice}
//                       onChange={e => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value))}
//                       className="w-20 px-2 py-2 border border-gray-200 rounded-lg text-sm"
//                       required
//                     />
//                     {orderItems.length > 1 && (
//                       <button type="button" onClick={() => removeItemRow(idx)} className="text-red-400 hover:text-red-600">
//                         <X size={16} />
//                       </button>
//                     )}
//                   </div>
//                 ))}
//               </div>

//               <div className="pt-4">
//                 <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold">
//                   {editingOrder ? 'Update Order' : 'Create Order'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Dashboard;



//Option 3
import React, { useState, useEffect } from 'react';
import { User, Order, UserRole } from '../types';
import { API_ENDPOINTS } from './config'; 

import { 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  PackageCheck,
  Calendar as CalendarIcon,
  Plus,
  Edit2,
  X,
  TrendingUp,
  Wallet,
  AlertCircle,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday, isSameMonth, isSameYear, parse } from 'date-fns';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  
  // Modal States
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showDayDetailModal, setShowDayDetailModal] = useState(false);
  const [inventory, setInventory] = useState<any[]>([]);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [newOrderStatus, setNewOrderStatus] = useState('Pending'); 
  const [orderItems, setOrderItems] = useState([{ bottleId: '', quantity: 1, unitPrice: 0 }]);

  const ORDER_API = `${API_ENDPOINTS.ORDERS}`;
  const PRODUCT_API = `${API_ENDPOINTS.PRODUCTS}`;

  useEffect(() => {
    fetchData();
  }, [user.id]);

  const fetchData = async () => {
    try {
      const res = await fetch(`${ORDER_API}/${user.id}`);
      const data = await res.json();
      setOrders(data.map((o: any) => ({ ...o, id: o._id })));

      const invRes = await fetch(`${PRODUCT_API}/${user.id}`);
      const invData = await invRes.json();
      setInventory(invData.map((i: any) => ({ ...i, id: i._id })));
    } catch (error) {
      console.error("Dashboard error:", error);
    }
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const getOrdersForDate = (date: Date) => {
    return orders.filter(order => isSameDay(new Date(order.date), date));
  };

  // --- STATS CALCULATIONS ---
  const getOrderProfit = (order: any) => {
    return order.totalProfit !== undefined ? order.totalProfit : (order.profit || 0);
  };

  const totalProfit = orders.reduce((sum, order) => sum + getOrderProfit(order), 0);

  const monthlyProfit = orders
    .filter(order => isSameMonth(new Date(order.date), currentMonth))
    .reduce((sum, order) => sum + getOrderProfit(order), 0);

  const yearlyProfit = orders
    .filter(order => isSameYear(new Date(order.date), currentMonth))
    .reduce((sum, order) => sum + getOrderProfit(order), 0);

  const totalOrders = orders.length;
  const uniqueCustomers = new Set(orders.map(order => order.toName)).size;

  // --- AUTOCOMPLETE DATA ---
  // Extract unique customer names from existing orders
  const pastCustomers = Array.from(new Set(orders.map(o => o.toName))).filter(Boolean).sort();

  const totalPending = orders
    .filter(order => order.status !== 'Completed')
    .reduce((sum, order) => sum + order.totalAmount, 0);

  // Get orders for the CURRENT MONTH to display in side panel
  const monthOrders = orders
    .filter(order => isSameMonth(new Date(order.date), currentMonth))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // --- HELPER FOR SMART FONT SIZING ---
  // Reduces font size if number is too long to fit in box
  const getSmartFontSize = (val: number) => {
    const str = val.toLocaleString('en-IN');
    const len = str.length;
    if (len > 13) return 'text-lg'; // Very long numbers
    if (len > 10) return 'text-xl'; // Long numbers
    if (len > 8) return 'text-2xl'; // Medium numbers
    return 'text-3xl'; // Normal numbers
  };

  // --- HANDLERS ---

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setCurrentMonth(parse(e.target.value, 'yyyy-MM', new Date()));
    }
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setShowDayDetailModal(true);
  };

  const openAddModal = () => {
    setEditingOrder(null);
    setCustomerName('');
    setNewOrderStatus('Pending');
    setOrderItems([{ bottleId: '', quantity: 1, unitPrice: 0 }]);
    setShowOrderModal(true);
  };

  const openEditModal = (order: Order) => {
    setShowDayDetailModal(false); 
    setEditingOrder(order);
    setCustomerName(order.toName);
    setNewOrderStatus(order.status === 'Completed' ? 'Completed' : 'Pending');
    if (order.items && order.items.length > 0) {
      setOrderItems(order.items.map(i => ({
        bottleId: i.bottleId,
        quantity: i.quantity,
        unitPrice: i.unitPrice
      })));
    } else {
      // @ts-ignore
      setOrderItems([{ bottleId: order.bottleId, quantity: order.quantity, unitPrice: order.unitPrice }]);
    }
    setShowOrderModal(true);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...orderItems];
    // @ts-ignore
    newItems[index][field] = value;
    setOrderItems(newItems);
  };

  const addItemRow = () => {
    setOrderItems([...orderItems, { bottleId: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItemRow = (index: number) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (orderItems.some(i => !i.bottleId || i.quantity <= 0)) {
      alert("Please check item details");
      return;
    }
    try {
      if (editingOrder) {
        if(!confirm("Editing will replace the old order. Continue?")) return;
        await fetch(`${ORDER_API}/${editingOrder.id}`, { method: 'DELETE' });
      }
      const response = await fetch(ORDER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromId: user.id,
          toName: customerName,
          items: orderItems,
          type: user.role === UserRole.MANUFACTURER ? 'M2D' : 'D2S',
          date: selectedDate || new Date(),
          status: newOrderStatus 
        }),
      });
      if (response.ok) {
        setShowOrderModal(false);
        fetchData(); 
      } else {
        const d = await response.json();
        alert(d.message || "Failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving order");
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Welcome, {user.username}</h1>
          <p className="text-gray-600 font-medium">Overview for {format(currentMonth, 'MMMM yyyy')}</p>
        </div>
        
        <div className="flex bg-white border border-gray-200 rounded-2xl p-1 shadow-sm self-start sm:self-center">
           <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
             <ChevronLeft size={20} className="text-gray-600" />
           </button>
           
           <div className="relative px-4 py-2 min-w-[140px] text-center group cursor-pointer flex items-center justify-center">
             <span className="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors pointer-events-none">
                {format(currentMonth, 'MMMM yyyy')}
             </span>
             <input 
               type="month" 
               value={format(currentMonth, 'yyyy-MM')}
               onChange={handleMonthChange}
               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
               title="Change Month"
             />
           </div>

           <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
             <ChevronRight size={20} className="text-gray-600" />
           </button>
        </div>
      </header>

      {/* --- FINANCIAL STATS ROW (4 Boxes) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
        {/* Monthly Profit */}
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-inner font-black text-xl shrink-0"><CalendarIcon size={24} /></div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Profit ({format(currentMonth, 'MMM')})</p>
            <p className={`${getSmartFontSize(monthlyProfit)} font-black text-gray-900 tracking-tight leading-none break-words`}>
                ₹{monthlyProfit.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Yearly Profit */}
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl shadow-inner font-black text-xl shrink-0"><TrendingUp size={24} /></div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Profit ({format(currentMonth, 'yyyy')})</p>
            <p className={`${getSmartFontSize(yearlyProfit)} font-black text-gray-900 tracking-tight leading-none break-words`}>
                ₹{yearlyProfit.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-2xl shadow-inner font-black text-xl shrink-0"><AlertCircle size={24} /></div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Pending Payments</p>
            <p className={`${getSmartFontSize(totalPending)} font-black text-red-600 tracking-tight leading-none break-words`}>
                ₹{totalPending.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Lifetime Profit */}
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shadow-inner font-black text-xl shrink-0"><Wallet size={24} /></div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Lifetime Profit</p>
            <p className={`${getSmartFontSize(totalProfit)} font-black text-gray-900 tracking-tight leading-none break-words`}>
                ₹{totalProfit.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      {/* --- OPERATIONAL STATS ROW (2 Boxes) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center space-x-5">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl shadow-inner"><PackageCheck size={28} /></div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Orders Placed</p>
            <p className="text-3xl font-black text-gray-900 tracking-tight">{totalOrders}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center space-x-5">
          <div className="p-4 bg-violet-50 text-violet-600 rounded-2xl shadow-inner"><Users size={28} /></div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{user.role === UserRole.MANUFACTURER ? 'Active Distributors' : 'Active SMEs'}</p>
            <p className="text-3xl font-black text-gray-900 tracking-tight">{uniqueCustomers}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CALENDAR */}
        <div className="lg:col-span-2 bg-white p-5 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
              <CalendarIcon size={24} className="text-indigo-600" />
              Order Calendar
            </h2>
          </div>
          <div className="overflow-x-auto -mx-5 md:-mx-8 px-5 md:px-8 pb-4">
            <div className="min-w-[500px]">
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-[10px] font-black text-gray-400 uppercase tracking-tighter">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="h-20 md:h-28 bg-gray-50/40 rounded-2xl border border-transparent"></div>
                ))}
                {days.map((day, idx) => {
                  const dayOrders = getOrdersForDate(day);
                  const isDateSelected = isSameDay(day, selectedDate || new Date(0));
                  
                  const dayProfit = dayOrders.reduce((acc, o) => acc + getOrderProfit(o), 0);

                  return (
                    <button
                      key={idx}
                      onClick={() => handleDayClick(day)} 
                      className={`h-20 md:h-28 p-1.5 md:p-3 border transition-all relative rounded-2xl flex flex-col items-center justify-between gap-1 group ${
                        isDateSelected 
                          ? 'border-indigo-600 ring-4 ring-indigo-50 bg-indigo-50/20' 
                          : 'border-gray-100 hover:border-indigo-200 bg-white shadow-sm'
                      }`}
                    >
                      <span className={`text-xs md:text-sm font-bold ${isToday(day) ? 'text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded-lg' : isDateSelected ? 'text-indigo-800' : 'text-gray-500'}`}>
                        {format(day, 'd')}
                      </span>
                      
                      {dayOrders.length > 0 ? (
                        <div className="flex flex-col items-center gap-1 w-full">
                           {/* Daily Profit Pill */}
                           <div className="bg-emerald-100 text-emerald-800 text-[10px] md:text-xs font-extrabold px-1 py-0.5 rounded-md w-full text-center truncate tracking-tight shadow-sm border border-emerald-200">
                             +₹{dayProfit.toLocaleString('en-IN')}
                           </div>
                           <div className="bg-indigo-600 text-[8px] md:text-[10px] text-white py-0.5 px-2 rounded-full font-black leading-none opacity-80">
                             {dayOrders.length}
                           </div>
                        </div>
                      ) : (
                        <div className="flex-1"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* SIDE PANEL: MONTH OVERVIEW & DETAILS */}
        <div className="bg-white p-5 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between max-h-[800px]">
          <div className="flex-1 overflow-hidden flex flex-col">
             <h2 className="text-xl font-black text-gray-900 mb-2">Month Overview</h2>
             <p className="text-gray-500 text-sm font-medium mb-6">Details for {format(currentMonth, 'MMMM yyyy')}</p>
             
             {/* Summary Stats */}
             <div className="space-y-3 mb-6 shrink-0">
                <div className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center">
                    <span className="text-gray-500 font-bold text-sm">Total Orders</span>
                    <span className="text-gray-900 font-black text-lg">{monthOrders.length}</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center">
                    <span className="text-gray-500 font-bold text-sm">Total Revenue</span>
                    <span className="text-indigo-600 font-black text-lg">₹{monthOrders.reduce((acc, o) => acc + o.totalAmount, 0).toLocaleString('en-IN')}</span>
                </div>
             </div>

             {/* SCROLLABLE ORDER LIST WITH PERSON DETAILS */}
             <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 sticky top-0 bg-white py-1">Order History</h3>
                {monthOrders.length > 0 ? (
                    monthOrders.map(order => (
                        <div key={order.id} className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors group relative">
                            {/* FIX: Status is now on the LEFT to avoid overlapping with Absolute Edit Button */}
                            <div className="flex justify-between items-center mb-1 pr-8">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-gray-400">{format(new Date(order.date), 'MMM d')}</span>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${order.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                        {order.status === 'Completed' ? 'Paid' : 'Pending'}
                                    </span>
                                </div>
                            </div>
                            
                            <button 
                                onClick={(e) => { e.stopPropagation(); openEditModal(order); }}
                                className="absolute top-3 right-3 text-gray-300 hover:text-indigo-600 transition-colors"
                            >
                                <Edit2 size={14} />
                            </button>

                            {/* Person Name */}
                            <p className="font-black text-gray-800 text-sm mb-2 truncate pr-6">{order.toName}</p>
                            
                            {/* Items Detail */}
                            <div className="space-y-1 mb-2">
                                {order.items && order.items.length > 0 ? (
                                    order.items.map((item: any, i: number) => (
                                        <div key={i} className="flex justify-between text-xs text-gray-500">
                                            <span>{item.bottleName}</span>
                                            <span className="font-bold">x{item.quantity}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex justify-between text-xs text-gray-500">
                                        {/* @ts-ignore */}
                                        <span>{order.bottleName}</span>
                                        {/* @ts-ignore */}
                                        <span className="font-bold">x{order.quantity}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end items-center pt-2 border-t border-gray-200/50">
                                <span className="font-bold text-indigo-600">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-400 text-xs py-4">No orders this month.</p>
                )}
             </div>
          </div>

          <div className="mt-6 shrink-0">
             <button 
                onClick={openAddModal}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-transform active:scale-95 flex items-center justify-center gap-2"
             >
               <Plus size={20} />
               Create New Order
             </button>
          </div>
        </div>
      </div>

      {/* --- DAY DETAIL POPUP MODAL --- */}
      {showDayDetailModal && selectedDate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] w-full max-w-2xl h-[85vh] shadow-2xl flex flex-col overflow-hidden relative">
                
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Details: {format(selectedDate, 'MMM do')}</h2>
                        <p className="text-gray-500 font-medium text-xs mt-1">{format(selectedDate, 'EEEE, yyyy')}</p>
                    </div>
                    <button onClick={() => setShowDayDetailModal(false)} className="p-2 bg-white rounded-full hover:bg-gray-200 transition-colors shadow-sm">
                        <X size={20} className="text-gray-600" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-gray-50/30">
                    {/* PURPLE SUMMARY BOX (PROFIT ONLY) */}
                    <div className="p-8 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl shadow-xl text-white mb-8 text-center relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-indigo-200 text-xs font-bold uppercase tracking-[0.2em] mb-3">Net Profit</p>
                            <p className={`${getSmartFontSize(getOrdersForDate(selectedDate).reduce((s, o) => s + getOrderProfit(o), 0))} font-black text-white leading-none`}>
                                +₹{getOrdersForDate(selectedDate).reduce((s, o) => s + getOrderProfit(o), 0).toLocaleString('en-IN')}
                            </p>
                            <div className="mt-4 inline-block bg-white/20 px-4 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm">
                                {getOrdersForDate(selectedDate).length} Order{getOrdersForDate(selectedDate).length !== 1 && 's'} Processed
                            </div>
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                    </div>

                    {/* ORDER LIST IN POPUP */}
                    <div className="space-y-4">
                        {getOrdersForDate(selectedDate).length > 0 ? (
                            getOrdersForDate(selectedDate).map(order => (
                                <div key={order.id} className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-indigo-50 text-indigo-600 text-[10px] font-mono font-bold px-2 py-1 rounded-lg">
                                                #{order.id.slice(-6).toUpperCase()}
                                            </span>
                                            <span className="text-xs font-bold text-gray-400">
                                                {format(new Date(order.date), 'h:mm a')}
                                            </span>
                                        </div>
                                        <button 
                                            onClick={() => openEditModal(order)}
                                            className="text-gray-300 hover:text-indigo-600 transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                    </div>

                                    <h3 className="text-lg font-black text-gray-900 mb-3">{order.toName}</h3>

                                    {/* Items */}
                                    <div className="bg-gray-50 rounded-xl p-3 mb-3 space-y-1">
                                        {order.items && order.items.length > 0 ? (
                                            order.items.map((item: any, i: number) => (
                                                <div key={i} className="flex justify-between text-xs text-gray-600 border-b border-gray-200/50 last:border-0 pb-1 last:pb-0">
                                                    <span className="font-bold">{item.bottleName}</span>
                                                    <span>x{item.quantity}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex justify-between text-xs text-gray-600">
                                                {/* @ts-ignore */}
                                                <span className="font-bold">{order.bottleName}</span>
                                                {/* @ts-ignore */}
                                                <span>x{order.quantity}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer */}
                                    <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider ${order.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {order.status === 'Completed' ? 'Paid' : 'Pending'}
                                        </span>
                                        <span className="text-lg font-black text-indigo-600">
                                            ₹{order.totalAmount.toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-gray-400">
                                <PackageCheck size={40} className="mx-auto mb-3 opacity-20" />
                                <p className="font-bold text-sm">No orders on this date.</p>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="p-4 border-t border-gray-100 bg-white">
                    <button 
                        onClick={openAddModal}
                        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
                    >
                        <Plus size={18} /> Add New Order
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* CREATE ORDER MODAL */}
      {showOrderModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">
                {editingOrder ? 'Edit Order' : `New Order for ${selectedDate ? format(selectedDate, 'MMM do') : ''}`}
              </h2>
              <button onClick={() => setShowOrderModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Customer Name</label>
                    <input 
                      list="customer-suggestions" 
                      type="text" 
                      required 
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="Search or Enter"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <datalist id="customer-suggestions">
                        {pastCustomers.map(name => (
                            <option key={name} value={name} />
                        ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Payment Status</label>
                    <select 
                        value={newOrderStatus}
                        onChange={(e) => setNewOrderStatus(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                    </select>
                  </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                   <label className="block text-xs font-bold text-gray-500 uppercase">Items</label>
                   <button type="button" onClick={addItemRow} className="text-indigo-600 text-xs font-bold">+ Add Item</button>
                </div>
                {orderItems.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <select 
                      value={item.bottleId}
                      onChange={e => handleItemChange(idx, 'bottleId', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      required
                    >
                      <option value="">Select Product</option>
                      {inventory.map(inv => (
                        <option key={inv.id} value={inv.id}>{inv.name}</option>
                      ))}
                    </select>
                    <input 
                      type="number" 
                      min="1" 
                      placeholder="Qty" 
                      value={item.quantity}
                      onChange={e => handleItemChange(idx, 'quantity', parseInt(e.target.value))}
                      className="w-16 px-2 py-2 border border-gray-200 rounded-lg text-sm"
                      required
                    />
                    <input 
                      type="number" 
                      step="0.01" 
                      placeholder="Price" 
                      value={item.unitPrice}
                      onChange={e => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value))}
                      className="w-20 px-2 py-2 border border-gray-200 rounded-lg text-sm"
                      required
                    />
                    {orderItems.length > 1 && (
                      <button type="button" onClick={() => removeItemRow(idx)} className="text-red-400 hover:text-red-600">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold">
                  {editingOrder ? 'Update Order' : 'Create Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;