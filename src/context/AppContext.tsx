import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { CartItem, Product, User, Order, Address } from '../types';
import { supabase } from '../lib/supabase';

interface FlyingItem {
  id: string;
  imageUrl: string;
  startX: number;
  startY: number;
}

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, event?: React.MouseEvent) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  cartTotal: number;
  cartItemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  
  favorites: Set<string>;
  toggleFavorite: (product: Product) => void;

  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  addOrder: (order: Order) => void;
  removeOrder: (id: string) => void;
  addAddress: (address: Address) => void;
  updateAddress: (id: string, address: Omit<Address, 'id'>) => void;
  removeAddress: (id: string) => void;
  updateProfile: (name: string, email: string) => void;
  
  flyingItems: FlyingItem[];
  removeFlyingItem: (id: string) => void;
  
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  
  favoriteProducts: Product[];
  isLoadingAuth: boolean;
  markVoucherUsed: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Sync session with Supabase
  useEffect(() => {
    let mounted = true;

    const fetchUserData = async (authUser: any) => {
      try {
        const userId = authUser.id;
        const email = authUser.email || '';
        
        // Fetch profile — check error explicitly
        const { data: profileData, error: profileError } = await supabase
          .from('profiles').select('*').eq('id', userId).maybeSingle();
        
        if (profileError) {
          console.error('[BrewsLee] Profile fetch error:', profileError.message);
        }

        let profile = profileData;

        // If profile doesn't exist, upsert one and WAIT for it
        if (!profile) {
          const defaultProfile = { 
            id: userId, 
            name: authUser.user_metadata?.full_name || email.split('@')[0],
            email: email,
            favorite_products: [], 
            cart: [] 
          };

          const { data: upserted, error: upsertError } = await supabase
            .from('profiles').upsert(defaultProfile, { onConflict: 'id' }).select().single();

          if (upsertError) {
            console.error('[BrewsLee] Profile upsert error:', upsertError.message);
            profile = defaultProfile; // use local fallback
          } else {
            profile = upserted;
          }
        }

        // Fetch addresses — check error
        const { data: addressData, error: addrError } = await supabase
          .from('addresses').select('*').eq('user_id', userId);
        if (addrError) console.error('[BrewsLee] Addresses fetch error:', addrError.message);

        // Fetch orders — check error
        const { data: orderData, error: orderError } = await supabase
          .from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        if (orderError) console.error('[BrewsLee] Orders fetch error:', orderError.message);

        const formattedAddresses: Address[] = (addressData || []).map(a => ({
          id: a.id,
          fullName: a.full_name,
          mobile: a.mobile,
          streetAddress: a.street_address,
          barangay: a.barangay,
          city: a.city,
          province: a.province,
          zipCode: a.zip_code
        }));

        const formattedOrders: Order[] = (orderData || []).map(o => ({
          id: o.id,
          date: new Date(o.created_at).toLocaleDateString(),
          items: o.items as CartItem[],
          total: Number(o.total),
          status: o.status as any,
          paymentMethod: o.payment_method as any,
          deliveryType: o.delivery_type as any,
          address: o.address as Address | undefined
        }));

        // Load fallbacks from localStorage in case Supabase RLS blocked saves
        let localData: any = {};
        try {
          const stored = localStorage.getItem(`brewslee_data_${userId}`);
          if (stored) localData = JSON.parse(stored);
        } catch (e) {}

        const finalAddresses = formattedAddresses.length > 0 ? formattedAddresses : (localData.addresses || []);
        const finalOrders = formattedOrders.length > 0 ? formattedOrders : (localData.orders || []);
        const favProducts = profile?.favorite_products?.length > 0 ? profile.favorite_products : (localData.favorite_products || []);
        const finalCart = profile?.cart?.length > 0 ? profile.cart : (localData.cart || []);

        // Populate favorites from profile
        if (mounted) {
          setFavoriteProducts(favProducts);
          setFavorites(new Set(favProducts.map((p: Product) => p.id)));
          setCart(finalCart);
        }

        if (!mounted) return;

        setUser({
          id: userId,
          name: profile?.name || authUser.user_metadata?.full_name || email.split('@')[0],
          email: email,
          savedAddresses: finalAddresses,
          orders: finalOrders,
          voucherCode: authUser.user_metadata?.voucher_code,
          voucherUsed: authUser.user_metadata?.voucher_used || false
        });
      } catch (err) {
        console.error('[BrewsLee] Fatal error fetching user data:', err);
      }
    };

    // Safety: if INITIAL_SESSION never fires (e.g. Supabase is down), unlock after 8s
    const safetyTimer = setTimeout(() => {
      if (mounted) setIsLoadingAuth(false);
    }, 8000);

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'INITIAL_SESSION') {
        clearTimeout(safetyTimer);
        if (session?.user) {
          await fetchUserData(session.user);
        }
        if (mounted) setIsLoadingAuth(false);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          await fetchUserData(session.user);
        }
        if (mounted) setIsLoadingAuth(false);
      } else if (event === 'SIGNED_OUT') {
        if (mounted) {
          setUser(null);
          setCart([]);
          setFavorites(new Set());
          setFavoriteProducts([]);
        }
      }
    });

    // Helper to persist data to localStorage
    const saveLocalFallback = (userId: string, key: string, value: any) => {
      try {
        const stored = localStorage.getItem(`brewslee_data_${userId}`);
        const parsed = stored ? JSON.parse(stored) : {};
        parsed[key] = value;
        localStorage.setItem(`brewslee_data_${userId}`, JSON.stringify(parsed));
      } catch (e) {}
    };

    // Make it globally available on window for the context to use later
    (window as any).saveLocalFallback = saveLocalFallback;

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      authListener.subscription.unsubscribe();
    };
  }, []);

  const addToCart = useCallback((product: Product, quantity: number = 1, event?: React.MouseEvent) => {
    // Add flying item animation
    if (event) {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const newFlyingItem: FlyingItem = {
        id: Math.random().toString(36).substr(2, 9),
        imageUrl: product.imageUrl,
        startX: rect.left + rect.width / 2,
        startY: rect.top + rect.height / 2,
      };
      setFlyingItems(prev => [...prev, newFlyingItem]);
    }

    setCart(prev => {
      let nextCart;
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        nextCart = prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        nextCart = [...prev, { id: Math.random().toString(36).substr(2, 9), product, quantity }];
      }
      if (user) {
        supabase.from('profiles').update({ cart: nextCart }).eq('id', user.id).then(({error}) => { if (error) console.error("Error updating cart", error); });
        (window as any).saveLocalFallback?.(user.id, 'cart', nextCart);
      }
      return nextCart;
    });
    
    addToast(`Added ${product.name} to cart`);
  }, [addToast, user]);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => {
      const nextCart = prev.filter(item => item.product.id !== productId);
      if (user) {
        supabase.from('profiles').update({ cart: nextCart }).eq('id', user.id).then(({error}) => { if (error) console.error("Error updating cart", error); });
        (window as any).saveLocalFallback?.(user.id, 'cart', nextCart);
      }
      return nextCart;
    });
  }, [user]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => {
      const nextCart = prev.map(item => item.product.id === productId ? { ...item, quantity } : item);
      if (user) {
        supabase.from('profiles').update({ cart: nextCart }).eq('id', user.id).then(({error}) => { if (error) console.error("Error updating cart", error); });
        (window as any).saveLocalFallback?.(user.id, 'cart', nextCart);
      }
      return nextCart;
    });
  }, [removeFromCart, user]);

  const removeFlyingItem = useCallback((id: string) => {
    setFlyingItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const toggleFavorite = useCallback((product: Product) => {
    if (!user) {
      addToast('Please sign in to save favorites', 'info');
      return;
    }
    const isFav = favorites.has(product.id);
    if (isFav) {
      setFavorites(prev => { const next = new Set(prev); next.delete(product.id); return next; });
      setFavoriteProducts(prev => {
        const nextFavs = prev.filter(fp => fp.id !== product.id);
        if (user) {
          supabase.from('profiles').update({ favorite_products: nextFavs }).eq('id', user.id).then(({error}) => { if (error) console.error("Error updating favorites", error); });
          (window as any).saveLocalFallback?.(user.id, 'favorite_products', nextFavs);
        }
        return nextFavs;
      });
      addToast('Removed from favorites', 'info');
    } else {
      setFavorites(prev => { const next = new Set(prev); next.add(product.id); return next; });
      setFavoriteProducts(prev => {
        const nextFavs = prev.some(fp => fp.id === product.id) ? prev : [...prev, product];
        if (user) {
          supabase.from('profiles').update({ favorite_products: nextFavs }).eq('id', user.id).then(({error}) => { if (error) console.error("Error updating favorites", error); });
          (window as any).saveLocalFallback?.(user.id, 'favorite_products', nextFavs);
        }
        return nextFavs;
      });
      addToast('Added to favorites ♥');
    }
  }, [favorites, addToast, user]);

  const markVoucherUsed = useCallback(async () => {
    if (!user) return;
    try {
      const { error } = await supabase.auth.updateUser({
        data: { voucher_used: true }
      });
      if (error) throw error;
      setUser(prev => prev ? { ...prev, voucherUsed: true } : prev);
    } catch (err: any) {
      console.error('Failed to update voucher status', err);
    }
  }, [user]);

  const login = useCallback((newUser: User) => {
    setUser(newUser);
    // User data is fetched automatically by onAuthStateChange
  }, []);

  const logout = useCallback(async () => {
    // Clear state synchronously before awaiting Supabase to ensure immediate UI update
    setUser(null);
    setCart([]);
    setFavorites(new Set());
    setFavoriteProducts([]);

    await supabase.auth.signOut();
    addToast('Logged out', 'info');
  }, [addToast]);

  const addOrder = useCallback(async (order: Order) => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('orders').insert({
        user_id: user.id,
        total: order.total,
        status: order.status,
        payment_method: order.paymentMethod,
        delivery_type: order.deliveryType,
        items: order.items,
        address: order.address
      }).select().single();
      
      if (error) throw error;
      
      const newOrder: Order = {
        id: data?.id || Math.random().toString(36).substr(2, 9),
        date: new Date(data?.created_at || Date.now()).toLocaleDateString(),
        items: order.items,
        total: Number(order.total),
        status: order.status,
        paymentMethod: order.paymentMethod,
        deliveryType: order.deliveryType,
        address: order.address
      };
      
      setUser(prev => {
        if (!prev) return prev;
        const newOrders = [newOrder, ...prev.orders];
        (window as any).saveLocalFallback?.(user.id, 'orders', newOrders);
        return { ...prev, orders: newOrders };
      });
      setCart([]); // Clear cart after order
      await supabase.from('profiles').update({ cart: [] }).eq('id', user.id);
      (window as any).saveLocalFallback?.(user.id, 'cart', []);
    } catch (err: any) {
      // If error occurs (likely RLS), still add it locally so the user experience doesn't break
      const newOrder: Order = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toLocaleDateString(),
        items: order.items,
        total: Number(order.total),
        status: order.status,
        paymentMethod: order.paymentMethod,
        deliveryType: order.deliveryType,
        address: order.address
      };
      setUser(prev => {
        if (!prev) return prev;
        const newOrders = [newOrder, ...prev.orders];
        (window as any).saveLocalFallback?.(user.id, 'orders', newOrders);
        return { ...prev, orders: newOrders };
      });
      setCart([]);
      (window as any).saveLocalFallback?.(user.id, 'cart', []);
      console.error("Order save fallback triggered due to error:", err.message);
    }
  }, [user, addToast]);

  const removeOrder = useCallback(async (id: string) => {
    if (!user) return;
    try {
      await supabase.from('orders').delete().eq('id', id).eq('user_id', user.id);
      // Ignore error for local fallback
      setUser(prev => {
        if (!prev) return prev;
        const newOrders = prev.orders.filter(o => o.id !== id);
        (window as any).saveLocalFallback?.(user.id, 'orders', newOrders);
        return { ...prev, orders: newOrders };
      });
      addToast('Order cancelled', 'info');
    } catch (err: any) {
      console.error(err);
    }
  }, [user, addToast]);

  const addAddress = useCallback(async (address: Address) => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('addresses').insert({
        user_id: user.id,
        full_name: address.fullName,
        mobile: address.mobile,
        street_address: address.streetAddress,
        barangay: address.barangay,
        city: address.city,
        province: address.province,
        zip_code: address.zipCode
      }).select().single();
      
      if (error) throw error;
      
      const newAddress: Address = {
        id: data?.id || Math.random().toString(36).substr(2, 9),
        fullName: address.fullName,
        mobile: address.mobile,
        streetAddress: address.streetAddress,
        barangay: address.barangay,
        city: address.city,
        province: address.province,
        zipCode: address.zipCode
      };

      setUser(prev => {
        if (!prev) return prev;
        const newAddrs = [...prev.savedAddresses, newAddress];
        (window as any).saveLocalFallback?.(user.id, 'addresses', newAddrs);
        return { ...prev, savedAddresses: newAddrs };
      });
      addToast('Address added');
    } catch (err: any) {
      // Fallback
      const newAddress: Address = {
        id: Math.random().toString(36).substr(2, 9),
        ...address
      };
      setUser(prev => {
        if (!prev) return prev;
        const newAddrs = [...prev.savedAddresses, newAddress];
        (window as any).saveLocalFallback?.(user.id, 'addresses', newAddrs);
        return { ...prev, savedAddresses: newAddrs };
      });
      addToast('Address added (local only)');
      console.error("Address save fallback triggered:", err.message);
    }
  }, [user, addToast]);

  const updateAddress = useCallback(async (id: string, address: Omit<Address, 'id'>) => {
    if (!user) return;
    try {
      await supabase.from('addresses').update({
        full_name: address.fullName,
        mobile: address.mobile,
        street_address: address.streetAddress,
        barangay: address.barangay,
        city: address.city,
        province: address.province,
        zip_code: address.zipCode
      }).eq('id', id).eq('user_id', user.id);
      
      setUser(prev => {
        if (!prev) return prev;
        const newAddrs = prev.savedAddresses.map(a => a.id === id ? { ...address, id } : a);
        (window as any).saveLocalFallback?.(user.id, 'addresses', newAddrs);
        return { ...prev, savedAddresses: newAddrs };
      });
      addToast('Address updated');
    } catch (err: any) {
      console.error(err);
    }
  }, [user, addToast]);

  const removeAddress = useCallback(async (id: string) => {
    if (!user) return;
    try {
      await supabase.from('addresses').delete().eq('id', id).eq('user_id', user.id);
      
      setUser(prev => {
        if (!prev) return prev;
        const newAddrs = prev.savedAddresses.filter(a => a.id !== id);
        (window as any).saveLocalFallback?.(user.id, 'addresses', newAddrs);
        return { ...prev, savedAddresses: newAddrs };
      });
      addToast('Address removed', 'info');
    } catch (err: any) {
      console.error(err);
    }
  }, [user, addToast]);

  const updateProfile = useCallback(async (name: string, email: string) => {
    if (!user) return;
    try {
      // Note: updating email via Supabase auth requires email confirmation flow.
      // We only update name in the profiles table for now.
      const { error } = await supabase.from('profiles').update({ name }).eq('id', user.id);
      if (error) throw error;
      
      setUser(prev => prev ? { ...prev, name } : prev);
      addToast('Profile updated successfully');
    } catch (err: any) {
      addToast(err.message || 'Failed to update profile', 'error');
    }
  }, [user, addToast]);

  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <AppContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      cartTotal,
      cartItemCount,
      isCartOpen,
      setIsCartOpen,
      favorites,
      toggleFavorite,
      favoriteProducts,
      user,
      login,
      logout,
      addOrder,
      removeOrder,
      addAddress,
      updateAddress,
      removeAddress,
      updateProfile,
      flyingItems,
      removeFlyingItem,
      toasts,
      addToast,
      removeToast,
      isLoadingAuth,
      markVoucherUsed
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

