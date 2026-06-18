import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { LogOut, Package, MapPin, Settings, Heart, Eye, EyeOff } from 'lucide-react';
import { formatPHP, cn } from '../lib/utils';

type Tab = 'orders' | 'addresses' | 'settings' | 'favorites';

export const DashboardPage = () => {
  const { user, logout, updateProfile, addAddress, removeAddress, updateAddress, addToast, favoriteProducts, toggleFavorite, addToCart, setIsCartOpen, removeOrder, isLoadingAuth } = useAppContext();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>('orders');

  // Setting state
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [emailInput, setEmailInput] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Sync inputs when user loads (important for Google OAuth where user arrives after mount)
  React.useEffect(() => {
    if (user) {
      setNameInput(user.name || '');
      setEmailInput(user.email || '');
    }
  }, [user?.name, user?.email]);

  // Address state
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Order cancellation modal state
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  // Grace period: don't redirect to login immediately — give auth state time to settle
  const [authGracePeriod, setAuthGracePeriod] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setAuthGracePeriod(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Redirect to login if auth is done loading, grace period passed, and there's no user
  React.useEffect(() => {
    if (!isLoadingAuth && !authGracePeriod && !user) {
      setLocation('/login');
    }
  }, [isLoadingAuth, authGracePeriod, user, setLocation]);

  // Show empty layout while loading auth or if user is null (waiting/redirecting)
  if (isLoadingAuth || !user) {
    return <div className="min-h-screen bg-beige-50" />;
  }

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPassword || newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        addToast('Passwords do not match', 'error');
        return;
      }
      updateProfile(nameInput, emailInput);
      addToast('Profile and password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      updateProfile(nameInput, emailInput);
      addToast('Profile updated successfully');
    }
  };
  
  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const addressData = {
      fullName: formData.get('fullName') as string,
      mobile: formData.get('mobile') as string,
      streetAddress: formData.get('streetAddress') as string,
      barangay: formData.get('barangay') as string,
      city: formData.get('city') as string,
      province: formData.get('province') as string,
      zipCode: formData.get('zipCode') as string,
    };

    if (editingAddressId) {
      updateAddress(editingAddressId, addressData);
      setEditingAddressId(null);
    } else {
      addAddress({ ...addressData, id: Math.random().toString(36).substr(2, 9) });
    }
    setIsAddingAddress(false);
  };

  return (
    <div className="min-h-screen bg-beige-50 pt-32 pb-24">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <h1 className="font-serif text-4xl text-matcha-900 mb-12">My Account</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="space-y-2">
            <button 
              onClick={() => setActiveTab('orders')}
              className={cn(
                "flex items-center gap-3 w-full p-4 rounded-xl font-sans font-medium transition-colors",
                activeTab === 'orders' ? "text-matcha-900 bg-white shadow-sm border border-matcha-100" : "text-ink/60 hover:bg-white hover:text-matcha-900"
              )}
            >
              <Package className="w-5 h-5" />
              Order History
            </button>
            <button 
              onClick={() => setActiveTab('addresses')}
              className={cn(
                "flex items-center gap-3 w-full p-4 rounded-xl font-sans font-medium transition-colors",
                activeTab === 'addresses' ? "text-matcha-900 bg-white shadow-sm border border-matcha-100" : "text-ink/60 hover:bg-white hover:text-matcha-900"
              )}
            >
              <MapPin className="w-5 h-5" />
              Addresses
            </button>
            <button 
              onClick={() => setActiveTab('favorites')}
              className={cn(
                "flex items-center gap-3 w-full p-4 rounded-xl font-sans font-medium transition-colors",
                activeTab === 'favorites' ? "text-matcha-900 bg-white shadow-sm border border-matcha-100" : "text-ink/60 hover:bg-white hover:text-matcha-900"
              )}
            >
              <Heart className="w-5 h-5" />
              Favorites
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={cn(
                "flex items-center gap-3 w-full p-4 rounded-xl font-sans font-medium transition-colors",
                activeTab === 'settings' ? "text-matcha-900 bg-white shadow-sm border border-matcha-100" : "text-ink/60 hover:bg-white hover:text-matcha-900"
              )}
            >
              <Settings className="w-5 h-5" />
              Settings
            </button>
            <div className="pt-8 mt-8 border-t border-matcha-300">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 w-full p-4 rounded-xl font-sans font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>

          {/* Content area */}
          <div className="md:col-span-3 space-y-8">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-ink/5">
              <h2 className="font-serif text-2xl text-ink mb-2">Welcome, {user.name}</h2>
              <p className="font-sans text-ink/60">Manage your orders, addresses, and account details here.</p>
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-ink/5 relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'favorites' && (
                    <div>
                      <h3 className="font-serif text-xl text-ink mb-6 border-b border-matcha-100 pb-4 flex items-center gap-2">
                        <Heart className="w-5 h-5 fill-red-500 text-red-500" /> Favorites
                      </h3>
                      {favoriteProducts.length === 0 ? (
                        <div className="py-16 text-center">
                          <Heart className="w-10 h-10 text-matcha-200 mx-auto mb-4" />
                          <p className="font-sans text-ink/60 italic">No favorites yet. Heart a product in the menu to save it here.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                          {favoriteProducts.map(product => (
                            <div key={product.id} className="group relative">
                              <div className="aspect-square overflow-hidden bg-matcha-50 mb-3 relative">
                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <button
                                  onClick={() => toggleFavorite(product)}
                                  className="absolute top-2 right-2 p-1.5 hover:scale-110 transition-transform"
                                >
                                  <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                                </button>
                              </div>
                              <p className="font-serif text-sm text-ink leading-tight">{product.name}</p>
                              <p className="font-sans text-xs text-ink/50 mt-0.5 mb-2">{formatPHP(product.price)}</p>
                              <button
                                onClick={() => {
                                  addToCart(product);
                                  setIsCartOpen(true);
                                }}
                                className="w-full py-3 border border-[#0d1b14]/20 text-[#0d1b14] bg-transparent font-sans text-[10px] font-bold tracking-[0.15em] uppercase hover:bg-[#0d1b14] hover:text-white transition-colors rounded-none"
                              >
                                ADD TO CART
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'orders' && (
                    <div>
                      <h3 className="font-serif text-xl text-ink mb-6 border-b border-matcha-100 pb-4">Recent Orders</h3>
                      {user.orders.length === 0 ? (
                        <p className="font-sans text-ink/60 py-8 text-center italic">No orders yet.</p>
                      ) : (
                        <div className="space-y-6">
                          {user.orders.map((order) => (
                            <div key={order.id} className="border border-matcha-300 rounded-xl p-6">
                              <div className="flex justify-between items-start mb-4 border-b border-matcha-100 pb-4">
                                <div>
                                  <p className="font-sans font-medium text-ink">Order #{order.id}</p>
                                  <p className="font-sans text-sm text-ink/60">{order.date}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-sans font-medium text-matcha-700">{formatPHP(order.total)}</p>
                                  <span className="inline-block mt-1 px-3 py-1 bg-matcha-100 text-matcha-900 rounded-full text-xs font-semibold uppercase">{order.status}</span>
                                </div>
                              </div>
                              <div className="space-y-4">
                                {order.items.map((item, i) => (
                                  <div key={i} className="flex items-center gap-4 font-sans text-sm text-ink/80">
                                    <div className="w-12 h-12 bg-matcha-50 rounded-lg overflow-hidden shrink-0 border border-matcha-100">
                                      <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 flex justify-between items-center">
                                      <span className="font-medium text-ink">{item.quantity}x {item.product.name}</span>
                                      <span className="text-ink/60">{formatPHP(item.product.price * item.quantity)}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-matcha-100">
                                <button 
                                  onClick={() => {
                                    order.items.forEach(item => addToCart(item.product, item.quantity));
                                    setLocation('/checkout');
                                  }}
                                  className="px-5 py-2 bg-matcha-900 text-white rounded-lg font-sans text-sm font-medium hover:bg-ink transition-colors"
                                >
                                  ORDER AGAIN
                                </button>
                                  <button 
                                    onClick={() => setCancellingOrderId(order.id)}
                                    className="px-5 py-2 border border-red-200 text-red-600 rounded-lg font-sans text-sm font-medium hover:bg-red-50 transition-colors"
                                  >
                                    CANCEL ORDER
                                  </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'addresses' && (
                    <div>
                      <div className="flex justify-between items-center mb-6 border-b border-matcha-100 pb-4">
                        <h3 className="font-serif text-xl text-ink">Saved Addresses</h3>
                        {!isAddingAddress && (
                          <button 
                            onClick={() => setIsAddingAddress(true)}
                            className="font-sans text-sm font-medium px-4 py-2 bg-matcha-100 text-matcha-900 rounded-lg hover:bg-matcha-300 transition-colors"
                          >
                            Add New Address
                          </button>
                        )}
                      </div>

                      {isAddingAddress || editingAddressId ? (
                        <form onSubmit={handleAddAddress} className="space-y-6 border border-matcha-300 rounded-xl p-6">
                          <h4 className="font-serif text-lg text-matcha-900">{editingAddressId ? 'Edit Address' : 'New Address'}</h4>
                          {(() => {
                            const editingAddress = editingAddressId ? user.savedAddresses.find(a => a.id === editingAddressId) : null;
                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                   <label className="block text-xs font-sans uppercase text-ink/60 mb-1">Full Name</label>
                                   <input name="fullName" defaultValue={editingAddress?.fullName} required className="w-full border border-matcha-300 rounded-lg px-4 py-2 font-sans focus:outline-none focus:border-matcha-700" />
                                </div>
                                <div>
                                   <label className="block text-xs font-sans uppercase text-ink/60 mb-1">Mobile</label>
                                   <input name="mobile" defaultValue={editingAddress?.mobile} required className="w-full border border-matcha-300 rounded-lg px-4 py-2 font-sans focus:outline-none focus:border-matcha-700" />
                                </div>
                                <div className="sm:col-span-2">
                                   <label className="block text-xs font-sans uppercase text-ink/60 mb-1">Street Address</label>
                                   <input name="streetAddress" defaultValue={editingAddress?.streetAddress} required placeholder="House/Unit No., Street Name" className="w-full border border-matcha-300 rounded-lg px-4 py-2 font-sans focus:outline-none focus:border-matcha-700" />
                                </div>
                                <div>
                                   <label className="block text-xs font-sans uppercase text-ink/60 mb-1">Barangay</label>
                                   <input name="barangay" defaultValue={editingAddress?.barangay} required className="w-full border border-matcha-300 rounded-lg px-4 py-2 font-sans focus:outline-none focus:border-matcha-700" />
                                </div>
                                <div>
                                   <label className="block text-xs font-sans uppercase text-ink/60 mb-1">City / Municipality</label>
                                   <input name="city" defaultValue={editingAddress?.city} required className="w-full border border-matcha-300 rounded-lg px-4 py-2 font-sans focus:outline-none focus:border-matcha-700" />
                                </div>
                                <div>
                                   <label className="block text-xs font-sans uppercase text-ink/60 mb-1">Province</label>
                                   <input name="province" defaultValue={editingAddress?.province} required className="w-full border border-matcha-300 rounded-lg px-4 py-2 font-sans focus:outline-none focus:border-matcha-700" />
                                </div>
                                <div>
                                   <label className="block text-xs font-sans uppercase text-ink/60 mb-1">Zip Code</label>
                                   <input name="zipCode" defaultValue={editingAddress?.zipCode} required className="w-full border border-matcha-300 rounded-lg px-4 py-2 font-sans focus:outline-none focus:border-matcha-700" />
                                </div>
                              </div>
                            );
                          })()}
                          <div className="flex gap-4 items-center">
                            <button type="submit" className="px-6 py-2 bg-matcha-900 text-white rounded-lg font-medium">{editingAddressId ? 'Update' : 'Save'} Address</button>
                            <button type="button" onClick={() => { setIsAddingAddress(false); setEditingAddressId(null); }} className="px-6 py-2 border border-matcha-300 text-ink rounded-lg font-medium hover:bg-matcha-100">Cancel</button>
                          </div>
                        </form>
                      ) : (
                        <div className="space-y-4">
                          {user.savedAddresses.length === 0 ? (
                            <p className="font-sans text-ink/60 italic text-center py-8">No saved addresses.</p>
                          ) : (
                            user.savedAddresses.map((addr) => (
                              <div key={addr.id} className="border border-matcha-300 rounded-xl p-6 flex justify-between items-start">
                                <div>
                                  <p className="font-bold font-sans text-ink">{addr.fullName} <span className="font-normal text-ink/60">— {addr.mobile}</span></p>
                                  {addr.streetAddress && <p className="font-sans text-ink/80 mt-1 text-sm">{addr.streetAddress}</p>}
                                  <p className="font-sans text-ink/80 mt-0.5 text-sm">{addr.barangay}, {addr.city}</p>
                                  <p className="font-sans text-ink/80 text-sm">{addr.province}, {addr.zipCode}</p>
                                </div>
                                <div className="flex gap-3">
                                  <button onClick={() => setEditingAddressId(addr.id)} className="text-sm font-medium text-matcha-700 hover:text-matcha-500">Edit</button>
                                  <button onClick={() => removeAddress(addr.id)} className="text-sm font-medium text-red-600 hover:text-red-400">Delete</button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'settings' && (
                    <div>
                      <h3 className="font-serif text-xl text-ink mb-6 border-b border-matcha-100 pb-4">Account Settings</h3>
                      <div className="max-w-xl">
                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                          <div>
                            <label className="block text-xs font-sans uppercase text-ink/60 mb-1">Full Name</label>
                            <input 
                              value={nameInput} 
                              onChange={(e) => setNameInput(e.target.value)}
                              className="w-full border-b border-matcha-300 bg-transparent py-2 focus:outline-none focus:border-matcha-700 font-sans" 
                              required 
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-sans uppercase text-ink/60 mb-1">Email Address</label>
                            <input 
                              value={emailInput} 
                              onChange={(e) => setEmailInput(e.target.value)}
                              type="email"
                              className="w-full border-b border-matcha-300 bg-transparent py-2 focus:outline-none focus:border-matcha-700 font-sans" 
                              required 
                            />
                          </div>

                          <div className="pt-4 pb-2 mt-8">
                            <h4 className="font-serif text-lg text-matcha-900 mb-4">Change Password</h4>
                            <div className="space-y-6">
                              <div className="relative">
                                <label className="block text-xs font-sans uppercase text-ink/60 mb-1">Current Password</label>
                                <input 
                                  type={showCurrentPassword ? "text" : "password"}
                                  value={currentPassword} 
                                  onChange={(e) => setCurrentPassword(e.target.value)}
                                  className="w-full border-b border-matcha-300 bg-transparent py-2 pr-10 focus:outline-none focus:border-matcha-700 font-sans" 
                                />
                                {currentPassword.length > 0 && (
                                  <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-0 bottom-2 text-ink/40 hover:text-ink">
                                    {showCurrentPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                  </button>
                                )}
                              </div>
                              <div className="relative">
                                <label className="block text-xs font-sans uppercase text-ink/60 mb-1">New Password</label>
                                <input 
                                  type={showNewPassword ? "text" : "password"}
                                  value={newPassword} 
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  className="w-full border-b border-matcha-300 bg-transparent py-2 pr-10 focus:outline-none focus:border-matcha-700 font-sans" 
                                />
                                {newPassword.length > 0 && (
                                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-0 bottom-2 text-ink/40 hover:text-ink">
                                    {showNewPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                  </button>
                                )}
                              </div>
                              <div className="relative">
                                <label className="block text-xs font-sans uppercase text-ink/60 mb-1">Confirm New Password</label>
                                <input 
                                  type={showConfirmPassword ? "text" : "password"}
                                  value={confirmPassword} 
                                  onChange={(e) => setConfirmPassword(e.target.value)}
                                  className="w-full border-b border-matcha-300 bg-transparent py-2 pr-10 focus:outline-none focus:border-matcha-700 font-sans" 
                                />
                                {confirmPassword.length > 0 && (
                                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-0 bottom-2 text-ink/40 hover:text-ink">
                                    {showConfirmPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          <button type="submit" className="w-full py-3 bg-matcha-900 text-white rounded-full font-medium tracking-wide hover:bg-ink transition-colors mt-6">
                            Save Changes
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Confirmation Modal */}
      <AnimatePresence>
        {cancellingOrderId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(10,24,17,0.75)', backdropFilter: 'blur(6px)' }}
            onClick={() => setCancellingOrderId(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-[420px] overflow-hidden border border-white/10"
              style={{ background: '#0e1a12' }}
            >
              <div className="px-8 pb-10 pt-10">
                <div className="w-8 h-[2px] mb-6" style={{ background: '#c1f23e' }} />
                
                <h3 
                  className="font-serif text-white mb-3"
                  style={{ fontSize: '26px', lineHeight: 1.2, fontWeight: 400 }}
                >
                  Cancel this order?
                </h3>
                <p 
                  className="font-sans text-white/50 mb-10"
                  style={{ fontSize: '13px', lineHeight: 1.7, letterSpacing: '0.02em' }}
                >
                  Are you sure you want to cancel this order? This action cannot be undone and your payment will be refunded.
                </p>
                
                <div className="space-y-4">
                  <button
                    onClick={() => setCancellingOrderId(null)}
                    className="w-full py-4 font-sans font-bold tracking-[0.2em] uppercase text-[11px] transition-all flex items-center justify-center"
                    style={{ background: '#c1f23e', color: '#0a1811' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#d4ff50')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#c1f23e')}
                  >
                    Keep Order
                  </button>
                  <button
                    onClick={() => {
                      removeOrder(cancellingOrderId);
                      setCancellingOrderId(null);
                      addToast('Order cancelled successfully', 'success');
                    }}
                    className="w-full font-sans text-white/30 hover:text-red-400 transition-colors text-center uppercase tracking-[0.1em]"
                    style={{ fontSize: '11px' }}
                  >
                    Yes, Cancel Order
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
