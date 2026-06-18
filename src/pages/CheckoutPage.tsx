import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { formatPHP } from '../lib/utils';
import { Coffee, Croissant, Leaf, MapPin, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Address } from '../types';

export const CheckoutPage = () => {
  const { cart, cartTotal, addToast, removeFromCart, addOrder, user, markVoucherUsed } = useAppContext();
  const [, setLocation] = useLocation();
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  const [voucherInput, setVoucherInput] = useState('');
  const [voucherError, setVoucherError] = useState('');
  const [isVoucherApplied, setIsVoucherApplied] = useState(false);

  // Saved address selector state
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressPicker, setShowAddressPicker] = useState(false);

  // Controlled form fields
  const [formName, setFormName]       = useState(user?.name || '');
  const [formEmail, setFormEmail]     = useState(user?.email || '');
  const [formMobile, setFormMobile]   = useState('');
  const [formStreet, setFormStreet]   = useState('');
  const [formBarangay, setFormBarangay] = useState('');
  const [formCity, setFormCity]       = useState('');
  const [formProvince, setFormProvince] = useState('');

  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');

  const SHIPPING_FEE = 100;
  const shippingFee = deliveryMethod === 'delivery' ? SHIPPING_FEE : 0;
  const discountAmount = isVoucherApplied ? cartTotal * 0.2 : 0;
  const finalTotal = cartTotal - discountAmount + shippingFee;

  const savedAddresses: Address[] = user?.savedAddresses || [];

  const handleSelectAddress = (address: Address) => {
    setSelectedAddressId(address.id);
    setFormName(address.fullName);
    setFormMobile(address.mobile);
    setFormBarangay(address.barangay);
    setFormCity(address.city);
    setFormProvince(address.province);
    setFormStreet(address.streetAddress || ''); 
    setShowAddressPicker(false);
    addToast('Address details filled in');
  };

  const handleApplyVoucher = () => {
    if (!voucherInput.trim()) return;
    if (user?.voucherCode && voucherInput.trim().toUpperCase() === user.voucherCode.toUpperCase()) {
      if (user.voucherUsed) {
        setVoucherError('This voucher has already been used.');
        setIsVoucherApplied(false);
      } else {
        setVoucherError('');
        setIsVoucherApplied(true);
        addToast('Voucher applied successfully!');
      }
    } else {
      setVoucherError('Invalid voucher code.');
      setIsVoucherApplied(false);
    }
  };

  // Redirect to login if not authenticated
  if (!user) {
    setLocation('/login');
    return null;
  }

  if (cart.length === 0 && !isSuccess) {
    setLocation('/menu');
    return null;
  }

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const orderId = `BRW-${Math.floor(Math.random() * 100000)}`;

    if (isVoucherApplied) {
      await markVoucherUsed();
    }

    const newOrder = {
      id: orderId,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      items: [...cart],
      total: finalTotal,
      status: 'Processing' as const,
      paymentMethod: formData.get('payment') as any,
      deliveryType: formData.get('deliveryMethod') as any,
      address: deliveryMethod === 'delivery' ? {
        id: Math.random().toString(36).substr(2, 9),
        fullName: formData.get('fullName') as string,
        mobile: formData.get('mobile') as string,
        streetAddress: formData.get('streetAddress') as string,
        barangay: formData.get('barangay') as string,
        city: formData.get('city') as string,
        province: formData.get('province') as string,
        zipCode: formData.get('zipCode') as string,
      } : undefined
    };

    addOrder(newOrder);
    setOrderDetails(newOrder);
    setIsSuccess(true);
    cart.forEach(item => removeFromCart(item.product.id));
    addToast('Order placed successfully!');
  };

  if (isSuccess && orderDetails) {
    return (
      <div className="min-h-screen bg-[#faf9f5] flex items-center justify-center py-24 px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white p-8 md:p-12 rounded-[1.5rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] max-w-xl w-full text-center relative border border-ink/5"
        >
          <h2 className="font-serif text-4xl text-[#0d1b14] mb-3 tracking-tight">Order Confirmed</h2>
          <p className="font-sans text-sm text-[#0d1b14]/70 mb-8 max-w-md mx-auto leading-relaxed font-light">
            Your moments of stillness are being prepared. We have received your order and it is now brewing.
          </p>

          <div className="bg-[#f5f4ef] rounded-xl text-left border border-ink/5 mb-8">
            <div className="p-6 border-b border-ink/5 flex justify-between">
              <div>
                <p className="text-[10px] font-sans uppercase tracking-[0.1em] font-bold text-[#0d1b14]/60 mb-1">Order Number</p>
                <p className="font-serif text-2xl text-[#0d1b14]">#{orderDetails.id}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-sans uppercase tracking-[0.1em] font-bold text-[#0d1b14]/60 mb-1">Estimated Delivery</p>
                <p className="font-sans font-medium text-sm text-[#0d1b14]">25 - 35 mins</p>
              </div>
            </div>

            <div className="p-6 space-y-4 border-b border-ink/5">
              {orderDetails.items.map((item: any, i: number) => (
                <div key={i} className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-md overflow-hidden shrink-0 bg-[#e8e6dd]">
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : item.product.category === 'Pastries' ? (
                        <Croissant className="w-4 h-4 text-[#0d1b14] m-auto mt-3" strokeWidth={1.5} />
                      ) : (
                        <Leaf className="w-4 h-4 text-[#0d1b14] m-auto mt-3" strokeWidth={1.5} />
                      )}
                    </div>
                    <div>
                      <p className="font-sans font-medium text-sm text-[#0d1b14]">{item.product.name}</p>
                      <p className="font-sans text-xs text-[#0d1b14]/60 mt-0.5 tracking-wide">
                        {item.quantity} {item.quantity === 1 ? 'Item' : 'Items'}
                      </p>
                    </div>
                  </div>
                  <p className="font-sans text-sm text-[#0d1b14]">{formatPHP(item.product.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="p-6 flex justify-between items-center text-[#0d1b14]">
              <p className="font-sans text-sm">Total</p>
              <p className="font-serif text-2xl">{formatPHP(orderDetails.total)}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setLocation('/dashboard')}
              className="px-8 py-3.5 bg-[#0a1811] text-white rounded font-sans text-[10px] font-bold tracking-[0.15em] uppercase hover:bg-black transition-colors"
            >
              Track Order
            </button>
            <button
              onClick={() => setLocation('/')}
              className="px-8 py-3.5 border border-[#c4c2ba] bg-white text-[#0d1b14] rounded font-sans text-[10px] font-bold tracking-[0.15em] uppercase hover:bg-[#faf9f5] transition-colors"
            >
              Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige-50 pt-32 pb-24">
      <div className="max-w-6xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Form area */}
        <div>
          <h1 className="font-serif text-4xl text-matcha-900 mb-8">Checkout</h1>

          {/* ── Saved Address Picker ── */}
          {savedAddresses.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-sans font-bold tracking-[0.12em] uppercase text-ink/60">
                  Use a Saved Address
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddressPicker(v => !v)}
                  className="flex items-center gap-1 text-xs font-sans text-matcha-700 hover:text-matcha-900 transition-colors"
                >
                  {showAddressPicker ? 'Hide' : `${savedAddresses.length} saved`}
                  {showAddressPicker ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              <AnimatePresence>
                {showAddressPicker && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                      {savedAddresses.map(addr => {
                        const isSelected = selectedAddressId === addr.id;
                        return (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => handleSelectAddress(addr)}
                            className={`text-left p-4 border transition-all duration-200 relative ${
                              isSelected
                                ? 'border-matcha-700 bg-matcha-50 shadow-sm'
                                : 'border-matcha-200 bg-white hover:border-matcha-400 hover:bg-white'
                            }`}
                          >
                            {isSelected && (
                              <span className="absolute top-3 right-3 w-5 h-5 bg-matcha-700 rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
                              </span>
                            )}
                            <div className="flex items-start gap-2 mb-2">
                              <MapPin className="w-3.5 h-3.5 text-matcha-600 mt-0.5 shrink-0" />
                              <p className="font-sans font-semibold text-sm text-ink leading-snug">{addr.fullName}</p>
                            </div>
                            <p className="font-sans text-xs text-ink/60 leading-relaxed pl-5">
                              {addr.streetAddress && <>{addr.streetAddress}<br /></>}
                              {addr.barangay}, {addr.city}<br />
                              {addr.province} {addr.zipCode}<br />
                              {addr.mobile}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Collapsed preview of selected address */}
              {!showAddressPicker && selectedAddressId && (() => {
                const addr = savedAddresses.find(a => a.id === selectedAddressId);
                return addr ? (
                  <div className="flex items-center gap-3 p-3 bg-matcha-50 border border-matcha-200">
                    <Check className="w-4 h-4 text-matcha-700 shrink-0" />
                    <p className="font-sans text-xs text-ink/80">
                      <span className="font-semibold">{addr.fullName}</span> — {addr.barangay}, {addr.city}, {addr.province}
                    </p>
                  </div>
                ) : null;
              })()}

              {!showAddressPicker && !selectedAddressId && (
                <button
                  type="button"
                  onClick={() => setShowAddressPicker(true)}
                  className="w-full py-3 border border-dashed border-matcha-300 text-xs font-sans text-ink/50 hover:border-matcha-500 hover:text-ink/70 transition-colors"
                >
                  + Choose from saved addresses
                </button>
              )}

              <div className="mt-4 border-t border-matcha-100" />
            </div>
          )}

          <form id="checkout-form" onSubmit={handleComplete} className="space-y-12">
            {/* Section 1: Contact */}
            <section>
              <h2 className="font-serif text-2xl text-ink mb-6 border-b border-matcha-100 pb-2">1. Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-sans tracking-wide uppercase text-ink/60 mb-1">Full Name</label>
                  <input
                    required
                    type="text"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full border-b border-matcha-300 bg-transparent py-2 focus:outline-none focus:border-matcha-700 transition-colors font-sans"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-sans tracking-wide uppercase text-ink/60 mb-1">Email</label>
                    <input
                      required
                      type="email"
                      value={formEmail}
                      onChange={e => setFormEmail(e.target.value)}
                      className="w-full border-b border-matcha-300 bg-transparent py-2 focus:outline-none focus:border-matcha-700 transition-colors font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-sans tracking-wide uppercase text-ink/60 mb-1">Mobile Number</label>
                    <input
                      required
                      type="tel"
                      value={formMobile}
                      onChange={e => setFormMobile(e.target.value)}
                      className="w-full border-b border-matcha-300 bg-transparent py-2 focus:outline-none focus:border-matcha-700 transition-colors font-sans"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Delivery */}
            <section>
              <h2 className="font-serif text-2xl text-ink mb-6 border-b border-matcha-100 pb-2">2. Delivery Details</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <label className={`flex items-center gap-2 p-4 border rounded-xl cursor-pointer hover:bg-white transition-colors ${deliveryMethod === 'delivery' ? 'border-matcha-700 bg-matcha-50' : 'border-matcha-300'}`}>
                  <input type="radio" name="deliveryMethod" value="delivery" checked={deliveryMethod === 'delivery'} onChange={() => setDeliveryMethod('delivery')} className="accent-matcha-700" />
                  <span className="font-sans font-medium text-sm">Delivery</span>
                  <span className="ml-auto font-sans text-xs text-ink/60">+₱100</span>
                </label>
                <label className={`flex items-center gap-2 p-4 border rounded-xl cursor-pointer hover:bg-white transition-colors ${deliveryMethod === 'pickup' ? 'border-matcha-700 bg-matcha-50' : 'border-matcha-300'}`}>
                  <input type="radio" name="deliveryMethod" value="pickup" checked={deliveryMethod === 'pickup'} onChange={() => setDeliveryMethod('pickup')} className="accent-matcha-700" />
                  <span className="font-sans font-medium text-sm">Store Pickup</span>
                  <span className="ml-auto font-sans text-xs text-matcha-700 font-semibold">Free</span>
                </label>
              </div>

              {deliveryMethod === 'pickup' ? (
                <div className="p-6 border border-matcha-200 rounded-xl bg-white relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-matcha-700" />
                  <p className="font-sans text-[11px] font-bold tracking-[0.2em] uppercase text-matcha-800 mb-3">Store Location</p>
                  <p className="font-sans text-sm text-ink/70 leading-relaxed">
                    <strong className="font-medium text-ink">Brews Lee Café</strong> — Davao City<br />
                    Open: Mon–Sun, 7:00 AM – 8:00 PM<br />
                    <span className="text-matcha-700 mt-2 block text-[11px] tracking-wide font-medium">No shipping fee applies for store pickup.</span>
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-sans tracking-wide uppercase text-ink/60 mb-1">Street Address</label>
                    <input
                      required
                      type="text"
                      value={formStreet}
                      onChange={e => setFormStreet(e.target.value)}
                      placeholder="House/Unit No., Street Name"
                      className="w-full border-b border-matcha-300 bg-transparent py-2 focus:outline-none focus:border-matcha-700 transition-colors font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-sans tracking-wide uppercase text-ink/60 mb-1">Barangay</label>
                    <input
                      required
                      type="text"
                      value={formBarangay}
                      onChange={e => setFormBarangay(e.target.value)}
                      className="w-full border-b border-matcha-300 bg-transparent py-2 focus:outline-none focus:border-matcha-700 transition-colors font-sans"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-sans tracking-wide uppercase text-ink/60 mb-1">City / Municipality</label>
                      <input
                        required
                        type="text"
                        value={formCity}
                        onChange={e => setFormCity(e.target.value)}
                        className="w-full border-b border-matcha-300 bg-transparent py-2 focus:outline-none focus:border-matcha-700 transition-colors font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-sans tracking-wide uppercase text-ink/60 mb-1">Province</label>
                      <input
                        required
                        type="text"
                        value={formProvince}
                        onChange={e => setFormProvince(e.target.value)}
                        className="w-full border-b border-matcha-300 bg-transparent py-2 focus:outline-none focus:border-matcha-700 transition-colors font-sans"
                      />
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Section 3: Payment */}
            <section>
              <h2 className="font-serif text-2xl text-ink mb-6 border-b border-matcha-100 pb-2">3. Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 border border-matcha-300 rounded-xl cursor-pointer hover:bg-white transition-colors">
                  <div className="flex items-center gap-3">
                    <input type="radio" name="payment" value="gcash" defaultChecked className="accent-matcha-700" />
                    <span className="font-sans font-medium">GCash</span>
                  </div>
                </label>
                <label className="flex items-center justify-between p-4 border border-matcha-300 rounded-xl cursor-pointer hover:bg-white transition-colors">
                  <div className="flex items-center gap-3">
                    <input type="radio" name="payment" value="cod" className="accent-matcha-700" />
                    <span className="font-sans font-medium">Cash on Delivery</span>
                  </div>
                </label>
              </div>
            </section>
          </form>
        </div>

        {/* Order Summary Area */}
        <div>
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-ink/5 sticky top-32">
            <h2 className="font-serif text-2xl text-ink mb-6 border-b border-matcha-100 pb-4">Order Summary</h2>

            <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto pr-2">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-16 overflow-hidden shrink-0">
                    <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-sans font-medium text-sm text-ink mb-1">{item.product.name}</h4>
                    <p className="font-sans text-xs text-ink/50">Qty: {item.quantity}</p>
                  </div>
                  <div className="font-sans font-medium text-sm">
                    {formatPHP(item.product.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t border-matcha-100 pt-6">
              <div className="flex justify-between font-sans text-sm text-ink/70">
                <span>Subtotal</span>
                <span>{formatPHP(cartTotal)}</span>
              </div>
              {isVoucherApplied && (
                <div className="flex justify-between font-sans text-sm text-[#0d1b14] font-medium">
                  <span>Discount (20%)</span>
                  <span>-{formatPHP(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-sans text-sm text-ink/70">
                <span>Shipping</span>
                {deliveryMethod === 'pickup' ? (
                  <span className="text-matcha-700 font-semibold">Free</span>
                ) : (
                  <span>₱{SHIPPING_FEE}.00</span>
                )}
              </div>
              <div className="flex justify-between font-serif text-2xl text-matcha-900 pt-4 border-t border-matcha-100 mt-4">
                <span>Total</span>
                <span>{formatPHP(finalTotal)}</span>
              </div>
            </div>

            <div className="mt-6 border-t border-matcha-100 pt-6">
              <label className="block text-xs font-sans tracking-wide uppercase text-ink/60 mb-2">Gift Card or Discount Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={voucherInput}
                  onChange={e => {
                    setVoucherInput(e.target.value);
                    setVoucherError('');
                  }}
                  disabled={isVoucherApplied}
                  className="flex-1 border border-matcha-300 rounded-lg bg-transparent px-4 py-2 focus:outline-none focus:border-matcha-700 transition-colors font-sans text-sm uppercase disabled:opacity-50"
                  placeholder="Enter code"
                />
                <button
                  type="button"
                  onClick={handleApplyVoucher}
                  disabled={!voucherInput.trim() || isVoucherApplied}
                  className="px-6 py-2 bg-[#0d1b14] text-white rounded-lg font-sans text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
              {voucherError && <p className="text-red-500 font-sans text-xs mt-2">{voucherError}</p>}
            </div>

            <button
              type="submit"
              form="checkout-form"
              className="w-full mt-8 py-4 bg-[#0d1b14] text-white rounded font-sans text-[11px] font-bold tracking-[0.15em] uppercase hover:bg-black transition-colors"
            >
              PLACE ORDER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

