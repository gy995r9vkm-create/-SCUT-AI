import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebase';

export interface CartItem {
  id: string;
  title: string;
  price: string;
  author?: string;
  authorId?: string;
  category?: string;
  images?: string[];
  acceptedCurrencies?: string[];
  quantity: number;
  savedForLater?: boolean;
  isDigital?: boolean;
  details?: string;
}

export const getCart = (): CartItem[] => {
  try {
    const saved = localStorage.getItem('scut_cart');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

export const saveCartToStore = async (newCart: CartItem[]): Promise<void> => {
  localStorage.setItem('scut_cart', JSON.stringify(newCart));
  window.dispatchEvent(new Event('scut_cart_changed'));

  if (auth.currentUser) {
    try {
      await setDoc(
        doc(db, 'user_carts', auth.currentUser.uid),
        {
          userId: auth.currentUser.uid,
          items: newCart,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
    } catch (err) {
      console.warn("Failed to persist cart to Firestore:", err);
    }
  }
};

export const loadCartFromFirestore = async (): Promise<CartItem[]> => {
  if (!auth.currentUser) return getCart();
  try {
    const snap = await getDoc(doc(db, 'user_carts', auth.currentUser.uid));
    if (snap.exists() && snap.data().items) {
      const items = snap.data().items as CartItem[];
      localStorage.setItem('scut_cart', JSON.stringify(items));
      window.dispatchEvent(new Event('scut_cart_changed'));
      return items;
    }
  } catch (err) {
    console.warn("Error loading cart from Firestore:", err);
  }
  return getCart();
};

export const addToCart = async (item: Omit<CartItem, 'quantity'> & { quantity?: number }): Promise<CartItem[]> => {
  const currentCart = getCart();
  const existingIndex = currentCart.findIndex(i => i.id === item.id && !i.savedForLater);
  let updatedCart = [...currentCart];

  if (existingIndex > -1) {
    updatedCart[existingIndex].quantity = (updatedCart[existingIndex].quantity || 1) + (item.quantity || 1);
  } else {
    updatedCart.push({
      ...item,
      quantity: item.quantity || 1,
      savedForLater: false,
      acceptedCurrencies: item.acceptedCurrencies || ['scut_token', 'crypto_pol', 'crypto_matic', 'crypto_usdc', 'crypto_usdt', 'card']
    });
  }

  await saveCartToStore(updatedCart);
  return updatedCart;
};
