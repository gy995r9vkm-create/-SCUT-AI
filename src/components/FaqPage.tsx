/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "What is SCUT AI?",
      answer: "SCUT AI is a high-performance developer workspace and conversational playground built to connect users directly to Google's next-generation multimodal Gemini model weights securely. We combine premium user interfaces with server-side proxy handlers to protect secrets."
    },
    {
      question: "How does the real Google Gemini API connection work?",
      answer: "We employ a secure full-stack architecture. Your prompt queries, image base64s, and file attachments are sent securely to our server endpoint (POST /api/chat). This handler initializes the official Google GenAI SDK using process.env.GEMINI_API_KEY, meaning your private API secrets are never exposed to browser inspectors or client scripts."
    },
    {
      question: "Are my chats or data used to train AI models?",
      answer: "Absolutely not. On our Business and Enterprise tiers, we enforce a strict Zero Data Training agreement. All inquiries proxied through our API endpoints bypass model weights training cycles."
    },
    {
      question: "How do I upgrade my billing tier?",
      answer: "Simply navigate to the Subscription portal. Select your desired plan (Pro or Business) to open the Stripe Checkout form simulator. Complete the checkout simulation using the mock credentials provided, and your limits will upgrade instantly."
    },
    {
      question: "What file attachments are supported inside chat?",
      answer: "We support image attachments (JPEG, PNG, WEBP) which are converted into inline base64 data parts and processed directly by Gemini's vision weights, as well as text attachments (.txt, .json, code files) which are extracted on the client side and appended as formatted code blocks within the query structure."
    },
    {
      question: "Can I generate developer keys to connect from my terminal?",
      answer: "Yes. Pro and Business subscribers have full access to our API key manager console. You can mint custom secret keys, monitor real-time invocation counts, and copy integration code snippets for Python, Node.js, and cURL CLI."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-2.5 py-1 rounded-md">
            Product Knowledge Base
          </span>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white leading-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-slate-400 font-light leading-relaxed">
            Quickly audit details about our secure Gemini API proxies, multi-model playgrounds, and Stripe elements billing cycles.
          </p>
        </div>

        {/* Interactive Accordion FAQs */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div 
                key={i}
                className="rounded-2xl border border-slate-850 bg-slate-900/20 overflow-hidden transition-colors hover:border-cyan-500/20"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-semibold text-white focus:outline-none cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="h-4.5 w-4.5 text-cyan-400 shrink-0" />
                    {faq.question}
                  </span>
                  {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-5 pb-5 pt-1 border-t border-slate-850 text-xs text-slate-400 leading-relaxed font-light whitespace-pre-line">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
