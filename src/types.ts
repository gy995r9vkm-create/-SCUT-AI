/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Attachment {
  name: string;
  type: string;
  size: string;
  previewUrl?: string; // for images
  textContent?: string; // parsed content for .txt/.json files
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachment?: Attachment;
  isFailed?: boolean;
  tokens?: number;
  durationMs?: number;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  isFavorite: boolean;
  model: string;
  folderId?: string | null;
  isPinned?: boolean;
  isArchived?: boolean;
}

export interface Folder {
  id: string;
  name: string;
  createdAt: string;
  color?: string; // Hex or tailwind class
}

export type SubscriptionTier = 'free' | 'pro' | 'business' | 'enterprise';
export type Language = 
  | 'en' | 'ro' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'nl' | 'da' | 'sv' 
  | 'no' | 'fi' | 'pl' | 'cs' | 'sk' | 'hu' | 'el' | 'tr' | 'uk' | 'ar' 
  | 'he' | 'hi' | 'zh' | 'ja' | 'ko' | 'th' | 'vi' | 'id' | 'ms';

export interface SavedPrompt {
  id: string;
  title: string;
  prompt: string;
  category: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  status: 'active' | 'revoked';
  usageCount: number;
}

export interface User {
  email: string;
  name: string;
  subscriptionTier: SubscriptionTier;
  createdAt: string;
  isVerified: boolean;
  avatarUrl?: string;
  usageCount: number;
  maxUsage: number;
  theme?: 'dark' | 'light';
  language?: Language;
  walletAddress?: string;
  isAdmin?: boolean;
  scutCredits?: number;
  isVerificationRequested?: boolean;
  isBanned?: boolean;
  isMuted?: boolean;
  mutedUntil?: string;
  infractionCount?: number;
  sex?: 'female' | 'male';
  selectedCommunity?: 'women_girls' | 'men_boys' | 'none';
  approvalStatus?: 'pending_approval' | 'approved' | 'rejected';
  isApproved?: boolean;
  rejectionReason?: string;
  privacySettings?: {
    whoCanMessageMe: 'all' | 'friends' | 'none';
    whoCanCallMe: 'all' | 'friends' | 'none';
    whoCanInviteMe: 'all' | 'friends' | 'none';
    whoCanSeeProfile: 'all' | 'members' | 'none';
    whoCanSeeOnlineStatus: 'all' | 'members' | 'none';
  };
  friends?: string[];
  followers?: string[];
  following?: string[];
}

export interface ScutCreditsTransaction {
  id: string;
  amount: number;
  type: 'earn_ai' | 'earn_community' | 'earn_achievement' | 'earn_referral' | 'spend_ai' | 'spend_marketplace' | 'spend_micabucurie' | 'spend_discount' | 'admin_adjust';
  description: string;
  timestamp: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;
  author: string;
  readTime: string;
  imageUrl: string;
  slug: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'chat' | 'billing' | 'api' | 'security';
}

export interface Address {
  fullName: string;
  address: string;
  city: string;
  country: string;
  zip: string;
  phone: string;
}

export interface TrackingCheckpoint {
  status: string;
  location: string;
  timestamp: string;
  completed: boolean;
}

export interface TrackingInfo {
  carrier?: string;
  trackingNumber: string;
  currentLocation?: string;
  estimatedArrival?: string;
  checkpoints?: TrackingCheckpoint[];
}

export interface DigitalAssetAccess {
  licenseKey: string;
  downloadUrl: string;
  systemPromptPayload: string;
  instructions: string;
  unlockedAt: string;
}

export interface OrderItem {
  id: string;
  title: string;
  price: string;
  quantity: number;
  category: string;
  author: string;
  authorId?: string;
  images?: string[];
  isDigital?: boolean;
}

export interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  taxes: number;
  total: number;
  paymentMethod: string;
  status: 'pending' | 'shipped' | 'delivered' | 'refunded';
  isDigital?: boolean;
  trackingNumber?: string;
  invoiceNumber?: string;
  transactionHash?: string;
  shippingAddress?: Address;
  billingAddress?: Address;
  digitalAccess?: DigitalAssetAccess;
  trackingInfo?: TrackingInfo;
  refundRequested?: boolean;
  buyerUid?: string;
  sellerId?: string;
  sellerName?: string;
}

export interface CartItem {
  id: string;
  title: string;
  price: string;
  category: string;
  author: string;
  authorId?: string;
  quantity: number;
  images: string[];
  savedForLater?: boolean;
  badge?: string;
}

