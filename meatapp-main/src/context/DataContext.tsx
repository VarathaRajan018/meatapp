import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Backend URL ────────────────────────────────────────────────────────────
const BACKEND_URL = 'http://10.179.52.215:3001/api';

const isMongoId = (id: string) => /^[a-f\d]{24}$/i.test(id);

// ─── Fallback products ───────────────────────────────────────────────────────
const FALLBACK_PRODUCTS = [
    { id: '201', category: 'Chicken', title: 'Morning Fresh Chicken', description: 'Freshly cut tender chicken, perfect for daily cooking.', price: '₹220/kg', originalPrice: '₹250/kg', image: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&q=80&w=400', cutOptions: ['Curry Cut', 'Boneless', 'Whole'] },
    { id: '202', category: 'Chicken', title: 'Country Chicken (Nattu Kozhi)', description: 'Authentic free-range country chicken with rich flavor.', price: '₹350/kg', originalPrice: '₹400/kg', image: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&q=80&w=400', cutOptions: ['Curry Cut', 'Whole'] },
    { id: '203', category: 'Chicken', title: 'Full Chicken (Whole Bird) 🐔', description: 'One whole fresh chicken, cleaned and dressed.', price: '₹380/bird', originalPrice: '₹420/bird', image: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&q=80&w=400', cutOptions: ['Whole', 'Curry Cut'] },
    { id: '301', category: 'Mutton', title: 'Premium Tender Mutton', description: 'Fresh, farm-raised tender mutton cuts.', price: '₹750/kg', originalPrice: '₹820/kg', image: 'https://images.unsplash.com/photo-1603048297172-c92544798d5e?auto=format&fit=crop&q=80&w=400', cutOptions: ['Curry Cut', 'Biryani Cut', 'Boneless'] },
    { id: '302', category: 'Mutton', title: 'Mutton Chops', description: 'Juicy and succulent mutton chops.', price: '₹800/kg', originalPrice: '₹880/kg', image: 'https://images.unsplash.com/photo-1603048297172-c92544798d5e?auto=format&fit=crop&q=80&w=400', cutOptions: ['Chop Cut'] },
    { id: '303', category: 'Mutton', title: 'Mutton Keema (Minced)', description: 'Finely minced fresh mutton.', price: '₹780/kg', originalPrice: '₹850/kg', image: 'https://images.unsplash.com/photo-1603048297172-c92544798d5e?auto=format&fit=crop&q=80&w=400', cutOptions: ['Minced'] },
    { id: '401', category: 'SubProduct', title: 'Wings', price: '₹200/kg', originalPrice: '₹230/kg', description: 'Fresh chicken wings, great for frying or BBQ.' },
    { id: '402', category: 'SubProduct', title: 'Breast', price: '₹240/kg', originalPrice: '₹270/kg', description: 'Boneless chicken breast, lean and healthy.' },
    { id: '403', category: 'SubProduct', title: 'Nalli', price: '₹850/kg', originalPrice: '₹920/kg', description: 'Mutton bone marrow / Nalli — rich and flavorful.' },
    { id: '404', category: 'SubProduct', title: 'Leg', price: '₹230/kg', originalPrice: '₹260/kg', description: 'Fresh chicken legs, meaty and tender.' },
    { id: '405', category: 'SubProduct', title: 'Brain', price: '₹150/piece', originalPrice: '₹180/piece', description: 'Fresh mutton brain — a delicacy for special dishes.' },
    { id: '406', category: 'SubProduct', title: 'Blood', price: '₹50/pack', originalPrice: '₹60/pack', description: 'Fresh mutton blood for poriyal.' },
    { id: '407', category: 'SubProduct', title: 'Kudal', price: '₹300/kg', originalPrice: '₹350/kg', description: 'Mutton Boti / Intestine cut — popular in South Indian cuisine.' },
    { id: '408', category: 'SubProduct', title: 'Thala Kari', price: '₹500/head', originalPrice: '₹580/head', description: 'Mutton Head meat — rich in taste and nutrition.' },
];

// ─── Types ───────────────────────────────────────────────────────────────────
export interface CartItem {
    id: string;
    title: string;
    price: string;
    cut: string;
    quantity: number;
    cleaning: string[];
}

export interface Order {
    id: string;
    items: CartItem[];
    total: number;
    date: string;
    status: 'Pending' | 'Processing' | 'Delivered' | 'Cancelled' | 'Confirmed' | 'Declined';
    isPreBooking?: boolean;
    advancePaid?: number;
    description?: string;
}

export interface ShopConfig {
    shopStatus: boolean;
    chickenRate: string;
    muttonRate: string;
}

export interface CurrentUser {
    id: string;
    username: string;
    gmail: string;
}

interface DataContextType {
    // Shop
    chickenRate: string;
    muttonRate: string;
    shopStatus: boolean;
    updateConfig: (newConfig: Partial<ShopConfig>) => Promise<boolean>;
    updateChickenRate: (rate: string) => void;
    // Products
    products: any[];
    updateProduct: (id: string, updates: any) => Promise<boolean>;
    addProduct: (product: any) => Promise<boolean>;
    deleteProduct: (id: string) => Promise<boolean>;
    isLoadingProducts: boolean;
    refreshProducts: () => Promise<void>;
    refreshAll: () => Promise<void>;
    // Cart
    cart: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
    // Orders
    orders: Order[];
    placeOrder: (order: Omit<Order, 'id'>) => Promise<boolean>;
    updateOrderStatus: (id: string, status: string, reason?: string) => void;
    formatCurrency: (amount: number | string) => string;
    // Auth
    currentUser: CurrentUser | null;
    setCurrentUser: (user: CurrentUser | null) => void;
    logout: () => Promise<void>;
    BACKEND_URL: string;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const [chickenRate, setChickenRate] = useState('₹220/kg');
    const [muttonRate, setMuttonRate]   = useState('₹750/kg');
    const [shopStatus, setShopStatus]   = useState(true);
    const [cart, setCart]               = useState<CartItem[]>([]);
    const [orders, setOrders]           = useState<Order[]>([]);
    const [products, setProducts]       = useState<any[]>(FALLBACK_PRODUCTS);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [currentUser, _setCurrentUser] = useState<CurrentUser | null>(null);

    // ── Persist user session ───────────────────────────────────────────────
    const setCurrentUser = async (user: CurrentUser | null) => {
        _setCurrentUser(user);
        if (user) {
            await AsyncStorage.setItem('currentUser', JSON.stringify(user));
        } else {
            await AsyncStorage.removeItem('currentUser');
        }
    };

    const logout = async () => {
        _setCurrentUser(null);
        await AsyncStorage.removeItem('currentUser');
        setCart([]);
        setOrders([]);
    };

    // ── On app start: restore session ─────────────────────────────────────
    useEffect(() => {
        const restoreSession = async () => {
            try {
                const stored = await AsyncStorage.getItem('currentUser');
                if (stored) {
                    const parsed = JSON.parse(stored) as CurrentUser;
                    _setCurrentUser(parsed);
                    console.log('✅ Session restored for:', parsed.username);
                }
            } catch (e) {
                console.warn('Could not restore session');
            }
        };
        restoreSession();
        fetchProducts();
        fetchConfig();
    }, []);

    // ─── Products ─────────────────────────────────────────────────────────
    const fetchProducts = async () => {
        try {
            setIsLoadingProducts(true);
            const res = await fetch(`${BACKEND_URL}/products`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                const normalized = data.map((p: any) => ({
                    ...p,
                    id: p._id,
                    oldPrice: p.originalPrice || '',
                }));
                setProducts(normalized);
            }
        } catch (err) {
            console.warn('⚠️ Backend unreachable, using fallback products');
        } finally {
            setIsLoadingProducts(false);
        }
    };

    const fetchConfig = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/config`);
            if (!res.ok) throw new Error('Bad response');
            const data = await res.json();
            if (data.shopStatus !== undefined) setShopStatus(data.shopStatus);
            if (data.chickenRate) setChickenRate(data.chickenRate);
            if (data.muttonRate)  setMuttonRate(data.muttonRate);
        } catch (err) {
            console.warn('⚠️ Could not load config');
        }
    };

    const updateConfig = async (newConfig: Partial<ShopConfig>): Promise<boolean> => {
        if (newConfig.chickenRate) setChickenRate(newConfig.chickenRate);
        if (newConfig.muttonRate)  setMuttonRate(newConfig.muttonRate);
        if (newConfig.shopStatus !== undefined) setShopStatus(newConfig.shopStatus);
        try {
            const res = await fetch(`${BACKEND_URL}/config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newConfig),
            });
            return res.ok;
        } catch {
            return false;
        }
    };

    const updateProduct = async (id: string, updates: any): Promise<boolean> => {
        if (!isMongoId(id)) return false;
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
        try {
            const res = await fetch(`${BACKEND_URL}/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            return res.ok;
        } catch {
            return false;
        }
    };

    const addProduct = async (productData: any): Promise<boolean> => {
        try {
            const res = await fetch(`${BACKEND_URL}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData),
            });
            if (res.ok) {
                const saved = await res.json();
                setProducts(prev => [{ ...saved, id: saved._id, oldPrice: saved.originalPrice || '' }, ...prev]);
                return true;
            }
            return false;
        } catch {
            return false;
        }
    };

    const deleteProduct = async (id: string): Promise<boolean> => {
        if (!isMongoId(id)) return false; // Might be a fallback product
        try {
            setProducts(prev => prev.filter(p => p.id !== id));
            const res = await fetch(`${BACKEND_URL}/products/${id}`, { method: 'DELETE' });
            return res.ok;
        } catch {
            return false;
        }
    };

    // ─── Cart ──────────────────────────────────────────────────────────────
    const addToCart      = (item: CartItem) => setCart(prev => [...prev, item]);
    const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id));
    const clearCart      = () => setCart([]);

    // ─── Orders → save to MongoDB ──────────────────────────────────────────
    const placeOrder = async (order: Omit<Order, 'id'>): Promise<boolean> => {
        const orderPayload = {
            ...order,
            userId:   currentUser?.id   || null,
            userName: currentUser?.username || 'Guest',
        };
        try {
            const res = await fetch(`${BACKEND_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderPayload),
            });
            if (res.ok) {
                const saved = await res.json();
                setOrders(prev => [{ ...saved, id: saved._id } as Order, ...prev]);
                clearCart();
                return true;
            }
            return false;
        } catch {
            // Fallback: save locally
            const localOrder = { ...order, id: Date.now().toString() } as Order;
            setOrders(prev => [localOrder, ...prev]);
            clearCart();
            return true;
        }
    };

    const updateOrderStatus = (id: string, status: string, reason?: string) => {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: status as any, declineReason: reason } : o));
    };

    const updateChickenRate = (rate: string) => setChickenRate(rate);
    const formatCurrency = (amount: number | string) => {
        const value = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.]/g, '')) : amount;
        return isNaN(value) ? '₹0' : `₹${value.toFixed(0)}`;
    };
    const refreshProducts = fetchProducts;
    const refreshAll = async () => { await Promise.all([fetchProducts(), fetchConfig()]); };

    return (
        <DataContext.Provider value={{
            chickenRate, muttonRate, shopStatus,
            updateConfig, updateChickenRate,
            cart, addToCart, removeFromCart, clearCart,
            orders, placeOrder, updateOrderStatus, formatCurrency,
            products, updateProduct, addProduct, deleteProduct,
            isLoadingProducts, refreshProducts, refreshAll,
            currentUser, setCurrentUser, logout,
            BACKEND_URL,
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error('useData must be used within a DataProvider');
    return context;
};
