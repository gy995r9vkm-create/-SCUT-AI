import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, Search, Tag, Cpu, ShieldCheck, Download, Star, 
  ArrowUpRight, Grid, Filter, Sparkles, Coins, HelpCircle, Package, Layers,
  Heart, MessageSquare, AlertTriangle, Share2, Upload, Plus, X, ArrowLeft, Check, ShieldAlert, AlertCircle, Bookmark, Compass,
  Home, Briefcase, Wrench, BookOpen, Dog, Utensils, Calendar, Palette, Building, Code, Users, Laptop, TrendingUp,
  ShoppingCart, Trash2, Minus, Truck, FileText, CheckCircle, CreditCard,
  ExternalLink, Copy, Printer, MapPin, Clock, Eye, Info, RefreshCw, Send, Lock, Key, FileCheck, CheckSquare, MessageCircle, AlertOctagon, Terminal, Play, PlayCircle, Shield, Globe, Settings
} from 'lucide-react';
import { 
  collection, 
  doc, 
  addDoc, 
  setDoc, 
  getDocs, 
  getDoc,
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  where,
  updateDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { User, Language } from '../types';
import { t } from '../lib/translations';
import { saveCartToStore, loadCartFromFirestore, addToCart as addToCartUtil, CartItem } from '../lib/cart';
import BuyerSellerChatSystem, { ChatContext } from './BuyerSellerChatSystem';
import VideoPlayer from './VideoPlayer';

interface MarketplacePageProps {
  user: User | null;
  language?: Language;
  onNavigate: (page: string) => void;
  onPayWithWallet: (amount: string, description: string) => void;
}

export interface ProductListing {
  id: string;
  title: string;
  description: string;
  category: string;
  price: string;
  author: string;
  authorId: string;
  rating: number;
  downloads: string;
  images: string[];
  videoUrl?: string;
  badge?: string;
  details: string;
  acceptedCurrencies?: string[];
  createdAt: any;
}

export interface Review {
  id: string;
  listingId: string;
  authorId: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: any;
}

export interface UserAddress {
  id: string;
  userId: string;
  label: string;
  fullName: string;
  country: string;
  state: string;
  city: string;
  address: string;
  zip: string;
  phone: string;
  email: string;
}

export interface SellerProfile {
  sellerId: string;
  storeName: string;
  payoutAddress: string;
  acceptedCurrencies: string[];
  shippingCountries: string[];
  shippingPriceStandard: number;
  shippingPriceExpress: number;
  processingTime: string;
  returnPolicy: string;
}

// Initial seed products for empty database fallback
const INITIAL_SEED_PRODUCTS = [
  {
    title: 'Goddess Glitz Bridal Beauty Styling masterclass',
    description: 'Expert tutorials, nail-art guides, hair-braid presets, and customized face-mapping AI prompts optimized for wedding events.',
    category: 'beauty_fashion',
    price: '4.50',
    author: 'Elena R. (Beauty Lead)',
    authorId: 'system_seed_1',
    rating: 4.9,
    downloads: '1.4K',
    images: ['https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'],
    badge: 'Trending',
    details: 'Includes step-by-step videos and customized makeup lookup charts utilizing Gemini vision matrices to match cosmetics with specific skin Undertones.',
    acceptedCurrencies: ['scut_token', 'crypto_pol', 'crypto_usdc', 'card']
  },
  {
    title: 'Carbon-Fiber Performance Aero Custom Tuning Kit',
    description: 'Full high-fidelity blueprints, custom parameters, and tuning curves for optimal Downforce of standard electric and combustion sports cars.',
    category: 'auto_vehicles',
    price: '18.00',
    author: 'Veloce Dynamics',
    authorId: 'system_seed_2',
    rating: 4.8,
    downloads: '290',
    images: ['https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'],
    badge: 'Pro Edition',
    details: 'CAD designs and wind-tunnel models optimized using high-performance machine learning models. Built by expert track engineers.',
    acceptedCurrencies: ['scut_token', 'crypto_pol', 'crypto_matic', 'crypto_usdc', 'crypto_usdt', 'card']
  },
  {
    title: 'Premier League Football Pitch Dynamics Guide',
    description: 'Advanced player position maps, tactical heatmaps, fitness optimization routines, and team drill plans.',
    category: 'sports_football',
    price: '3.00',
    author: 'Coach Marcus',
    authorId: 'system_seed_3',
    rating: 5.0,
    downloads: '950',
    images: ['https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'],
    badge: 'Bestseller',
    details: 'Interactive pitch-positioning playbook designed for high-performance coaches and sports science majors.',
    acceptedCurrencies: ['scut_token', 'crypto_pol', 'card']
  },
  {
    title: 'Sovereign Legal NDA Multi-agent Prompt Ledger',
    description: 'Deeply structured chain-of-thought system prompts designed to analyze contract risk, locate hidden clauses, and suggest edits.',
    category: 'ai_digital',
    price: '2.50',
    author: 'SCUT AI Labs',
    authorId: 'system_seed_4',
    rating: 4.95,
    downloads: '3.2K',
    images: ['https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'],
    badge: 'Verified',
    details: 'Staggered context gates ensure that sensitive documents are analyzed within local sandboxed models on-demand without leaking trade secrets.',
    acceptedCurrencies: ['scut_token', 'crypto_pol', 'crypto_matic', 'crypto_usdc', 'crypto_usdt', 'card']
  }
];

export default function MarketplacePage({ user, language = 'en', onNavigate, onPayWithWallet }: MarketplacePageProps) {
  const trText = (key: string, fallback: string) => t(language, key, fallback);

  const [products, setProducts] = useState<ProductListing[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductListing | null>(null);
  
  // Modals & form states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportType, setReportType] = useState<'listing' | 'review'>('listing');
  const [reportTargetId, setReportTargetId] = useState('');
  const [reportReason, setReportReason] = useState('');
  
  // Create listing fields
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('beauty_fashion');
  const [newDetails, setNewDetails] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newImages, setNewImages] = useState<string[]>([]);
  const [newAcceptedCurrencies, setNewAcceptedCurrencies] = useState<string[]>(['scut_token', 'crypto_pol', 'crypto_matic', 'crypto_usdc', 'crypto_usdt', 'card']);
  const [isUploading, setIsUploading] = useState(false);
  
  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [moderationWarning, setModerationWarning] = useState<string | null>(null);

  // Favorites & Cart state
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [marketplaceView, setMarketplaceView] = useState<string>('browse');
  const [toast, setToast] = useState<string | null>(null);
  const [addedToCartModalItem, setAddedToCartModalItem] = useState<ProductListing | null>(null);
  
  // Real User Addresses from Firestore
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    country: '',
    state: '',
    city: '',
    address: '',
    zip: '',
    phone: '',
    email: user?.email || ''
  });
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billingAddress, setBillingAddress] = useState({
    fullName: user?.name || '',
    country: '',
    state: '',
    city: '',
    address: '',
    zip: '',
    phone: '',
    email: user?.email || ''
  });

  const [deliveryOption, setDeliveryOption] = useState<'standard' | 'express' | 'digital'>('digital');
  const [paymentMethod, setPaymentMethod] = useState<string>('scut_token');
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string, percent: number } | null>(null);
  
  // Address Creation Modal
  const [newAddrLabel, setNewAddrLabel] = useState('');
  const [newAddrFullName, setNewAddrFullName] = useState(user?.name || '');
  const [newAddrCountry, setNewAddrCountry] = useState('');
  const [newAddrState, setNewAddrState] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('');
  const [newAddrAddress, setNewAddrAddress] = useState('');
  const [newAddrZip, setNewAddrZip] = useState('');
  const [newAddrPhone, setNewAddrPhone] = useState('');
  const [newAddrEmail, setNewAddrEmail] = useState(user?.email || '');
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Seller Settings State
  const [sellerProfile, setSellerProfile] = useState<SellerProfile>({
    sellerId: auth.currentUser?.uid || '',
    storeName: user?.name ? `${user.name}'s Store` : 'Merchant Store',
    payoutAddress: auth.currentUser?.uid ? `0x${auth.currentUser.uid.substring(0, 12)}` : '',
    acceptedCurrencies: ['scut_token', 'crypto_pol', 'crypto_matic', 'crypto_usdc', 'crypto_usdt', 'card'],
    shippingCountries: ['Global'],
    shippingPriceStandard: 2.50,
    shippingPriceExpress: 5.50,
    processingTime: '1-2 Business Days',
    returnPolicy: '30-Day Money Back Guarantee'
  });
  const [isSavingSellerProfile, setIsSavingSellerProfile] = useState(false);

  // Real Orders List from Firestore
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [justPlacedOrder, setJustPlacedOrder] = useState<any | null>(null);

  // Modals & Action overlays
  const [activeDigitalItem, setActiveDigitalItem] = useState<{ item: any; orderId: string; orderDate: string } | null>(null);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<any | null>(null);
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<any | null>(null);
  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState<any | null>(null);
  const [activeContactSellerModal, setActiveContactSellerModal] = useState<{ sellerName: string; sellerId?: string; orderId: string; itemTitle: string } | null>(null);
  const [contactSellerMessage, setContactSellerMessage] = useState('');
  const [isSendingSellerMsg, setIsSendingSellerMsg] = useState(false);
  const [showHowToGuide, setShowHowToGuide] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'overview' | 'digital_unlock' | 'physical_tracking' | 'invoices_escrow' | 'selling'>('overview');

  // Tracking editor state
  const [editingTrackingOrderId, setEditingTrackingOrderId] = useState<string | null>(null);
  const [editCarrier, setEditCarrier] = useState('Global Express Courier');
  const [editTrackingNum, setEditTrackingNum] = useState('');
  const [editLocation, setEditLocation] = useState('');

  const [isSubmittingVerification, setIsSubmittingVerification] = useState(false);

  const showNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(prev => prev === msg ? null : prev);
    }, 4000);
  };

  const getCurrencyCode = (method?: string) => {
    switch (method) {
      case 'scut_token': return 'SCUT';
      case 'crypto_pol': return 'POL';
      case 'crypto_matic': return 'MATIC';
      case 'crypto_usdc': return 'USDC';
      case 'crypto_usdt': return 'USDT';
      case 'card': return 'USD';
      default: return 'USD';
    }
  };

  const getCurrencyName = (method?: string) => {
    switch (method) {
      case 'scut_token': return 'SCUT Token';
      case 'crypto_pol': return 'Polygon POL';
      case 'crypto_matic': return 'Polygon MATIC';
      case 'crypto_usdc': return 'USD Coin (USDC)';
      case 'crypto_usdt': return 'Tether (USDT)';
      case 'card': return 'Credit / Debit Card (USD)';
      default: return 'USD';
    }
  };

  // Sync cart state
  const updateCartState = () => {
    const saved = localStorage.getItem('scut_cart');
    if (saved) {
      try { setCart(JSON.parse(saved)); } catch (e) {}
    } else {
      setCart([]);
    }
  };

  const saveCart = async (newCart: any[]) => {
    setCart(newCart);
    await saveCartToStore(newCart);
  };

  // Load User Addresses from Firestore
  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, 'user_addresses'),
      where('userId', '==', auth.currentUser.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      const addrs: UserAddress[] = [];
      snap.forEach((d) => {
        const data = d.data();
        addrs.push({
          id: d.id,
          userId: data.userId || auth.currentUser?.uid || '',
          label: data.label || 'Default Address',
          fullName: data.fullName || '',
          country: data.country || '',
          state: data.state || '',
          city: data.city || '',
          address: data.address || '',
          zip: data.zip || '',
          phone: data.phone || '',
          email: data.email || ''
        });
      });
      setSavedAddresses(addrs);

      if (addrs.length > 0 && !selectedAddressId) {
        const first = addrs[0];
        setSelectedAddressId(first.id);
        setShippingAddress({
          fullName: first.fullName,
          country: first.country,
          state: first.state,
          city: first.city,
          address: first.address,
          zip: first.zip,
          phone: first.phone,
          email: first.email
        });
      }
    }, (err) => {
      console.warn("User addresses listener notice:", err);
    });

    return () => unsub();
  }, [user]);

  // Load Seller Profile from Firestore
  useEffect(() => {
    if (!auth.currentUser) return;
    const ref = doc(db, 'seller_profiles', auth.currentUser.uid);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setSellerProfile({
          sellerId: auth.currentUser?.uid || '',
          storeName: data.storeName || (user?.name ? `${user.name}'s Store` : 'Merchant Store'),
          payoutAddress: data.payoutAddress || `0x${auth.currentUser?.uid.substring(0, 12)}`,
          acceptedCurrencies: data.acceptedCurrencies || ['scut_token', 'crypto_pol', 'crypto_matic', 'crypto_usdc', 'crypto_usdt', 'card'],
          shippingCountries: data.shippingCountries || ['Global'],
          shippingPriceStandard: data.shippingPriceStandard ?? 2.50,
          shippingPriceExpress: data.shippingPriceExpress ?? 5.50,
          processingTime: data.processingTime || '1-2 Business Days',
          returnPolicy: data.returnPolicy || '30-Day Money Back Guarantee'
        });
      }
    }, (err) => {
      console.warn("Seller profile listener notice:", err);
    });

    return () => unsub();
  }, [user]);

  // Load Firestore Orders (where user is buyer or seller)
  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, 'marketplace_orders'),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      const orders: any[] = [];
      snap.forEach((doc) => {
        const data = doc.data();
        if (data.buyerUid === auth.currentUser?.uid || data.items?.some((i: any) => i.authorId === auth.currentUser?.uid)) {
          orders.push({ id: doc.id, ...data });
        }
      });
      setOrdersList(orders);
    }, (err) => {
      console.warn("Orders query fallback:", err);
    });

    return () => unsub();
  }, [user]);

  // Load products from Firestore (pure database driven)
  useEffect(() => {
    const q = query(collection(db, 'marketplace_listings'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const list: ProductListing[] = [];
      snap.forEach((doc) => {
        const d = doc.data();
        list.push({
          id: doc.id,
          title: d.title || '',
          description: d.description || '',
          category: d.category || '',
          price: d.price || '0.00',
          author: d.author || 'Anonymous',
          authorId: d.authorId || '',
          rating: d.rating || 5.0,
          downloads: d.downloads || '0',
          images: d.images || [],
          badge: d.badge || '',
          details: d.details || '',
          acceptedCurrencies: d.acceptedCurrencies || ['scut_token', 'crypto_pol', 'crypto_matic', 'crypto_usdc', 'crypto_usdt', 'card'],
          createdAt: d.createdAt
        });
      });
      setProducts(list);
    }, (err) => {
      console.warn("Marketplace listings listener notice:", err);
    });

    return () => unsub();
  }, []);

  // Sync favorites & restore cart from Firestore
  useEffect(() => {
    const savedFav = localStorage.getItem('scut_marketplace_favorites');
    if (savedFav) {
      try { setFavorites(JSON.parse(savedFav)); } catch (e) {}
    }

    const syncCart = async () => {
      const items = await loadCartFromFirestore();
      setCart(items);
    };

    syncCart();
    window.addEventListener('scut_cart_changed', updateCartState);

    return () => {
      window.removeEventListener('scut_cart_changed', updateCartState);
    };
  }, [user]);

  // Fetch reviews for selected product
  useEffect(() => {
    if (!selectedProduct) {
      setReviews([]);
      return;
    }
    const q = query(
      collection(db, 'marketplace_reviews'), 
      where('listingId', '==', selectedProduct.id),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      const list: Review[] = [];
      snap.forEach((doc) => {
        const d = doc.data();
        list.push({
          id: doc.id,
          listingId: d.listingId || '',
          authorId: d.authorId || '',
          authorName: d.authorName || 'Anonymous',
          rating: d.rating || 5,
          comment: d.comment || '',
          createdAt: d.createdAt
        });
      });
      setReviews(list);
    });

    return () => unsub();
  }, [selectedProduct]);

  const toggleFavorite = (productId: string) => {
    let updated: string[] = [];
    if (favorites.includes(productId)) {
      updated = favorites.filter(id => id !== productId);
    } else {
      updated = [...favorites, productId];
    }
    setFavorites(updated);
    localStorage.setItem('scut_marketplace_favorites', JSON.stringify(updated));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setIsUploading(true);
    
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setNewImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    
    setIsUploading(false);
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !auth.currentUser) {
      alert("Please authenticate to create a marketplace listing.");
      return;
    }

    if (!newTitle.trim() || !newDesc.trim() || !newPrice) {
      alert("Please fill in title, description, and price.");
      return;
    }

    try {
      await addDoc(collection(db, 'marketplace_listings'), {
        title: newTitle,
        description: newDesc,
        category: newCategory,
        price: Number(newPrice).toFixed(2),
        author: user.name || user.email || 'Verified Creator',
        authorId: auth.currentUser.uid,
        rating: 5.0,
        downloads: '0',
        images: newImages.length > 0 ? newImages : ['https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'],
        videoUrl: newVideoUrl.trim() || undefined,
        badge: 'New Listing',
        details: newDetails || 'No further specifications provided.',
        acceptedCurrencies: newAcceptedCurrencies,
        createdAt: serverTimestamp()
      });

      setNewTitle('');
      setNewDesc('');
      setNewPrice('');
      setNewDetails('');
      setNewVideoUrl('');
      setNewImages([]);
      setIsCreateOpen(false);
      showNotification("Listing published successfully!");
    } catch (err) {
      console.error("Error creating listing:", err);
      alert("Failed to submit listing. Try again.");
    }
  };

  const handleSaveSellerProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setIsSavingSellerProfile(true);
    try {
      await setDoc(doc(db, 'seller_profiles', auth.currentUser.uid), {
        ...sellerProfile,
        sellerId: auth.currentUser.uid,
        updatedAt: serverTimestamp()
      }, { merge: true });
      showNotification("Seller Studio Settings saved!");
    } catch (err) {
      console.error("Failed to save seller profile:", err);
      showNotification("Error saving settings.");
    } finally {
      setIsSavingSellerProfile(false);
    }
  };

  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      alert("Please sign in to save shipping addresses.");
      return;
    }

    if (!newAddrFullName || !newAddrCountry || !newAddrCity || !newAddrAddress || !newAddrZip) {
      showNotification("Please fill in all required address fields.");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'user_addresses'), {
        userId: auth.currentUser.uid,
        label: newAddrLabel || 'Home Address',
        fullName: newAddrFullName,
        country: newAddrCountry,
        state: newAddrState,
        city: newAddrCity,
        address: newAddrAddress,
        zip: newAddrZip,
        phone: newAddrPhone,
        email: newAddrEmail,
        createdAt: serverTimestamp()
      });

      setShippingAddress({
        fullName: newAddrFullName,
        country: newAddrCountry,
        state: newAddrState,
        city: newAddrCity,
        address: newAddrAddress,
        zip: newAddrZip,
        phone: newAddrPhone,
        email: newAddrEmail
      });
      setSelectedAddressId(docRef.id);

      setShowAddressModal(false);
      setNewAddrLabel('');
      setNewAddrFullName('');
      setNewAddrCountry('');
      setNewAddrState('');
      setNewAddrCity('');
      setNewAddrAddress('');
      setNewAddrZip('');
      setNewAddrPhone('');
      showNotification("New shipping address added!");
    } catch (err) {
      console.error("Failed to save address:", err);
    }
  };

  const handleCheckout = async (product: ProductListing) => {
    await handleAddToCart(product, true);
  };

  const handleAddToCart = async (product: ProductListing, openCartDirect: boolean = false) => {
    const existingIndex = cart.findIndex(item => item.id === product.id && !item.savedForLater);
    let newCart = [...cart];
    if (existingIndex > -1) {
      newCart[existingIndex].quantity += 1;
    } else {
      newCart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        author: product.author,
        authorId: product.authorId,
        category: product.category,
        images: product.images,
        acceptedCurrencies: product.acceptedCurrencies || ['scut_token', 'crypto_pol', 'crypto_matic', 'crypto_usdc', 'crypto_usdt', 'card'],
        quantity: 1,
        savedForLater: false
      });
    }
    await saveCart(newCart);
    showNotification(`"${product.title}" added to shopping cart.`);
    if (openCartDirect) {
      setMarketplaceView('cart');
    } else {
      setAddedToCartModalItem(product);
    }
  };

  const updateQuantity = (itemId: string, savedForLater: boolean, newQty: number) => {
    if (newQty <= 0) {
      removeCartItem(itemId, savedForLater);
      return;
    }
    const newCart = cart.map(item => {
      if (item.id === itemId && item.savedForLater === savedForLater) {
        return { ...item, quantity: newQty };
      }
      return item;
    });
    saveCart(newCart);
  };

  const removeCartItem = (itemId: string, savedForLater: boolean) => {
    const newCart = cart.filter(item => !(item.id === itemId && item.savedForLater === savedForLater));
    saveCart(newCart);
    showNotification("Item removed from cart.");
  };

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === 'SCUTFREE') {
      setAppliedDiscount({ code: 'SCUTFREE', percent: 1.0 });
      showNotification("100% Promo Code Applied!");
    } else if (code === 'SOVEREIGN') {
      setAppliedDiscount({ code: 'SOVEREIGN', percent: 0.15 });
      showNotification("15% Promo Code Applied!");
    } else {
      showNotification("Invalid discount code.");
    }
  };

  const handlePlaceOrder = async () => {
    const activeItems = cart.filter(item => !item.savedForLater);
    if (activeItems.length === 0) {
      showNotification("Your cart is empty.");
      return;
    }

    if (!shippingAddress.fullName || !shippingAddress.country || !shippingAddress.address || !shippingAddress.city) {
      showNotification("Please fill in all shipping address fields.");
      return;
    }

    const subtotal = activeItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    const discountAmount = appliedDiscount ? (subtotal * appliedDiscount.percent) : 0;
    const isDigitalOrder = deliveryOption === 'digital' || activeItems.every(i => i.isDigital || i.category === 'ai_digital' || i.category === 'digital_products' || i.category === 'education');
    const shipping = isDigitalOrder ? 0 : deliveryOption === 'express' ? 5.50 : 2.50;
    const taxes = (subtotal - discountAmount) * 0.05;
    const total = subtotal - discountAmount + shipping + taxes;

    const orderNum = 'SCUT-ORD-' + Math.floor(100000 + Math.random() * 900000);
    const invNum = 'INV-2026-' + Math.floor(100000 + Math.random() * 900000);

    const hexChars = '0123456789abcdef';
    let txHash = '0x';
    for (let i = 0; i < 40; i++) {
      txHash += hexChars.charAt(Math.floor(Math.random() * hexChars.length));
    }

    const carrierName = isDigitalOrder 
      ? 'SCUT Instant Digital Delivery Engine' 
      : (deliveryOption === 'express' ? 'Express Sovereign Air Courier' : 'Global Ground Logistics');

    const trkNum = isDigitalOrder 
      ? 'DIGITAL-UNLOCK-' + Math.floor(1000 + Math.random() * 9000)
      : 'SCUT-TRK-' + Math.floor(100000 + Math.random() * 900000);

    const estArrival = isDigitalOrder ? 'Instant Access' : '3-5 Business Days';

    const enrichedItems = activeItems.map((item) => {
      const isDigitalItem = isDigitalOrder || item.isDigital || item.category === 'ai_digital' || item.category === 'digital_products' || item.category === 'education';
      return {
        ...item,
        isDigital: isDigitalItem,
        digitalAccess: isDigitalItem ? {
          licenseKey: 'SCUT-LIC-2026-' + Math.floor(1000 + Math.random() * 9000) + '-KEY',
          downloadUrl: item.images && item.images[0] ? item.images[0] : 'https://scut.net/vault/' + item.id,
          promptContent: item.details || item.description || `High-performance digital asset payload for ${item.title}.`,
          blueprintDetails: `Standard license authorized for verified user.`
        } : undefined
      };
    });

    const newOrder = {
      orderId: orderNum,
      buyerUid: auth.currentUser?.uid || 'guest_buyer',
      buyerName: user?.name || shippingAddress.fullName || 'Buyer',
      invoiceNumber: invNum,
      date: new Date().toISOString().split('T')[0],
      items: enrichedItems,
      subtotal: parseFloat(subtotal.toFixed(2)),
      discount: parseFloat(discountAmount.toFixed(2)),
      shipping: parseFloat(shipping.toFixed(2)),
      taxes: parseFloat(taxes.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      paymentMethod,
      paymentCurrency: getCurrencyCode(paymentMethod),
      transactionHash: txHash,
      deliveryOption,
      shippingAddress: billingSameAsShipping ? shippingAddress : billingAddress,
      status: isDigitalOrder ? 'delivered' : 'pending',
      trackingInfo: {
        carrier: carrierName,
        trackingNumber: trkNum,
        estimatedArrival: estArrival,
        currentLocation: isDigitalOrder ? 'SCUT Digital Vault' : 'Central Processing Hub',
        checkpoints: isDigitalOrder ? [
          { status: 'Payment Confirmed & Contract Executed', location: 'Network Node', timestamp: new Date().toLocaleTimeString(), completed: true },
          { status: 'License Key Generated & Encryption Complete', location: 'Key Vault', timestamp: new Date().toLocaleTimeString(), completed: true },
          { status: 'Digital Asset Unlocked', location: 'User Vault Workspace', timestamp: new Date().toLocaleTimeString(), completed: true }
        ] : [
          { status: 'Order Executed & Payment Received', location: 'Merchant Network', timestamp: new Date().toLocaleTimeString(), completed: true },
          { status: 'Preparing Parcel & Inspection', location: 'Sorting Depot', timestamp: 'In Progress', completed: true },
          { status: 'In Transit - Carrier Handover', location: carrierName, timestamp: 'Pending', completed: false },
          { status: 'Out for Local Delivery', location: 'Regional Hub', timestamp: 'Pending', completed: false },
          { status: 'Delivered', location: 'Destination', timestamp: 'Pending', completed: false }
        ]
      },
      refundRequested: false,
      createdAt: serverTimestamp()
    };

    try {
      const orderRef = await addDoc(collection(db, 'marketplace_orders'), newOrder);
      const createdOrder = { id: orderRef.id, ...newOrder };

      const savedItems = cart.filter(item => item.savedForLater);
      saveCart(savedItems);

      setJustPlacedOrder(createdOrder);
      setMarketplaceView('order_confirmation');
      showNotification(`Order #${orderNum} placed successfully! Status: Pending merchant review.`);
    } catch (err) {
      console.error("Order placement failed:", err);
      showNotification("Error saving order. Please retry.");
    }
  };

  const handleSellerAcceptOrder = async (orderId: string) => {
    try {
      const orderRef = doc(db, 'marketplace_orders', orderId);
      await updateDoc(orderRef, {
        status: 'preparing',
        'trackingInfo.currentLocation': 'Order Accepted by Merchant - Preparing Parcel'
      });
      showNotification(`Order #${orderId} ACCEPTED and moved to Preparing.`);
    } catch (err) {
      console.error("Failed to accept order:", err);
    }
  };

  const handleSellerRejectOrder = async (orderId: string) => {
    try {
      const orderRef = doc(db, 'marketplace_orders', orderId);
      await updateDoc(orderRef, {
        status: 'cancelled',
        'trackingInfo.currentLocation': 'Order Rejected by Seller'
      });
      showNotification(`Order #${orderId} REJECTED and CANCELLED.`);
    } catch (err) {
      console.error("Failed to reject order:", err);
    }
  };

  const handleSellerMarkShipped = async (orderId: string) => {
    try {
      const orderRef = doc(db, 'marketplace_orders', orderId);
      await updateDoc(orderRef, {
        status: 'shipped',
        'trackingInfo.currentLocation': 'In Transit - Carrier Handover'
      });
      showNotification(`Order marked as SHIPPED.`);
    } catch (err) {
      console.error("Failed to mark shipped:", err);
    }
  };

  const handleSellerMarkDelivered = async (orderId: string) => {
    try {
      const orderRef = doc(db, 'marketplace_orders', orderId);
      await updateDoc(orderRef, {
        status: 'delivered',
        'trackingInfo.currentLocation': 'Delivered at Consignee Address'
      });
      showNotification(`Order marked as DELIVERED.`);
    } catch (err) {
      console.error("Failed to mark delivered:", err);
    }
  };

  const handleUserRequestRefund = async (orderId: string) => {
    try {
      const orderRef = doc(db, 'marketplace_orders', orderId);
      await updateDoc(orderRef, { refundRequested: true });
      showNotification(`Refund requested for order.`);
    } catch (err) {
      console.error("Failed to request refund:", err);
    }
  };

  const handleSellerApproveRefund = async (orderId: string) => {
    try {
      const orderRef = doc(db, 'marketplace_orders', orderId);
      await updateDoc(orderRef, { status: 'refunded', refundRequested: false });
      showNotification(`Refund approved.`);
    } catch (err) {
      console.error("Failed to approve refund:", err);
    }
  };

  const categories = [
    { id: 'all', name: trText('marketplace.all', 'All Assets'), icon: Compass },
    { id: 'beauty_fashion', name: trText('marketplace.beauty', 'Beauty & Fashion'), icon: Sparkles },
    { id: 'auto_vehicles', name: trText('marketplace.auto', 'Auto & Vehicles'), icon: Layers },
    { id: 'sports_football', name: trText('marketplace.sports', 'Sports & Football'), icon: TrophyIcon },
    { id: 'gaming', name: trText('marketplace.gaming', 'Gaming'), icon: Cpu },
    { id: 'electronics', name: trText('marketplace.electronics', 'Electronics'), icon: Laptop },
    { id: 'home_garden', name: trText('marketplace.home', 'Home & Garden'), icon: Home },
    { id: 'real_estate', name: trText('marketplace.real_estate', 'Real Estate'), icon: Building },
    { id: 'jobs', name: trText('marketplace.jobs', 'Jobs'), icon: Briefcase },
    { id: 'services', name: trText('marketplace.services', 'Services'), icon: Wrench },
    { id: 'education', name: trText('marketplace.education', 'Education'), icon: BookOpen },
    { id: 'pets', name: trText('marketplace.pets', 'Pets'), icon: Dog },
    { id: 'food_restaurants', name: trText('marketplace.food', 'Food & Restaurants'), icon: Utensils },
    { id: 'events', name: trText('marketplace.events', 'Events'), icon: Calendar },
    { id: 'art_handmade', name: trText('marketplace.art', 'Art & Handmade'), icon: Palette },
    { id: 'business_entrepreneurship', name: trText('marketplace.business', 'Business'), icon: TrendingUp },
    { id: 'crypto_blockchain', name: trText('marketplace.crypto', 'Crypto & Blockchain'), icon: Coins },
    { id: 'ai_services', name: trText('marketplace.ai', 'AI Services'), icon: Cpu },
    { id: 'digital_products', name: trText('marketplace.digital', 'Digital Products'), icon: Code },
    { id: 'local_community', name: trText('marketplace.community', 'Local Community'), icon: Users },
    { id: 'protected_women', name: trText('marketplace.women', 'SCUT Women & Girls 🌸'), icon: Heart },
    { id: 'protected_men', name: trText('marketplace.men', 'SCUT Men & Boys ⚡'), icon: ShieldCheck }
  ];

  function TrophyIcon(props: any) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
        <path d="M12 2a6 6 0 0 0-6 6v3.5c0 1.62 1.03 3 2.5 3.5h7c1.47-.5 2.5-1.88 2.5-3.5V8a6 6 0 0 0-6-6z" />
      </svg>
    );
  }

  const isProtectedSelected = selectedCategory === 'protected_women' || selectedCategory === 'protected_men';
  const isUserVerified = user?.isVerified || user?.subscriptionTier === 'business' || user?.subscriptionTier === 'pro';

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeCartItems = cart.filter(item => !item.savedForLater);
  const cartSubtotal = activeCartItems.reduce((sum, item) => sum + (parseFloat(item.price) * (item.quantity || 1)), 0);
  const cartDiscount = appliedDiscount ? (cartSubtotal * appliedDiscount.percent) : 0;
  const cartShipping = deliveryOption === 'digital' ? 0 : deliveryOption === 'express' ? 5.50 : 2.50;
  const cartTaxes = (cartSubtotal - cartDiscount) * 0.05;
  const cartTotal = cartSubtotal - cartDiscount + cartShipping + cartTaxes;

  // Seller allowed payment methods for current cart
  const cartSellerAllowedCurrencies = activeCartItems.length > 0 && activeCartItems[0].acceptedCurrencies
    ? activeCartItems[0].acceptedCurrencies
    : ['scut_token', 'crypto_pol', 'crypto_matic', 'crypto_usdc', 'crypto_usdt', 'card'];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Toast alert */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 right-6 z-50 bg-cyan-500 text-slate-950 px-4 py-3 rounded-2xl font-bold text-xs shadow-2xl flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{toast}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Header */}
        <div className="border-b border-slate-900 pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-400 font-medium mb-3">
              <ShoppingBag className="h-3.5 w-3.5 text-cyan-400" />
              <span>{trText('marketplace.tagline', 'Global Sovereign Marketplace')}</span>
            </div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-white">
              SCUT <span className="text-cyan-400">Marketplace</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1 leading-relaxed font-light">
              {trText('marketplace.subtitle', 'Multi-currency decentralized commerce for digital assets, physical goods, masterclasses, and services.')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder={trText('marketplace.search_placeholder', 'Search listings...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs focus:outline-none focus:border-cyan-500/30 text-slate-200"
              />
            </div>

            {user && (
              <button
                onClick={() => setIsCreateOpen(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-md hover:shadow-cyan-500/20"
              >
                <Plus className="h-4 w-4" />
                {trText('marketplace.list_item', 'List Item')}
              </button>
            )}
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-850 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setMarketplaceView('browse')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                marketplaceView === 'browse'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 font-extrabold'
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              <Compass className="h-4 w-4" />
              <span>{trText('marketplace.browse', 'Browse Store')}</span>
            </button>

            <button
              onClick={() => setMarketplaceView('cart')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer relative ${
                marketplaceView === 'cart'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 font-extrabold'
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              <span>{trText('marketplace.cart', 'Shopping Cart')}</span>
              {activeCartItems.length > 0 && (
                <span className="bg-rose-500 text-white font-mono font-bold text-[9px] h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border border-slate-950">
                  {activeCartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)}
                </span>
              )}
            </button>

            <button
              onClick={() => setMarketplaceView('user_dashboard')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                marketplaceView === 'user_dashboard'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 font-extrabold'
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>{trText('marketplace.my_purchases', 'My Purchases')}</span>
            </button>

            <button
              onClick={() => setMarketplaceView('seller_dashboard')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                marketplaceView === 'seller_dashboard'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 font-extrabold'
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              <Briefcase className="h-4 w-4" />
              <span>{trText('marketplace.seller_studio', 'Seller Studio')}</span>
            </button>
          </div>

          <button
            onClick={() => setShowHowToGuide(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer text-cyan-400 hover:text-cyan-300 border border-cyan-500/20 hover:border-cyan-500/40 bg-cyan-950/20 hover:bg-cyan-950/40 shadow-sm"
          >
            <HelpCircle className="h-4 w-4" />
            <span>{trText('marketplace.guide', 'How to Use & Guide')}</span>
          </button>
        </div>

        {/* View 1: Browse Store */}
        {marketplaceView === 'browse' && (
          <>
            {/* Categories Rail */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
              {categories.map((cat) => {
                const CatIcon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                const isProtected = cat.id.startsWith('protected_');
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                      isSelected 
                        ? isProtected 
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' 
                          : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 font-bold'
                        : 'bg-slate-900 text-slate-400 border-transparent hover:bg-slate-850 hover:text-white'
                    }`}
                  >
                    <CatIcon className={`h-4 w-4 ${isSelected ? (isProtected ? 'text-purple-400' : 'text-cyan-400') : 'text-slate-500'}`} />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Standard Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((prod) => {
                const isFav = favorites.includes(prod.id);
                return (
                  <motion.div 
                    layout
                    key={prod.id}
                    className="rounded-3xl border border-slate-900 bg-slate-950/80 p-6 flex flex-col justify-between hover:border-cyan-500/20 transition-all group relative overflow-hidden"
                  >
                    {prod.badge && (
                      <div className="absolute top-4 right-4 border font-bold text-[9px] uppercase px-2.5 py-0.5 rounded tracking-wider bg-cyan-500/10 border-cyan-500/15 text-cyan-400">
                        {prod.badge}
                      </div>
                    )}

                    <button
                      onClick={() => toggleFavorite(prod.id)}
                      className="absolute top-4 left-4 p-2 bg-slate-900/60 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                    >
                      <Heart className={`h-3.5 w-3.5 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                    </button>

                    <div className="mt-4">
                      <div className="w-full h-36 rounded-2xl overflow-hidden bg-slate-900 border border-slate-850/50 relative mb-4">
                        <img 
                          src={prod.images[0]} 
                          alt={prod.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">
                        {categories.find(c => c.id === prod.category)?.name || 'Ecosystem'}
                      </span>

                      <h3 className="font-display text-base font-bold text-slate-100 group-hover:text-white mb-2 leading-snug">
                        {prod.title}
                      </h3>

                      <p className="text-slate-400 text-xs font-light leading-relaxed mb-4 line-clamp-3">
                        {prod.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-900/80 mt-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className="text-[10px] text-slate-500 block">PRICE</span>
                          <span className="font-display text-sm font-bold text-white font-mono">{prod.price} {getCurrencyCode(prod.acceptedCurrencies?.[0])}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block">ACCEPTED</span>
                          <div className="flex gap-1 justify-end mt-0.5">
                            {prod.acceptedCurrencies?.slice(0, 3).map(c => (
                              <span key={c} className="text-[8px] bg-slate-900 border border-slate-800 px-1 py-0.5 rounded font-mono text-cyan-400">
                                {getCurrencyCode(c)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedProduct(prod)}
                          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleCheckout(prod)}
                          className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition-all hover:shadow-md hover:shadow-cyan-500/15 flex items-center gap-1 cursor-pointer"
                        >
                          Acquire
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}

        {/* View 2: Cart */}
        {marketplaceView === 'cart' && (
          <div className="grid lg:grid-cols-3 gap-8 animate-fade-in">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 sm:p-8">
                <h2 className="font-display text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-cyan-400" />
                  Active Basket Items ({activeCartItems.length})
                </h2>

                {activeCartItems.length === 0 ? (
                  <div className="text-center py-16 space-y-4">
                    <Package className="h-12 w-12 text-slate-700 mx-auto" />
                    <p className="text-slate-400 text-sm font-light">Your Shopping Cart is currently empty.</p>
                    <button
                      onClick={() => setMarketplaceView('browse')}
                      className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      Browse Catalog
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-900 space-y-6">
                    {activeCartItems.map((item) => (
                      <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 first:pt-0">
                        <div className="flex gap-4 items-center">
                          <img
                            src={item.images?.[0] || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=100'}
                            alt={item.title}
                            className="w-16 h-16 rounded-xl object-cover border border-slate-850"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <h3 className="font-display text-sm font-bold text-slate-200 line-clamp-1">{item.title}</h3>
                            <p className="text-[10px] text-slate-500 uppercase mt-0.5 font-mono">By {item.author || 'Merchant'}</p>
                            <span className="font-mono text-xs font-semibold text-cyan-400 mt-1 block">{item.price} USD</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 w-full sm:w-auto justify-between">
                          <div className="flex items-center gap-2 bg-slate-950 border border-slate-850 px-2 py-1 rounded-xl">
                            <button onClick={() => updateQuantity(item.id, false, (item.quantity || 1) - 1)} className="p-1 text-slate-500 hover:text-cyan-400"><Minus className="h-3 w-3" /></button>
                            <span className="font-mono text-xs font-bold text-slate-200 w-6 text-center">{item.quantity || 1}</span>
                            <button onClick={() => updateQuantity(item.id, false, (item.quantity || 1) + 1)} className="p-1 text-slate-500 hover:text-cyan-400"><Plus className="h-3 w-3" /></button>
                          </div>

                          <button onClick={() => removeCartItem(item.id, false)} className="p-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-slate-950">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 space-y-6">
                <h3 className="font-display text-base font-bold text-white">Order Summary</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-slate-400"><span>Subtotal</span><span className="font-mono text-slate-200">{cartSubtotal.toFixed(2)} USD</span></div>
                  <div className="flex justify-between text-slate-400"><span>Shipping</span><span className="font-mono text-slate-200">{cartShipping.toFixed(2)} USD</span></div>
                  <div className="flex justify-between text-slate-400"><span>Taxes</span><span className="font-mono text-slate-200">{cartTaxes.toFixed(2)} USD</span></div>
                  <div className="flex justify-between text-base font-bold text-white pt-3 border-t border-slate-900"><span>Total</span><span className="font-mono text-cyan-400">{cartTotal.toFixed(2)} USD</span></div>
                </div>

                <button
                  disabled={activeCartItems.length === 0}
                  onClick={() => setMarketplaceView('checkout')}
                  className="w-full py-3.5 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Proceed to Checkout
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View 3: Checkout */}
        {marketplaceView === 'checkout' && (
          <div className="grid lg:grid-cols-3 gap-8 animate-fade-in">
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address Picker */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                    <Truck className="h-5 w-5 text-cyan-400" />
                    Shipping Destination Address
                  </h2>
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Shipping Address
                  </button>
                </div>

                {savedAddresses.length > 0 && (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {savedAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => {
                          setSelectedAddressId(addr.id);
                          setShippingAddress({
                            fullName: addr.fullName,
                            country: addr.country,
                            state: addr.state,
                            city: addr.city,
                            address: addr.address,
                            zip: addr.zip,
                            phone: addr.phone,
                            email: addr.email
                          });
                        }}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          selectedAddressId === addr.id
                            ? 'border-cyan-500/40 bg-cyan-500/5'
                            : 'border-slate-850 bg-slate-950 hover:border-slate-800'
                        }`}
                      >
                        <span className="text-xs font-bold text-cyan-400 font-mono block">{addr.label}</span>
                        <p className="text-xs font-bold text-white mt-1">{addr.fullName}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{addr.address}, {addr.city}, {addr.state} {addr.zip}</p>
                        <p className="text-[10px] text-slate-500">{addr.country} • {addr.phone}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Form fields */}
                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">FULL NAME *</label>
                    <input
                      type="text"
                      value={shippingAddress.fullName}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">EMAIL ADDRESS *</label>
                    <input
                      type="email"
                      value={shippingAddress.email}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">STREET ADDRESS *</label>
                    <input
                      type="text"
                      value={shippingAddress.address}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">CITY *</label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">STATE / REGION</label>
                    <input
                      type="text"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">POSTAL CODE *</label>
                    <input
                      type="text"
                      value={shippingAddress.zip}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, zip: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">COUNTRY *</label>
                    <input
                      type="text"
                      placeholder="e.g. United States, Germany, Japan"
                      value={shippingAddress.country}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">PHONE NUMBER</label>
                    <input
                      type="text"
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Selector based on Seller Accepted Currencies */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 sm:p-8 space-y-6">
                <h2 className="font-display text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-cyan-400" />
                  Select Payment Currency
                </h2>

                <div className="p-3 bg-cyan-950/20 border border-cyan-500/10 rounded-xl text-xs text-cyan-400 flex items-center gap-2">
                  <Shield className="h-4 w-4 shrink-0 text-cyan-400" />
                  <span>Payments transfer directly between buyer and seller using seller-accepted currencies.</span>
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  {cartSellerAllowedCurrencies.map((methodKey) => (
                    <button
                      key={methodKey}
                      onClick={() => setPaymentMethod(methodKey)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                        paymentMethod === methodKey ? 'border-cyan-500/40 bg-cyan-500/5' : 'border-slate-850 bg-slate-950 hover:border-slate-800'
                      }`}
                    >
                      <span className="font-bold text-xs text-slate-200 block">{getCurrencyName(methodKey)}</span>
                      <span className="text-[10px] text-cyan-400 font-mono mt-2">{getCurrencyCode(methodKey)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 space-y-6">
                <h3 className="font-display text-base font-bold text-white">Order Summary</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-slate-400"><span>Items ({activeCartItems.length})</span><span className="font-mono text-slate-200">{cartSubtotal.toFixed(2)} USD</span></div>
                  <div className="flex justify-between text-slate-400"><span>Shipping</span><span className="font-mono text-slate-200">{cartShipping.toFixed(2)} USD</span></div>
                  <div className="flex justify-between text-slate-400"><span>Taxes</span><span className="font-mono text-slate-200">{cartTaxes.toFixed(2)} USD</span></div>
                  <div className="flex justify-between text-base font-bold text-white pt-3 border-t border-slate-900">
                    <span>Payable Total</span>
                    <span className="font-mono text-cyan-400">{cartTotal.toFixed(2)} {getCurrencyCode(paymentMethod)}</span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  className="w-full py-4 bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle className="h-4.5 w-4.5" />
                  Pay & Complete Order
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View 4: Order Confirmation */}
        {marketplaceView === 'order_confirmation' && justPlacedOrder && (
          <div className="max-w-3xl mx-auto bg-slate-900/40 border border-slate-900 rounded-3xl p-6 sm:p-10 text-center space-y-8 animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-emerald-500 to-cyan-500" />
            
            <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mx-auto">
              <Check className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h2 className="font-display text-2xl font-extrabold text-white tracking-tight">Order Confirmed!</h2>
              <p className="text-slate-400 text-xs max-w-md mx-auto">
                Thank you for your purchase. Your order has been placed and registered in the database.
              </p>
            </div>

            <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-6 text-left space-y-6">
              <div className="flex flex-wrap justify-between items-center border-b border-slate-900 pb-4 text-xs gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">ORDER ID</span>
                  <span className="font-mono font-bold text-slate-200">{justPlacedOrder.orderId}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">INVOICE</span>
                  <span className="font-mono font-bold text-cyan-400">{justPlacedOrder.invoiceNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">TOTAL PAID</span>
                  <span className="font-mono font-bold text-white">{justPlacedOrder.total.toFixed(2)} {justPlacedOrder.paymentCurrency || 'USD'}</span>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">ITEMS ({justPlacedOrder.items.length})</span>
                {justPlacedOrder.items.map((item: any) => (
                  <div key={item.id} className="p-3 bg-slate-900/60 rounded-xl border border-slate-850 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {item.images && item.images[0] && (
                        <img src={item.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      )}
                      <div>
                        <span className="text-slate-200 font-bold block text-xs">{item.title}</span>
                        <span className="text-[10px] text-slate-400">Merchant: {item.author || 'Seller'}</span>
                      </div>
                    </div>

                    {item.isDigital ? (
                      <button
                        onClick={() => setActiveDigitalItem({ item, orderId: justPlacedOrder.orderId, orderDate: justPlacedOrder.date })}
                        className="px-3 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-[10px] rounded-lg cursor-pointer"
                      >
                        Open Product
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveTrackingOrder(justPlacedOrder)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[10px] rounded-lg cursor-pointer"
                      >
                        Track Shipment
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => setMarketplaceView('user_dashboard')}
                className="px-5 py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold rounded-xl cursor-pointer"
              >
                My Purchases
              </button>
              <button
                onClick={() => setMarketplaceView('browse')}
                className="px-4 py-3 border border-slate-800 text-slate-400 text-xs font-bold rounded-xl cursor-pointer"
              >
                Return to Store
              </button>
            </div>
          </div>
        )}

        {/* View 5: User Purchases & Addresses */}
        {marketplaceView === 'user_dashboard' && (
          <div className="grid lg:grid-cols-3 gap-8 animate-fade-in">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 sm:p-8">
                <h2 className="font-display text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-cyan-400" />
                  My Orders ({ordersList.length})
                </h2>

                {ordersList.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-8 text-center">No orders found.</p>
                ) : (
                  <div className="space-y-4">
                    {ordersList.map((ord) => (
                      <div key={ord.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-900 space-y-4">
                        <div className="flex justify-between items-start text-xs border-b border-slate-900 pb-3">
                          <div>
                            <span className="font-mono font-bold text-slate-200">{ord.orderId || ord.id}</span>
                            <span className="text-[10px] text-slate-500 block font-mono mt-0.5">{ord.date}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-cyan-400">{ord.total?.toFixed(2)} {ord.paymentCurrency || 'USD'}</span>
                            <span className="text-[10px] uppercase font-bold block mt-1 px-2 py-0.5 rounded font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{ord.status}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[11px] text-slate-400 font-mono">{ord.items?.length || 0} item(s)</span>
                          <div className="flex items-center gap-2">
                            {ord.items?.some((i: any) => i.isDigital) && (
                              <button
                                onClick={() => {
                                  const digital = ord.items.find((i: any) => i.isDigital) || ord.items[0];
                                  setActiveDigitalItem({ item: digital, orderId: ord.orderId || ord.id, orderDate: ord.date });
                                }}
                                className="px-3 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-[10px] font-bold rounded-lg cursor-pointer"
                              >
                                Open Product
                              </button>
                            )}
                            {ord.items?.some((i: any) => !i.isDigital) && (
                              <button
                                onClick={() => setActiveTrackingOrder(ord)}
                                className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-cyan-400 text-[10px] font-bold rounded-lg cursor-pointer"
                              >
                                Track Shipment
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Address Manager */}
            <div className="space-y-6">
              <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="font-display text-base font-bold text-white">Saved Addresses</h2>
                  <button onClick={() => setShowAddressModal(true)} className="text-xs font-bold text-cyan-400 hover:underline cursor-pointer">+ Add</button>
                </div>

                <div className="space-y-3">
                  {savedAddresses.map((addr) => (
                    <div key={addr.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-900 space-y-1">
                      <span className="text-xs font-bold text-cyan-400 font-mono">{addr.label}</span>
                      <p className="text-xs font-bold text-white mt-1">{addr.fullName}</p>
                      <p className="text-[11px] text-slate-400">{addr.address}, {addr.city}, {addr.state} {addr.zip}</p>
                      <p className="text-[10px] text-slate-500">{addr.country} • {addr.phone}</p>
                    </div>
                  ))}
                  {savedAddresses.length === 0 && (
                    <p className="text-xs text-slate-500 italic">No addresses saved yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View 6: Seller Studio */}
        {marketplaceView === 'seller_dashboard' && (
          <div className="space-y-8 animate-fade-in">
            {/* Merchant Incoming Orders Queue */}
            <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-900 pb-4">
                <div>
                  <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                    <Package className="h-5 w-5 text-cyan-400" />
                    Incoming Merchant Orders ({ordersList.filter(o => o.items?.some((i: any) => i.authorId === auth.currentUser?.uid || auth.currentUser?.uid)).length})
                  </h3>
                  <p className="text-xs text-slate-400">Review, accept, process, ship, or deliver incoming marketplace orders.</p>
                </div>
              </div>

              {ordersList.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-900 text-xs text-slate-500">
                  No incoming merchant orders yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {ordersList.map((ord) => {
                    const isPending = ord.status === 'pending';
                    const isPreparing = ord.status === 'preparing' || ord.status === 'accepted';
                    const isShipped = ord.status === 'shipped';
                    const isDelivered = ord.status === 'delivered';
                    const isCancelled = ord.status === 'cancelled' || ord.status === 'rejected';

                    return (
                      <div key={ord.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-900 space-y-4">
                        <div className="flex flex-wrap justify-between items-start gap-2 border-b border-slate-900 pb-3 text-xs">
                          <div>
                            <span className="font-mono font-bold text-white">Order #{ord.orderId || ord.id}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">Buyer: {ord.buyerName || 'Verified Buyer'} ({ord.shippingAddress?.email || 'N/A'})</span>
                            <span className="text-[10px] text-slate-500 block">Shipping: {ord.shippingAddress?.address}, {ord.shippingAddress?.city}, {ord.shippingAddress?.country}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-cyan-400 text-sm">{ord.total?.toFixed(2)} {ord.paymentCurrency || 'USD'}</span>
                            <span className={`text-[10px] uppercase font-bold block mt-1 px-2.5 py-0.5 rounded font-mono w-fit ml-auto ${
                              isPending ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                              isPreparing ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                              isShipped ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                              isDelivered ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {ord.status}
                            </span>
                          </div>
                        </div>

                        {/* Items in order */}
                        <div className="space-y-1.5">
                          {ord.items?.map((it: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center text-xs text-slate-300 bg-slate-900/50 p-2 rounded-xl">
                              <span>{it.title} (x{it.quantity || 1})</span>
                              <span className="font-mono text-cyan-400">{it.price}</span>
                            </div>
                          ))}
                        </div>

                        {/* Seller Action Controls */}
                        <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-900">
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleSellerRejectOrder(ord.id)}
                                className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white text-xs font-bold rounded-xl border border-rose-500/20 transition-all cursor-pointer"
                              >
                                Reject Order
                              </button>
                              <button
                                onClick={() => handleSellerAcceptOrder(ord.id)}
                                className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                              >
                                Accept Order (Preparing)
                              </button>
                            </>
                          )}

                          {isPreparing && (
                            <button
                              onClick={() => handleSellerMarkShipped(ord.id)}
                              className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                            >
                              Mark as Shipped
                            </button>
                          )}

                          {isShipped && (
                            <button
                              onClick={() => handleSellerMarkDelivered(ord.id)}
                              className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                            >
                              Mark as Delivered
                            </button>
                          )}

                          {isDelivered && (
                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" /> Order Fulfilled
                            </span>
                          )}

                          {isCancelled && (
                            <span className="text-xs font-bold text-rose-400">Order Cancelled</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Store Settings Editor */}
            <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 sm:p-8 space-y-6">
              <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-cyan-400" />
                Store & Payment Preferences Settings
              </h3>

              <form onSubmit={handleSaveSellerProfile} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">STORE NAME</label>
                    <input
                      type="text"
                      value={sellerProfile.storeName}
                      onChange={(e) => setSellerProfile({ ...sellerProfile, storeName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">PAYOUT WALLET / ROUTE ADDRESS</label>
                    <input
                      type="text"
                      value={sellerProfile.payoutAddress}
                      onChange={(e) => setSellerProfile({ ...sellerProfile, payoutAddress: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs font-mono text-cyan-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">ACCEPTED CURRENCIES & PAYMENT METHODS</label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[
                      { id: 'scut_token', label: 'SCUT Token' },
                      { id: 'crypto_pol', label: 'Polygon POL' },
                      { id: 'crypto_matic', label: 'Polygon MATIC' },
                      { id: 'crypto_usdc', label: 'USDC' },
                      { id: 'crypto_usdt', label: 'USDT' },
                      { id: 'card', label: 'Card (USD)' }
                    ].map((cur) => {
                      const isChecked = sellerProfile.acceptedCurrencies.includes(cur.id);
                      return (
                        <button
                          key={cur.id}
                          type="button"
                          onClick={() => {
                            let updated = [...sellerProfile.acceptedCurrencies];
                            if (isChecked) {
                              if (updated.length > 1) updated = updated.filter(c => c !== cur.id);
                            } else {
                              updated.push(cur.id);
                            }
                            setSellerProfile({ ...sellerProfile, acceptedCurrencies: updated });
                          }}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                            isChecked ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 font-bold' : 'bg-slate-950 border-slate-850 text-slate-500'
                          }`}
                        >
                          {cur.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSavingSellerProfile}
                    className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    {isSavingSellerProfile ? "Saving..." : "Save Store Settings"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>

      {/* Selected Product Details Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProduct(null)} className="absolute inset-0 bg-slate-950/85 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto space-y-6">
              <div className="flex justify-between items-start border-b border-slate-900 pb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                    {categories.find(c => c.id === selectedProduct.category)?.name || 'Marketplace Item'}
                  </span>
                  <h3 className="font-display text-xl font-bold text-white">{selectedProduct.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">Merchant: <span className="text-slate-200 font-semibold">{selectedProduct.author || 'Verified Seller'}</span></p>
                </div>
                <button onClick={() => setSelectedProduct(null)} className="p-1.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"><X className="h-5 w-5" /></button>
              </div>

              {/* Product Video or Main Image */}
              {selectedProduct.videoUrl ? (
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Official Product Presentation Video</span>
                  <VideoPlayer
                    url={selectedProduct.videoUrl}
                    title={selectedProduct.title}
                    description={`Video demonstration for ${selectedProduct.title}`}
                    poster={selectedProduct.images?.[0]}
                  />
                </div>
              ) : (
                <div className="h-64 w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 relative">
                  <img src={selectedProduct.images?.[0]} alt={selectedProduct.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Item Overview</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-light whitespace-pre-wrap">{selectedProduct.description}</p>
                {selectedProduct.details && (
                  <p className="text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-850 leading-relaxed">{selectedProduct.details}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/60 rounded-2xl border border-slate-850">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-mono">LISTING PRICE</span>
                  <span className="font-display text-xl font-bold text-white font-mono">{selectedProduct.price} USD</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      handleAddToCart(selectedProduct, false);
                      setSelectedProduct(null);
                    }}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <ShoppingCart className="h-4 w-4 text-cyan-400" />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => {
                      handleCheckout(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1"
                  >
                    Acquire Now
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Address Modal */}
      <AnimatePresence>
        {showAddressModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddressModal(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-2xl z-10">
              <h3 className="font-display text-base font-bold text-white mb-4">Add New Shipping Address</h3>
              <form onSubmit={handleSaveNewAddress} className="space-y-3">
                <input type="text" placeholder="Address Label (e.g. Home, Office)" value={newAddrLabel} onChange={(e) => setNewAddrLabel(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200" />
                <input type="text" placeholder="Full Name *" value={newAddrFullName} onChange={(e) => setNewAddrFullName(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200" required />
                <input type="text" placeholder="Street Address *" value={newAddrAddress} onChange={(e) => setNewAddrAddress(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200" required />
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="City *" value={newAddrCity} onChange={(e) => setNewAddrCity(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200" required />
                  <input type="text" placeholder="State / Region" value={newAddrState} onChange={(e) => setNewAddrState(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="Postal Code *" value={newAddrZip} onChange={(e) => setNewAddrZip(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200" required />
                  <input type="text" placeholder="Country *" value={newAddrCountry} onChange={(e) => setNewAddrCountry(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200" required />
                </div>
                <input type="text" placeholder="Phone Number" value={newAddrPhone} onChange={(e) => setNewAddrPhone(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200" />

                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setShowAddressModal(false)} className="flex-1 py-2.5 rounded-xl bg-slate-900 text-slate-400 text-xs font-bold">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs">Save Address</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Digital Item Modal */}
      <AnimatePresence>
        {activeDigitalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveDigitalItem(null)} className="absolute inset-0 bg-slate-950/85 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-xl bg-slate-950 border border-cyan-500/30 rounded-3xl p-6 shadow-2xl z-10 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-cyan-400" />
                  Instant Digital Access Vault
                </h3>
                <button onClick={() => setActiveDigitalItem(null)} className="p-1 text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
              </div>

              <div className="p-4 bg-slate-900/60 rounded-2xl space-y-2">
                <h4 className="font-bold text-white text-sm">{activeDigitalItem.item.title}</h4>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-cyan-300 text-xs flex justify-between items-center">
                  <span>{activeDigitalItem.item.digitalAccess?.licenseKey || 'SCUT-LIC-KEY'}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(activeDigitalItem.item.digitalAccess?.licenseKey || '');
                      showNotification("License key copied!");
                    }}
                    className="px-2.5 py-1 bg-cyan-400 text-slate-950 text-[10px] font-bold rounded-lg"
                  >
                    Copy
                  </button>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 max-h-40 overflow-y-auto whitespace-pre-wrap">
                  {activeDigitalItem.item.digitalAccess?.promptContent || activeDigitalItem.item.description}
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={() => setActiveDigitalItem(null)} className="px-5 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold">Done</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Shipment Tracking Modal */}
      <AnimatePresence>
        {activeTrackingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveTrackingOrder(null)} className="absolute inset-0 bg-slate-950/85 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-xl bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-2xl z-10 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                  <Truck className="h-5 w-5 text-cyan-400" />
                  Shipment Tracking Details
                </h3>
                <button onClick={() => setActiveTrackingOrder(null)} className="p-1 text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between p-3 bg-slate-900/60 rounded-xl">
                  <div><span className="text-[10px] text-slate-500 block">CARRIER</span><span className="font-bold text-white">{activeTrackingOrder.trackingInfo?.carrier || 'Global Courier'}</span></div>
                  <div><span className="text-[10px] text-slate-500 block">TRACKING ID</span><span className="font-mono text-cyan-400 font-bold">{activeTrackingOrder.trackingInfo?.trackingNumber || 'SCUT-TRK-1001'}</span></div>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-xl">
                  <span className="text-[10px] text-slate-500 block mb-1 font-mono uppercase">CURRENT STATUS</span>
                  <span className="text-emerald-400 font-bold font-mono">{activeTrackingOrder.trackingInfo?.currentLocation || 'In Transit'}</span>
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={() => setActiveTrackingOrder(null)} className="px-5 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Listing Modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreateOpen(false)} className="absolute inset-0 bg-slate-950/85 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-2xl z-10 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <h3 className="font-display text-base font-bold text-white">Create New Marketplace Listing</h3>
                <button onClick={() => setIsCreateOpen(false)} className="p-1 text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
              </div>

              <form onSubmit={handleCreateListing} className="space-y-3">
                <input type="text" placeholder="Title *" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200" required />
                <textarea placeholder="Description *" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 resize-none h-20" required />
                
                <input type="url" placeholder="Optional Product Video Demo URL (YouTube, Vimeo, MP4)" value={newVideoUrl} onChange={(e) => setNewVideoUrl(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono" />

                <div className="grid grid-cols-2 gap-2">
                  <input type="number" step="0.01" placeholder="Price (USD) *" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200" required />
                  <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200">
                    {categories.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">ACCEPTED PAYMENT CURRENCIES</label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'scut_token', label: 'SCUT' },
                      { id: 'crypto_pol', label: 'POL' },
                      { id: 'crypto_matic', label: 'MATIC' },
                      { id: 'crypto_usdc', label: 'USDC' },
                      { id: 'crypto_usdt', label: 'USDT' },
                      { id: 'card', label: 'Card' }
                    ].map(cur => {
                      const isSel = newAcceptedCurrencies.includes(cur.id);
                      return (
                        <button
                          key={cur.id}
                          type="button"
                          onClick={() => {
                            if (isSel) {
                              if (newAcceptedCurrencies.length > 1) setNewAcceptedCurrencies(newAcceptedCurrencies.filter(c => c !== cur.id));
                            } else {
                              setNewAcceptedCurrencies([...newAcceptedCurrencies, cur.id]);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${isSel ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
                        >
                          {cur.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setIsCreateOpen(false)} className="flex-1 py-2.5 rounded-xl bg-slate-900 text-slate-400 text-xs font-bold">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs">Publish Listing</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* How To Guide Modal */}
      <AnimatePresence>
        {showHowToGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowHowToGuide(false)} className="absolute inset-0 bg-slate-950/85 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl bg-slate-950 border border-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-900 pb-4">
                <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-cyan-400" />
                  SCUT Marketplace Fulfillment & Payment Guide
                </h3>
                <button onClick={() => setShowHowToGuide(false)} className="p-1 text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
              </div>

              <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                <p><strong>Multi-Currency Direct Transactions:</strong> Payments happen directly between buyer and seller using currencies chosen by the seller (SCUT, POL, MATIC, USDC, USDT, or Card).</p>
                <p><strong>Instant Digital Unlocking:</strong> Purchasing a digital asset or AI prompt instantly generates your license key and payload access in <em>My Purchases</em>.</p>
                <p><strong>Physical Parcel Logistics:</strong> Physical orders generate carrier tracking and status updates from dispatch to final delivery.</p>
              </div>

              <div className="flex justify-end pt-2">
                <button onClick={() => setShowHowToGuide(false)} className="px-5 py-2.5 bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl">Got It</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Added to Cart Choice Modal */}
      <AnimatePresence>
        {addedToCartModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAddedToCartModalItem(null)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-slate-950 border border-cyan-500/30 rounded-3xl p-6 shadow-2xl z-10 space-y-5 text-center">
              <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-base font-bold text-white">Item Added to Shopping Cart!</h3>
                <p className="text-xs font-bold text-cyan-400">{addedToCartModalItem.title}</p>
                <p className="text-[11px] text-slate-400">Your cart has been updated and synchronized with your account in Firestore.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setAddedToCartModalItem(null)}
                  className="w-full py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs cursor-pointer"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => {
                    setAddedToCartModalItem(null);
                    setMarketplaceView('cart');
                  }}
                  className="w-full py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs cursor-pointer shadow-md"
                >
                  Proceed to Checkout
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
