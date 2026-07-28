/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, HelpCircle, ShieldCheck, CornerDownLeft, MessageSquare, AlertCircle } from 'lucide-react';
import { saveSupportTicket } from '../lib/db';
import { User } from '../types';
import { auth } from '../lib/firebase';

interface ContactPageProps {
  user?: User | null;
}

export default function ContactPage({ user }: ContactPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('Technical Issue');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [ticketId, setTicketId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.email) setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    // 1. Validate required fields
    if (!trimmedName) {
      setError("Please provide your full name.");
      setIsSubmitting(false);
      return;
    }

    if (!trimmedEmail) {
      setError("Please provide a valid email address.");
      setIsSubmitting(false);
      return;
    }

    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setError("Please enter a valid email address (e.g., user@example.com).");
      setIsSubmitting(false);
      return;
    }

    if (!trimmedMessage) {
      setError("Please enter a description of your issue or question.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Get logged-in user UID or null
      const currentUserId = auth.currentUser?.uid || null;

      // 1. Save ticket in Firebase Firestore (under support_tickets)
      const createdId = await saveSupportTicket({
        name: trimmedName,
        email: trimmedEmail,
        category,
        message: trimmedMessage,
        userId: currentUserId
      });

      setTicketId(createdId);

      // 2. Trigger the automated emails to admin and user via server API
      try {
        const response = await fetch('/api/support', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: trimmedName,
            email: trimmedEmail,
            category,
            message: trimmedMessage,
            ticketId: createdId
          })
        });

        if (!response.ok) {
          console.warn("Server email notification endpoint returned non-200, ticket was safely saved in Firestore.");
        }
      } catch (emailErr) {
        console.warn("Support email API call exception:", emailErr);
      }

      setIsSubmitting(false);
      setSuccess(true);
      
      // Clear message, keep name and email if user is logged in
      setMessage('');
      if (!user) {
        setName('');
        setEmail('');
      }
    } catch (err: any) {
      console.error("Support submission error:", err);
      setError(err.message || "Something went wrong creating your ticket. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-2.5 py-1 rounded-md">
            Dedicated SLA Channel
          </span>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white leading-tight">
            Get in Touch with SCUT Support
          </h1>
          <p className="text-sm text-slate-400 font-light leading-relaxed">
            Need custom Enterprise SLA contracts or experiencing token playground questions? Contact our developer-first support network.
          </p>
        </div>

        {/* Contact Form & info cards */}
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Side stats/support channels */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-slate-900/30 border border-slate-850 p-6 space-y-4">
              <h3 className="font-display text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-cyan-400" /> Channel SLAs
              </h3>
              <div className="space-y-2.5 text-xs text-slate-400 leading-relaxed font-light">
                <p><b>Free tier</b>: Community Forum & documentation support only.</p>
                <p><b>Pro tier</b>: Email support under 24h average.</p>
                <p><b>Business tier</b>: SLA contract support under 1h response guarantee.</p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900/30 border border-slate-850 p-6 space-y-4">
              <h3 className="font-display text-sm font-bold text-white flex items-center gap-2">
                <Mail className="h-4 w-4 text-cyan-400" /> Direct Address
              </h3>
              <p className="text-xs text-slate-400 font-light leading-relaxed">
                Send manual support queries directly to:<br />
                <a href="mailto:echipa@romaniacurajoasa.info" className="font-bold text-cyan-300 hover:underline">echipa@romaniacurajoasa.info</a>
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2 rounded-2xl bg-slate-900/40 border border-slate-850 p-6 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-24 w-24 bg-cyan-500/[0.01] rounded-bl-full pointer-events-none" />
            
            <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-cyan-400" /> Create Support Ticket
            </h3>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success ? (
              <div className="py-8 text-center space-y-4">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/5">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-display font-bold text-lg text-white">Support Ticket Created!</h4>
                  {ticketId && (
                    <p className="text-xs font-mono font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-lg inline-block">
                      Ref #{ticketId}
                    </p>
                  )}
                </div>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Your ticket has been registered in our support queue. An automated email confirmation was sent to your inbox, and our engineering desk has been notified.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSuccess(false);
                      setTicketId(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
                  >
                    Submit Another Query
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/60"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/60"
                  >
                    <option value="Technical Issue">Technical Issue</option>
                    <option value="Billing & Pricing">Billing & Pricing</option>
                    <option value="Enterprise SLA contract">Enterprise SLA contract</option>
                    <option value="Feature Suggestion">Feature Suggestion</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Describe Issue / Query</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide details of your query..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/60 resize-none leading-relaxed"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl font-display font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>Submit Ticket <CornerDownLeft className="h-3.5 w-3.5" /></>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
