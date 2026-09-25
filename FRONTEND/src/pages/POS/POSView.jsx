// src/pages/POS/POSView.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  PageHeader,
  Card,
  Button,
  Badge,
  Input,
  IconButton
} from '../../components/ui/index';
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, DollarSign, Wallet } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { useERPStore } from '../../store/useERPStore';

export default function POSView() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Cart state
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0); // in percent
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [lastReceipt, setLastReceipt] = useState(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await api.getProducts();
      setProducts(res || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...new Set(products.map(p => p.category))];

  // Cart operations
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = (subtotal * discount) / 100;
  const taxRate = 5; // 5% flat tax
  const taxAmount = ((subtotal - discountAmount) * taxRate) / 100;
  const total = subtotal - discountAmount + taxAmount;

  const handleCheckout = () => {
    if (cart.length === 0) {
      useERPStore.getState().showToast("Cart is empty! Please add products before checkout.", "warning");
      return;
    }
    const receipt = {
      orderId: `POS-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleString(),
      items: [...cart],
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      total,
      paymentMethod
    };
    setLastReceipt(receipt);
    setIsReceiptOpen(true);
    setCart([]); // Reset cart
    useERPStore.getState().showToast(`Order #${receipt.orderId} processed successfully!`, "success");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="POS Cashier Terminal"
        description="Search products, click cards to insert in retail cart, configure discounts, and process payments."
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'POS' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Product Grid */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search barcode or SKU..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            {/* Category selection */}
            <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                    selectedCategory === cat
                      ? 'bg-secondary border-secondary text-white'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid list */}
          {loading ? (
            <div className="text-center py-20 text-slate-400">Loading catalog items...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-400">No items matched filters.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filteredProducts.map((prod) => (
                <Card
                  key={prod.id}
                  onClick={() => addToCart(prod)}
                  className="hover:border-secondary dark:hover:border-secondary cursor-pointer hover:shadow-xs p-3.5 space-y-3 transition-all flex flex-col justify-between"
                >
                  {prod.image && (
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-24 object-cover rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50"
                    />
                  )}
                  <div className="space-y-1 text-xs">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">{prod.brand}</span>
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{prod.name}</h5>
                    <div className="flex justify-between items-center pt-1">
                      <span className="font-extrabold text-slate-900 dark:text-indigo-400">${prod.price}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">{prod.stock} in stock</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Retail Cart Sidebar */}
        <Card className="flex flex-col h-[580px] p-5 justify-between">
          <div className="flex-1 flex flex-col min-h-0">
            {/* Cart Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingCart className="w-4 h-4 text-secondary" /> Cart Items
              </span>
              <Badge variant="primary">{cart.length} items</Badge>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 py-2">
              {cart.length === 0 ? (
                <div className="text-center py-20 text-slate-400 text-xs font-medium">Cart is empty. Click products on the left.</div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-2.5 text-xs">
                    <div className="flex-1 min-w-0">
                      <h6 className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{item.name}</h6>
                      <span className="text-[10px] text-slate-400">${item.price} each</span>
                    </div>
                    {/* Quantity controls */}
                    <div className="flex items-center gap-1.5">
                      <IconButton icon={Minus} size="sm" onClick={() => updateQuantity(item.id, -1)} />
                      <span className="w-6 text-center font-bold text-slate-900 dark:text-white">{item.quantity}</span>
                      <IconButton icon={Plus} size="sm" onClick={() => addToCart(item)} />
                    </div>
                    <IconButton
                      icon={Trash2}
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => removeFromCart(item.id)}
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pricing Ledger summary and checkout */}
          <div className="border-t border-slate-150 dark:border-slate-800 pt-4 space-y-3.5">
            {/* Ledger math */}
            <div className="text-xs space-y-1.5 font-semibold text-slate-550 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Discount (%)</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={e => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="w-12 h-6 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 px-1 text-center"
                />
              </div>
              <div className="flex justify-between">
                <span>Sales Tax (5%)</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-slate-50 border-t border-dashed border-slate-200 dark:border-slate-800 pt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Cash', icon: DollarSign },
                { id: 'Card', icon: CreditCard },
                { id: 'UPI', icon: Wallet }
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setPaymentMethod(mode.id)}
                  className={`py-2 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
                    paymentMethod === mode.id
                      ? 'bg-secondary/10 border-secondary text-secondary'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-550/5'
                  }`}
                >
                  <mode.icon className="w-4 h-4 shrink-0" />
                  <span>{mode.id}</span>
                </button>
              ))}
            </div>

            <Button variant="primary" size="md" className="w-full bg-slate-900 hover:bg-slate-950 font-bold" onClick={handleCheckout}>
              Checkout Payout
            </Button>
          </div>
        </Card>
      </div>

      {/* Checkout Receipt Modal */}
      {isReceiptOpen && lastReceipt && (
        <Modal
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          title="POS Transaction Invoice Receipt"
          size="md"
        >
          <div className="space-y-4 text-xs font-mono text-slate-700 dark:text-slate-300">
            <div className="text-center space-y-1">
              <h4 className="font-bold text-sm tracking-widest text-slate-900 dark:text-white">VISHVIN ERP SYSTEMS</h4>
              <p className="text-[10px] text-slate-400">128 Operations Dr, California, USA</p>
              <p className="text-[10px] text-slate-500">ID: {lastReceipt.orderId} • {lastReceipt.date}</p>
            </div>

            <div className="border-t border-b border-dashed border-slate-200 dark:border-slate-800 py-3 space-y-2">
              <div className="grid grid-cols-4 font-bold border-b border-slate-100 dark:border-slate-800 pb-1">
                <span className="col-span-2">Item</span>
                <span className="text-center">Qty</span>
                <span className="text-right">Price</span>
              </div>
              {lastReceipt.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-4">
                  <span className="col-span-2 truncate">{item.name}</span>
                  <span className="text-center">{item.quantity}</span>
                  <span className="text-right">${(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-right">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${lastReceipt.subtotal.toLocaleString()}</span>
              </div>
              {lastReceipt.discount > 0 && (
                <div className="flex justify-between text-red-500">
                  <span>Discount:</span>
                  <span>-${lastReceipt.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Sales Tax (5%):</span>
                <span>${lastReceipt.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm border-t border-dashed border-slate-200 dark:border-slate-800 pt-2 text-slate-900 dark:text-slate-50">
                <span>TOTAL PAID:</span>
                <span>${lastReceipt.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-400 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800 space-y-1">
              <p>Paid via {lastReceipt.paymentMethod} • Cashier: Andrew</p>
              <p className="font-bold">Thank you for your business!</p>
            </div>
            
            <div className="flex justify-center pt-2">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                Print Receipt
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
