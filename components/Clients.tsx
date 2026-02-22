import React, { useState, useEffect } from 'react';
import { User, Order } from '../types';
import { Search, Users, ShoppingBag, Calendar, TrendingUp, X, Package, Clock, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { API_ENDPOINTS } from './config';

interface ClientsProps {
  user: User;
}

interface ClientStats {
  name: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: Date;
  averageOrderValue: number;
}

const Clients: React.FC<ClientsProps> = ({ user }) => {
  const [clients, setClients] = useState<ClientStats[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]); // Store raw orders for detail view
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Detail Modal State
  const [selectedClientName, setSelectedClientName] = useState<string | null>(null);

  useEffect(() => {
    fetchClientData();
  }, [user.id]);

  const fetchClientData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_ENDPOINTS.ORDERS}/${user.id}`);
      const ordersData = await response.json();
      
      // Store all orders for filtering later
      setAllOrders(ordersData);

      // Process orders to group by Client Name
      const clientMap = new Map<string, ClientStats>();

      ordersData.forEach((order: any) => {
        const name = order.toName;
        const current = clientMap.get(name) || {
          name,
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: new Date(0),
          averageOrderValue: 0
        };

        current.totalOrders += 1;
        current.totalSpent += order.totalAmount;
        
        const orderDate = new Date(order.date);
        if (orderDate > current.lastOrderDate) {
          current.lastOrderDate = orderDate;
        }

        clientMap.set(name, current);
      });

      const clientList = Array.from(clientMap.values()).map(c => ({
        ...c,
        averageOrderValue: c.totalSpent / c.totalOrders
      }));

      setClients(clientList.sort((a, b) => b.totalSpent - a.totalSpent));
    } catch (error) {
      console.error("Error loading clients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- CLIENT DETAIL LOGIC ---
  const clientDetails = selectedClientName 
    ? clients.find(c => c.name === selectedClientName) 
    : null;

  const clientOrders = selectedClientName
    ? allOrders
        .filter((o: any) => o.toName === selectedClientName)
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  // Aggregate Items Purchased
  const purchasedItemsMap = new Map<string, { name: string, qty: number, total: number }>();
  if (selectedClientName) {
    clientOrders.forEach((order: any) => {
      // Handle both new array format and old single object format
      const items = order.items && order.items.length > 0 
        ? order.items 
        : [{ bottleName: order.bottleName, quantity: order.quantity, unitPrice: order.unitPrice || 0 }];

      items.forEach((item: any) => {
         const current = purchasedItemsMap.get(item.bottleName) || { name: item.bottleName, qty: 0, total: 0 };
         current.qty += item.quantity;
         current.total += (item.quantity * (item.unitPrice || 0));
         purchasedItemsMap.set(item.bottleName, current);
      });
    });
  }
  const purchasedItems = Array.from(purchasedItemsMap.values()).sort((a, b) => b.qty - a.qty);


  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      <header>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Client Directory</h1>
        <p className="text-gray-600 font-medium">Track performance and purchase history.</p>
      </header>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm">
         <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search clients..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-gray-900 focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
            />
         </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-gray-400 font-bold">Loading client data...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredClients.map((client, index) => (
            <div 
              key={index} 
              onClick={() => setSelectedClientName(client.name)}
              className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Users size={24} />
                </div>
                <span className="text-xs font-black text-gray-300 bg-gray-50 px-3 py-1 rounded-full">
                  #{index + 1}
                </span>
              </div>

              <h3 className="text-xl font-black text-gray-900 mb-1 truncate" title={client.name}>
                {client.name}
              </h3>
              <p className="text-sm font-bold text-gray-400 mb-6 flex items-center gap-2">
                <Calendar size={14} />
                Last active: {format(new Date(client.lastOrderDate), 'MMM d')}
              </p>

              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-gray-500 text-sm font-bold">
                    <ShoppingBag size={16} />
                    <span>Orders</span>
                  </div>
                  <span className="text-gray-900 font-black">{client.totalOrders}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-gray-500 text-sm font-bold">
                    <TrendingUp size={16} />
                    <span>Total Revenue</span>
                  </div>
                  <span className="text-indigo-600 font-black">₹{client.totalSpent.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          ))}
          
          {filteredClients.length === 0 && (
            <div className="col-span-full text-center py-20">
              <p className="text-gray-500 font-bold">No clients found matching your search.</p>
            </div>
          )}
        </div>
      )}

      {/* CLIENT DETAILS MODAL */}
      {selectedClientName && clientDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start">
              <div className="flex items-center gap-5">
                 <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                    <Users size={32} />
                 </div>
                 <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">{clientDetails.name}</h2>
                    <p className="text-gray-500 font-medium mt-1">Client Profile & Purchase History</p>
                 </div>
              </div>
              <button onClick={() => setSelectedClientName(null)} className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors border border-gray-200">
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                
                {/* LEFT SIDE: Stats & Items */}
                <div className="w-full md:w-1/2 p-8 overflow-y-auto border-r border-gray-100 custom-scrollbar">
                    
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
                            <p className="text-xs font-bold text-indigo-400 uppercase">Total Spent</p>
                            <p className="text-2xl font-black text-indigo-700 mt-1">₹{clientDetails.totalSpent.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="p-5 bg-orange-50 rounded-2xl border border-orange-100">
                            <p className="text-xs font-bold text-orange-400 uppercase">Avg. Order</p>
                            <p className="text-2xl font-black text-orange-700 mt-1">₹{Math.round(clientDetails.averageOrderValue).toLocaleString('en-IN')}</p>
                        </div>
                    </div>

                    {/* Purchased Items List */}
                    <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                        <Package size={20} className="text-gray-400" />
                        Items Purchased
                    </h3>
                    <div className="space-y-3">
                        {purchasedItems.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                                <div>
                                    <p className="font-bold text-gray-900">{item.name}</p>
                                    <p className="text-xs font-bold text-gray-400">{item.qty} units total</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-gray-700">₹{item.total.toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT SIDE: Order History */}
                <div className="w-full md:w-1/2 p-8 overflow-y-auto custom-scrollbar bg-gray-50/30">
                    <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                        <Clock size={20} className="text-gray-400" />
                        Order History
                    </h3>
                    <div className="space-y-4">
                        {clientOrders.map((order: any) => (
                            <div key={order._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase">{format(new Date(order.date), 'MMM do, yyyy')}</p>
                                        <p className="text-xs font-mono text-gray-300 mt-0.5">#{order._id.slice(-6).toUpperCase()}</p>
                                    </div>
                                    <span className="px-2.5 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-bold border border-green-100">
                                        {order.status}
                                    </span>
                                </div>
                                
                                {/* Items Preview */}
                                <div className="space-y-1 mb-3">
                                    {order.items && order.items.length > 0 ? (
                                        order.items.map((item: any, i: number) => (
                                            <div key={i} className="flex justify-between text-xs">
                                                <span className="text-gray-600 font-medium">{item.bottleName} <span className="text-gray-400">x{item.quantity}</span></span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-600 font-medium">{order.bottleName} <span className="text-gray-400">x{order.quantity}</span></span>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-400">Total Amount</span>
                                    <span className="text-lg font-black text-gray-900">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Clients;