/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, MapPin, Users, Plus, X, CheckCircle, Clock,
  ArrowRight, Landmark, Laptop, Video, ShieldCheck, Wallet
} from 'lucide-react';
import { addToCart } from '../../lib/cart';

interface EventProps {
  onAddLog: (action: string, details: string, type: any) => Promise<void>;
  onPayWithWallet?: (amount: string, description: string) => void;
  onNavigate?: (page: string) => void;
  showToast: (msg: string) => void;
}

interface MeetupEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'In-person' | 'Online';
  category: 'Meetup' | 'Webinar' | 'Workshop' | 'Conference';
  price: string;
  organizer: string;
  capacity: number;
  registeredCount: number;
  joined: boolean;
}

export default function WomenEvents({ onAddLog, onPayWithWallet, onNavigate, showToast }: EventProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'in-person' | 'online' | 'workshop'>('all');
  const [addedCartProduct, setAddedCartProduct] = useState<any | null>(null);
  
  // Local events state
  const [events, setEvents] = useState<MeetupEvent[]>([
    {
      id: 'ev-1',
      title: "Bucharest Women Tech founders Meetup",
      date: "Aug 12, 2026",
      time: "18:30 EEST",
      location: "SCUT Bucharest Creative Hub",
      type: "In-person",
      category: "Meetup",
      price: "50 RON",
      organizer: "Irina Popa",
      capacity: 40,
      registeredCount: 28,
      joined: false
    },
    {
      id: 'ev-2',
      title: "Financial Independence & Portfolio Sprints",
      date: "Aug 15, 2026",
      time: "19:00 EEST",
      location: "Zoom Secured Link",
      type: "Online",
      category: "Webinar",
      price: "Free",
      organizer: "Elena Radulescu",
      capacity: 500,
      registeredCount: 345,
      joined: true
    },
    {
      id: 'ev-3',
      title: "London Diaspora Female Leadership Summit",
      date: "Aug 22, 2026",
      time: "09:30 GMT",
      location: "Sheraton Kensington Hall",
      type: "In-person",
      category: "Conference",
      price: "180 RON",
      organizer: "Romanian London Club",
      capacity: 150,
      registeredCount: 112,
      joined: false
    },
    {
      id: 'ev-4',
      title: "Organic Skincare Formulation Workshop",
      date: "Aug 25, 2026",
      time: "17:00 EEST",
      location: "Munich Bio Labs",
      type: "In-person",
      category: "Workshop",
      price: "90 RON",
      organizer: "Dr. Maria Cosmetologist",
      capacity: 25,
      registeredCount: 18,
      joined: false
    }
  ]);

  // Create Event Form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newType, setNewType] = useState<'In-person' | 'Online'>('In-person');
  const [newCategory, setNewCategory] = useState<'Meetup' | 'Webinar' | 'Workshop' | 'Conference'>('Meetup');
  const [newPrice, setNewPrice] = useState('Free');
  const [newOrganizer, setNewOrganizer] = useState('');
  const [newCapacity, setNewCapacity] = useState('50');

  const handleJoinEvent = async (event: MeetupEvent) => {
    if (event.joined) {
      // Leave
      setEvents(prev => prev.map(ev => ev.id === event.id ? { ...ev, joined: false, registeredCount: ev.registeredCount - 1 } : ev));
      showToast(`Cancelled reservation for "${event.title}".`);
      onAddLog('Cancelled Event RSVP', `Left meetup: ${event.title}`, 'chat');
      return;
    }

    if (event.price !== 'Free') {
      await addToCart({
        id: event.id,
        title: `RSVP Ticket: ${event.title}`,
        price: event.price.replace(/[^0-9.]/g, '') || '10.00',
        author: event.organizer,
        category: 'events',
        images: ['https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&auto=format&fit=crop&q=80'],
        acceptedCurrencies: ['scut_token', 'crypto_pol', 'crypto_matic', 'crypto_usdc', 'crypto_usdt', 'card'],
        quantity: 1,
        savedForLater: false,
        isDigital: true,
        details: `${event.date} at ${event.time} - ${event.location}`
      });
      setAddedCartProduct({ title: `RSVP Ticket: ${event.title}`, price: event.price });
    } else {
      showToast(`RSVP Ticket secured! Confirmed details sent to your registered inbox.`);
    }

    setEvents(prev => prev.map(ev => ev.id === event.id ? { ...ev, joined: true, registeredCount: ev.registeredCount + 1 } : ev));
    onAddLog('RSVP Secured', `Joined event: ${event.title}`, 'chat');
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate.trim() || !newLocation.trim() || !newOrganizer.trim()) {
      showToast("Please fill in all the required event parameters.");
      return;
    }

    const newEv: MeetupEvent = {
      id: 'event-' + Math.random().toString(36).substring(2, 9),
      title: newTitle,
      date: newDate,
      time: newTime || "19:00 EEST",
      location: newLocation,
      type: newType,
      category: newCategory,
      price: newPrice,
      organizer: newOrganizer,
      capacity: parseInt(newCapacity) || 50,
      registeredCount: 1,
      joined: true
    };

    setEvents([newEv, ...events]);
    setShowAddModal(false);
    
    // Clear
    setNewTitle('');
    setNewDate('');
    setNewTime('');
    setNewLocation('');
    setNewOrganizer('');
    
    showToast(`Successfully organized "${newTitle}" meetup!`);
    onAddLog('Organized Community Event', `Created new event slot: ${newTitle}`, 'billing');
  };

  const filteredEvents = activeFilter === 'all' 
    ? events 
    : activeFilter === 'in-person' 
      ? events.filter(e => e.type === 'In-person')
      : activeFilter === 'online'
        ? events.filter(e => e.type === 'Online')
        : events.filter(e => e.category === 'Workshop');

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-rose-50/40 via-[#fff0f2]/30 to-[#fdf2f4]/40 border border-rose-200/40 shadow-sm relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-gradient-to-br from-pink-300/10 to-rose-400/5 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 text-[10px] font-bold uppercase tracking-widest">Global Gathering</span>
              <Calendar className="h-4.5 w-4.5 text-rose-400 animate-pulse" />
            </div>
            <h2 className="text-3xl font-display font-extrabold text-[#3b1c24] tracking-tight">Meetups & Conferences</h2>
            <p className="text-xs text-[#694e55] max-w-xl leading-relaxed">
              Organize and attend safe meetups, local workshops across the diaspora, Webinars, and conferences. Secure entry passes via SCUT Pay.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4.5 py-2.5 bg-[#3b1c24] hover:bg-black text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-950/10"
            >
              <Plus className="h-4 w-4" /> Organize Event
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Filters */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#3b1c24] uppercase tracking-wider flex items-center gap-2">
            <Clock className="h-4.5 w-4.5 text-rose-500 animate-pulse" />
            Upcoming Schedules
          </h3>

          <div className="flex gap-1">
            {[
              { id: 'all', label: 'All schedules' },
              { id: 'in-person', label: 'Local Meetups' },
              { id: 'online', label: 'Webinars & Online' },
              { id: 'workshop', label: 'Workshops' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase border cursor-pointer whitespace-nowrap transition-all ${
                  activeFilter === f.id 
                    ? 'bg-rose-500 text-white border-rose-500' 
                    : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEvents.map(event => (
            <div key={event.id} className="bg-white border border-slate-100 rounded-3xl p-6.5 shadow-[0_15px_45px_rgba(243,212,217,0.04)] flex flex-col justify-between space-y-5">
              <div className="space-y-3.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono font-bold text-rose-500 uppercase tracking-widest bg-rose-50 px-2.5 py-0.5 rounded">
                    {event.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase font-mono">
                    {event.type === 'Online' ? <Laptop className="h-3.5 w-3.5" /> : <Landmark className="h-3.5 w-3.5" />}
                    <span>{event.type}</span>
                  </div>
                </div>

                <h4 className="text-sm font-black text-[#3b1c24] leading-snug">{event.title}</h4>

                <div className="space-y-2 pt-2 text-xs font-semibold text-[#694e55]">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-rose-400" />
                    <span>{event.date} • {event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-400 truncate max-w-[280px]" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                    <Users className="h-4 w-4" />
                    <span>Organizer: {event.organizer} • Capacity: {event.registeredCount}/{event.capacity} seats reserved</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                <span className="text-sm font-black text-[#3b1c24] font-mono">{event.price}</span>

                <button
                  onClick={() => handleJoinEvent(event)}
                  className={`px-4.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
                    event.joined 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-[#3b1c24] hover:bg-black text-white'
                  }`}
                >
                  {event.joined ? (
                    <>
                      <CheckCircle className="h-3.5 w-3.5" /> Secured Seat
                    </>
                  ) : (
                    <>
                      {event.price === 'Free' ? 'RSVP Ticket' : 'Book Ticket'} <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE EVENT MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full rounded-3xl bg-white border border-rose-100 p-6 space-y-5 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#3b1c24] uppercase tracking-wider">Organize Local Gathering</h3>
                <p className="text-[11px] text-slate-400">Design an event entry point for safe community interactions.</p>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-3.5 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-mono text-slate-400">Meetup Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Cluj Startup Mentorship Meetup"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2 text-[#3b1c24] focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-mono text-slate-400">Event Type</label>
                    <select
                      value={newType}
                      onChange={e => setNewType(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-2 py-2 text-[#3b1c24] focus:outline-none"
                    >
                      <option value="In-person">In-person</option>
                      <option value="Online">Online</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-mono text-slate-400">Category</label>
                    <select
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-2 py-2 text-[#3b1c24] focus:outline-none"
                    >
                      <option value="Meetup">Meetup</option>
                      <option value="Webinar">Webinar</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Conference">Conference</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-mono text-slate-400">Date Slot</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Aug 18, 2026"
                      value={newDate}
                      onChange={e => setNewDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-[#3b1c24] focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-mono text-slate-400">Time Slot</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 19:00 EEST"
                      value={newTime}
                      onChange={e => setNewTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-[#3b1c24] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-mono text-slate-400">Address / Location Link</label>
                  <input 
                    type="text" 
                    placeholder="e.g. London Lounge or Zoom Link"
                    value={newLocation}
                    onChange={e => setNewLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-[#3b1c24] focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[9px] uppercase font-mono text-slate-400">Your Name (Organizer)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Adina Dumitru"
                      value={newOrganizer}
                      onChange={e => setNewOrganizer(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-[#3b1c24] focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-mono text-slate-400">Ticket Price</label>
                    <input 
                      type="text" 
                      placeholder="Free or e.g. 60 RON"
                      value={newPrice}
                      onChange={e => setNewPrice(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-[#3b1c24] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#3b1c24] hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Publish Secure Meetup Event
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Added to Cart Choice Modal */}
      <AnimatePresence>
        {addedCartProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAddedCartProduct(null)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white border border-rose-100 rounded-3xl p-6 shadow-2xl z-10 space-y-4 text-center">
              <div className="h-12 w-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-base font-bold text-[#3b1c24]">Added to Shopping Cart!</h3>
                <p className="text-xs font-bold text-rose-600">{addedCartProduct.title} ({addedCartProduct.price})</p>
                <p className="text-[11px] text-slate-500 font-medium">Ticket saved to your cart and synchronized with your account in Firestore.</p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => setAddedCartProduct(null)}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer hover:bg-slate-200"
                >
                  Continue Browsing
                </button>
                <button
                  onClick={() => {
                    setAddedCartProduct(null);
                    localStorage.setItem('scut_marketplace_view', 'cart');
                    window.dispatchEvent(new Event('scut_cart_changed'));
                    if (onNavigate) onNavigate('marketplace');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs cursor-pointer shadow-md"
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
