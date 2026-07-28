/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, HelpCircle, BookOpen, Award, Zap, ShieldCheck, AlertTriangle, 
  Info, Play, ChevronRight, Sparkles, MessageSquare, Compass,
  Coins, Wallet, ShoppingBag, Heart, Shield, Terminal, Settings, 
  User, Database, Image, Mic, Search, Folder, BarChart3, Lock, Trophy, Video
} from 'lucide-react';
import VideoPlayer from './VideoPlayer';

export interface HelpGuideData {
  title: string;
  subtitle: string;
  icon: any;
  description: string;
  videoUrl?: string;
  quickStart: string[];
  beginnerGuide: { title: string; steps: string[] };
  advancedGuide: { title: string; steps: string[] };
  bestPractices: string[];
  faq: { q: string; a: string }[];
  safetyPrivacy?: string;
  accentColor: string;
}

export const HELP_GUIDES: Record<string, HelpGuideData> = {
  chat: {
    title: 'SCUT AI Assistant',
    subtitle: 'High-Performance Generative Intellect',
    icon: Sparkles,
    accentColor: 'text-cyan-400 border-cyan-500/25 bg-cyan-500/5',
    description: 'Your premier workspace for complex coding, natural language orchestration, and contextual memory management. Powered by customized Gemini models.',
    quickStart: [
      'Type your query in the terminal input at the bottom of the screen.',
      'Use prompt folder tags to organize active conversation threads.',
      'Click the favorite star to persist critical prompts in your sidebar.'
    ],
    beginnerGuide: {
      title: 'Beginner Guide: Mastering Conversational Input',
      steps: [
        'Initialize a clean thread by clicking the "+" button in your workspace.',
        'Provide explicit context: State your target framework, constraints, and goal in your prompt.',
        'Use markdown tags for code segments to ensure structured terminal outputs.'
      ]
    },
    advancedGuide: {
      title: 'Advanced Guide: Prompt Engineering & Memory Blocks',
      steps: [
        'Utilize system instructions to lock down specific formatting rules.',
        'Configure the temperature parameter: lower values (0.1 - 0.3) for coding and analytics, higher values (0.7 - 0.9) for creative output.',
        'Chain multiple reasoning blocks together using step-by-step prompt scaffolding.'
      ]
    },
    bestPractices: [
      'Avoid vague or single-word queries; explain your desired outcome.',
      'Regularly archive completed threads to keep memory buffers clean.',
      'Validate generated code blocks in the developers playground before deployment.'
    ],
    faq: [
      { q: 'Is my chat context sent to external third parties?', a: 'No. SCUT AI implements end-to-end sandbox routing. All inputs are evaluated within our secure Cloud infrastructure.' },
      { q: 'Can I import my own custom prompt library?', a: 'Yes. Navigate to the Prompt Library module to save and run custom templates.' }
    ],
    safetyPrivacy: 'End-to-End Encrypted. Chats are isolated within your secure Firebase profile container.'
  },
  scutchat: {
    title: 'SCUT Chat Network',
    subtitle: 'Decentralized Encrypted Messaging',
    icon: MessageSquare,
    accentColor: 'text-blue-400 border-blue-500/25 bg-blue-500/5',
    description: 'Real-time messaging channels for teams, friends, and community circles. Supports instant secure voice nodes and encrypted text protocols.',
    quickStart: [
      'Select or create a public channel from the sidebar list.',
      'Send instant messages using secure peer-to-peer tunnels.',
      'Toggle the privacy lock to start a direct message thread.'
    ],
    beginnerGuide: {
      title: 'Beginner Guide: Launching Channels',
      steps: [
        'Click the "+" icon next to Channels to create a new topic space.',
        'Invite peers by typing their registered SCUT handles.',
        'Customize notification thresholds to avoid conversation fatigue.'
      ]
    },
    advancedGuide: {
      title: 'Advanced Guide: Managing Public & Private Keys',
      steps: [
        'Enable perfect forward secrecy (PFS) inside the chat safety options.',
        'Broadcast announcements to thousands of peers using synchronized webhooks.',
        'Integrate SCUT AI bots directly inside chat channels to trigger smart automated summaries.'
      ]
    },
    bestPractices: [
      'Never share password details or API credentials in any public chat channels.',
      'Keep discussions focused on channel topics to maintain order.',
      'Utilize reaction emojis to express instant feedback and save valuable screen space.'
    ],
    faq: [
      { q: 'Are my chats saved permanently?', a: 'Private direct messages are encrypted in transit. Public channel transcripts are saved securely for community history.' },
      { q: 'How many members can join a single channel?', a: 'Public channels support unlimited peers; private circles are capped at 500 members for performance.' }
    ],
    safetyPrivacy: 'All direct peer-to-peer conversations are fully encrypted using SCUT cryptographic protocols.'
  },
  scutpay: {
    title: 'SCUT Pay Gateway',
    subtitle: 'Enterprise-grade Transactions & Invoices',
    icon: Wallet,
    accentColor: 'text-cyan-400 border-cyan-500/25 bg-cyan-500/5',
    description: 'Secure financial gateway supporting marketplace transactions, wallet balances, and external merchant checkouts.',
    quickStart: [
      'Navigate to SCUT Pay to check your current ledger balance.',
      'Click "Deposit" to top up your account with certified credits.',
      'Use instant scan code or address keys to execute transactions.'
    ],
    beginnerGuide: {
      title: 'Beginner Guide: Managing Wallets',
      steps: [
        'Verify your account tier is active before sending funds.',
        'Deposit funds using any standard credit, debit, or local SCUT voucher.',
        'Generate instant payment receipts for digital tax archives.'
      ]
    },
    advancedGuide: {
      title: 'Advanced Guide: Escrow Contracts & Invoice APIs',
      steps: [
        'Utilize the SCUT Pay API endpoints to integrate checkouts in third-party stores.',
        'Configure automated multi-signature approval triggers for high-volume corporate wallets.',
        'Set up recurring subscription checkouts for software SaaS endpoints.'
      ]
    },
    bestPractices: [
      'Enable multi-factor authorization (MFA) before committing large balances.',
      'Double check recipient wallet addresses and SCUT handles before clicking submit.',
      'Keep transaction descriptions clear to maintain structured financial ledger reports.'
    ],
    faq: [
      { q: 'What are the transaction fees?', a: 'Standard account transfers are 100% free. Commercial merchant checkout services are charged a minor 1.2% flat rate.' },
      { q: 'Is there a limit to how much I can deposit?', a: 'Standard verified tiers can hold up to 50,000 SCUT Credits. Premium tiers have unlimited headroom.' }
    ],
    safetyPrivacy: 'PCI-DSS Compliant. Your payment data is isolated inside bank-grade encrypted database hardware.'
  },
  scuttoken: {
    title: 'SCUT Token Portal',
    subtitle: 'Decentralized Asset & Ecosystem Token',
    icon: Coins,
    accentColor: 'text-amber-400 border-amber-500/25 bg-amber-500/5',
    description: 'The native cryptographic utility asset powering the SCUT ecosystem. Governance, staking yield models, and global gas limits.',
    quickStart: [
      'Inspect your active SCUT Token balance.',
      'Commit tokens to the staking pool to accrue high-yield returns.',
      'Participate in active governance votes for upcoming module designs.'
    ],
    beginnerGuide: {
      title: 'Beginner Guide: Understanding Tokens',
      steps: [
        'Tokens represent digital equity within the SCUT AI developer ecosystem.',
        'Purchase tokens securely using your credit balance on the Exchange widget.',
        'View live market capitalization charts directly within this dashboard.'
      ]
    },
    advancedGuide: {
      title: 'Advanced Guide: Liquidity Provision & Yield',
      steps: [
        'Participate in smart liquidity pools to earn transaction percentage shares.',
        'Review current global gas parameters to optimize transaction execution speed.',
        'Export key transaction histories to standard JSON formats for accounting audits.'
      ]
    },
    bestPractices: [
      'Staking requires a lockup period; ensure you plan liquidity timelines accordingly.',
      'Track historical pricing to make well-informed portfolio adjustments.',
      'Vote on open governance ballots to actively guide the platform progression.'
    ],
    faq: [
      { q: 'How is the token price calculated?', a: 'The token value is derived from active ecosystem demand, transaction volume, and public liquidity pools.' },
      { q: 'Are token rewards distributed automatically?', a: 'Yes, staking yields are distributed directly to your wallet daily at 00:00 UTC.' }
    ],
    safetyPrivacy: 'Protected by distributed ledger security. Secure cryptographic smart contracts regulate reward calculations.'
  },
  credits: {
    title: 'SCUT Credits Hub',
    subtitle: 'On-Demand API & Computational Units',
    icon: Coins,
    accentColor: 'text-blue-400 border-blue-500/25 bg-blue-500/5',
    description: 'Utility tokens used to compute AI models, generate high-resolution images, trigger search spiders, and compile code blocks.',
    quickStart: [
      'Check remaining computing units in the top right header.',
      'Trigger free daily check-in tasks to earn loyalty bonus credits.',
      'Purchase computing credit packs to avoid workspace speed limits.'
    ],
    beginnerGuide: {
      title: 'Beginner Guide: Optimizing Credit Consumptions',
      steps: [
        'Review how many credits each model consumes (e.g. 1 credit per chat, 5 credits per image).',
        'Complete simple learning activities to build credit reserves without cash.',
        'Configure usage alerts so you never run out of units during critical sprints.'
      ]
    },
    advancedGuide: {
      title: 'Advanced Guide: Enterprise Pools & API Allotments',
      steps: [
        'Set up automatic threshold recharges so your production server stays alive.',
        'Allocate sub-credit limits to specific team API keys to monitor contractor usage.',
        'Analyze the computational cost-efficiency of individual prompt structures.'
      ]
    },
    bestPractices: [
      'Choose lighter models (like Gemini-Flash) for simple tasks to conserve units.',
      'Avoid duplicate generation prompts; leverage cache memory blocks.',
      'Claim your daily rewards regularly to consistently grow your operational budget.'
    ],
    faq: [
      { q: 'Do purchased credits expire?', a: 'No, bought packages never expire. Free promotional rewards roll over on a 30-day window.' },
      { q: 'Can I transfer credits to a friend?', a: 'Yes! Send credits instantly via SCUT Pay using their handle.' }
    ],
    safetyPrivacy: 'Ledger tracked. Every single credit event is securely logged in your immutable activity log.'
  },
  marketplace: {
    title: 'Ecosystem Marketplace',
    subtitle: 'High-Fidelity Apps, Prompts & Graphics',
    icon: ShoppingBag,
    accentColor: 'text-cyan-400 border-cyan-500/25 bg-cyan-500/5',
    description: 'The primary marketplace to trade specialized AI agents, prompt packages, visual brand guides, and custom SaaS extensions.',
    quickStart: [
      'Browse featured and trending tools in the Marketplace lobby.',
      'Click "Purchase" using your credits or pay directly via SCUT Pay.',
      'Install downloaded items to your active workspace with one click.'
    ],
    beginnerGuide: {
      title: 'Beginner Guide: Purchasing Securely',
      steps: [
        'Read peer reviews and check seller verification badges before buying.',
        'Download instant zip packages containing prompt definitions or assets.',
        'Contact seller support directly through SCUT Chat if assistance is needed.'
      ]
    },
    advancedGuide: {
      title: 'Advanced Guide: Listing Custom Products',
      steps: [
        'Apply for a Merchant license through the Business Portal page.',
        'Publish digital goods: Configure automated webhook triggers to deliver assets post-purchase.',
        'Optimize listing metadata, search keywords, and promo pricing structures.'
      ]
    },
    bestPractices: [
      'Always test purchased prompts inside the isolated playground before deploying.',
      'Leave constructive reviews to support quality developer products.',
      'Verify refund policies before making significant marketplace commitments.'
    ],
    faq: [
      { q: 'Are listing codes screened for malware?', a: 'Yes. All executable templates and packages undergo extensive static analysis and linter checks.' },
      { q: 'What cut does the marketplace take?', a: 'The platform retains a minimal 8% commission to fund security verification audits.' }
    ],
    safetyPrivacy: 'Sandboxed downloads. Executable code assets run within sandboxed node modules.'
  },
  business: {
    title: 'Business Portal',
    subtitle: 'Corporate Controls & Strategic Operations',
    icon: Compass,
    accentColor: 'text-indigo-400 border-indigo-500/25 bg-indigo-500/5',
    description: 'The administrative command post for enterprise clients. Manage corporate billing, team licenses, merchant credentials, and audit trails.',
    quickStart: [
      'Register your corporate legal entity under the portal directory.',
      'Configure automated billing profiles and team seat sizes.',
      'Review real-time sales curves and operational expenditures.'
    ],
    beginnerGuide: {
      title: 'Beginner Guide: Setting Up Teams',
      steps: [
        'Create your company workspace and generate secure access links.',
        'Assign roles: Administrators, Developers, Billing Admins, or Viewers.',
        'Integrate your corporate identity systems to manage team credentials.'
      ]
    },
    advancedGuide: {
      title: 'Advanced Guide: Merchant Webhooks & Split Routing',
      steps: [
        'Configure immediate payment division triggers (split payouts) among co-founders.',
        'Integrate high-security business APIs to stream transactional ledgers directly to CRM software.',
        'Enforce IP-restricted login panels to protect high-volume business funds.'
      ]
    },
    bestPractices: [
      'Perform monthly reviews of developer access credentials to revoke stale permissions.',
      'Set transactional notification thresholds to instantly catch high-volume activity.',
      'Utilize the unified audit log to verify compliance benchmarks.'
    ],
    faq: [
      { q: 'Can I manage multiple businesses under one login?', a: 'Yes. Create multiple organization entities and switch workspaces from the profile card.' },
      { q: 'How do I export raw CSV files for corporate tax audits?', a: 'Navigate to the billing tab and select target date boundaries to pull full CSV/PDF ledgers.' }
    ],
    safetyPrivacy: 'Corporate Shield active. Complete isolation of intellectual IP and restricted access keys.'
  },
  micabucurie: {
    title: 'Mica Bucurie Portal',
    subtitle: 'Charitable Giving & Mutual Support',
    icon: Heart,
    accentColor: 'text-rose-400 border-rose-500/25 bg-rose-500/5',
    description: 'Our core community social responsibility gateway. Connect with local families, fund food pantries, and sponsor educational supplies.',
    quickStart: [
      'Browse active charitable projects and family wishlists.',
      'Donate computing power, clothing, or small credit sums.',
      'Apply to volunteer in local neighborhood support drives.'
    ],
    beginnerGuide: {
      title: 'Beginner Guide: Making an Impact',
      steps: [
        'Select a verified campaign, such as regional food relief or school supply drives.',
        'Allocate direct credits to fulfill a specific wishlist item.',
        'View real-time photo confirmation updates from local hub coordinators.'
      ]
    },
    advancedGuide: {
      title: 'Advanced Guide: Launching Regional Drives',
      steps: [
        'Submit a coordinator application package to establish a verified hub.',
        'Manage logistics: Track incoming food and supplies using centralized barcode registries.',
        'Publish localized metrics to highlight regional impact and coordinate peer efforts.'
      ]
    },
    bestPractices: [
      'Focus donations on requested wishlist items to maximize relevance.',
      'Respect private information; never publish recipient details publicly.',
      'Invite peers to joint charity drives to multiply community results.'
    ],
    faq: [
      { q: 'Are donations 100% direct?', a: 'Yes. SCUT pays for all regional delivery costs, ensuring every dollar reaches target campaigns.' },
      { q: 'How can I register my family for assistance?', a: 'Click the "Apply for Aid" tab and complete the private regional questionnaire.' }
    ],
    safetyPrivacy: 'Strict safety standards. Personal details are securely locked behind non-disclosure agreements.'
  },
  scutwomen: {
    title: 'SCUT Women & Girls',
    subtitle: 'Empowerment, Healthcare & Professional Network',
    icon: Heart,
    accentColor: 'text-rose-400 border-rose-500/25 bg-rose-500/5',
    description: 'A comprehensive, high-security space focusing on professional mentorship, physical/mental wellness, career pathways, and safe forums.',
    quickStart: [
      'Enter the Women & Girls workspace to view verified mentors.',
      'Toggle "Anonymity Mode" to engage in open community support forums.',
      'Explore active career scholarships and executive training programs.'
    ],
    beginnerGuide: {
      title: 'Beginner Guide: Career Mapping',
      steps: [
        'Create a professional target outline and select a technical field.',
        'Request 1:1 mentorship from experienced female executives in tech.',
        'Join discussions centered around work-life balance and negotiation tactics.'
      ]
    },
    advancedGuide: {
      title: 'Advanced Guide: Developing Mentorship Curriculums',
      steps: [
        'Apply to become a verified mentor and upload structured learning syllabi.',
        'Securely manage scholarship payouts and student progression tracks.',
        'Trigger local high-school STEM outreach programs using decentralized templates.'
      ]
    },
    bestPractices: [
      'Utilize incognito mode if you are discussing sensitive medical or security topics.',
      'Actively support fellow members with constructive career feedback.',
      'Attend virtual networking roundtables to build strong professional circles.'
    ],
    faq: [
      { q: 'Who can access the Women & Girls workspace?', a: 'The workspace is designed for female professionals and students, prioritizing safe space rules.' },
      { q: 'Are healthcare questions confidential?', a: 'Completely. Medical forums are non-indexed and strictly confidential.' }
    ],
    safetyPrivacy: 'Zero-tolerance moderation. State-of-the-art anonymity protection layers.'
  },
  scutmen: {
    title: 'SCUT Men & Boys',
    subtitle: 'Mental Strength, Physical Wellness & Career Coaching',
    icon: Shield,
    accentColor: 'text-blue-400 border-blue-500/25 bg-blue-500/5',
    description: 'A private, professional-grade module centering physical high-performance, mental stress management, corporate advancement, and active peer circles.',
    quickStart: [
      'Log daily workout, sleep, and mood metrics in the Health tab.',
      'Ask Ares AI for high-performance routines and stress-mitigation blocks.',
      'Browse executive coaches and startup leadership tracks.'
    ],
    beginnerGuide: {
      title: 'Beginner Guide: Managing Stress & Vitality',
      steps: [
        'Input baseline sleep and exertion values into the health logger daily.',
        'Select a verified mentor to discuss leadership progression tracks.',
        'Browse local outdoor and community meetups focused on teamwork and health.'
      ]
    },
    advancedGuide: {
      title: 'Advanced Guide: Optimizing Daily Performance Metrics',
      steps: [
        'Synchronize fitness and sleep metrics to identify cognitive stamina trends.',
        'Utilize advanced mental models to navigate fast-paced tech environments.',
        'Coordinate corporate peer groups to support younger engineering professionals.'
      ]
    },
    bestPractices: [
      'Consistently log wellness parameters to maintain realistic habits.',
      'Leverage Ares AI for quick, structured routine suggestions.',
      'Maintain an encouraging, solution-oriented approach in community discussions.'
    ],
    faq: [
      { q: 'Is my wellness log visible to colleagues?', a: 'No. Wellness data is encrypted and visible only within your personal profile dashboard.' },
      { q: 'How do I schedule a chat with an executive coach?', a: 'Request a connection directly through the Mentorship list to activate a secure message thread.' }
    ],
    safetyPrivacy: 'End-to-End Encrypted. Your personal and medical logs are private and secure.'
  },
  developers: {
    title: 'Developer Center',
    subtitle: 'API Keys & Integration Sandbox',
    icon: Terminal,
    accentColor: 'text-cyan-400 border-cyan-500/25 bg-cyan-500/5',
    description: 'Mint API credentials, read SDK integration documentation, inspect system limits, and run diagnostic request tests.',
    quickStart: [
      'Click "Generate Key" to create secure system credentials.',
      'Copy the integration code blocks into your server environment.',
      'Send a diagnostic curl request to verify gateway response times.'
    ],
    beginnerGuide: {
      title: 'Beginner Guide: Generating API Keys',
      steps: [
        'Set an explicit name for your key to easily identify its location.',
        'Copy the key immediately; for security, it is only displayed once.',
        'Begin with standard test endpoints before scaling up requests.'
      ]
    },
    advancedGuide: {
      title: 'Advanced Guide: Webhooks & Production Sprints',
      steps: [
        'Enforce strict CORS policies and IP-range white-lists on your developer keys.',
        'Set absolute usage caps on tokens to protect against infinite request loops.',
        'Integrate stream-based model connections to minimize initial latency.'
      ]
    },
    bestPractices: [
      'Never embed raw API keys in client-side HTML or git repositories.',
      'Rotate keys every 90 days to maintain secure operational benchmarks.',
      'Set alert thresholds to immediately catch unusual request volume.'
    ],
    faq: [
      { q: 'What is the rate limit for standard accounts?', a: 'Standard developer accounts allow 60 requests per minute. Custom business packages offer unlimited headroom.' },
      { q: 'How do I check system response times?', a: 'Real-time latencies are published dynamically on the Analytics Page.' }
    ],
    safetyPrivacy: 'Protected by AES-256 decryption matrices. Revoke compromised keys instantly.'
  },
  dashboard: {
    title: 'Ecosystem Desk',
    subtitle: 'Unified Operational Control Center',
    icon: Database,
    accentColor: 'text-indigo-400 border-indigo-500/25 bg-indigo-500/5',
    description: 'Get an immediate bird\'s-eye view of your entire SCUT profile: recent activities, saved templates, computational balance, and active alerts.',
    quickStart: [
      'Check active notifications and security alert bulletins.',
      'Access your saved conversation shortcuts in the center panel.',
      'Inspect your recent audit logs to track active processes.'
    ],
    beginnerGuide: {
      title: 'Beginner Guide: Customizing Your Desk',
      steps: [
        'Arrange your primary shortcuts to keep your favorite modules handy.',
        'Review current computational balances before launching major tasks.',
        'Familiarize yourself with the system activity feed to verify operations.'
      ]
    },
    advancedGuide: {
      title: 'Advanced Guide: Tracking System Activities',
      steps: [
        'Configure the activity logs to track specific security and API events.',
        'Set up automated task cards for regular system checks.',
        'Analyze long-term usage trends to optimize computational credit spend.'
      ]
    },
    bestPractices: [
      'Regularly review your active alerts to maintain optimal profile health.',
      'Keep your shortcut list clean by removing unused templates.',
      'Familiarize yourself with the audit trail to confirm your data remains secure.'
    ],
    faq: [
      { q: 'Can I customize the widgets visible on my dashboard?', a: 'Yes, customize layout arrangements from your Settings Page.' },
      { q: 'How often does the activity feed update?', a: 'The system feed updates in real-time as processes execute.' }
    ],
    safetyPrivacy: 'Monitored continuously. Secure session data is protected by industry-standard access controls.'
  },
  profile: {
    title: 'Profile Settings',
    subtitle: 'Identity & Professional Credentials',
    icon: User,
    accentColor: 'text-blue-400 border-blue-500/25 bg-blue-500/5',
    description: 'Manage your verified name, public avatars, biography, communication handles, and professional affiliations.',
    quickStart: [
      'Update your profile avatar and displayed username.',
      'Enter your professional background to customize your AI recommendations.',
      'Familiarize yourself with your verified user tier status.'
    ],
    beginnerGuide: {
      title: 'Beginner Guide: Updating Personal Data',
      steps: [
        'Enter your preferred name and professional title in the form fields.',
        'Provide a brief biography to help mentors tailor their feedback.',
        'Review your active subscription status on your profile card.'
      ]
    },
    advancedGuide: {
      title: 'Advanced Guide: Verifying Professional Credentials',
      steps: [
        'Link verified Github or LinkedIn handles to unlock developer tags.',
        'Configure secure email-forwarding options for company communications.',
        'Generate structured resumes formatted specifically for AI screening systems.'
      ]
    },
    bestPractices: [
      'Ensure displayed details reflect your professional background.',
      'Use a high-quality, high-contrast avatar image for visual consistency.',
      'Regularly review linked accounts to keep your profile secure.'
    ],
    faq: [
      { q: 'Is my biography visible to the public?', a: 'No, your biography is kept confidential and visible only to authorized mentors.' },
      { q: 'How do I update my registered email address?', a: 'Navigate to the Security Center to safely update login details.' }
    ],
    safetyPrivacy: 'Your profile information is isolated within encrypted Firebase container systems.'
  },
  settings: {
    title: 'System Settings',
    subtitle: 'System Preferences & Personalization',
    icon: Settings,
    accentColor: 'text-slate-400 border-slate-500/25 bg-slate-500/5',
    description: 'Fine-tune your global ecosystem preferences: language, theme presets, layout setups, and notifications.',
    quickStart: [
      'Select your preferred workspace language (English, Romanian, etc.).',
      'Choose your preferred notification channels and triggers.',
      'Verify active API and security integrations.'
    ],
    beginnerGuide: {
      title: 'Beginner Guide: Customizing Preferences',
      steps: [
        'Select your workspace language to instantly translate all interface labels.',
        'Choose how you want to receive system updates and alerts.',
        'Manage local browser storage caches to maintain performance.'
      ]
    },
    advancedGuide: {
      title: 'Advanced Guide: Custom Styling & Webhook Nodes',
      steps: [
        'Configure external webhook targets to automatically receive alert notifications.',
        'Fine-tune layouts by adjusting standard font sizes and density.',
        'Export full system configurations to a backup JSON file.'
      ]
    },
    bestPractices: [
      'Keep your notification settings tailored to avoid message fatigue.',
      'Clear your browser storage cache regularly to maintain peak interface speeds.',
      'Save configuration backups before executing major system changes.'
    ],
    faq: [
      { q: 'Can I roll back settings to defaults?', a: 'Yes. Click the "Reset to Defaults" button to restore original values instantly.' },
      { q: 'Are settings synchronized across my devices?', a: 'Yes. All configurations are securely backed up inside your active user profile.' }
    ],
    safetyPrivacy: 'Stored securely. System preferences are isolated within your personal workspace profile.'
  },
  admin: {
    title: 'Administrator Console',
    subtitle: 'Ecosystem Controls & Server Diagnostics',
    icon: Shield,
    accentColor: 'text-purple-400 border-purple-500/25 bg-purple-500/5',
    description: 'Available only for verified staff. Monitor user registries, manage support request logs, audit billing ledgers, and check server status.',
    quickStart: [
      'Review the system diagnostics panel to confirm server health.',
      'Audit the global user registry list for outstanding tasks.',
      'Familiarize yourself with the consolidated team support desk.'
    ],
    beginnerGuide: {
      title: 'Beginner Guide: Managing Basic Operations',
      steps: [
        'Check active database connection status to confirm performance.',
        'Review reported user tickets and coordinate technical responses.',
        'Audit general billing ledger states for irregularities.'
      ]
    },
    advancedGuide: {
      title: 'Advanced Guide: Server Controls & IP Blocking',
      steps: [
        'Deploy emergency global security protocols to halt unauthorized requests.',
        'Review specific database records for compliance and performance audits.',
        'Track server request load times to coordinate infrastructure scaling.'
      ]
    },
    bestPractices: [
      'Perform all administrative actions under strict corporate logging.',
      'Regularly back up server diagnostics logs for technical reviews.',
      'Handle sensitive user records in compliance with data privacy standards.'
    ],
    faq: [
      { q: 'Who has access to the Admin Console?', a: 'Only verified platform administrators with explicit credential clearance can access this panel.' },
      { q: 'Are administrator actions logged?', a: 'Yes, all actions are recorded in an immutable, high-security audit log.' }
    ],
    safetyPrivacy: 'Maximum security active. Access requires double-factor authorization and IP validation.'
  },
  analytics: {
    title: 'Analytics Engine',
    subtitle: 'Computational Resource & Usage Metrics',
    icon: BarChart3,
    accentColor: 'text-indigo-400 border-indigo-500/25 bg-indigo-500/5',
    description: 'Track active credit consumption, API response times, model efficiencies, and transaction trends in real-time.',
    quickStart: [
      'Inspect the consumption chart to monitor credit spend over time.',
      'Review average API latencies to confirm developer key speeds.',
      'Familiarize yourself with your active model efficiency trends.'
    ],
    beginnerGuide: {
      title: 'Beginner Guide: Navigating Metrics',
      steps: [
        'Review the credit usage summary to track daily expenditures.',
        'Familiarize yourself with model response metrics to choose efficient systems.',
        'Track daily active request counts to keep your workspace optimized.'
      ]
    },
    advancedGuide: {
      title: 'Advanced Guide: Deep Performance Audits',
      steps: [
        'Analyze request failure rate trends to catch code or network bugs early.',
        'Review specific API endpoint performance to allocate resource bounds.',
        'Generate structured cost-efficiency reports for team financial planning.'
      ]
    },
    bestPractices: [
      'Regularly audit computational spend to avoid unexpected credit consumption.',
      'Utilize lightweight models for simple queries to optimize response speeds.',
      'Track error rates to verify system integrations remain functional.'
    ],
    faq: [
      { q: 'How often are the metric graphs updated?', a: 'All analytics panels render live data, refreshing every 10 seconds.' },
      { q: 'Can I export raw chart datasets?', a: 'Yes. Export data directly using the CSV download button on the Analytics page.' }
    ],
    safetyPrivacy: 'Completely isolated. Metric logs contain zero personal or identifiable user content.'
  },
  image_studio: {
    title: 'AI Image Studio',
    subtitle: 'High-Resolution Visual Synthesis',
    icon: Image,
    accentColor: 'text-cyan-400 border-cyan-500/25 bg-cyan-500/5',
    description: 'Generate production-ready digital artwork, marketing banners, flat vector icons, or photorealistic product mocks using state-of-the-art AI.',
    quickStart: [
      'Type your desired visual scene description in the prompt box.',
      'Select a style preset (e.g. Photorealistic, Cyberpunk, Minimalist Vector).',
      'Click "Generate Image" to render your visual assets instantly.'
    ],
    beginnerGuide: {
      title: 'Beginner Guide: Describing Scenes',
      steps: [
        'Provide high-detail nouns and specify the ambient lighting style (e.g. dramatic neon, soft sunset).',
        'Use style tags to instantly configure the artistic look of your output.',
        'Select the appropriate aspect ratio to fit your website or mobile screen.'
      ]
    },
    advancedGuide: {
      title: 'Advanced Guide: Negative Prompts & Seed Locking',
      steps: [
        'Incorporate negative prompt keywords to explicitly exclude unwanted elements.',
        'Lock specific seed parameters to render consistent modifications of an image.',
        'Chain multiple generations to build cohesive digital brand assets.'
      ]
    },
    bestPractices: [
      'Avoid vague single-word descriptions; paint a comprehensive mental picture.',
      'Experiment with minimalist vector styles for fast UI placeholder graphics.',
      'Save high-resolution generations immediately to build your personal asset library.'
    ],
    faq: [
      { q: 'Do image generations cost computational credits?', a: 'Yes, each standard generation consumes 5 credits to cover backend GPU processing.' },
      { q: 'Can I use generated images commercially?', a: 'Absolutely. You retain 100% ownership and commercial rights of all output graphics.' }
    ],
    safetyPrivacy: 'Safe-content filters active. Standard visual content guidelines are enforced.'
  },
  voice_ai: {
    title: 'AI Voice Forge',
    subtitle: 'Neural Speech & Audio Synthesis',
    icon: Mic,
    accentColor: 'text-blue-400 border-blue-500/25 bg-blue-500/5',
    description: 'Synthesize highly realistic human speech from text, clone vocals securely, and generate immersive ambient audio clips.',
    quickStart: [
      'Type or paste your text transcript in the synthesis input.',
      'Select your preferred voice model preset (e.g., Echo, Nova, Onyx).',
      'Click "Synthesize Audio" to listen or download the MP3 track.'
    ],
    beginnerGuide: {
      title: 'Beginner Guide: Generating Speech',
      steps: [
        'Keep transcripts structured to ensure realistic pronunciation and rhythm.',
        'Select a voice preset that matches your project\'s tone (e.g., professional, friendly).',
        'Download output MP3 tracks directly to your device for easy integration.'
      ]
    },
    advancedGuide: {
      title: 'Advanced Guide: Vocal Tuning & Custom Clones',
      steps: [
        'Adjust pitch, speed, and emotional intensity sliders to fine-tune the delivery.',
        'Utilize custom vocal training clips to securely clone verified voice profiles.',
        'Integrate voice synthesis webhooks to build real-time responsive audio apps.'
      ]
    },
    bestPractices: [
      'Incorporate phonetic punctuation to guide natural pauses and emphasis.',
      'Listen to short preview segments before compiling long text files.',
      'Use professional, high-fidelity source audio files when training voice clones.'
    ],
    faq: [
      { q: 'How many languages are supported?', a: 'The synthesis model supports over 40 languages, complete with regional accents.' },
      { q: 'Can I train a custom voice clone?', a: 'Yes, verified developers can train custom clones in their settings page.' }
    ],
    safetyPrivacy: 'Voice signatures are strictly encrypted. Commercial voice cloning requires identity verification.'
  },
  web_search: {
    title: 'AI Web Search',
    subtitle: 'Live Information Retrieval Hub',
    icon: Search,
    accentColor: 'text-cyan-400 border-cyan-500/25 bg-cyan-500/5',
    description: 'Trigger intelligent search spiders to scrape, analyze, and synthesize real-time data from the open web.',
    quickStart: [
      'Type your search topic in the input field.',
      'Choose a search category preset (e.g., News, Tech Trends, Academic).',
      'Click "Trigger Deep Search" to read compiled and cited results.'
    ],
    beginnerGuide: {
      title: 'Beginner Guide: Query Synthesis',
      steps: [
        'Formulate your queries in natural question format (e.g., "What are the latest developments in solar tech?").',
        'Review the compiled key-insights panel for immediate overviews.',
        'Click the dynamic source citations to read original articles.'
      ]
    },
    advancedGuide: {
      title: 'Advanced Guide: Custom Research Pipelines',
      steps: [
        'Configure the deep research model to scrape specific domains or documentation sites.',
        'Use strict filters to target precise timeframes and data types.',
        'Export cited research papers into cleanly formatted markdown documents.'
      ]
    },
    bestPractices: [
      'Utilize specific terms to isolate highly relevant search results.',
      'Always cross-reference critical data with the cited source links.',
      'Save research logs to quickly access compiled data in future sessions.'
    ],
    faq: [
      { q: 'Are search results updated in real-time?', a: 'Yes, results are fetched directly from live web indexes as you query.' },
      { q: 'How does the system prevent biased synthesis?', a: 'The model cross-references multiple independent sources and highlights conflicting data.' }
    ],
    safetyPrivacy: 'Completely private. Files are isolated inside your personal Firebase storage bucket.'
  },
  wallet: {
    title: 'SCUT Digital Wallet',
    subtitle: 'Asset Custody & Multi-Currency Treasury',
    icon: Wallet,
    accentColor: 'text-cyan-400 border-cyan-500/25 bg-cyan-500/5',
    description: 'Manage crypto tokens, credit reserves, fiat vouchers, and automated payouts in one secure multi-chain wallet.',
    quickStart: [
      'View your combined asset portfolio and transaction history.',
      'Click "Deposit" to top up credit or token reserves.',
      'Generate secure QR codes or public address keys for incoming transfers.'
    ],
    beginnerGuide: {
      title: 'Beginner Guide: Managing Balances',
      steps: [
        'Review your total net balance across credits, tokens, and fiat equivalents.',
        'Set up low-balance alerts to automatically top up operational credits.',
        'Export monthly transaction statements for accounting and reporting.'
      ]
    },
    advancedGuide: {
      title: 'Advanced Guide: Multisig & Cold Keys',
      steps: [
        'Configure multi-signature approval rules for team wallet withdrawals.',
        'Connect Web3 wallet extensions (MetaMask, WalletConnect) for decentralized custody.',
        'Automate instant split-payouts to external vendor wallets upon order fulfillment.'
      ]
    },
    bestPractices: [
      'Double check recipient addresses before confirming transactions.',
      'Enable two-factor authorization on all financial transactions.',
      'Regularly review authorized dApp permissions and revoke unused session keys.'
    ],
    faq: [
      { q: 'Are my funds insured?', a: 'All digital credit assets are backed 1:1 in secure reserve escrow accounts.' },
      { q: 'What is the transaction processing time?', a: 'Internal SCUT transfers complete in under 500ms. On-chain transfers depend on network congestion.' }
    ],
    safetyPrivacy: 'Bank-grade encryption. Private keys remain encrypted client-side and never touch raw server logs.'
  },
  seller_studio: {
    title: 'Seller Studio',
    subtitle: 'Merchant Hub & Digital Store Management',
    icon: ShoppingBag,
    accentColor: 'text-amber-400 border-amber-500/25 bg-amber-500/5',
    description: 'Publish digital products, track sales analytics, manage customer reviews, and automate delivery webhooks.',
    quickStart: [
      'Create a new product listing with custom media, pricing, and tags.',
      'Set up automated file delivery or license key generation post-purchase.',
      'Track real-time sales revenue, conversion rates, and payout history.'
    ],
    beginnerGuide: {
      title: 'Beginner Guide: Creating Listings',
      steps: [
        'Upload high-quality product screenshots and detailed markdown descriptions.',
        'Select your product category (Prompts, AI Apps, Design Assets, Datasets).',
        'Set competitive credit or fiat pricing models to maximize conversion.'
      ]
    },
    advancedGuide: {
      title: 'Advanced Guide: Store Automation & Webhooks',
      steps: [
        'Configure custom fulfillment webhooks to deliver dynamic API keys.',
        'Integrate affiliate tracking links to reward community advocates.',
        'Run A/B pricing experiments to optimize sales conversion rates.'
      ]
    },
    bestPractices: [
      'Maintain clear documentation and quick support response times for buyers.',
      'Regularly update your digital assets to ensure compatibility with latest AI models.',
      'Request buyer feedback to earn verified top-seller badges.'
    ],
    faq: [
      { q: 'When do seller payouts occur?', a: 'Payouts are disbursed automatically every Monday to your SCUT Wallet or bank account.' },
      { q: 'What merchant fee applies?', a: 'Standard merchant accounts incur a low 8% commission fee covering hosting and escrow security.' }
    ],
    safetyPrivacy: 'Merchant Protection Active. Automated DRM and anti-piracy fingerprinting on digital assets.'
  },
  support_center: {
    title: 'Support Center & SLA Desk',
    subtitle: 'Technical Assistance & Ticket Resolution',
    icon: HelpCircle,
    accentColor: 'text-emerald-400 border-emerald-500/25 bg-emerald-500/5',
    description: 'Submit high-priority support tickets, chat with live technical specialists, track open SLA requests, and access system manuals.',
    quickStart: [
      'Search the knowledge base for instant answers to common questions.',
      'Submit a formal support ticket with detailed diagnostic logs.',
      'Track real-time resolution progress and response SLA countdowns.'
    ],
    beginnerGuide: {
      title: 'Beginner Guide: Submitting Tickets',
      steps: [
        'Select the appropriate issue category (Billing, Technical, Account, API).',
        'Provide error messages, steps to reproduce, and screenshot attachments.',
        'Receive automated status notifications as engineers work on your request.'
      ]
    },
    advancedGuide: {
      title: 'Advanced Guide: Priority SLA & Dedicated Engineers',
      steps: [
        'Enterprise clients receive guaranteed < 15 minute SLA response windows.',
        'Escalate critical production outages directly to on-call infrastructure leads.',
        'Schedule live video diagnostic sessions with senior platform architects.'
      ]
    },
    bestPractices: [
      'Include relevant account IDs and transaction hashes in initial tickets.',
      'Check system status dashboards before reporting network incidents.',
      'Keep contact information updated to receive urgent resolution SMS alerts.'
    ],
    faq: [
      { q: 'What are support desk operating hours?', a: 'Our global engineer network operates 24 hours a day, 7 days a week, 365 days a year.' },
      { q: 'How do I escalate an urgent issue?', a: 'Select "High Priority / System Outage" on the ticket form to alert on-call staff.' }
    ],
    safetyPrivacy: 'GDPR & HIPAA compliant support ticket logs. All attached logs are auto-purged after 30 days.'
  },
  sports_hub: {
    title: 'Sports & Athletics Hub',
    subtitle: 'Performance Tracking & Community Events',
    icon: Trophy,
    accentColor: 'text-cyan-400 border-cyan-500/25 bg-cyan-500/5',
    description: 'Track athletic training sessions, organize regional sports tournaments, log workout telemetry, and connect with fitness mentors.',
    quickStart: [
      'Log workout routines, running metrics, or team match scores.',
      'Join local community sports leagues and upcoming tournaments.',
      'Get AI-powered athletic nutrition and workout recovery plans.'
    ],
    beginnerGuide: {
      title: 'Beginner Guide: Fitness Logging',
      steps: [
        'Connect wearable devices or manually enter session duration and intensity.',
        'Track personal records (PRs) across running, swimming, cycling, and weightlifting.',
        'Participate in monthly community athletic challenges to earn reward badges.'
      ]
    },
    advancedGuide: {
      title: 'Advanced Guide: Tournament Management',
      steps: [
        'Create single-elimination or round-robin tournament brackets for local leagues.',
        'Manage team rosters, player statistics, and referee score verifications.',
        'Stream live match updates and broadcast leaderboard rankings to community feeds.'
      ]
    },
    bestPractices: [
      'Log sessions consistently to allow AI algorithms to optimize rest intervals.',
      'Stay hydrated and follow proper warm-up protocols before high-intensity events.',
      'Encourage sportsmanship and fair play across all community match forums.'
    ],
    faq: [
      { q: 'Can I sync Garmin or Strava data?', a: 'Yes! Connect external fitness apps in Settings to auto-import workout activities.' },
      { q: 'Are sports challenges free to enter?', a: 'All community challenges are free, with bonus rewards for top ranking athletes.' }
    ],
    safetyPrivacy: 'Health telemetry encrypted. GPS routes are blurred near home locations to protect athlete privacy.'
  },
  rewards: {
    title: 'Rewards & Loyalty Portal',
    subtitle: 'Missions, Badges & Daily Airdrops',
    icon: Award,
    accentColor: 'text-amber-400 border-amber-500/25 bg-amber-500/5',
    description: 'Earn bonus credits, unlock exclusive platform badges, complete daily learning missions, and claim promotional rewards.',
    quickStart: [
      'Claim your daily check-in bonus credits every 24 hours.',
      'Complete daily learning sprints and community tasks to earn XP.',
      'Redeem accumulated reward points for free computational credit packages.'
    ],
    beginnerGuide: {
      title: 'Beginner Guide: Earning XP & Badges',
      steps: [
        'Log in daily to build an active streak and multiply reward multipliers.',
        'Complete profile setup tasks and complete introductory academy guides.',
        'Share platform feedback and invite colleagues to earn referral bonuses.'
      ]
    },
    advancedGuide: {
      title: 'Advanced Guide: Season Passes & Leaderboards',
      steps: [
        'Participate in quarterly hackathons and prompt design sprints for major credit prize pools.',
        'Climb global community leaderboards to unlock VIP developer privileges and beta features.',
        'Redeem rare digital collectable NFT badges tied to ecosystem milestones.'
      ]
    },
    bestPractices: [
      'Check in daily to avoid breaking your streak bonus multiplier.',
      'Focus on high-XP quests in modules you want to master.',
      'Redeem credit vouchers before monthly expiration windows.'
    ],
    faq: [
      { q: 'Do reward credits expire?', a: 'Daily check-in credits roll over on a 30-day window; purchased credits never expire.' },
      { q: 'How are leaderboard ranks calculated?', a: 'Ranks combine daily mission completions, community contributions, and academy achievements.' }
    ],
    safetyPrivacy: 'Automated fraud protection. Botting or multi-accounting results in immediate reward disqualification.'
  },
  messages: {
    title: 'Ecosystem Messaging & Direct Chats',
    subtitle: 'Private Peer Communications & Encrypted Channels',
    icon: MessageSquare,
    accentColor: 'text-blue-400 border-blue-500/25 bg-blue-500/5',
    description: 'Instant end-to-end encrypted messaging, group channels, voice notes, and file sharing with community peers.',
    quickStart: [
      'Start a direct thread with any verified user or mentor.',
      'Share code snippets, attachments, or voice notes securely.',
      'Toggle notification preferences to customize alert sounds and badges.'
    ],
    beginnerGuide: {
      title: 'Beginner Guide: Messaging Controls',
      steps: [
        'Search for contacts by SCUT handle or email address.',
        'Use markdown formatting for code blocks and bold text emphasis.',
        'React to messages with emoji feedback to acknowledge receipt.'
      ]
    },
    advancedGuide: {
      title: 'Advanced Guide: Group Threads & AI Bot Integration',
      steps: [
        'Create invite-only group channels with custom administrative permissions.',
        'Tag @SCUTAI inside any chat thread to invoke instant AI summaries or code generation.',
        'Configure self-destructing timed messages for high-privacy technical discussions.'
      ]
    },
    bestPractices: [
      'Never send raw passwords or secret API keys in unencrypted message channels.',
      'Use code blocks for technical snippets to preserve indentation and readability.',
      'Respect peer quiet hours and timezones when sending direct messages.'
    ],
    faq: [
      { q: 'Are direct messages encrypted?', a: 'Yes. All direct peer-to-peer chats use end-to-end encryption protocols.' },
      { q: 'Can I delete messages after sending?', a: 'You can edit or delete your messages at any time for both sender and recipient.' }
    ],
    safetyPrivacy: 'End-to-end encrypted. Messages cannot be read by platform intermediaries or unauthenticated clients.'
  },
  notifications: {
    title: 'Notifications & Alerts Center',
    subtitle: 'System Communications & Activity Feeds',
    icon: Info,
    accentColor: 'text-cyan-400 border-cyan-500/25 bg-cyan-500/5',
    description: 'Manage real-time system alerts, transaction confirmations, security warnings, and message notifications.',
    quickStart: [
      'Review unread notifications in your central inbox.',
      'Filter alerts by category (Security, Billing, Social, System).',
      'Mark notifications as read or clear completed activity alerts.'
    ],
    beginnerGuide: {
      title: 'Beginner Guide: Managing Inbox',
      steps: [
        'Click on notification cards to jump directly to the relevant module.',
        'Customize email and browser push notification toggles in Settings.',
        'Set up quiet hours to mute non-essential social notifications during work hours.'
      ]
    },
    advancedGuide: {
      title: 'Advanced Guide: Webhooks & Emergency SMS',
      steps: [
        'Configure custom webhook endpoints to forward security alerts to Slack or Discord.',
        'Enable SMS alerts for urgent account security incidents or large financial transfers.',
        'Programmatically consume notification feeds via the Developer API.'
      ]
    },
    bestPractices: [
      'Keep security notifications enabled at all times.',
      'Review billing alerts immediately to prevent service disruptions.',
      'Clear read notifications weekly to maintain an organized workspace.'
    ],
    faq: [
      { q: 'How long are notifications saved?', a: 'Notification history is preserved for 90 days in your account feed.' },
      { q: 'Can I disable email digests?', a: 'Yes. Toggle off email digests in your Profile Settings at any time.' }
    ],
    safetyPrivacy: 'Strict privacy controls. Notification payloads contain no sensitive cryptographic keys.'
  }
};

interface HelpOverlayProps {
  moduleKey: string;
  onClose: () => void;
}

export function ModuleHelpOverlay({ moduleKey, onClose }: HelpOverlayProps) {
  const guide = HELP_GUIDES[moduleKey];
  const [activeSubTab, setActiveSubTab] = useState<'quick' | 'guides' | 'faq' | 'safety'>('quick');

  if (!guide) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full relative text-center space-y-4">
          <HelpCircle className="h-12 w-12 text-slate-500 mx-auto animate-pulse" />
          <h3 className="text-sm font-bold text-white">Guide is Under Construction</h3>
          <p className="text-xs text-slate-400">Our engineers are compiling the structured guide for this module. Check back shortly!</p>
          <button onClick={onClose} className="px-4 py-2 bg-slate-850 rounded-xl text-xs font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer">Close Panel</button>
        </div>
      </div>
    );
  }

  const Icon = guide.icon;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-slate-900 border border-slate-850 rounded-3xl p-6 sm:p-8 max-w-3xl w-full relative space-y-6 shadow-2xl my-8"
      >
        {/* CLOSE ACTION BUTTON */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          id="close-help-overlay"
        >
          <X className="h-4 w-4" />
        </button>

        {/* HERO TITLE */}
        <div className="flex items-start gap-4">
          <div className={`p-4 rounded-2xl border ${guide.accentColor} shrink-0`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-cyan-400 bg-cyan-500/10 border border-cyan-500/15 px-1.5 py-0.5 rounded">SCUT Academy</span>
              <span className="text-[10px] font-mono text-slate-500">v2026.7.19</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white mt-1.5">{guide.title}</h2>
            <p className="text-xs text-slate-400 font-medium font-mono">{guide.subtitle}</p>
          </div>
        </div>

        {/* DESCRIPTION SUMMARY */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/50 border border-slate-900/60 p-4 rounded-2xl">
          {guide.description}
        </p>

        {/* NAVIGATION INNER SUB-TABS */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1.5 border-b border-slate-850 scrollbar-thin">
          {[
            { id: 'quick', label: 'Quick Start', icon: Zap },
            { id: 'guides', label: 'Beginner & Advanced Guides', icon: BookOpen },
            { id: 'faq', label: 'FAQs & Best Practices', icon: Info },
            { id: 'safety', label: 'Safety & Privacy', icon: ShieldCheck }
          ].map((tab) => {
            const TabIcon = tab.icon;
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all border cursor-pointer ${
                  active 
                    ? 'bg-cyan-500/10 border-cyan-500/35 text-cyan-400 font-bold' 
                    : 'bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                <TabIcon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* SUBTAB CONTENTS */}
        <div className="min-h-[200px] text-xs">
          {activeSubTab === 'quick' && (
            <div className="space-y-6">
              {/* Video Tutorial Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                  <Video className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Module Video Tutorial ({guide.title})</span>
                </div>
                <VideoPlayer 
                  url={guide.videoUrl || 'https://www.youtube.com/embed/L_LUpnjgPso'}
                  title={`How to use ${guide.title}`}
                  description={`Interactive video guide covering features, workflow and capabilities for ${guide.title}.`}
                  className="max-w-3xl mx-auto shadow-lg"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                  <Play className="h-3.5 w-3.5 text-cyan-400 fill-cyan-400/10" />
                  <span>Quick Start Instructions</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {guide.quickStart.map((step, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-950/40 border border-slate-900 flex flex-col gap-2">
                      <span className="font-mono text-[10px] font-bold text-cyan-500">STEP 0{idx + 1}</span>
                      <p className="text-slate-300 leading-relaxed font-medium">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'guides' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Beginner Guide */}
              <div className="space-y-3.5 p-5 rounded-2xl bg-slate-950/30 border border-slate-900/60">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 flex items-center justify-center font-mono text-[10px] font-bold">A</div>
                  <h4 className="text-xs font-bold text-emerald-400">{guide.beginnerGuide.title}</h4>
                </div>
                <ul className="space-y-2.5">
                  {guide.beginnerGuide.steps.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-300 leading-relaxed">
                      <ChevronRight className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Advanced Guide */}
              <div className="space-y-3.5 p-5 rounded-2xl bg-slate-950/30 border border-slate-900/60">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/15 flex items-center justify-center font-mono text-[10px] font-bold">B</div>
                  <h4 className="text-xs font-bold text-cyan-400">{guide.advancedGuide.title}</h4>
                </div>
                <ul className="space-y-2.5">
                  {guide.advancedGuide.steps.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-300 leading-relaxed">
                      <ChevronRight className="h-4 w-4 text-cyan-500 shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          )}

          {activeSubTab === 'faq' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* FAQ items */}
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                  <span>Frequently Asked Questions</span>
                </div>
                <div className="space-y-3">
                  {guide.faq.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-900 space-y-1.5">
                      <p className="font-bold text-slate-100 flex items-center gap-1">
                        <span className="text-cyan-400 font-mono">Q.</span> {item.q}
                      </p>
                      <p className="text-slate-400 leading-relaxed">{item.a}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Best practices list */}
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                  <span>Operational Best Practices</span>
                </div>
                <div className="p-5 rounded-2xl bg-cyan-950/[0.04] border border-cyan-500/10 space-y-3">
                  {guide.bestPractices.map((bp, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <Award className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                      <p className="text-slate-300 leading-relaxed font-semibold">{bp}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {activeSubTab === 'safety' && (
            <div className="space-y-4">
              <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                <span>Security Protocol & Privacy Protections</span>
              </div>
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-900/80 space-y-4">
                <div className="flex items-center gap-2.5 text-amber-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-bold font-mono text-[10px] uppercase tracking-wider">Confidential Clearance</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">
                  {guide.safetyPrivacy || 'Standard SCUT End-to-End Encryption active. Your queries, transaction records, and logs are isolated within your profile.'}
                </p>
                <div className="pt-3 border-t border-slate-900 text-[10px] text-slate-500 flex items-center justify-between">
                  <span>Encryption Standard: AES-256 GCM</span>
                  <span>Compliance Standard: GDPR-ready</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="pt-4 border-t border-slate-850 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>Need custom enterprise consulting?</span>
          <button 
            onClick={() => {
              onClose();
              window.location.hash = 'contact';
            }}
            className="text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer underline"
          >
            Contact Platform Support
          </button>
        </div>

      </motion.div>
    </div>
  );
}
