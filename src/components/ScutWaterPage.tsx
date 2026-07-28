import React, { useState, useEffect } from 'react';
import { 
  Droplets, Search, Filter, Plus, Star, Heart, ShoppingBag, Truck, ShieldCheck, 
  MapPin, CheckCircle2, MessageSquare, ExternalLink, RefreshCw, Sparkles, AlertCircle,
  X, ChevronRight, SlidersHorizontal, ArrowUpRight, Globe, Layers, Zap, Flame, Award,
  Clock, PackageCheck, Send, DollarSign, Wallet, Phone, Mail, Building, Trash2, Edit3, Eye
} from 'lucide-react';
import { 
  collection, doc, onSnapshot, setDoc, addDoc, updateDoc, deleteDoc, 
  query, where, orderBy, serverTimestamp, getDocs 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { User, Language } from '../types';
import { t } from '../lib/translations';
import { saveCartToStore, getCart, CartItem } from '../lib/cart';
import BuyerSellerChatSystem, { ChatContext } from './BuyerSellerChatSystem';

interface ScutWaterPageProps {
  user: User | null;
  language: Language;
  onNavigate: (page: string) => void;
  onAddLog?: (action: string, details: string, type: 'chat' | 'billing' | 'api' | 'security') => void;
}

export interface WaterListing {
  id: string;
  title: string;
  category: string;
  price: number; // USD
  scutPrice: number; // SCUT Tokens
  unit: string; // e.g. "19L Bottle", "per System", "500ml 24-pack"
  description: string;
  images: string[];
  author: string;
  authorId: string;
  authorAvatar?: string;
  purityRating: string; // e.g. "99.99%"
  pHLevel: string; // e.g. "8.5"
  capacity: string; // e.g. "19 Liters", "500 GPD"
  deliveryRadius: string; // e.g. "Same-day Local / Global"
  stock: number;
  rating: number;
  reviewsCount: number;
  certifications: string[];
  acceptedCurrencies: string[];
  isService?: boolean;
  minerals?: string; // e.g. "Calcium, Magnesium, Potassium, Silica"
  tdsPpm?: number; // e.g. 45
  createdAt?: any;
}

export interface WaterVendor {
  id: string;
  businessName: string;
  logo: string;
  banner?: string;
  description: string;
  certifications: string[];
  rating: number;
  reviewsCount: number;
  totalSales: number;
  deliveryZones: string;
  verified: boolean;
  contactPhone: string;
  contactEmail: string;
  address: string;
}

export interface WaterReview {
  id: string;
  listingId: string;
  authorName: string;
  authorAvatar?: string;
  rating: number;
  comment: string;
  createdAt: any;
}

export interface WaterOrder {
  id: string;
  items: CartItem[];
  totalUSD: number;
  totalSCUT: number;
  paymentMethod: string;
  status: 'pending' | 'processing' | 'dispatched' | 'delivered' | 'cancelled';
  vendorId?: string;
  vendorName?: string;
  buyerId: string;
  buyerName: string;
  shippingAddress: string;
  notes?: string;
  createdAt: any;
  trackingNumber?: string;
}

// 14 Core Water Categories
const WATER_CATEGORIES = [
  { id: 'all', name: 'All Water Products', icon: '🌊', desc: 'Complete SCUT Water Catalog' },
  { id: 'bottled_water', name: 'Bottled Water', icon: '🍼', desc: 'Artesian, Mineral, Sparkling & Alkaline' },
  { id: 'water_delivery', name: 'Water Delivery', icon: '🚛', desc: 'Home & Office Bulk Delivery Services' },
  { id: 'water_filters', name: 'Water Filters', icon: '🚰', desc: 'Under-Sink, Countertop & Pitchers' },
  { id: 'purification_systems', name: 'Purification Systems', icon: '⚡', desc: 'Reverse Osmosis & UV Sterilization' },
  { id: 'water_coolers', name: 'Water Coolers', icon: '❄️', desc: 'Hot/Cold Dispensers & Bottom Loaders' },
  { id: 'refill_stations', name: 'Refill Stations', icon: '🏬', desc: 'Automated Kiosks & Eco Refill Hubs' },
  { id: 'smart_water_devices', name: 'Smart Water Devices', icon: '📱', desc: 'IoT Smart Hydration & Leak Detectors' },
  { id: 'rainwater_solutions', name: 'Rainwater Solutions', icon: '🌧️', desc: 'Harvesting Systems & Eco Diverters' },
  { id: 'irrigation', name: 'Irrigation', icon: '🌱', desc: 'Drip Kits & Smart Sprinkler Systems' },
  { id: 'water_storage_tanks', name: 'Water Storage Tanks', icon: '🛢️', desc: 'High-Capacity Poly Tanks & Cisterns' },
  { id: 'plumbing_water_services', name: 'Plumbing & Water Services', icon: '🔧', desc: 'Certified Technicians & Pipe Repair' },
  { id: 'water_quality_testing', name: 'Water Quality Testing', icon: '🧪', desc: 'Purity Test Kits & Digital TDS Meters' },
  { id: 'sustainable_water_solutions', name: 'Sustainable Water Solutions', icon: '♻️', desc: 'Atmospheric Water Generators & Solar' },
  { id: 'emergency_water_supplies', name: 'Emergency Water Supplies', icon: '🚨', desc: 'Rations, Storage Cans & Tablets' },
];

// Rich Seed Data for Initial Booting
const DEFAULT_SEED_LISTINGS: Omit<WaterListing, 'id'>[] = [
  {
    title: 'SCUT Ultra-Pure Artesian Mineral Water 19L Gallon',
    category: 'water_delivery',
    price: 8.50,
    scutPrice: 42,
    unit: '19L Bottle + Delivery',
    description: 'Sourced from deep volcanic artesian aquifers enriched with natural calcium, magnesium, and silica. Delivered direct to your home or office on the SCUT Express Route.',
    images: ['https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80'],
    author: 'AquaPure SCUT Logistics',
    authorId: 'vendor-aquapure',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    purityRating: '99.99%',
    pHLevel: '8.2',
    capacity: '19 Liters',
    deliveryRadius: 'Same-day Citywide Express',
    stock: 250,
    rating: 4.9,
    reviewsCount: 88,
    certifications: ['ISO 22000', 'NSF Certified', 'Microplastic Free'],
    acceptedCurrencies: ['SCUT', 'USD', 'EUR', 'RON', 'USDT'],
    minerals: 'Calcium 32mg/L, Magnesium 18mg/L, Silica 24mg/L',
    tdsPpm: 120
  },
  {
    title: 'SCUT HydroGlow Alkaline 9.5 pH Ionized Box (24x 500ml)',
    category: 'bottled_water',
    price: 24.99,
    scutPrice: 125,
    unit: 'Box of 24 Bottled Packs',
    description: 'High-pH electrolyte water infused with ionic trace minerals for maximal cell hydration and athletic recovery. Packaged in 100% biodegradable ocean-safe bottles.',
    images: ['https://images.unsplash.com/photo-1560023907-5f339617ea30?auto=format&fit=crop&w=800&q=80'],
    author: 'HydraTech BioLabs',
    authorId: 'vendor-hydratech',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    purityRating: '99.95%',
    pHLevel: '9.5',
    capacity: '12 Liters Total',
    deliveryRadius: 'Global Shipping (2-3 Days)',
    stock: 120,
    rating: 4.8,
    reviewsCount: 42,
    certifications: ['FDA Approved', 'BPA Free', 'Electrolyte Enhanced'],
    acceptedCurrencies: ['SCUT', 'USD', 'ETH', 'BTC'],
    minerals: 'Sodium, Potassium, Ionic Minerals',
    tdsPpm: 85
  },
  {
    title: 'SCUT RO-7 Stage Under-Sink Reverse Osmosis System with UV',
    category: 'purification_systems',
    price: 299.00,
    scutPrice: 1495,
    unit: 'Complete System Kit',
    description: '7-stage commercial-grade reverse osmosis filtration unit removing 99.99% of heavy metals, PFAS, microplastics, and viruses with integrated UV-C sterilizer.',
    images: ['https://images.unsplash.com/photo-1585837575652-267c041d77d4?auto=format&fit=crop&w=800&q=80'],
    author: 'PureFlow Engineering',
    authorId: 'vendor-pureflow',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    purityRating: '99.999%',
    pHLevel: '7.5',
    capacity: '100 GPD (Gallons Per Day)',
    deliveryRadius: 'Worldwide Express Freight',
    stock: 35,
    rating: 5.0,
    reviewsCount: 116,
    certifications: ['NSF 58 Standard', 'CE Certified', 'Lead-Free Brass'],
    acceptedCurrencies: ['SCUT', 'USD', 'EUR', 'USDT'],
    minerals: 'Post-alkaline remineralization stage',
    tdsPpm: 15
  },
  {
    title: 'Smart Hydration IoT Dispenser & Cooler (Touchless)',
    category: 'water_coolers',
    price: 189.00,
    scutPrice: 945,
    unit: 'Per Unit',
    description: 'IoT-enabled hot/cold water dispenser with mobile app tracking, instant water temperature customizer, and automatic bottle refill reminder on SCUT Pay.',
    images: ['https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=800&q=80'],
    author: 'PureFlow Engineering',
    authorId: 'vendor-pureflow',
    purityRating: '99.9%',
    pHLevel: '7.0',
    capacity: 'Supports 12L to 20L Bottles',
    deliveryRadius: 'National Express',
    stock: 50,
    rating: 4.7,
    reviewsCount: 39,
    certifications: ['Energy Star', 'UL Listed'],
    acceptedCurrencies: ['SCUT', 'USD', 'EUR', 'RON']
  },
  {
    title: 'SCUT Smart Hydration Water Quality Digital Tester (TDS, pH, EC)',
    category: 'water_quality_testing',
    price: 34.99,
    scutPrice: 175,
    unit: 'Digital Probe Kit',
    description: 'Precision Bluetooth-connected water quality analyzer measuring TDS, pH, conductivity, temperature, and hardness with real-time sync to SCUT Dashboard.',
    images: ['https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80'],
    author: 'AquaPure SCUT Logistics',
    authorId: 'vendor-aquapure',
    purityRating: '±0.01 Accuracy',
    pHLevel: '0-14 Range',
    capacity: 'Unlimited Tests',
    deliveryRadius: 'Global Air Courier',
    stock: 200,
    rating: 4.9,
    reviewsCount: 64,
    certifications: ['ISO 9001', 'CE', 'RoHS'],
    acceptedCurrencies: ['SCUT', 'USD', 'EUR', 'BTC', 'ETH']
  },
  {
    title: 'Atmospheric Water Generator (AWG) - 30L Daily Air-to-Water',
    category: 'sustainable_water_solutions',
    price: 890.00,
    scutPrice: 4450,
    unit: 'Standalone Unit',
    description: 'Generates up to 30 liters of ultrapure drinking water directly from ambient atmospheric humidity. Powered by low-energy inverter technology or solar panels.',
    images: ['https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80'],
    author: 'EcoHydra Innovations',
    authorId: 'vendor-ecohydra',
    purityRating: '100% Purity',
    pHLevel: '7.8',
    capacity: '30 Liters / 24 Hours',
    deliveryRadius: 'Global Freight Delivery',
    stock: 15,
    rating: 4.95,
    reviewsCount: 28,
    certifications: ['Green Tech Certified', 'Zero Plastics'],
    acceptedCurrencies: ['SCUT', 'USD', 'USDT', 'ETH']
  },
  {
    title: 'Rainwater Eco Harvesting Tank 3,000L with First-Flush Filter',
    category: 'water_storage_tanks',
    price: 450.00,
    scutPrice: 2250,
    unit: 'Complete Tank & Diverter Kit',
    description: 'UV-stabilized food-grade poly tank engineered for rainwater collection, emergency backup water storage, and agricultural irrigation with leaf strainer and brass tap.',
    images: ['https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80'],
    author: 'EcoHydra Innovations',
    authorId: 'vendor-ecohydra',
    purityRating: 'Food-Grade Polyethylene',
    pHLevel: 'Rain Natural',
    capacity: '3,000 Liters',
    deliveryRadius: 'Regional Heavy Truck',
    stock: 22,
    rating: 4.8,
    reviewsCount: 19,
    certifications: ['AS/NZS 4766', 'UV20 Grade'],
    acceptedCurrencies: ['SCUT', 'USD', 'EUR', 'RON']
  },
  {
    title: 'Professional Home Water Pipe & Filtration Plumbing Service',
    category: 'plumbing_water_services',
    price: 75.00,
    scutPrice: 375,
    unit: 'Per On-Site Service Visit',
    description: 'Certified SCUT master plumbing service for water filter installation, pipe leak detection, water pressure balancing, and system sanitation.',
    images: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80'],
    author: 'Master Plumb SCUT Certified',
    authorId: 'vendor-plumbmaster',
    isService: true,
    purityRating: '100% Workmanship Warranty',
    pHLevel: 'N/A',
    capacity: 'On-Demand Dispatch',
    deliveryRadius: '50km Local Radius',
    stock: 99,
    rating: 4.9,
    reviewsCount: 57,
    certifications: ['Licensed Master Plumber', 'Insured'],
    acceptedCurrencies: ['SCUT', 'USD', 'EUR', 'RON']
  }
];

export default function ScutWaterPage({ user, language, onNavigate, onAddLog }: ScutWaterPageProps) {
  const trText = (key: string, fallback: string) => t(language, key, fallback);

  // Core state
  const [activeTab, setActiveTab] = useState<'marketplace' | 'vendors' | 'orders' | 'favorites' | 'studio'>('marketplace');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [listings, setListings] = useState<WaterListing[]>([]);
  const [vendors, setVendors] = useState<WaterVendor[]>([]);
  const [orders, setOrders] = useState<WaterOrder[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>(getCart());
  const [isLoading, setIsLoading] = useState(true);

  // Filter & sorting states
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'purity' | 'rating'>('featured');
  const [priceMax, setPriceMax] = useState<number>(1000);

  // Modals & Selected items
  const [selectedListing, setSelectedListing] = useState<WaterListing | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<WaterVendor | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // Chat Context state
  const [chatContext, setChatContext] = useState<ChatContext | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Review & Rating form state
  const [reviews, setReviews] = useState<WaterReview[]>([]);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Checkout state
  const [selectedCurrency, setSelectedCurrency] = useState<'SCUT' | 'USD' | 'EUR' | 'RON' | 'USDT'>('SCUT');
  const [shippingAddress, setShippingAddress] = useState((user as any)?.location || 'Aleea Ghilmeceanu, Bucharest, Romania');
  const [deliveryNotes, setDeliveryNotes] = useState('Please place gallon bottles at front porch');
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [checkoutSuccessOrder, setCheckoutSuccessOrder] = useState<WaterOrder | null>(null);

  // Create Listing / Business Studio form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('bottled_water');
  const [newPrice, setNewPrice] = useState('');
  const [newUnit, setNewUnit] = useState('19L Bottle');
  const [newDescription, setNewDescription] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newPurity, setNewPurity] = useState('99.99%');
  const [newPH, setNewPH] = useState('8.0');
  const [newCapacity, setNewCapacity] = useState('19 Liters');
  const [newDeliveryRadius, setNewDeliveryRadius] = useState('Citywide Express');
  const [newStock, setNewStock] = useState('100');
  const [newMinerals, setNewMinerals] = useState('Calcium, Magnesium');
  const [isSubmittingListing, setIsSubmittingListing] = useState(false);

  // Sync cart from window event listener
  useEffect(() => {
    const handleCartChange = () => {
      setCart(getCart());
    };
    window.addEventListener('scut_cart_changed', handleCartChange);
    return () => window.removeEventListener('scut_cart_changed', handleCartChange);
  }, []);

  // 1. Fetch & Seed Listings in Firestore
  useEffect(() => {
    setIsLoading(true);
    const q = query(collection(db, 'scut_water_listings'));
    
    const unsub = onSnapshot(q, async (snap) => {
      if (snap.empty) {
        // Auto-seed initial listings if collection is empty
        try {
          for (const item of DEFAULT_SEED_LISTINGS) {
            await addDoc(collection(db, 'scut_water_listings'), {
              ...item,
              createdAt: serverTimestamp()
            });
          }
        } catch (err) {
          console.error("Error seeding SCUT Water listings:", err);
        }
      } else {
        const fetched: WaterListing[] = [];
        snap.forEach((docSnap) => {
          fetched.push({ id: docSnap.id, ...docSnap.data() } as WaterListing);
        });
        setListings(fetched);
      }
      setIsLoading(false);
    }, (err) => {
      console.warn("Firestore SCUT Water onSnapshot notice:", err);
      // Fallback local memory listings
      setListings(DEFAULT_SEED_LISTINGS.map((item, idx) => ({ id: `seed-${idx}`, ...item } as WaterListing)));
      setIsLoading(false);
    });

    return () => unsub();
  }, []);

  // 2. Fetch Vendors from Firestore
  useEffect(() => {
    const q = query(collection(db, 'scut_water_vendors'));
    const unsub = onSnapshot(q, (snap) => {
      const list: WaterVendor[] = [];
      snap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as WaterVendor);
      });
      // Fallback default vendors if empty
      if (list.length === 0) {
        setVendors([
          {
            id: 'vendor-aquapure',
            businessName: 'AquaPure SCUT Logistics',
            logo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
            description: 'Premier certified provider of volcanic artesian mineral water and automated 24/7 delivery across SCUT networks.',
            certifications: ['ISO 22000', 'NSF Certified', 'SCUT Certified Vendor'],
            rating: 4.9,
            reviewsCount: 142,
            totalSales: 1250,
            deliveryZones: 'Citywide & Suburban Express',
            verified: true,
            contactPhone: '+40 722 123 456',
            contactEmail: 'orders@aquapure-scut.io',
            address: 'Hydration Way 42, Bucharest, Romania'
          },
          {
            id: 'vendor-pureflow',
            businessName: 'PureFlow Engineering',
            logo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
            description: 'Specialists in commercial and residential 7-stage reverse osmosis filtration systems and smart water coolers.',
            certifications: ['NSF 58', 'UL Listed', 'Water Quality Assoc.'],
            rating: 5.0,
            reviewsCount: 98,
            totalSales: 840,
            deliveryZones: 'Global Air Courier & Regional Freight',
            verified: true,
            contactPhone: '+1 (800) 555-FLOW',
            contactEmail: 'support@pureflow-water.com',
            address: 'Industrial Water Park B3, Munich, Germany'
          }
        ]);
      } else {
        setVendors(list);
      }
    });

    return () => unsub();
  }, []);

  // 3. Fetch Orders for Current User
  useEffect(() => {
    const currentUserId = auth.currentUser?.uid || (user as any)?.id || 'guest-user';
    const q = query(
      collection(db, 'scut_water_orders'),
      where('buyerId', '==', currentUserId)
    );
    const unsub = onSnapshot(q, (snap) => {
      const orderList: WaterOrder[] = [];
      snap.forEach((docSnap) => {
        orderList.push({ id: docSnap.id, ...docSnap.data() } as WaterOrder);
      });
      // Sort newest first
      orderList.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setOrders(orderList);
    });

    return () => unsub();
  }, [user]);

  // 4. Fetch Reviews for Selected Listing
  useEffect(() => {
    if (!selectedListing) {
      setReviews([]);
      return;
    }
    const q = query(
      collection(db, 'scut_water_reviews'),
      where('listingId', '==', selectedListing.id)
    );
    const unsub = onSnapshot(q, (snap) => {
      const list: WaterReview[] = [];
      snap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as WaterReview);
      });
      setReviews(list);
    });

    return () => unsub();
  }, [selectedListing]);

  // Favorite toggle logic
  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  // Add to cart helper
  const handleAddToCart = (item: WaterListing) => {
    const existing = cart.find(c => c.id === item.id);
    let updatedCart: CartItem[];
    if (existing) {
      updatedCart = cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
    } else {
      const newItem: CartItem = {
        id: item.id,
        title: item.title,
        price: `$${item.price.toFixed(2)}`,
        author: item.author,
        authorId: item.authorId,
        category: item.category,
        images: item.images,
        quantity: 1,
        details: `${item.capacity} | ${item.purityRating} Purity`
      };
      updatedCart = [...cart, newItem];
    }
    setCart(updatedCart);
    saveCartToStore(updatedCart);
  };

  // Calculate cart totals
  const cartTotalUSD = cart.reduce((acc, item) => {
    const numericPrice = parseFloat(item.price.replace('$', '')) || 0;
    return acc + (numericPrice * item.quantity);
  }, 0);

  const cartTotalSCUT = Math.round(cartTotalUSD * 5); // 1 USD = 5 SCUT Tokens

  // Launch Chat with Seller / Vendor
  const openChatWithVendor = (vendorId: string, vendorName: string, productTitle?: string, orderId?: string) => {
    const ctx: ChatContext = {
      type: orderId ? 'order' : 'product',
      productId: selectedListing?.id,
      productTitle: productTitle || selectedListing?.title || 'Water Product Consultation',
      productPrice: selectedListing ? `$${selectedListing.price.toFixed(2)}` : undefined,
      orderId: orderId,
      sellerId: vendorId,
      sellerName: vendorName
    };
    setChatContext(ctx);
    setIsChatOpen(true);
  };

  // Handle Checkout submission with SCUT Pay
  const handleExecuteCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessingCheckout(true);

    const buyerId = auth.currentUser?.uid || (user as any)?.id || 'guest-water-buyer';
    const buyerName = user?.name || 'SCUT Water Customer';

    const newOrder: Omit<WaterOrder, 'id'> = {
      items: cart,
      totalUSD: cartTotalUSD,
      totalSCUT: cartTotalSCUT,
      paymentMethod: selectedCurrency === 'SCUT' ? 'SCUT Token (5% Discount Applied)' : `${selectedCurrency} Gateway`,
      status: 'pending',
      buyerId,
      buyerName,
      vendorName: cart[0]?.author || 'AquaPure SCUT Vendor',
      vendorId: cart[0]?.authorId || 'vendor-aquapure',
      shippingAddress,
      notes: deliveryNotes,
      createdAt: serverTimestamp(),
      trackingNumber: `WAT-${Math.floor(100000 + Math.random() * 900000)}`
    };

    try {
      const docRef = await addDoc(collection(db, 'scut_water_orders'), newOrder);
      const createdOrder: WaterOrder = { id: docRef.id, ...newOrder, createdAt: new Date() };
      
      setCheckoutSuccessOrder(createdOrder);
      // Clear cart
      setCart([]);
      saveCartToStore([]);
      setIsProcessingCheckout(false);

      if (onAddLog) {
        onAddLog('SCUT Pay Water Purchase', `Order #${createdOrder.trackingNumber} placed for $${cartTotalUSD.toFixed(2)}`, 'billing');
      }
    } catch (err) {
      console.error("Error creating SCUT Water order:", err);
      // Local fallback for offline mode
      const fallbackOrder: WaterOrder = { id: `ord-${Date.now()}`, ...newOrder, createdAt: new Date() };
      setOrders(prev => [fallbackOrder, ...prev]);
      setCheckoutSuccessOrder(fallbackOrder);
      setCart([]);
      saveCartToStore([]);
      setIsProcessingCheckout(false);
    }
  };

  // Submit Review
  const handleSubmitReview = async () => {
    if (!selectedListing || !newReviewComment.trim()) return;
    setIsSubmittingReview(true);

    const reviewObj: Omit<WaterReview, 'id'> = {
      listingId: selectedListing.id,
      authorName: user?.name || 'Certified Hydrator',
      authorAvatar: (user as any)?.avatar || (user as any)?.photoURL,
      rating: newReviewRating,
      comment: newReviewComment.trim(),
      createdAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, 'scut_water_reviews'), reviewObj);
      setNewReviewComment('');
      setIsReviewOpen(false);
      setIsSubmittingReview(false);
    } catch (err) {
      console.error("Error posting water review:", err);
      setReviews(prev => [{ id: `rev-${Date.now()}`, ...reviewObj, createdAt: new Date() }, ...prev]);
      setNewReviewComment('');
      setIsReviewOpen(false);
      setIsSubmittingReview(false);
    }
  };

  // Create Water Listing / Service in Business Studio
  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPrice) return;

    setIsSubmittingListing(true);
    const priceNum = parseFloat(newPrice) || 10;

    const listingData: Omit<WaterListing, 'id'> = {
      title: newTitle.trim(),
      category: newCategory,
      price: priceNum,
      scutPrice: Math.round(priceNum * 5),
      unit: newUnit || 'Unit',
      description: newDescription || 'Premium certified water product or service provided via SCUT Water Ecosystem.',
      images: [newImageUrl.trim() || 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80'],
      author: user?.name || 'Registered Water Business',
      authorId: auth.currentUser?.uid || (user as any)?.id || 'vendor-user',
      purityRating: newPurity || '99.99%',
      pHLevel: newPH || '8.0',
      capacity: newCapacity || '19L',
      deliveryRadius: newDeliveryRadius || 'Citywide Express',
      stock: parseInt(newStock) || 50,
      rating: 5.0,
      reviewsCount: 1,
      certifications: ['SCUT Verified Water', 'Quality Lab Tested'],
      acceptedCurrencies: ['SCUT', 'USD', 'EUR', 'RON'],
      minerals: newMinerals,
      createdAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, 'scut_water_listings'), listingData);
      setIsCreateOpen(false);
      setIsSubmittingListing(false);
      // Reset form
      setNewTitle('');
      setNewPrice('');
      setNewDescription('');
      setNewImageUrl('');
    } catch (err) {
      console.error("Error creating water listing:", err);
      setIsSubmittingListing(false);
    }
  };

  // Filtering listings
  const filteredListings = listings.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = item.price <= priceMax;
    return matchesCategory && matchesSearch && matchesPrice;
  }).sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'purity') return parseFloat(b.purityRating) - parseFloat(a.purityRating);
    return 0;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-20 pb-24 px-4 sm:px-6 lg:px-8 selection:bg-cyan-500 selection:text-black">
      
      {/* 1. HERO & HYDRATION HEADER */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="relative rounded-3xl overflow-hidden border border-cyan-500/20 bg-gradient-to-br from-slate-900 via-cyan-950/40 to-slate-950 p-6 sm:p-10 shadow-2xl">
          {/* Background Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider">
                <Droplets className="h-4 w-4 animate-bounce text-cyan-400" />
                SCUT Water Ecosystem Hub
              </div>
              
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-none">
                Pure Hydration. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
                  Global Water Marketplace.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
                Discover certified artesians, bulk home & office deliveries, advanced 7-stage RO purifiers, IoT smart hydration bottles, atmospheric generators, and plumbing services — powered instantly by <strong className="text-cyan-300">SCUT Pay</strong>.
              </p>

              {/* Quick Specs Bar */}
              <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white">99.99% Purity</div>
                    <div className="text-[10px] text-slate-400">Lab Certified</div>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
                  <Truck className="h-4 w-4 text-cyan-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white">Express Delivery</div>
                    <div className="text-[10px] text-slate-400">Same-Day Route</div>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white">SCUT Pay 5% Off</div>
                    <div className="text-[10px] text-slate-400">Instant Tokens</div>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-indigo-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white">Direct Chat</div>
                    <div className="text-[10px] text-slate-400">Buyer & Seller</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions & Cart Widget */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto shrink-0">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative px-6 py-3.5 rounded-2xl bg-cyan-500 text-slate-950 font-display font-bold hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <ShoppingBag className="h-5 w-5" />
                <span>SCUT Water Cart ({cart.length})</span>
                {cart.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-slate-950 text-cyan-400 text-xs font-mono">
                    ${cartTotalUSD.toFixed(2)}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-850 text-cyan-400 border border-cyan-500/30 transition-all flex items-center justify-center gap-2 text-sm font-semibold cursor-pointer"
              >
                <Plus className="h-5 w-5" />
                <span>List Water Product / Service</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION TABS */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto scrollbar-none text-xs sm:text-sm font-medium">
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'marketplace'
                ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Droplets className="h-4 w-4" />
            <span>Water Marketplace</span>
          </button>

          <button
            onClick={() => setActiveTab('vendors')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'vendors'
                ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Building className="h-4 w-4" />
            <span>Water Vendors & Suppliers ({vendors.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <PackageCheck className="h-4 w-4" />
            <span>My Water Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'favorites'
                ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Heart className="h-4 w-4 text-rose-400" />
            <span>Saved Favorites ({favorites.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('studio')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'studio'
                ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Award className="h-4 w-4 text-amber-400" />
            <span>Vendor Business Studio</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT: MARKETPLACE */}
      {activeTab === 'marketplace' && (
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* SEARCH & FILTERS BAR */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search artesian water, RO filters, coolers, Smart IoT, pH..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="md:col-span-4 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-slate-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="featured">Featured Water Products</option>
                <option value="rating">Highest Customer Rating</option>
                <option value="purity">Highest Purity Rating (%)</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            {/* Price Range Slider */}
            <div className="md:col-span-3 flex flex-col justify-center px-2">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Max Price:</span>
                <span className="font-mono text-cyan-400 font-bold">${priceMax}</span>
              </div>
              <input
                type="range"
                min="5"
                max="1000"
                step="5"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* 14 CATEGORY PILLS GRID */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-cyan-400" />
              Select Category ({WATER_CATEGORIES.length})
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2">
              {WATER_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-lg mb-1">{cat.icon}</div>
                    <div className="font-semibold text-[11px] truncate leading-tight">{cat.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* LISTINGS GRID */}
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Loading SCUT Water Ecosystem listings...</p>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="py-16 text-center bg-slate-900/30 rounded-3xl border border-slate-850 p-8 space-y-4">
              <Droplets className="h-12 w-12 text-cyan-500/40 mx-auto" />
              <h3 className="text-base font-bold text-slate-300">No Water Listings Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No items match your selected filter or search term. Try resetting your search or price limit.
              </p>
              <button
                onClick={() => { setSelectedCategory('all'); setSearchQuery(''); setPriceMax(1000); }}
                className="px-4 py-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold hover:bg-cyan-500/20 transition-all cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredListings.map((listing) => {
                const isFav = favorites.includes(listing.id);
                return (
                  <div
                    key={listing.id}
                    className="group bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden hover:border-cyan-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/5 flex flex-col justify-between relative"
                  >
                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(listing.id)}
                      className="absolute top-3 right-3 z-10 p-2 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/50 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                    >
                      <Heart className={`h-4 w-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>

                    {/* Image & Badge Header */}
                    <div 
                      onClick={() => setSelectedListing(listing)}
                      className="relative h-48 overflow-hidden bg-slate-950 cursor-pointer"
                    >
                      <img
                        src={listing.images[0] || 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80'}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                      {/* Top Left Purity Badge */}
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-cyan-500/90 text-slate-950 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                        <Droplets className="h-3 w-3" />
                        <span>{listing.purityRating} Purity</span>
                      </div>

                      {/* Bottom Image Spec Overlay */}
                      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] text-cyan-300 font-mono">
                        <span>pH {listing.pHLevel}</span>
                        <span>{listing.capacity}</span>
                      </div>
                    </div>

                    {/* Body Content */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-mono text-cyan-400/90 font-semibold uppercase tracking-wider">
                          {listing.author}
                        </div>
                        <h3 
                          onClick={() => setSelectedListing(listing)}
                          className="font-display text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 cursor-pointer leading-snug"
                        >
                          {listing.title}
                        </h3>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {listing.description}
                        </p>
                      </div>

                      {/* Minerals & Certs */}
                      {listing.certifications && listing.certifications.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {listing.certifications.slice(0, 2).map((cert, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[9px] font-mono border border-slate-750">
                              ✓ {cert}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Pricing & Cart Action */}
                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                        <div>
                          <div className="font-display font-extrabold text-base text-white">
                            ${listing.price.toFixed(2)}
                          </div>
                          <div className="text-[10px] font-mono text-cyan-400">
                            or {listing.scutPrice} SCUT
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openChatWithVendor(listing.authorId, listing.author, listing.title)}
                            title="Chat with Water Supplier"
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleAddToCart(listing)}
                            className="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                          >
                            <ShoppingBag className="h-3.5 w-3.5" />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: VENDORS */}
      {activeTab === 'vendors' && (
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Certified SCUT Water Suppliers</h2>
              <p className="text-xs text-slate-400">Verified bottling plants, delivery logistics, and certified plumbing master partners.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vendors.map((v) => (
              <div key={v.id} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 hover:border-cyan-500/40 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={v.logo} alt={v.businessName} className="h-14 w-14 rounded-2xl object-cover border border-cyan-500/30" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-base text-white">{v.businessName}</h3>
                        {v.verified && <CheckCircle2 className="h-4 w-4 text-cyan-400" />}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1 text-amber-400 font-bold">
                          <Star className="h-3.5 w-3.5 fill-amber-400" />
                          {v.rating} ({v.reviewsCount} reviews)
                        </span>
                        <span>•</span>
                        <span>{v.totalSales}+ Orders Fulfilled</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => openChatWithVendor(v.id, v.businessName)}
                    className="px-3.5 py-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Contact Supplier</span>
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {v.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-850">
                  <div>
                    <span className="text-slate-500 block">Delivery Zone:</span>
                    <span className="text-slate-200 font-semibold">{v.deliveryZones}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Contact Line:</span>
                    <span className="text-cyan-400 font-semibold">{v.contactPhone}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {v.certifications.map((cert, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[10px] font-mono">
                      ✓ {cert}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: MY WATER ORDERS & TRACKING */}
      {activeTab === 'orders' && (
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Water Orders & Delivery Tracking</h2>
              <p className="text-xs text-slate-400">Track gallon refills, purification system dispatches, and on-site service appointments.</p>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="py-16 text-center bg-slate-900/40 rounded-3xl border border-slate-800 p-8 space-y-3">
              <PackageCheck className="h-10 w-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-300">No Water Orders Found</h3>
              <p className="text-xs text-slate-500">You have not placed any water orders yet. Explore the marketplace to order gallon delivery or purification tech!</p>
              <button
                onClick={() => setActiveTab('marketplace')}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs inline-block cursor-pointer"
              >
                Browse Water Products
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => (
                <div key={ord.id} className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-cyan-400 font-bold">
                          Tracking #{ord.trackingNumber || ord.id}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 text-[10px] font-mono uppercase font-bold border border-cyan-500/20">
                          {ord.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Supplier: <strong className="text-slate-200">{ord.vendorName || 'SCUT Water Vendor'}</strong> • Paid via {ord.paymentMethod}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-display font-extrabold text-base text-white">
                          ${ord.totalUSD?.toFixed(2)}
                        </div>
                        <div className="text-[10px] font-mono text-cyan-400">
                          {ord.totalSCUT} SCUT
                        </div>
                      </div>

                      <button
                        onClick={() => openChatWithVendor(ord.vendorId || 'vendor-aquapure', ord.vendorName || 'Water Vendor', undefined, ord.id)}
                        className="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Chat Vendor</span>
                      </button>
                    </div>
                  </div>

                  {/* Delivery Timeline Progress */}
                  <div className="py-2">
                    <div className="text-[10px] font-mono text-slate-400 mb-2">DELIVERY TIMELINE:</div>
                    <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono">
                      <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
                        ✓ Order Received
                      </div>
                      <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
                        ✓ Quality Inspection
                      </div>
                      <div className="p-2 rounded-lg bg-slate-800 text-slate-400 border border-slate-700">
                        Dispatching
                      </div>
                      <div className="p-2 rounded-lg bg-slate-800 text-slate-400 border border-slate-700">
                        Delivered
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-1.5 text-xs">
                    {ord.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-slate-300 p-2 rounded-lg bg-slate-950/50">
                        <span>{item.title} x {item.quantity}</span>
                        <span className="font-mono text-cyan-400">{item.price}</span>
                      </div>
                    ))}
                  </div>

                  <div className="text-[11px] text-slate-400">
                    <strong>Shipping Address:</strong> {ord.shippingAddress}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: FAVORITES */}
      {activeTab === 'favorites' && (
        <div className="max-w-7xl mx-auto space-y-6">
          <h2 className="text-xl font-bold text-white">Saved Water Products & Services</h2>
          
          {favorites.length === 0 ? (
            <div className="py-16 text-center bg-slate-900/40 rounded-3xl border border-slate-800 p-8 space-y-3">
              <Heart className="h-10 w-10 text-rose-500/40 mx-auto" />
              <h3 className="text-sm font-bold text-slate-300">No Saved Favorites Yet</h3>
              <p className="text-xs text-slate-500">Click the heart icon on any water listing to save it here for quick re-ordering!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.filter(l => favorites.includes(l.id)).map(listing => (
                <div key={listing.id} className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                  <img src={listing.images[0]} alt={listing.title} className="w-full h-36 object-cover rounded-xl" />
                  <h3 className="font-bold text-sm text-white">{listing.title}</h3>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <span className="font-bold text-cyan-400">${listing.price.toFixed(2)}</span>
                    <button
                      onClick={() => handleAddToCart(listing)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 text-xs font-bold"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: VENDOR BUSINESS STUDIO */}
      {activeTab === 'studio' && (
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6">
            <div className="space-y-2">
              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-mono uppercase font-bold border border-amber-500/20">
                SCUT Water Supplier Portal
              </span>
              <h2 className="text-2xl font-bold text-white">Water Business Studio</h2>
              <p className="text-xs text-slate-300 max-w-2xl">
                Are you a water bottling plant, artesian spring owner, purification technician, or plumbing company? Expand your distribution on the SCUT Protocol.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-400">Total Active Listings</div>
                <div className="text-2xl font-bold text-cyan-400 font-mono mt-1">{listings.length}</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-400">Ecosystem Orders Fulfilled</div>
                <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">1,240+</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-400">SCUT Pay Instant Settlement</div>
                <div className="text-2xl font-bold text-amber-400 font-mono mt-1">0.00% Fees</div>
              </div>
            </div>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-6 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              <Plus className="h-5 w-5" />
              <span>Create New Water Product or Service Listing</span>
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL 1: PRODUCT DETAIL MODAL --- */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 my-8">
            <button
              onClick={() => setSelectedListing(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white cursor-pointer z-10"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <img
                  src={selectedListing.images[0]}
                  alt={selectedListing.title}
                  className="w-full h-64 object-cover rounded-2xl border border-slate-800"
                />
                
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
                  <div className="font-bold text-cyan-400">Hydration Specifications</div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 font-mono">
                    <div>Purity: <strong className="text-white">{selectedListing.purityRating}</strong></div>
                    <div>pH Level: <strong className="text-white">{selectedListing.pHLevel}</strong></div>
                    <div>Capacity: <strong className="text-white">{selectedListing.capacity}</strong></div>
                    <div>Radius: <strong className="text-white">{selectedListing.deliveryRadius}</strong></div>
                  </div>
                  {selectedListing.minerals && (
                    <div className="text-[10px] text-slate-400 border-t border-slate-850 pt-1.5">
                      <strong>Minerals:</strong> {selectedListing.minerals}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="text-xs text-cyan-400 font-mono uppercase font-semibold">
                    {selectedListing.author}
                  </div>
                  <h2 className="text-xl font-bold text-white leading-snug">
                    {selectedListing.title}
                  </h2>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedListing.description}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-xs text-slate-400">Price per unit ({selectedListing.unit}):</div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-extrabold text-white font-display">${selectedListing.price.toFixed(2)}</span>
                    <span className="text-sm font-mono text-cyan-400">or {selectedListing.scutPrice} SCUT</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    <span>Pay with SCUT Token for instant 5% cashback</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      handleAddToCart(selectedListing);
                      setSelectedListing(null);
                      setIsCartOpen(true);
                    }}
                    className="flex-1 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-cyan-500/20"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>Buy with SCUT Pay</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedListing(null);
                      openChatWithVendor(selectedListing.authorId, selectedListing.author, selectedListing.title);
                    }}
                    className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Chat Vendor</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Customer Reviews Section */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white">Customer Reviews ({reviews.length})</h3>
                <button
                  onClick={() => setIsReviewOpen(!isReviewOpen)}
                  className="text-xs text-cyan-400 hover:underline cursor-pointer font-semibold"
                >
                  + Write a Review
                </button>
              </div>

              {/* Review Input Box */}
              {isReviewOpen && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Rating:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        onClick={() => setNewReviewRating(star)}
                        className={`h-4 w-4 cursor-pointer ${star <= newReviewRating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
                      />
                    ))}
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Share your feedback regarding purity, taste, delivery speed, or installation quality..."
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />

                  <button
                    onClick={handleSubmitReview}
                    disabled={isSubmittingReview || !newReviewComment.trim()}
                    className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmittingReview ? 'Submitting...' : 'Post Review'}
                  </button>
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {reviews.length === 0 ? (
                  <p className="text-xs text-slate-500">No reviews yet for this listing. Be the first to review!</p>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-850 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{rev.authorName}</span>
                        <div className="flex items-center gap-0.5 text-amber-400">
                          <Star className="h-3 w-3 fill-amber-400" />
                          <span className="font-mono text-[10px]">{rev.rating}.0</span>
                        </div>
                      </div>
                      <p className="text-slate-400 text-[11px]">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: SHOPPING CART DRAWER --- */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 flex flex-col justify-between shadow-2xl">
            <div className="space-y-6 flex-1 overflow-y-auto pr-1">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-cyan-400" />
                  <h2 className="font-bold text-lg text-white">SCUT Water Cart</h2>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <Droplets className="h-10 w-10 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">Your water cart is empty.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                      <div className="space-y-0.5 flex-1">
                        <h4 className="font-bold text-xs text-white line-clamp-1">{item.title}</h4>
                        <div className="text-[10px] text-cyan-400 font-mono">{item.price} each</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const updated = cart.map(c => c.id === item.id ? { ...c, quantity: Math.max(1, c.quantity - 1) } : c);
                            setCart(updated);
                            saveCartToStore(updated);
                          }}
                          className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center font-bold hover:bg-slate-700 cursor-pointer text-xs"
                        >
                          -
                        </button>
                        <span className="font-mono text-xs font-bold text-white">{item.quantity}</span>
                        <button
                          onClick={() => {
                            const updated = cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
                            setCart(updated);
                            saveCartToStore(updated);
                          }}
                          className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center font-bold hover:bg-slate-700 cursor-pointer text-xs"
                        >
                          +
                        </button>
                        <button
                          onClick={() => {
                            const updated = cart.filter(c => c.id !== item.id);
                            setCart(updated);
                            saveCartToStore(updated);
                          }}
                          className="text-slate-500 hover:text-rose-400 ml-1 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <div className="space-y-1 font-mono text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span>Subtotal USD:</span>
                    <span className="font-bold text-white">${cartTotalUSD.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-cyan-400">
                    <span>SCUT Token Option:</span>
                    <span className="font-bold">{cartTotalSCUT} SCUT</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 text-[10px]">
                    <span>SCUT Pay Discount:</span>
                    <span>-5% Applied</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
                >
                  <Zap className="h-4 w-4" />
                  <span>Proceed to SCUT Pay Checkout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL 3: SCUT PAY CHECKOUT MODAL --- */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 my-8 shadow-2xl">
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {checkoutSuccessOrder ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-10 w-10 animate-bounce" />
                </div>
                <h2 className="text-2xl font-bold text-white">Payment Authorized!</h2>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Your order <strong>#{checkoutSuccessOrder.trackingNumber}</strong> has been transmitted via SCUT Pay. The water supplier is preparing your delivery route.
                </p>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 text-xs font-mono text-cyan-400 space-y-1">
                  <div>Status: Confirmed</div>
                  <div>Delivery Address: {checkoutSuccessOrder.shippingAddress}</div>
                </div>

                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setCheckoutSuccessOrder(null);
                      setIsCheckoutOpen(false);
                      setActiveTab('orders');
                    }}
                    className="px-6 py-3 rounded-2xl bg-cyan-500 text-slate-950 font-bold text-xs cursor-pointer"
                  >
                    Track Water Order
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-mono font-bold uppercase">
                    <ShieldCheck className="h-3.5 w-3.5" /> Secure SCUT Pay Gateway
                  </div>
                  <h2 className="text-xl font-bold text-white">Water Order Checkout</h2>
                </div>

                {/* Select Currency */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-semibold">Select Payment Asset:</label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {(['SCUT', 'USD', 'EUR', 'RON', 'USDT'] as const).map((curr) => (
                      <button
                        key={curr}
                        onClick={() => setSelectedCurrency(curr)}
                        className={`p-2.5 rounded-xl border text-center text-xs font-mono font-bold transition-all cursor-pointer ${
                          selectedCurrency === curr
                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {curr}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-semibold">Delivery Address:</label>
                  <input
                    type="text"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Delivery Notes */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-semibold">Instructions for Route Driver:</label>
                  <input
                    type="text"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Summary */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Total USD Amount:</span>
                    <span className="font-bold text-white">${cartTotalUSD.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-cyan-400">
                    <span>Payable in SCUT Tokens:</span>
                    <span className="font-bold">{cartTotalSCUT} SCUT</span>
                  </div>
                </div>

                <button
                  onClick={handleExecuteCheckout}
                  disabled={isProcessingCheckout}
                  className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                >
                  <Zap className="h-4 w-4" />
                  <span>{isProcessingCheckout ? 'Authorizing SCUT Pay...' : `Confirm & Pay with ${selectedCurrency}`}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL 4: CREATE LISTING / BUSINESS STUDIO MODAL --- */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 my-8 shadow-2xl">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-mono font-bold uppercase">
                SCUT Water Vendor Registration
              </span>
              <h2 className="text-xl font-bold text-white">Publish Water Listing / Service</h2>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Title:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SCUT Glacial Pure Artesian Water 19L"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Category:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    {WATER_CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Price (USD):</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="8.50"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Unit Type:</label>
                  <input
                    type="text"
                    placeholder="19L Bottle, 24-pack, Kit"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Available Stock:</label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Purity Rating (%):</label>
                  <input
                    type="text"
                    value={newPurity}
                    onChange={(e) => setNewPurity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">pH Level:</label>
                  <input
                    type="text"
                    value={newPH}
                    onChange={(e) => setNewPH(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Capacity:</label>
                  <input
                    type="text"
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Image URL:</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Description:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe your water source, mineral analysis, filtration process, or service details..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingListing}
                className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                <span>{isSubmittingListing ? 'Publishing to SCUT Protocol...' : 'Publish Listing'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- DIRECT CHAT DRAWER BETWEEN BUYER & SELLER --- */}
      {isChatOpen && (
        <BuyerSellerChatSystem
          isOpen={isChatOpen}
          onClose={() => {
            setIsChatOpen(false);
            setChatContext(null);
          }}
          currentLanguage={language}
          initialRecipient={{
            uid: chatContext?.sellerId || 'vendor-aquapure',
            name: chatContext?.sellerName || 'Water Vendor',
            role: 'seller'
          }}
          initialContext={chatContext || undefined}
        />
      )}
    </div>
  );
}
