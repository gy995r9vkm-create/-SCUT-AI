/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, User, ChevronRight, X, ArrowLeft, Calendar, Tag } from 'lucide-react';
import { BlogPost } from '../types';

export default function BlogPage() {
  const [activePost, setActivePost] = useState<BlogPost | null>(null);

  const posts: BlogPost[] = [
    {
      id: "1",
      title: "Unleashing Gemini 2.5 Flash: Next-Gen Speed",
      excerpt: "An in-depth analysis on why Google's newest 2.5 Flash model weights deliver sub-50ms text completions without sacrificing structural coding context.",
      category: "Model Audits",
      date: "July 12, 2026",
      author: "Sarah Jenkins",
      readTime: "4 min read",
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      slug: "gemini-2.5-flash-latency-audit",
      content: `The development of low-latency AI weights has hit a milestone with Google's Gemini 2.5 Flash. Developers are increasingly moving away from heavy, slow models for active user-facing chat apps in favor of rapid response times.

Our internal testing shows an average response latency of only 42ms when proxied through SCUT AI's Express pipeline. This is a 3x speed improvement over legacy systems.

### What makes 2.5 Flash so fast?
1. **Model Distillation**: Distilled parameter matrices optimize mathematical handoffs during token calculation.
2. **Dense Attention**: Enhanced attention mechanisms capture complete system prompts and attached document histories without triggering performance bottlenecks.

Integrate Gemini 2.5 Flash inside your workspace today by provisioning an API secret from the console.`
    },
    {
      id: "2",
      title: "Securing Client Inputs: Full-Stack Proxy Architectures",
      excerpt: "Explore the security details behind our server-side Express handlers. Learn why hiding API secrets prevents critical browser network breaches.",
      category: "Security",
      date: "July 08, 2026",
      author: "Alex Rivers",
      readTime: "6 min read",
      imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
      slug: "securing-client-inputs-proxy-architecture",
      content: `A massive flaw in many modern client-only React templates is the leakage of private API credentials. Storing Stripe secrets or Gemini API keys inside client-side bundles (even inside process.env variables) exposes them to simple inspections.

### The SCUT AI Blueprint
At SCUT AI, we protect your credentials using a robust full-stack container design:
- Client forms capture prompt structures and optional media.
- Data is securely dispatched to a private server route: \`POST /api/chat\`.
- The Node.js server appends the secret token securely from private system environments, executing queries completely out of view of the client.

This standard production-ready architecture ensures your applications are hardened against unauthorized access.`
    },
    {
      id: "3",
      title: "Building Real-Time Multimodal Workspaces with Tailwind v4",
      excerpt: "How we leveraged Tailwind's custom CSS imports and transition utilities to design a high-contrast cyan-themed ChatGPT rival.",
      category: "Front-end Design",
      date: "July 02, 2026",
      author: "David Lee",
      readTime: "5 min read",
      imageUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
      slug: "multimodal-workspaces-tailwindcss-v4",
      content: `Visual quality and responsive visual density are core metrics of a premium AI SaaS app. In this article, we cover why we adopted custom CSS modules and glassmorphic panels inside SCUT AI.

### Defining CSS Variables
We loaded "Outfit" display typography and mapped cyan neon glows using simple tailwind class integrations.
Using semi-transparent panels:
\`\`\`css
.glass-panel {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(6, 182, 212, 0.15);
}
\`\`\`

The result is a distinctive visual style that instantly conveys quality to visitors.`
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-2.5 py-1 rounded-md">
            Insights & Guides
          </span>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white leading-tight">
            The SCUT Tech Feed
          </h1>
          <p className="text-sm text-slate-400 font-light leading-relaxed">
            Stay ahead of artificial intelligence engineering breakthroughs, security protocols, front-end designs, and Gemini API optimization logs.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!activePost ? (
            // POSTS INDEX FEED
            <motion.div 
              key="index"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid md:grid-cols-3 gap-8"
            >
              {posts.map((post) => (
                <div 
                  key={post.id}
                  className="rounded-2xl bg-slate-900/30 border border-slate-850 overflow-hidden group flex flex-col hover:border-cyan-500/30 transition-all cursor-pointer"
                  onClick={() => setActivePost(post)}
                >
                  {/* Thumbnail Image */}
                  <div className="h-48 overflow-hidden bg-slate-950 border-b border-slate-850 relative">
                    <img 
                      src={post.imageUrl} 
                      alt={post.title} 
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 text-[9px] font-bold text-cyan-400 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded uppercase border border-cyan-500/10">
                      {post.category}
                    </span>
                  </div>

                  {/* Text details */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex gap-4 text-[10px] text-slate-500 font-medium">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {post.date}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {post.readTime}</span>
                      </div>
                      <h3 className="font-display text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-xs text-slate-400 font-light leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>

                    <span className="text-[11px] font-bold text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1 mt-2">
                      Read Complete Article <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            // ARTICLE DETAIL READ VIEW
            <motion.div 
              key="detail"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-3xl mx-auto rounded-3xl bg-slate-900/30 border border-slate-800 p-6 md:p-10 space-y-8"
            >
              {/* Back controls */}
              <button
                onClick={() => setActivePost(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" /> Back to News Feed
              </button>

              <div className="space-y-4">
                <span className="inline-block text-[9px] font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded uppercase tracking-wider">
                  {activePost.category}
                </span>
                <h2 className="font-display text-2xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  {activePost.title}
                </h2>
                
                {/* Meta details bar */}
                <div className="flex items-center gap-6 text-xs text-slate-500 pt-2 border-y border-slate-850 py-3">
                  <span className="flex items-center gap-1.5"><User className="h-4 w-4" /> {activePost.author}</span>
                  <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {activePost.date}</span>
                  <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {activePost.readTime}</span>
                </div>
              </div>

              {/* Full Article Content */}
              <div className="text-slate-300 text-sm md:text-base leading-relaxed font-light whitespace-pre-line space-y-4 prose prose-invert">
                {activePost.content}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
