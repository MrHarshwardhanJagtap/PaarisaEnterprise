import React, { useState, useEffect } from 'react';
import { User, UserRole, Order } from '../types';
import { Plus, Printer, CheckCircle2, Trash2, X, PlusCircle, Search, Filter, AlertCircle, Edit2, Save, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { API_ENDPOINTS } from './config'; 

interface OrdersProps {
  user: User;
}

// Helper interface for the form state
interface OrderItemRow {
  bottleId: string;
  quantity: number;
  unitPrice: number;
}

const Orders: React.FC<OrdersProps> = ({ user }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [customerName, setCustomerName] = useState('');
  
  // NEW: State for Order Status during Creation
  const [newOrderStatus, setNewOrderStatus] = useState('Pending');

  // NEW: State for Editing Status
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);
  const [editStatusValue, setEditStatusValue] = useState('');

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Print mode state
  const [printMode, setPrintMode] = useState<'single' | 'all' | null>(null);
  
  // State for multiple items
  const [orderItems, setOrderItems] = useState<OrderItemRow[]>([
    { bottleId: '', quantity: 1, unitPrice: 0 }
  ]);

  const ORDER_API = `${API_ENDPOINTS.ORDERS}`;
  const PRODUCT_API = `${API_ENDPOINTS.PRODUCTS}`;

  useEffect(() => {
    loadData();
  }, [user.id]);

  const loadData = async () => {
    try {
      const orderRes = await fetch(`${ORDER_API}/${user.id}`);
      const orderData = await orderRes.json();
      setOrders(orderData.map((o: any) => ({ ...o, id: o._id })));

      const invRes = await fetch(`${PRODUCT_API}/${user.id}`);
      const invData = await invRes.json();
      setInventory(invData.map((i: any) => ({ ...i, id: i._id })));
    } catch (err) {
      console.error("Failed to load data", err);
    }
  };

  // --- FILTERING LOGIC ---
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.toName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'COMPLETED' && order.status === 'Completed') ||
      (statusFilter === 'PENDING' && order.status !== 'Completed');

    return matchesSearch && matchesStatus;
  });

  // --- AUTOCOMPLETE DATA ---
  const pastCustomers = Array.from(new Set(orders.map(o => o.toName))).filter(Boolean).sort();

  // --- Form Handlers ---

  const addRow = () => {
    setOrderItems([...orderItems, { bottleId: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeRow = (index: number) => {
    if (orderItems.length > 1) {
      const newItems = [...orderItems];
      newItems.splice(index, 1);
      setOrderItems(newItems);
    }
  };

  const updateRow = (index: number, field: keyof OrderItemRow, value: any) => {
    const newItems = [...orderItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setOrderItems(newItems);
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    const invalidItems = orderItems.some(i => !i.bottleId || i.quantity <= 0 || i.unitPrice < 0);
    if(invalidItems) {
      alert("Please fill all item details correctly.");
      return;
    }

    // Check stock availability and prevent negative profit for each item
    for (const item of orderItems) {
      const product = inventory.find(p => p.id === item.bottleId);

      if (!product) {
        alert("Product not found!");
        return;
      }

      // Check stock availability
      if (product.stock < item.quantity) {
        alert(`Insufficient stock for "${product.name}"! Available: ${product.stock}, Requested: ${item.quantity}`);
        return;
      }

      // Prevent negative profit - selling price must be greater than or equal to cost price
      if (item.unitPrice < product.cost) {
        alert(`Warning: Selling price (₹${item.unitPrice}) for "${product.name}" is less than cost price (₹${product.cost})!\n\nThis would result in a loss of ₹${(product.cost - item.unitPrice).toFixed(2)} per unit.\n\nPlease increase the selling price to at least ₹${product.cost.toFixed(2)} to avoid negative profit.`);
        return;
      }
    }

    try {
      const response = await fetch(ORDER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromId: user.id,
          toName: customerName,
          items: orderItems,
          type: user.role === UserRole.MANUFACTURER ? 'M2D' : 'D2S',
          status: newOrderStatus // NEW: Send selected status
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create order');

      setShowNewOrder(false);
      setCustomerName('');
      setOrderItems([{ bottleId: '', quantity: 1, unitPrice: 0 }]);
      setNewOrderStatus('Pending'); // Reset
      loadData();
      alert("Order created successfully!");
    } catch (error: any) {
      alert(error.message);
    }
  };

  // --- NEW: Handle Status Update ---
  const openStatusModal = (order: Order) => {
    setOrderToEdit(order);
    setEditStatusValue(order.status === 'Completed' ? 'Completed' : 'Pending');
    setShowStatusModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!orderToEdit) return;

    try {
      // Assuming your backend supports PUT /api/orders/:id for updates
      const response = await fetch(`${ORDER_API}/${orderToEdit.id}`, {
        method: 'PUT', // Or PATCH depending on your backend
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editStatusValue
        }),
      });

      if (response.ok) {
        setShowStatusModal(false);
        setOrderToEdit(null);
        loadData(); // Refresh list
        alert("Payment status updated!");
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      console.error(error);
      alert("Error updating status");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if(!confirm("Are you sure? Deleting this order will restore stock for ALL items.")) return;
    
    try {
      const response = await fetch(`${ORDER_API}/${orderId}`, {
        method: 'DELETE'
      });
      if(response.ok) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
        loadData(); 
      } else {
        alert("Failed to delete order");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const printReceipt = (order: Order) => {
    setSelectedOrder(order);
    setPrintMode('single');
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const printReport = () => {
    setPrintMode('all');
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="space-y-6">
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
              padding: 2px;
            }
            @page { 
              size: A4; 
              margin: 0; 
            }
          }
        `}
      </style>

      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-500">
            {user.role === UserRole.MANUFACTURER ? 'Track orders sent to Distributors' : 'Manage SME sales'}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <button 
                onClick={printReport}
                className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm w-full sm:w-auto"
            >
                <Printer size={20} />
                Print Report
            </button>
            <button 
                onClick={() => setShowNewOrder(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm w-full sm:w-auto"
            >
                <Plus size={20} />
                Create New Order
            </button>
        </div>
      </header>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-[1.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by Order ID or Customer Name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 font-medium transition-all"
            />
        </div>

        <div className="relative w-full md:w-auto min-w-[200px]">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-12 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 font-bold text-gray-700 appearance-none cursor-pointer"
            >
              <option value="ALL">All Payment Status</option>
              <option value="PENDING">Pending / Unpaid</option>
              <option value="COMPLETED">Cleared / Paid</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-l pl-2 border-gray-300">
               <span className="text-[10px] text-gray-400">▼</span>
            </div>
        </div>
      </div>

      {/* Orders List Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 w-16">Sr. No</th>
                <th className="px-6 py-4">Date & Order ID</th>
                <th className="px-6 py-4">{user.role === UserRole.MANUFACTURER ? 'Distributor' : 'Customer'}</th>
                <th className="px-6 py-4">Items Summary</th>
                <th className="px-6 py-4">Payment Status</th>
                <th className="px-6 py-4 text-right">Total Amount</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order, index) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-400">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900">{format(new Date(order.date), 'dd MMM yyyy')}</p>
                      <p className="text-xs font-mono text-gray-400 mt-1">ID: {order.id.slice(-6).toUpperCase()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-800">{order.toName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item: any, idx: number) => (
                            <span key={idx} className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md w-fit">
                              {item.bottleName} <span className="font-bold">x{item.quantity}</span>
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-600">
                             {/* @ts-ignore */}
                            {order.bottleName} x{order.quantity}
                          </span>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      {order.status === 'Completed' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                          <CheckCircle2 size={12} />
                          Cleared
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">
                          <AlertCircle size={12} />
                          Pending
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-bold text-gray-900">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                      <p className={`text-[10px] font-medium ${(order.totalProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(order.totalProfit || 0) >= 0 ? 'Profit: +' : 'Loss: '}₹{(order.totalProfit || 0).toLocaleString('en-IN')}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openStatusModal(order)} className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 rounded-lg" title="Edit Payment Status">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => printReceipt(order)} className="p-2 text-gray-400 hover:text-indigo-600 bg-gray-50 rounded-lg">
                            <Printer size={18} />
                          </button>
                          <button onClick={() => handleDeleteOrder(order.id)} className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 rounded-lg">
                            <Trash2 size={18} />
                          </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 font-bold bg-gray-50/50">
                    No orders found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW ORDER MODAL */}
      {showNewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">Create New Order</h2>
              <button onClick={() => setShowNewOrder(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="flex-1 flex flex-col overflow-hidden">
              <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            {user.role === UserRole.MANUFACTURER ? 'Distributor Name' : 'Customer Name'}
                        </label>
                        <input 
                            list="customer-suggestions"
                            type="text" 
                            required 
                            placeholder="Search or Enter Name"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                        />
                        {/* Autocomplete Datalist */}
                        <datalist id="customer-suggestions">
                            {pastCustomers.map((name, index) => (
                                <option key={index} value={name} />
                            ))}
                        </datalist>
                    </div>
                    {/* NEW: Payment Status Dropdown during creation */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            Payment Status
                        </label>
                        <select 
                            value={newOrderStatus}
                            onChange={(e) => setNewOrderStatus(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium bg-white"
                        >
                            <option value="Pending">Pending (Unpaid)</option>
                            <option value="Completed">Cleared (Paid)</option>
                        </select>
                    </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Order Items</label>
                    <button 
                      type="button" 
                      onClick={addRow}
                      className="text-indigo-600 text-xs font-bold flex items-center gap-1 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-colors"
                    >
                      <PlusCircle size={14} /> Add Another Item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {orderItems.map((row, index) => {
                      const product = inventory.find(p => p.id === row.bottleId);
                      const isLoss = product && row.unitPrice > 0 && row.unitPrice < product.cost;
                      const lossAmount = product ? (product.cost - row.unitPrice) * row.quantity : 0;

                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-gray-50 p-3 rounded-xl border border-gray-100 relative group">
                            <div className="flex-1 w-full sm:w-auto">
                              <select
                                required
                                value={row.bottleId}
                                onChange={(e) => updateRow(index, 'bottleId', e.target.value)}
                                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                              >
                                <option value="">Select Product</option>
                                {inventory.map(item => (
                                  <option key={item.id} value={item.id}>
                                    {item.name} (Stock: {item.stock}, Cost: ₹{item.cost.toFixed(2)})
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="w-24">
                              <input
                                type="number"
                                required
                                min="1"
                                placeholder="Qty"
                                value={row.quantity}
                                onChange={(e) => updateRow(index, 'quantity', parseInt(e.target.value))}
                                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                              />
                            </div>
                            <div className="w-32 relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                              <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                placeholder="Price"
                                value={row.unitPrice}
                                onChange={(e) => updateRow(index, 'unitPrice', parseFloat(e.target.value))}
                                className={`w-full pl-6 pr-3 py-2.5 bg-white border rounded-lg outline-none focus:ring-2 text-sm ${
                                  isLoss ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'
                                }`}
                              />
                            </div>
                            {orderItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeRow(index)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                          {isLoss && (
                            <div className="flex items-start gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                              <AlertTriangle size={16} className="text-red-600 mt-0.5 shrink-0" />
                              <div className="text-xs text-red-700">
                                <p className="font-bold">Warning: Selling below cost!</p>
                                <p>Cost: ₹{product.cost.toFixed(2)} | Your Price: ₹{row.unitPrice.toFixed(2)} | Loss: ₹{lossAmount.toFixed(2)}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Grand Total</p>
                  <p className="text-2xl font-black text-indigo-600">₹{calculateTotal().toLocaleString('en-IN')}</p>
                </div>
                <button 
                  type="submit" 
                  className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                  Complete Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STATUS MODAL */}
      {showStatusModal && orderToEdit && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Update Payment Status</h3>
                    <button onClick={() => setShowStatusModal(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>
                <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-2">Order ID: <span className="font-mono font-bold text-gray-800">#{orderToEdit.id.slice(-6).toUpperCase()}</span></p>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select New Status</label>
                    <select 
                        value={editStatusValue}
                        onChange={(e) => setEditStatusValue(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium bg-white"
                    >
                        <option value="Pending">Pending (Unpaid)</option>
                        <option value="Completed">Cleared (Paid)</option>
                    </select>
                </div>
                <div className="flex justify-end gap-3">
                    <button 
                        onClick={() => setShowStatusModal(false)}
                        className="px-4 py-2 rounded-xl text-gray-600 font-bold hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleUpdateStatus}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                        <Save size={16} /> Update
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* PRINT AREA CONTAINER (Kept same as before, but now reflects live status) */}
      <div id="print-area" className="hidden print:block fixed inset-0 bg-white z-[9999] w-full">
        <div className="w-full h-auto flex flex-col max-w-4xl mx-auto">
            {printMode === 'single' && selectedOrder && (
              <>
                <div className="flex justify-between items-start mb-6 border-b-2 border-gray-800 pb-4">
                    <div>
                        <p className="text-4xl font-bold text-gray-900">Paaris Enterprises</p>
                        <p className="text-gray-900 font-bold text-xl mt-1">Newale Wasti, Chikhali, Pune 411062</p>
                        <p className="text-gray-900 font-bold text-xl mt-1"> Mobile no. 77-55-99-1106 </p>
                        <p className="text-gray-900 font-bold text-md mt-1"> Email - paarisenterprises@gmail.com </p>
                    </div>
                    <div className="text-right">
                        <div className="mb-2">
                          <span className="block text-xs font-bold text-gray-900 uppercase tracking-wider">Order ID</span>
                          <span className="font-mono font-bold text-lg text-gray-900">#{selectedOrder.id.slice(-6).toUpperCase()}</span>
                        </div>
                        <div>
                          <span className="block text-md font-bold text-gray-900 uppercase tracking-wider">Date</span>
                          <span className="font-bold text-gray-900 text-xl">{format(new Date(selectedOrder.date), 'dd MMMM yyyy')}</span>
                        </div>
                        <div className="mt-2">
                           <span className={`px-2 py-1 border rounded text-xs font-bold uppercase tracking-wider ${selectedOrder.status === 'Completed' ? 'border-green-600 text-green-700' : 'border-orange-600 text-orange-700'}`}>
                             {selectedOrder.status === 'Completed' ? 'PAID' : 'PAYMENT PENDING'}
                           </span>
                        </div>
                    </div>
                </div>
                <div className="mb-6">
                    <p className="text-xl font-bold text-gray-900 uppercase tracking-wider mb-1">Bill To</p>
                    <h2 className="text-3xl font-bold text-gray-900">{selectedOrder.toName}</h2>
                </div>
                <div className="flex-1">
                  <table className="w-full text-left border-collapse">
                      <thead>
                          <tr className="border-b-2 border-gray-900">
                              <th className="py-2 text-2xl font-bold text-gray-900 uppercase tracking-wider w-[50%]">Item Description</th>
                              <th className="py-2 text-center text-2xl font-bold text-gray-900 uppercase tracking-wider w-[15%]">Qty</th>
                              <th className="py-2 text-right text-2xl font-bold text-gray-900 uppercase tracking-wider w-[15%]">Unit Price</th>
                              <th className="py-2 text-right text-2xl font-bold text-gray-900 uppercase tracking-wider w-[20%]">Amount</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-900">
                          {selectedOrder.items && selectedOrder.items.map((item: any, idx: number) => (
                             <tr key={idx}>
                               <td className="py-2 text-gray-900 font-bold text-2xl">{item.bottleName}</td>
                               <td className="py-2 text-center text-gray-900 font-medium text-2xl">{item.quantity}</td>
                               <td className="py-2 text-right text-gray-900 font-medium text-2xl">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                               <td className="py-2 text-right font-bold text-gray-900 text-2xl">₹{(item.quantity * item.unitPrice).toLocaleString('en-IN')}</td>
                             </tr>
                          ))}
                      </tbody>
                  </table>
                </div>
                <div className="mt-1 border-t border-gray-100">
                    <div className="flex justify-end">
                        <div className="w-64">
                            <div className="flex justify-between items-center border-t-2 border-gray-900 pt-2 mt-2">
                                <span className="text-2xl font-black text-gray-900">Total</span>
                                <span className="text-2xl font-black text-gray-900">₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-4 text-center font-bold text-gray-900">Thanks for your business!</div>
              </>
            )}

            {printMode === 'all' && (
              <>
                <div className="flex justify-between items-start mb-8 border-b-2 border-gray-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">SALES REPORT</h1>
                        <p className="text-lg font-bold text-gray-800">Paaris Enterprises</p>
                        <p className="text-gray-500 text-sm mt-1">
                           {statusFilter === 'ALL' ? 'Consolidated Order History' : `Report: ${statusFilter} Orders`}
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Generated On</span>
                        <span className="font-medium text-gray-900">{format(new Date(), 'dd MMMM yyyy')}</span>
                    </div>
                </div>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b-2 border-gray-200">
                            <th className="py-2 text-xs font-bold text-gray-500 uppercase tracking-wider w-[15%]">Date</th>
                            <th className="py-2 text-xs font-bold text-gray-500 uppercase tracking-wider w-[20%]">Customer</th>
                            <th className="py-2 text-xs font-bold text-gray-500 uppercase tracking-wider w-[35%]">Items</th>
                            <th className="py-2 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-[15%]">Total</th>
                            <th className="py-2 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-[15%]">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredOrders.map((order, idx) => (
                            <tr key={idx}>
                                <td className="py-2 text-xs font-bold text-gray-900">{format(new Date(order.date), 'dd/MM/yyyy')}</td>
                                <td className="py-2 text-xs font-semibold text-gray-800">{order.toName}</td>
                                <td className="py-2 text-xs text-gray-600">
                                  {order.items && order.items.length > 0 
                                    ? order.items.map(i => `${i.bottleName} x${i.quantity}`).join(', ')
                                    // @ts-ignore
                                    : `${order.bottleName} x${order.quantity}`
                                  }
                                </td>
                                <td className="py-2 text-right text-xs font-bold text-gray-900">₹{order.totalAmount.toLocaleString('en-IN')}</td>
                                <td className="py-2 text-right text-xs font-bold">
                                   {order.status === 'Completed' ? 'PAID' : 'PENDING'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
              </>
            )}
        </div>
      </div>
    </div>
  );
};

export default Orders;