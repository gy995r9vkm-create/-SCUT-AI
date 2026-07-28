/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, HeartPulse, Sparkles, Smile, HelpCircle, 
  CheckCircle, Play, Pause, RefreshCw, Eye, EyeOff, Lock,
  ArrowRight, ShieldCheck, Flame, BookOpen, Music, Volume2,
  Stethoscope, Info, Activity, AlertTriangle
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

interface HealthLog {
  date: string;
  mood: 'Calm' | 'Energetic' | 'Tired' | 'Anxious' | 'Joyful';
  hydration: number; // in Liters
  sleepHours: number;
  periodDay?: number;
}

interface WomenWellnessProps {
  onAddLog: (action: string, details: string, type: 'chat' | 'billing' | 'api' | 'security') => Promise<void>;
  showToast: (msg: string) => void;
}

interface YogaPose {
  id: string;
  name: string;
  sanskrit: string;
  benefit: string;
  duration: number; // seconds
  steps: string[];
  image: string;
}

export default function WomenWellness({ onAddLog, showToast }: WomenWellnessProps) {
  const [activeSubTab, setActiveSubTab] = useState<'cycle' | 'breathing' | 'yoga' | 'stress' | 'health' | 'sexual'>('cycle');

  // Predictive cycle states
  const [cycleLength, setCycleLength] = useState(28);
  const [cycleDay, setCycleDay] = useState(14);

  // Hydration & sleep log states
  const [newLog, setNewLog] = useState<{ mood: 'Calm' | 'Energetic' | 'Tired' | 'Anxious' | 'Joyful'; hydration: number; sleepHours: number }>({
    mood: 'Calm',
    hydration: 2.0,
    sleepHours: 8.0
  });

  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([
    { date: 'Jul 17', mood: 'Calm', hydration: 2.2, sleepHours: 8.5 },
    { date: 'Jul 16', mood: 'Tired', hydration: 1.8, sleepHours: 6.0 },
    { date: 'Jul 15', mood: 'Energetic', hydration: 2.5, sleepHours: 7.5 },
    { date: 'Jul 14', mood: 'Joyful', hydration: 3.0, sleepHours: 9.0 }
  ]);

  // Breathing Trainer States
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathTimer, setBreathTimer] = useState(4); // 4-7-8 method
  const breathIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Yoga states
  const [activePose, setActivePose] = useState<YogaPose | null>(null);
  const [poseTimer, setPoseTimer] = useState(0);
  const [isPoseRunning, setIsPoseRunning] = useState(false);
  const poseIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Stress relief quotes / triggers
  const [stressScale, setStressScale] = useState(5);
  const [activeSound, setActiveSound] = useState<string | null>(null);

  // Women's Health & Sexual Health Sub-states
  const [selectedHealthSection, setSelectedHealthSection] = useState<'menstrual' | 'pregnancy' | 'fertility' | 'menopause' | 'breast' | 'nutrition' | 'mental' | 'exercise'>('menstrual');
  const [selectedSexualSection, setSelectedSexualSection] = useState<'consent' | 'relationships' | 'contraception' | 'stis' | 'wellness' | 'anatomy' | 'faq' | 'myths'>('consent');
  
  // Pregnancy due date
  const [lastPeriodDate, setLastPeriodDate] = useState('2026-05-10');
  
  // Breast self exam interactive checklist status
  const [breastStepsDone, setBreastStepsDone] = useState<boolean[]>([false, false, false, false, false]);
  
  // Menopause symptom severity ratings
  const [menopauseSymptoms, setMenopauseSymptoms] = useState<Record<string, number>>({
    hotFlashes: 3,
    sleepIssues: 4,
    moodShifts: 2,
    fatigue: 3,
    jointStiffness: 2
  });

  // Myths vs Facts state
  const [revealedMyths, setRevealedMyths] = useState<Record<number, boolean>>({});

  // Discussion starter generator state
  const [activeStarterIndex, setActiveStarterIndex] = useState(0);

  const calculatePregnancyStats = () => {
    const lmpDate = new Date(lastPeriodDate);
    if (isNaN(lmpDate.getTime())) return null;
    const edd = new Date(lmpDate.getTime() + 280 * 24 * 60 * 60 * 1000);
    const today = new Date();
    const diffTime = today.getTime() - lmpDate.getTime();
    const diffDays = Math.floor(diffTime / (24 * 60 * 60 * 1000));
    const currentWeek = Math.floor(diffDays / 7);
    const remainingDays = diffDays % 7;
    const daysToBirth = Math.max(0, 280 - diffDays);
    return {
      edd: edd.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      week: currentWeek,
      days: remainingDays,
      daysToBirth,
      trimester: currentWeek <= 13 ? 1 : currentWeek <= 26 ? 2 : 3
    };
  };

  const mythsData = [
    {
      id: 1,
      myth: "Vaginal douching is a healthy practice for intimate hygiene.",
      fact: "Myth! The vagina is self-cleaning. Douching disrupts the natural pH and vaginal microbiome, increasing the risk of bacterial vaginosis (BV), yeast infections, and pelvic inflammatory disease (PID). Wash only the external vulva with warm water."
    },
    {
      id: 2,
      myth: "You cannot get pregnant during your menstrual period.",
      fact: "Myth! While unlikely, it is entirely possible. Sperm can survive in the female reproductive tract for up to 5 days, and if a woman has a short cycle, ovulation can occur shortly after her period ends."
    },
    {
      id: 3,
      myth: "Using two condoms at once provides double the protection.",
      fact: "Myth! Using two condoms simultaneously increases friction between the latex layers, making them far more likely to tear or break. Always use a single condom correctly with a water-based or silicone lubricant."
    },
    {
      id: 4,
      myth: "Oral sex does not transmit Sexually Transmitted Infections (STIs).",
      fact: "Myth! Many STIs, including herpes (HSV), HPV, gonorrhea, syphilis, and chlamydia, can be transmitted via oral sex to the throat or genitals. Dual protection like dental dams or condoms is recommended."
    }
  ];

  const discussionStarters = [
    "What does physical and emotional safety mean to you in our relationship?",
    "How can we improve our daily check-in communication to feel more connected?",
    "Let's talk about our boundaries and what makes us feel respected and valued.",
    "How can we better support each other's emotional or mental health during busy weeks?",
    "Are there things we should change about how we talk to each other when we have disagreements?"
  ];

  const consentScenarios = [
    {
      scenario: "Your partner agreed to an intimate activity last week, so they are automatically consenting today.",
      isValid: false,
      explanation: "Incorrect! Consent is continuous and must be given every single time. Prior consent does not imply future agreement. Always check in."
    },
    {
      scenario: "Your partner remains quiet or passive during intimacy without explicitly saying 'no'.",
      isValid: false,
      explanation: "Incorrect! Silence, passivity, or freeze-responses do not equal consent. Consent must be active, enthusiastic, and freely given."
    },
    {
      scenario: "Both partners actively communicate what they feel comfortable with, are fully conscious, and enthusiastically agree.",
      isValid: true,
      explanation: "Correct! This is active, voluntary, enthusiastic, and informed consent. Both partners are equal participants."
    }
  ];

  const yogaPoses: YogaPose[] = [
    {
      id: 'y-1',
      name: "Child’s Pose",
      sanskrit: "Balasana",
      benefit: "Calms the nervous system, relieves back tension, and grounds your cognitive flow.",
      duration: 60,
      steps: [
        "Kneel on the floor, toes touching, knees apart to the width of your shoulders.",
        "Fold your torso forward over your thighs, resting your forehead on your yoga mat.",
        "Extend arms fully in front of you, palms facing down, sinking hips back to heels.",
        "Take long, slow deep breaths, expanding the back body with oxygen."
      ],
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&auto=format&fit=crop&q=80"
    },
    {
      id: 'y-2',
      name: "Cobra Pose",
      sanskrit: "Bhujangasana",
      benefit: "Strengthens shoulder girdles, expands lung capacity, and activates physical energy.",
      duration: 45,
      steps: [
        "Lie flat on your stomach with hands flat under your shoulders, elbows close to ribs.",
        "Press tops of your feet and thighs firmly down into your mat.",
        "Inhale and slowly lift your chest off the floor, keeping your pubic bone grounded.",
        "Roll shoulders down and back, broadening the collarbone while breathing deep."
      ],
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&auto=format&fit=crop&q=80"
    },
    {
      id: 'y-3',
      name: "Legs-Up-The-Wall Pose",
      sanskrit: "Viparita Karani",
      benefit: "Promotes lymphatic circulation, improves sleep quality, and lowers physical stress metrics.",
      duration: 120,
      steps: [
        "Position your hips close to a solid wall, sitting sideways.",
        "Gently swing your legs up onto the wall while lowering your shoulders to the floor.",
        "Rest your tailbone flat on the mat, arms resting open at your sides.",
        "Relax every muscle, allowing gravity to gently drain pooled tension from legs."
      ],
      image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&auto=format&fit=crop&q=80"
    }
  ];

  // Physiological calculations
  const computeCycleMetrics = () => {
    const half = Math.floor(cycleLength / 2);
    if (cycleDay <= 5) {
      return { status: "Menstrual Phase", desc: "Energy levels are naturally lowest. Prioritize active rest, warm herbal teas, and gentle stretching." };
    } else if (cycleDay <= half - 2) {
      return { status: "Follicular Phase", desc: "Estrogen is climbing, boosting mental recall and physical endurance. Ideal for strategic planning." };
    } else if (cycleDay <= half + 1) {
      return { status: "Ovulatory Phase", desc: "Hormones peak. Natural social charisma, peak communication skills, and highest muscle performance index." };
    } else {
      return { status: "Luteal Phase", desc: "Progesterone dominates. Shift focus to steady endurance, calming sleep triggers, and highly grounding nutrition." };
    }
  };
  const cycleStatus = computeCycleMetrics();

  // Breathing loop handler
  useEffect(() => {
    if (isBreathing) {
      breathIntervalRef.current = setInterval(() => {
        setBreathTimer(prev => {
          if (prev <= 1) {
            // Transition phases
            if (breathPhase === 'Inhale') {
              setBreathPhase('Hold');
              return 7;
            } else if (breathPhase === 'Hold') {
              setBreathPhase('Exhale');
              return 8;
            } else {
              setBreathPhase('Inhale');
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
    }
    return () => {
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
    };
  }, [isBreathing, breathPhase]);

  // Yoga countdown timer handler
  useEffect(() => {
    if (isPoseRunning && poseTimer > 0) {
      poseIntervalRef.current = setInterval(() => {
        setPoseTimer(prev => {
          if (prev <= 1) {
            setIsPoseRunning(false);
            showToast(`Completed yoga posture holding block! Balance restored.`);
            onAddLog('Yoga Session Complete', `Held posture for recommended window`, 'chat');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (poseIntervalRef.current) clearInterval(poseIntervalRef.current);
    }
    return () => {
      if (poseIntervalRef.current) clearInterval(poseIntervalRef.current);
    };
  }, [isPoseRunning, poseTimer]);

  const toggleSound = (sound: string) => {
    if (activeSound === sound) {
      setActiveSound(null);
      showToast("Paused ambient sound wave.");
    } else {
      setActiveSound(sound);
      showToast(`Now streaming local ambient "${sound}" therapeutic wave...`);
    }
  };

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-rose-50/40 via-[#fff0f2]/30 to-[#fdf2f4]/40 border border-rose-200/40 shadow-sm relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-gradient-to-br from-pink-300/10 to-rose-400/5 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 text-[10px] font-bold uppercase tracking-widest">Self Care</span>
              <HeartPulse className="h-4.5 w-4.5 text-rose-400 animate-pulse" />
            </div>
            <h2 className="text-3xl font-display font-extrabold text-[#3b1c24] tracking-tight">Wellness, Sleep & Health</h2>
            <p className="text-xs text-[#694e55] max-w-xl leading-relaxed">
              Track physiological cycle phases securely, master 4-7-8 breathing therapies, stream offline soundscapes, and unlock professional posture guides.
            </p>
          </div>
          
          <div className="flex items-center gap-1.5 p-1 bg-white/60 border border-rose-100 rounded-2xl shadow-sm overflow-x-auto max-w-full">
            {[
              { id: 'cycle', label: 'Cycle Tracker' },
              { id: 'breathing', label: 'Breathing Zen' },
              { id: 'yoga', label: 'Yoga Postures' },
              { id: 'stress', label: 'Stress Management' },
              { id: 'health', label: 'Health Center' },
              { id: 'sexual', label: 'Sexual Health' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase cursor-pointer whitespace-nowrap transition-all ${
                  activeSubTab === tab.id 
                    ? 'bg-[#3b1c24] text-white' 
                    : 'bg-transparent text-slate-500 hover:text-[#3b1c24]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* CYCLE TRACKER & LOCAL MOOD LOG */}
        {activeSubTab === 'cycle' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Predictive Dial Phase */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6.5 space-y-6 shadow-[0_15px_45px_rgba(243,212,217,0.1)] flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">Predictive Cycle Engine</h3>
                <p className="text-xs text-[#694e55] mt-1 leading-relaxed">Adjust logs below to compute physiological parameters locally.</p>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono font-medium">
                    <span className="text-slate-500">Typical Cycle Length</span>
                    <span className="text-rose-500 font-bold">{cycleLength} Days</span>
                  </div>
                  <input 
                    type="range" 
                    min={21} 
                    max={35}
                    value={cycleLength}
                    onChange={e => {
                      setCycleLength(Number(e.target.value));
                      if (cycleDay > Number(e.target.value)) setCycleDay(Number(e.target.value));
                    }}
                    className="w-full accent-rose-500 cursor-pointer h-1 bg-rose-100 rounded-lg appearance-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono font-medium">
                    <span className="text-slate-500">Current Day of Cycle</span>
                    <span className="text-pink-500 font-bold">Day {cycleDay}</span>
                  </div>
                  <input 
                    type="range" 
                    min={1} 
                    max={cycleLength}
                    value={cycleDay}
                    onChange={e => setCycleDay(Number(e.target.value))}
                    className="w-full accent-pink-500 cursor-pointer h-1 bg-rose-100 rounded-lg appearance-none"
                  />
                </div>
              </div>

              {/* Interactive glowing visual ring */}
              <div className="p-5 rounded-2xl bg-gradient-to-tr from-[#fffbfe] to-[#fff5f7] border border-rose-100 flex flex-col items-center justify-center text-center space-y-3.5 relative shadow-inner">
                <div className="relative h-24 w-24 rounded-full border-4 border-dashed border-rose-100 flex items-center justify-center shadow-lg shadow-rose-100/50">
                  <div className="absolute inset-2 rounded-full border border-rose-200/60 flex flex-col items-center justify-center p-2 bg-white">
                    <span className="text-[9px] text-slate-400 font-bold font-mono uppercase">Day</span>
                    <span className="text-2xl font-black text-rose-500 leading-none">{cycleDay}</span>
                    <span className="text-[8px] text-slate-400 font-mono mt-0.5">of {cycleLength}</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-bold text-[#3b1c24] px-2.5 py-1 rounded-full bg-white border border-rose-100 shadow-sm inline-block">
                    {cycleStatus.status}
                  </span>
                  <p className="text-[11px] text-[#694e55] leading-relaxed mt-2 font-light">{cycleStatus.desc}</p>
                </div>
              </div>
            </div>

            {/* Log Symptom Parameter Form */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6.5 flex flex-col justify-between shadow-[0_15px_45px_rgba(243,212,217,0.1)]">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-black text-[#3b1c24]">Log Sandbox Symptoms</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">Save health metrics without compromising privacy.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-mono text-[#694e55] tracking-wider font-bold">Current Mood Indicator</label>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {['Calm', 'Energetic', 'Tired', 'Anxious', 'Joyful'].map(moodOption => (
                        <button
                          key={moodOption}
                          onClick={() => setNewLog({ ...newLog, mood: moodOption as any })}
                          className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${newLog.mood === moodOption ? 'bg-rose-500 border-rose-500 text-white shadow-sm shadow-rose-200' : 'bg-white border-slate-200/80 text-slate-500 hover:border-rose-300'}`}
                        >
                          {moodOption}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-slate-500">Water Consumption</span>
                      <span className="text-rose-500 font-bold">{newLog.hydration} Liters</span>
                    </div>
                    <input 
                      type="range" 
                      min={0.5} 
                      max={4.0} 
                      step={0.1}
                      value={newLog.hydration}
                      onChange={e => setNewLog({ ...newLog, hydration: Number(e.target.value) })}
                      className="w-full accent-rose-400 cursor-pointer h-1 bg-rose-50 rounded-lg"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-pink-500 font-bold">Sleep Duration</span>
                      <span className="text-pink-500 font-bold">{newLog.sleepHours} Hours</span>
                    </div>
                    <input 
                      type="range" 
                      min={3} 
                      max={12} 
                      step={0.5}
                      value={newLog.sleepHours}
                      onChange={e => setNewLog({ ...newLog, sleepHours: Number(e.target.value) })}
                      className="w-full accent-pink-400 cursor-pointer h-1 bg-rose-50 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={() => {
                  const addedLog: HealthLog = {
                    date: 'Jul ' + (18 + healthLogs.length),
                    mood: newLog.mood,
                    hydration: newLog.hydration,
                    sleepHours: newLog.sleepHours,
                    periodDay: cycleDay
                  };
                  setHealthLogs([addedLog, ...healthLogs]);
                  onAddLog('Symptom Log Updated', `Saved local symptom file: sleep ${newLog.sleepHours}h, hydration ${newLog.hydration}L`, 'chat');
                  showToast("Symptom log filed securely on device cache.");
                }}
                className="w-full py-3.5 rounded-xl bg-[#3b1c24] hover:bg-black text-white font-bold text-xs tracking-wider uppercase cursor-pointer transition-all mt-6 shadow-md"
              >
                Save Secure Entry Log
              </button>
            </div>

            {/* Recharts Analytics Chart */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6.5 space-y-4 flex flex-col justify-between shadow-[0_15px_45px_rgba(243,212,217,0.1)]">
              <div>
                <h3 className="text-sm font-black text-[#3b1c24]">Confidential Sleep Cycles</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">Dynamic sleep patterns from local storage logs.</p>
              </div>

              <div className="h-40 w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-2 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[...healthLogs].reverse()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f2dbe0" opacity={0.5} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} />
                    <YAxis stroke="#94a3b8" fontSize={9} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#ebd0d5', borderRadius: '12px', fontSize: '11px', color: '#3b1c24' }} />
                    <Area type="monotone" dataKey="sleepHours" stroke="#f43f5e" strokeWidth={2} fillOpacity={0.15} fill="url(#colorSleepGradient)" />
                    <defs>
                      <linearGradient id="colorSleepGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5 text-[11px] text-[#694e55] leading-relaxed">
                <span className="font-bold text-rose-500 block">Ecosystem Health Intelligence:</span>
                <p>Your sleep statistics indicate balanced neural restoration. Hydrate regularly during Creative Follicular Windows for peak cognitive performance.</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* MEDITATION & BREATHING ZEN */}
        {activeSubTab === 'breathing' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="max-w-2xl mx-auto bg-white border border-slate-100 rounded-3xl p-8 shadow-[0_15px_45px_rgba(243,212,217,0.1)] text-center space-y-8"
          >
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[#3b1c24] flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-rose-500 animate-pulse" />
                4-7-8 Pranayama Breathing Therapy
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Relieve nervous fatigue, reduce cortisol indices, and oxygenate system registers. Match the expanding wave circle.
              </p>
            </div>

            {/* Expanding Circle Visual */}
            <div className="flex items-center justify-center h-52 relative">
              <div className="absolute inset-0 bg-rose-500/5 filter blur-3xl rounded-full" />
              
              {/* Outer wave glow ring */}
              <motion.div 
                animate={{
                  scale: !isBreathing ? 1 : breathPhase === 'Inhale' ? 1.5 : breathPhase === 'Hold' ? 1.5 : 1,
                  opacity: !isBreathing ? 0.2 : breathPhase === 'Inhale' ? 0.6 : breathPhase === 'Hold' ? 0.7 : 0.2
                }}
                transition={{ duration: breathPhase === 'Inhale' ? 4 : breathPhase === 'Hold' ? 7 : 8, ease: 'easeInOut' }}
                className="absolute h-40 w-40 rounded-full border border-rose-300 bg-rose-50"
              />

              {/* Core interactive bubble */}
              <motion.div 
                animate={{
                  scale: !isBreathing ? 1 : breathPhase === 'Inhale' ? 1.3 : breathPhase === 'Hold' ? 1.3 : 1
                }}
                transition={{ duration: breathPhase === 'Inhale' ? 4 : breathPhase === 'Hold' ? 7 : 8, ease: 'easeInOut' }}
                className="relative h-28 w-28 rounded-full bg-gradient-to-br from-[#3b1c24] to-[#1e0e12] text-white flex flex-col items-center justify-center shadow-xl border border-rose-950/20"
              >
                <span className="text-[10px] font-mono font-bold text-rose-300 uppercase tracking-widest">
                  {isBreathing ? breathPhase : 'Ready'}
                </span>
                <span className="text-3xl font-black">{isBreathing ? breathTimer : 'Go'}</span>
                <span className="text-[9px] text-slate-400 font-mono mt-1">{isBreathing ? 'seconds' : 'start'}</span>
              </motion.div>
            </div>

            {/* Instruction Banner */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 max-w-sm mx-auto">
              <p className="text-xs text-[#3b1c24] font-semibold">
                {breathPhase === 'Inhale' && "🌬️ Inhale deeply through nose (4s) - filling lungs..."}
                {breathPhase === 'Hold' && "🧘 Hold breath (7s) - stabilizing cellular oxygen..."}
                {breathPhase === 'Exhale' && "💨 Exhale slowly through mouth (8s) - venting fatigue..."}
              </p>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  if (isBreathing) {
                    setIsBreathing(false);
                    setBreathPhase('Inhale');
                    setBreathTimer(4);
                  } else {
                    setIsBreathing(true);
                    setBreathPhase('Inhale');
                    setBreathTimer(4);
                    onAddLog('Breathing Exercise Started', 'Initiated 4-7-8 deep breathing block', 'chat');
                  }
                }}
                className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer shadow-lg transition-all ${
                  isBreathing 
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/10' 
                    : 'bg-[#3b1c24] hover:bg-black text-white shadow-[#3b1c24]/10'
                }`}
              >
                {isBreathing ? 'Pause Breathing' : 'Start Zen Loop'}
              </button>
            </div>
          </motion.div>
        )}

        {/* YOGA POSTURES */}
        {activeSubTab === 'yoga' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Posture List */}
            <div className="lg:col-span-1 space-y-4">
              <div className="p-1 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-1.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase p-3 pb-1 tracking-wider">Select Posture Alignment</span>
                {yogaPoses.map(pose => (
                  <button
                    key={pose.id}
                    onClick={() => {
                      setActivePose(pose);
                      setPoseTimer(pose.duration);
                      setIsPoseRunning(false);
                    }}
                    className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                      activePose?.id === pose.id 
                        ? 'bg-rose-500/10 border-rose-200 text-rose-800' 
                        : 'bg-white border-transparent text-slate-600 hover:bg-slate-100/50'
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-bold">{pose.name}</h4>
                      <span className="text-[10px] font-mono italic text-slate-400">{pose.sanskrit}</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#3b1c24] bg-white px-2 py-0.5 rounded-lg border border-slate-100">{pose.duration}s</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Posture Detail & Countdown Timer */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {activePose ? (
                  <motion.div 
                    key={activePose.id}
                    initial={{ opacity: 0, scale: 0.98 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="bg-white border border-slate-100 rounded-3xl p-6.5 shadow-[0_15px_45px_rgba(243,212,217,0.1)] space-y-6"
                  >
                    <div className="flex flex-col md:flex-row justify-between gap-4 pb-4 border-b border-slate-100">
                      <div>
                        <span className="text-[9px] font-mono font-bold text-rose-500 uppercase">{activePose.sanskrit}</span>
                        <h3 className="text-lg font-bold text-[#3b1c24]">{activePose.name}</h3>
                        <p className="text-xs text-slate-500 mt-1">{activePose.benefit}</p>
                      </div>

                      {/* Timer Widget */}
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-4 self-start md:self-auto">
                        <div className="text-center">
                          <span className="text-[9px] font-mono text-slate-400 uppercase block">Hold Window</span>
                          <span className="text-xl font-black font-mono text-rose-500">{poseTimer}s</span>
                        </div>
                        <button
                          onClick={() => {
                            if (isPoseRunning) {
                              setIsPoseRunning(false);
                            } else {
                              setIsPoseRunning(true);
                              onAddLog('Yoga Hold Started', `Began hold of ${activePose.name}`, 'chat');
                            }
                          }}
                          className={`p-2.5 rounded-xl font-bold text-xs text-white ${isPoseRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'} cursor-pointer`}
                        >
                          {isPoseRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="rounded-2xl overflow-hidden h-44 border border-slate-100">
                        <img referrerPolicy="no-referrer" src={activePose.image} alt={activePose.name} className="w-full h-full object-cover" />
                      </div>

                      <div className="space-y-3.5">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Step-by-Step Alignment</h4>
                        <ol className="text-xs text-[#3b1c24] space-y-2.5 list-decimal pl-5 font-medium leading-relaxed">
                          {activePose.steps.map((st, i) => (
                            <li key={i}>{st}</li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-full min-h-[250px] border border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-6 text-center text-slate-400">
                    <Heart className="h-10 w-10 text-rose-300 animate-pulse mb-3" />
                    <span className="text-xs font-semibold text-slate-500">Select a posture on the left to load alignment details.</span>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* STRESS MANAGEMENT & SLEEP SOUNDS */}
        {activeSubTab === 'stress' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Mood Scale assessment */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6.5 shadow-[0_15px_45px_rgba(243,212,217,0.1)] space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">Stress Assessment</h3>
                <h4 className="text-xs font-bold text-[#3b1c24]">Self-Rated Cortisol Indicator</h4>
                <p className="text-xs text-slate-500 leading-relaxed">Rate your current cognitive load to balance cellular reserves.</p>

                <div className="space-y-2.5 pt-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-emerald-500">Calm/Centered</span>
                    <span className="text-red-500">High Fatigue</span>
                  </div>
                  <input 
                    type="range" 
                    min={1} 
                    max={10}
                    value={stressScale}
                    onChange={e => setStressScale(Number(e.target.value))}
                    className="w-full accent-[#3b1c24] cursor-pointer h-1.5 bg-rose-100 rounded-lg appearance-none"
                  />
                  <div className="text-center text-xs font-bold text-[#3b1c24] bg-slate-50 py-1.5 rounded-lg">
                    Current Rating: <span className="text-rose-500 font-black">{stressScale} / 10</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-rose-500/5 rounded-2xl border border-rose-500/10 text-xs text-[#3b1c24] leading-relaxed font-semibold">
                {stressScale <= 4 && "🌿 Your cognitive registers are balanced. Excellent window for deep analytical courses and technical sprint works."}
                {stressScale > 4 && stressScale <= 7 && "🧘 Moderate load detected. Take a 5-minute break. Inhale lavender oils and hydrate with lemon botanical water."}
                {stressScale > 7 && "🚨 Alert: Critical fatigue index. We recommend launching a 4-7-8 Breathing zen loop immediately. Silence communications."}
              </div>
            </div>

            {/* Offline Healing Soundscapes */}
            <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6.5 shadow-[0_15px_45px_rgba(243,212,217,0.1)] space-y-6">
              <div>
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">Therapeutic Soundscapes</h3>
                <h4 className="text-xs font-bold text-[#3b1c24]">Binaural Neural Solfeggios</h4>
                <p className="text-xs text-slate-500 mt-1">Play offline ambient frequencies to align heart rates during work sleep shifts.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "Transylvanian Forest Rain", freq: "432 Hz - Deep Grounding", sound: "rain" },
                  { title: "Black Sea Healing Wave", freq: "528 Hz - Cellular Repair", sound: "ocean" },
                  { title: "Carpathian Peak Winds", freq: "396 Hz - Tension Release", sound: "wind" },
                  { title: "Cosmic White Solfeggio", freq: "963 Hz - Crown Pineal", sound: "cosmic" }
                ].map((sc, i) => (
                  <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#3b1c24]">{sc.title}</h4>
                      <span className="text-[10px] font-mono text-rose-500 font-semibold">{sc.freq}</span>
                    </div>
                    <button
                      onClick={() => toggleSound(sc.sound)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        activeSound === sc.sound 
                          ? 'bg-rose-500 border-rose-500 text-white animate-pulse' 
                          : 'bg-white border-slate-200/60 text-slate-400 hover:text-rose-500'
                      }`}
                    >
                      {activeSound === sc.sound ? <Volume2 className="h-4 w-4" /> : <Music className="h-4 w-4" />}
                    </button>
                  </div>
                ))}
              </div>

              {activeSound && (
                <div className="p-3 bg-[#3b1c24] text-white rounded-xl text-center text-[10px] font-mono flex items-center justify-center gap-2 animate-bounce">
                  <Volume2 className="h-3.5 w-3.5 animate-pulse text-rose-300" />
                  <span>Synthesizing active solfeggio frequency locally... Perfect sleep/work balance active.</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* WOMEN'S HEALTH CENTER */}
        {activeSubTab === 'health' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Health Center Header */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6.5 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 pb-4">
                <div>
                  <h3 className="text-base font-black text-[#3b1c24] flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-rose-500" /> Women's Medical Health Center
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Medically reviewed, evidence-based physical wellness and education directories.</p>
                </div>
                <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1">
                  {[
                    { id: 'menstrual', label: 'Menstrual Health' },
                    { id: 'pregnancy', label: 'Pregnancy' },
                    { id: 'fertility', label: 'Fertility' },
                    { id: 'menopause', label: 'Menopause' },
                    { id: 'breast', label: 'Breast Health' },
                    { id: 'nutrition', label: 'Nutrition' },
                    { id: 'mental', label: 'Mental Health' },
                    { id: 'exercise', label: 'Exercise' }
                  ].map(sec => (
                    <button
                      key={sec.id}
                      onClick={() => setSelectedHealthSection(sec.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase cursor-pointer whitespace-nowrap transition-all ${
                        selectedHealthSection === sec.id 
                          ? 'bg-[#3b1c24] text-white' 
                          : 'bg-slate-50 text-slate-500 hover:text-[#3b1c24]'
                      }`}
                    >
                      {sec.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-4 bg-amber-50 border border-amber-200/60 rounded-2xl text-[10.5px] leading-relaxed text-[#78350f] flex items-start gap-2.5">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold uppercase tracking-wider block text-[9.5px] text-amber-800 mb-1">Strict Medical Disclaimer</span>
                  The clinical information displayed on this network is sourced from trusted health consensuses and is for educational references only. It is NOT a substitute for professional medical diagnosis, personalized clinical consultations, or direct treatment. Always seek the direct guidance of a qualified medical practitioner.
                </div>
              </div>
            </div>

            {/* Section details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Educational Card (Left Column, span 2) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Menstrual Health Details */}
                {selectedHealthSection === 'menstrual' && (
                  <div className="bg-white border border-slate-100 rounded-3xl p-6.5 shadow-sm space-y-6">
                    <div className="space-y-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-rose-500 text-[9px] font-mono font-bold uppercase">Physiological Cycle</span>
                      <h4 className="text-sm font-bold text-[#3b1c24]">Understanding Your Menstrual Hormonal Phases</h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-light">
                        A typical healthy cycle lasts between 21 and 35 days and is divided into four distinct phases: the Menstrual Phase (bleeding), the Follicular Phase (building), the Ovulatory Phase (releasing), and the Luteal Phase (rebuilding). Proper pelvic blood flow, balanced physical effort, and specific nutritional replenishment align with these shifts to maintain systemic hormonal wellness.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                        <h5 className="text-xs font-bold text-[#3b1c24] flex items-center gap-1.5">
                          <Activity className="h-4 w-4 text-rose-500" /> Typical Cycle Milestones
                        </h5>
                        <ul className="text-[11px] text-slate-500 space-y-1.5 leading-relaxed list-disc pl-4 font-light">
                          <li><strong>Menstrual (Days 1-5):</strong> Low estrogen & progesterone. Energy dips. Focus on hydration and iron-rich lentils.</li>
                          <li><strong>Follicular (Days 6-13):</strong> Estrogen climbs. High cognitive recall, strong physical stamina.</li>
                          <li><strong>Ovulatory (Day 14):</strong> LH surge triggers follicle release. Peak fertility window. Estrogen peaks.</li>
                          <li><strong>Luteal (Days 15-28):</strong> Progesterone climbs. Calm energy, possible physical fatigue, bloating.</li>
                        </ul>
                      </div>

                      <div className="p-4 rounded-2xl bg-rose-50/20 border border-rose-100/40 space-y-2">
                        <h5 className="text-xs font-bold text-[#3b1c24] flex items-center gap-1.5">
                          <AlertTriangle className="h-4 w-4 text-rose-500" /> Warning Symptoms (See a Doctor)
                        </h5>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-light">
                          Consult a gynecologist if you experience:
                        </p>
                        <ul className="text-[11px] text-slate-500 space-y-1 leading-relaxed list-disc pl-4 font-light">
                          <li>Severe cramping (dysmenorrhea) that disables daily activities.</li>
                          <li>Soaking through one or more pads/tampons every hour.</li>
                          <li>Cycles shorter than 21 days or longer than 35 days.</li>
                          <li>Absence of menstruation (amenorrhea) for three consecutive cycles.</li>
                        </ul>
                      </div>
                    </div>

                    {/* Interactive Component: Flow Tracker */}
                    <div className="p-5 rounded-2xl bg-rose-50/10 border border-rose-200/30 space-y-4">
                      <div className="space-y-1">
                        <h5 className="text-xs font-bold text-[#3b1c24] flex items-center gap-1">
                          <span>🩸</span> Flow Volume Logger
                        </h5>
                        <p className="text-[10px] text-slate-400">Log typical daily sanitary volume to determine physiological trends.</p>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {['Spotting', 'Light', 'Moderate', 'Heavy'].map((fl, idx) => (
                          <button
                            key={idx}
                            onClick={() => showToast(`Logged flow level: ${fl}. Volume marked securely.`)}
                            className="py-2.5 rounded-xl border border-rose-200 bg-white hover:bg-[#3b1c24] hover:text-white transition-all cursor-pointer text-center text-xs font-bold text-[#3b1c24]"
                          >
                            {fl}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Pregnancy Details */}
                {selectedHealthSection === 'pregnancy' && (
                  <div className="bg-white border border-slate-100 rounded-3xl p-6.5 shadow-sm space-y-6">
                    <div className="space-y-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-rose-500 text-[9px] font-mono font-bold uppercase">Gestational Development</span>
                      <h4 className="text-sm font-bold text-[#3b1c24]">Navigating the Trimesters: Clinical Benchmarks</h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-light">
                        Pregnancy is a 40-week physiological process calculated from the first day of the last menstrual period (LMP). It is chronologically mapped into three distinct trimesters: First Trimester (weeks 1-13, organogenesis and cellular differentiation), Second Trimester (weeks 14-26, rapid fetal skeletal elongation and movement), and Third Trimester (weeks 27-40, pulmonary maturation and exponential weight gain).
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                        <h5 className="text-xs font-bold text-[#3b1c24]">1st Trimester</h5>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-light">
                          Weeks 1-13. Primary organ structures form. Folic acid intake is crucial to prevent neural tube defects. Warning signs: Vaginal bleeding or severe unilateral cramping.
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                        <h5 className="text-xs font-bold text-[#3b1c24]">2nd Trimester</h5>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-light">
                          Weeks 14-26. Fetal movement (quickening) starts. Anatomical screening scan is performed around week 20. Track blood pressure metrics regularly.
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                        <h5 className="text-xs font-bold text-[#3b1c24]">3rd Trimester</h5>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-light">
                          Weeks 27-40. Preparation for birth. Monitor fetal kick counts (should be 10 movements within a 2-hour window). Watch for signs of preeclampsia (sudden hand/face swelling).
                        </p>
                      </div>
                    </div>

                    {/* Interactive Pregnancy Due Date Calculator */}
                    <div className="p-5 rounded-2xl bg-gradient-to-tr from-[#fffbfe] to-[#fff5f7] border border-rose-100 space-y-4">
                      <div className="flex justify-between items-center">
                        <h5 className="text-xs font-bold text-[#3b1c24] flex items-center gap-1.5">
                          <span>📅</span> Gestational Age & Due Date Wheel
                        </h5>
                        <span className="text-[10px] font-bold text-rose-500 font-mono">Naegele's Rule</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-500 font-semibold uppercase">First Day of Last Period (LMP)</label>
                          <input 
                            type="date"
                            value={lastPeriodDate}
                            onChange={e => setLastPeriodDate(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#3b1c24] focus:outline-none focus:ring-1 focus:ring-rose-300"
                          />
                        </div>
                        {calculatePregnancyStats() && (
                          <div className="p-3 bg-white rounded-xl border border-rose-100 space-y-1.5 text-xs text-[#3b1c24]">
                            <div>Estimated Due Date: <span className="font-bold text-rose-600">{calculatePregnancyStats()?.edd}</span></div>
                            <div>Gestational Age: <span className="font-bold text-rose-600">{calculatePregnancyStats()?.week} Weeks, {calculatePregnancyStats()?.days} Days</span></div>
                            <div>Trimester: <span className="font-bold text-rose-600">{calculatePregnancyStats()?.trimester === 1 ? '1st (First)' : calculatePregnancyStats()?.trimester === 2 ? '2nd (Second)' : '3rd (Third)'}</span></div>
                            <div className="text-[10px] text-slate-400 font-mono">Days to expected birth: {calculatePregnancyStats()?.daysToBirth} days</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Fertility Details */}
                {selectedHealthSection === 'fertility' && (
                  <div className="bg-white border border-slate-100 rounded-3xl p-6.5 shadow-sm space-y-6">
                    <div className="space-y-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-rose-500 text-[9px] font-mono font-bold uppercase">Reproductive Science</span>
                      <h4 className="text-sm font-bold text-[#3b1c24]">Understanding and Optimizing Your Fertile Window</h4>
                      <p className="text-xs text-[#694e55] leading-relaxed font-light">
                        The human oocyte is viable for approximately 12-24 hours post-ovulation, while sperm can survive within the cervical mucus and fallopian tubes for up to 5 days. Consequently, a woman's fertile window spans roughly 6 days: the 5 days preceding ovulation and the day of ovulation itself. Tracking ovulation involves identifying key biomarkers like basal body temperature (BBT) elevations and changes in cervical fluid consistency.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                        <h5 className="text-xs font-bold text-[#3b1c24]">Key Fertility Biomarkers</h5>
                        <ul className="text-[11px] text-slate-500 space-y-1 list-disc pl-4 leading-relaxed font-light">
                          <li><strong>Cervical Mucus:</strong> Shifts to a thin, highly elastic, clear consistency (resembling raw egg whites) to support sperm motility during peak fertility.</li>
                          <li><strong>Basal Body Temp:</strong> A slight thermal elevation of about 0.3°C to 0.5°C occurs post-ovulation due to progesterone secretion.</li>
                          <li><strong>Luteinizing Hormone (LH):</strong> A sudden spike in LH triggers the follicle to release the egg within 24-36 hours.</li>
                        </ul>
                      </div>

                      <div className="p-4 rounded-xl bg-rose-50/10 border border-rose-100 space-y-2">
                        <h5 className="text-xs font-bold text-[#3b1c24] flex items-center gap-1">
                          <span>📅</span> Fertility Estimator Console
                        </h5>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-light">
                          Based on your typified cycle length, your current calculated fertility sweet spots are:
                        </p>
                        <div className="p-3 bg-white border border-rose-100 rounded-lg text-[10.5px] text-[#3b1c24] space-y-1">
                          <div>Calculated Ovulation Day: <span className="font-bold text-rose-500">Day {Math.floor(cycleLength / 2)} of Cycle</span></div>
                          <div>Peak Fertile Window: <span className="font-bold text-rose-500">Days {Math.floor(cycleLength / 2) - 5} through {Math.floor(cycleLength / 2) + 1}</span></div>
                          <p className="text-[9px] text-slate-400 italic font-mono mt-1">Estimations assume cycle length regularities.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Menopause Details */}
                {selectedHealthSection === 'menopause' && (
                  <div className="bg-white border border-slate-100 rounded-3xl p-6.5 shadow-sm space-y-6">
                    <div className="space-y-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-rose-500 text-[9px] font-mono font-bold uppercase">Hormonal Transition</span>
                      <h4 className="text-sm font-bold text-[#3b1c24]">The Physiology of Perimenopause and Menopause</h4>
                      <p className="text-xs text-[#694e55] leading-relaxed font-light">
                        Menopause is clinically defined as the permanent cessation of menstruation, confirmed after 12 consecutive months of amenorrhea without other causes, typically occurring between ages 45 and 55. This transition is preceded by perimenopause, a phase of fluctuating ovarian activity, declining estrogen levels, and rising follicle-stimulating hormone (FSH) levels, resulting in vasomotor symptoms, sleep disturbances, and vaginal tissue remodeling.
                      </p>
                    </div>

                    {/* Interactive Symptom Severity & Lifestyle Remedies */}
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                      <h5 className="text-xs font-bold text-[#3b1c24] flex items-center gap-1.5">
                        <span>📊</span> Menopause Symptom Severity Calculator
                      </h5>
                      <p className="text-[10px] text-slate-400 leading-relaxed">Adjust your symptom severity indices to see evidence-based holistic support solutions.</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3 bg-white p-3.5 rounded-xl border border-slate-200">
                          {Object.keys(menopauseSymptoms).map(sym => (
                            <div key={sym} className="space-y-1">
                              <div className="flex justify-between text-[10px] capitalize font-semibold text-slate-500">
                                <span>{sym.replace(/([A-Z])/g, ' $1')}</span>
                                <span className="text-[#3b1c24] font-bold">{menopauseSymptoms[sym]}/5</span>
                              </div>
                              <input 
                                type="range"
                                min={1}
                                max={5}
                                value={menopauseSymptoms[sym]}
                                onChange={e => setMenopauseSymptoms({ ...menopauseSymptoms, [sym]: Number(e.target.value) })}
                                className="w-full accent-[#3b1c24] h-1 cursor-pointer bg-slate-100 rounded-lg"
                              />
                            </div>
                          ))}
                        </div>

                        <div className="p-4 bg-white rounded-xl border border-rose-100 space-y-2 flex flex-col justify-between">
                          <div>
                            <span className="text-[9px] font-bold text-rose-500 uppercase font-mono block">Custom Botanical & Lifestyle Plan</span>
                            <p className="text-[11px] text-slate-500 leading-relaxed mt-1 font-light">
                              {menopauseSymptoms.hotFlashes >= 4 && "🌡️Vasomotor support: Incorporate organic soy isoflavones and flaxseed. Wear breathable bamboo layered sleepwear. Keep environment below 20°C."}
                              {menopauseSymptoms.sleepIssues >= 4 && "🌙Sleep support: Establish strict circadian limits. Use 300mcg low-dose melatonin, magnesium glycinate, and eliminate blue spectrum displays 2 hours pre-sleep."}
                              {menopauseSymptoms.hotFlashes < 4 && menopauseSymptoms.sleepIssues < 4 && "🌿Maintain balanced exercise, calcium-rich diets, and routine bone density screening with your practitioner."}
                            </p>
                          </div>
                          <div className="text-xs font-bold text-[#3b1c24] bg-rose-50/40 p-2.5 rounded-lg border border-rose-100/20 text-center">
                            Computed Severity Score: <span className="text-rose-500 font-extrabold">{Object.values(menopauseSymptoms).reduce((a,b)=>a+b,0)} / 25</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Breast Health Details */}
                {selectedHealthSection === 'breast' && (
                  <div className="bg-white border border-slate-100 rounded-3xl p-6.5 shadow-sm space-y-6">
                    <div className="space-y-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-rose-500 text-[9px] font-mono font-bold uppercase">Preventative Screening</span>
                      <h4 className="text-sm font-bold text-[#3b1c24]">Breast Awareness and Clinical Screening Intervals</h4>
                      <p className="text-xs text-[#694e55] leading-relaxed font-light">
                        Routine preventative screening is key to breast health. Understanding your typical breast tissue structure (breast awareness) allows you to recognize atypical physical shifts. Clinical consensus recommends formal mammography screening intervals starting at age 40 or 50 based on personal genetic risk factors. Monthly self-checks should be performed 3-5 days after your period ends when tissue is least sensitive.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Interactive Breast Self-Exam Guide Checklist */}
                      <div className="p-5 rounded-2xl bg-[#fffbfe] border border-rose-100 space-y-4">
                        <div className="space-y-1">
                          <h5 className="text-xs font-bold text-[#3b1c24] flex items-center gap-1.5">
                            <ShieldCheck className="h-4.5 w-4.5 text-rose-500" /> Interactive Breast Self-Exam Checklist
                          </h5>
                          <p className="text-[10px] text-slate-400">Mark off each component during your monthly self-assessment.</p>
                        </div>
                        
                        <div className="space-y-2.5 text-xs font-light">
                          {[
                            "1. Visual: Stand before a mirror, check for contour symmetry or skin puckering.",
                            "2. Arms Up: Raise arms high, check for lateral pull deviations or dimpling.",
                            "3. Palpation: Lying down, use pads of fingers in circular spirals to check for lumps.",
                            "4. Axilla check: Gently check underarm and collarbone areas for deep nodes.",
                            "5. Nipple check: Inspect for unusual fluid discharge or sudden inversion."
                          ].map((step, idx) => (
                            <label key={idx} className="flex items-start gap-2.5 cursor-pointer hover:text-[#3b1c24] transition-colors">
                              <input 
                                type="checkbox"
                                checked={breastStepsDone[idx]}
                                onChange={() => {
                                  const updated = [...breastStepsDone];
                                  updated[idx] = !updated[idx];
                                  setBreastStepsDone(updated);
                                  if (updated.every(Boolean)) {
                                    showToast("Completed all self-exam stages! Mark your calendar for next month.");
                                    onAddLog('Breast Self-Exam Completed', 'Completed all monthly wellness screening milestones locally', 'chat');
                                  }
                                }}
                                className="mt-1 rounded border-slate-300 text-rose-500 focus:ring-rose-400"
                              />
                              <span className={breastStepsDone[idx] ? 'line-through text-slate-400' : 'text-[#694e55]'}>{step}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3 text-xs">
                        <h5 className="text-xs font-bold text-[#3b1c24] flex items-center gap-1">
                          <span>⚠️</span> Signs Requiring Prompt Clinical Investigation
                        </h5>
                        <p className="text-slate-500 leading-relaxed font-light">
                          Schedule an immediate clinical consultation if you notice:
                        </p>
                        <ul className="text-slate-500 space-y-1 list-disc pl-4 font-light leading-relaxed">
                          <li>A firm, painless lump that feels distinct from surrounding tissue.</li>
                          <li>Skin changes such as puckering, dimpling, redness, or an orange-peel texture.</li>
                          <li>Spontaneous or bloody nipple discharge from one breast.</li>
                          <li>New nipple inversion or persistent changes to the nipple skin.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Nutrition Details */}
                {selectedHealthSection === 'nutrition' && (
                  <div className="bg-white border border-slate-100 rounded-3xl p-6.5 shadow-sm space-y-6">
                    <div className="space-y-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-rose-500 text-[9px] font-mono font-bold uppercase">Dietary Excellence</span>
                      <h4 className="text-sm font-bold text-[#3b1c24]">Evidence-Based Nutritional Science for Women</h4>
                      <p className="text-xs text-[#694e55] leading-relaxed font-light">
                        A woman's physiological requirements shift significantly throughout her lifespan. Premenopausal women require higher daily intakes of iron to replenish menstrual losses, while postmenopausal and pregnant women require elevated levels of calcium, vitamin D, and folic acid to support skeletal densities and embryonic organogenesis.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-xs">
                        <h5 className="font-bold text-[#3b1c24]">Core Micro-Nutrient RDAs</h5>
                        <ul className="text-slate-500 space-y-1.5 list-disc pl-4 font-light leading-relaxed">
                          <li><strong>Iron:</strong> 18mg daily for premenopausal women (critical for hemoglobin function). Sourced from spinach, lentils, organic lean meats.</li>
                          <li><strong>Calcium:</strong> 1,000mg to 1,200mg daily (crucial for bone preservation and cellular signals).</li>
                          <li><strong>Folate (Vit B9):</strong> 400mcg daily for childbearing age (supports DNA synthesis and prevents birth anomalies).</li>
                          <li><strong>Vitamin D3:</strong> 600-800 IU daily (critical for calcium absorption and immunoprotection).</li>
                        </ul>
                      </div>

                      <div className="p-4 rounded-xl bg-rose-50/10 border border-rose-100 space-y-3 text-xs">
                        <h5 className="font-bold text-[#3b1c24]">The Vaginal & Gut Microbiome Connection</h5>
                        <p className="text-slate-500 leading-relaxed font-light">
                          Diets rich in diverse dietary fibers, fermented probiotics (kefir, live yogurt), and prebiotics nourish gut and vaginal flora. Lactobacilli strains ferment glycogen into lactic acid, maintaining an optimal acidic pH of 3.8-4.5 to deter opportunistic pathogens (BV, yeast).
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mental Health Details */}
                {selectedHealthSection === 'mental' && (
                  <div className="bg-white border border-slate-100 rounded-3xl p-6.5 shadow-sm space-y-6">
                    <div className="space-y-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-rose-500 text-[9px] font-mono font-bold uppercase">Cognitive Wellness</span>
                      <h4 className="text-sm font-bold text-[#3b1c24]">Evidence-Based Strategies for Emotional Resilience</h4>
                      <p className="text-xs text-[#694e55] leading-relaxed font-light">
                        Hormonal fluctuations can have a profound impact on cognitive wellness. Conditions like Premenstrual Dysphoric Disorder (PMDD), postpartum depression, and perimenopausal anxiety are biologically driven by neurotransmitter sensitivities to changing estrogen and progesterone levels. Sourcing clinical support, practicing mindfulness, and managing stress can help regulate cortisol, stabilizing mood and cognitive load.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-xs">
                        <h5 className="font-bold text-[#3b1c24]">Managing PMDD & Mood Shifts</h5>
                        <p className="text-slate-500 leading-relaxed font-light">
                          PMDD is a severe, neurobiologically based mood disorder occurring during the luteal phase. Keeping a detailed daily symptom chart for at least two cycles is critical for formal diagnosis. Clinical support options include cognitive behavioral therapy (CBT), selective lifestyle adjustments, and targeted medical therapies.
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-rose-50/10 border border-rose-100 space-y-2 text-xs">
                        <h5 className="font-bold text-[#3b1c24] flex items-center gap-1.5">
                          <CheckCircle className="h-4 w-4 text-rose-500" /> Grounding Exercise
                        </h5>
                        <p className="text-slate-500 leading-relaxed font-light">
                          When experiencing high anxiety or emotional stress, initiate the 5-4-3-2-1 sensory grounding check-in to bring focus back to the present.
                        </p>
                        <button
                          onClick={() => {
                            showToast("Anxiety shielding activated. Please begin 4-7-8 Breathing Zen.");
                            setActiveSubTab('breathing');
                          }}
                          className="w-full py-2 bg-[#3b1c24] text-white hover:bg-black transition-all rounded-xl font-bold font-mono text-[10px] uppercase cursor-pointer"
                        >
                          Launch Breathing Zen →
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Exercise Details */}
                {selectedHealthSection === 'exercise' && (
                  <div className="bg-white border border-slate-100 rounded-3xl p-6.5 shadow-sm space-y-6">
                    <div className="space-y-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-rose-500 text-[9px] font-mono font-bold uppercase">Biomechanical Conditioning</span>
                      <h4 className="text-sm font-bold text-[#3b1c24]">Clinical Movement Protocols & Pelvic Health</h4>
                      <p className="text-xs text-[#694e55] leading-relaxed font-light">
                        Consistent, targeted exercise supports bone mineral density, cardiovascular health, and metabolic balance. Incorporating pelvic floor training (Kegel exercises) strengthens the levator ani muscle group, supporting bladder, uterine, and bowel function. Modulating workout intensity based on cycle phases (steady cardio in the follicular phase, strength training in the ovulatory phase, low-impact yoga in the luteal phase) optimizes hormonal and physical performance.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Interactive Kegel Timer */}
                      <div className="p-5 rounded-2xl bg-rose-50/10 border border-rose-100 space-y-4 text-xs">
                        <h5 className="font-bold text-[#3b1c24] flex items-center gap-1">
                          <span>🏋️‍♀️</span> Interactive Pelvic Floor (Kegel) Trainer
                        </h5>
                        <p className="text-slate-400 text-[10px] leading-relaxed font-light">Strengthen pelvic support muscles. Complete 10 reps: contract for 3s, relax for 3s.</p>
                        <button
                          onClick={() => {
                            showToast("Starting pelvic floor contraction pulse: Contract for 3... 2... 1... Now Relax!");
                            onAddLog('Pelvic Floor Training Pulse', 'Executed pelvic muscle biomechanical routine on-device', 'chat');
                          }}
                          className="w-full py-2.5 bg-[#3b1c24] text-white rounded-xl text-center text-[10px] font-bold uppercase tracking-wider hover:bg-black cursor-pointer transition-all"
                        >
                          Trigger Guided Rep Pulse
                        </button>
                      </div>

                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-xs">
                        <h5 className="font-bold text-[#3b1c24]">Resistance Training benefits</h5>
                        <ul className="text-slate-500 space-y-1 list-disc pl-4 leading-relaxed font-light">
                          <li><strong>Osteoporosis Prevention:</strong> Progressive mechanical load stimulates osteoblast activity, increasing bone density.</li>
                          <li><strong>Metabolic Health:</strong> Lean muscle mass regulates blood glucose levels and insulin sensitivity.</li>
                          <li><strong>Joint Protection:</strong> Strengthening the muscles around the joints stabilizes ligaments, minimizing overall injury risk.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Clinic Directory & Sourced Schedulers (Right Column) */}
              <div className="space-y-6">
                
                {/* Book Consultation */}
                <div className="bg-gradient-to-br from-[#3b1c24] to-[#1e0e12] rounded-3xl p-6 shadow-2xl text-white space-y-5 border border-rose-950/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15">
                      <Stethoscope className="h-5 w-5 text-rose-300" />
                    </div>
                    <div>
                      <h3 className="text-xs font-mono font-bold text-rose-300 uppercase tracking-widest">Medical Support</h3>
                      <h4 className="text-xs font-bold text-white">Sourced Clinical Consultation</h4>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed font-light">
                    Direct access to vetted gynecologists, primary care clinicians, and obstetricians. Click to book a virtual appointment.
                  </p>

                  <div className="space-y-2.5 pt-2">
                    {[
                      { name: "Dr. Maria Popescu, OBGYN", type: "Reproductive & Gynae" },
                      { name: "Dr. Alin Dumitriu, Endocrinologist", type: "Thyroid & Hormonal Panel" },
                      { name: "Dr. Clara Rusu, Psychologist", type: "Cognitive & PMDD Therapy" }
                    ].map((dr, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          showToast(`Drafting encrypted scheduling token with ${dr.name}...`);
                          onAddLog('Clinical Request Initiated', `Sought health coordination with ${dr.name}`, 'chat');
                        }}
                        className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-white transition-all cursor-pointer flex justify-between items-center"
                      >
                        <div>
                          <h4 className="text-[11px] font-bold">{dr.name}</h4>
                          <span className="text-[9px] text-rose-300 font-medium">{dr.type}</span>
                        </div>
                        <span className="text-[10px] font-bold text-rose-400 font-mono">Book →</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dynamic FAQ box */}
                <div className="bg-white border border-slate-100 rounded-3xl p-5.5 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-[#3b1c24] uppercase font-mono tracking-wider">Health Quick Reads</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-light">
                    Have wellness queries? You can consult Athena AI in the <strong>Athena AI Desk</strong> tab for specialized health explanations or read through our medically reviewed guidelines.
                  </p>
                  <button
                    onClick={() => {
                      showToast("Routing to Athena AI Desk...");
                    }}
                    className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 transition-all rounded-xl font-bold text-[10px] uppercase cursor-pointer"
                  >
                    Open Athena AI Desk
                  </button>
                </div>

              </div>

            </div>

          </motion.div>
        )}

        {/* SEXUAL HEALTH & SEXOLOGY */}
        {activeSubTab === 'sexual' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Sexual Health Header */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6.5 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 pb-4">
                <div>
                  <h3 className="text-base font-black text-[#3b1c24] flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-rose-500" /> Sexual Health & Sexology Education
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Medically accurate, age-appropriate, evidence-based reproductive wellness guidance.</p>
                </div>
                <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1">
                  {[
                    { id: 'consent', label: 'Consent' },
                    { id: 'relationships', label: 'Healthy Relationships' },
                    { id: 'contraception', label: 'Contraception' },
                    { id: 'stis', label: 'STI Prevention' },
                    { id: 'wellness', label: 'Sexual Wellness' },
                    { id: 'anatomy', label: 'Anatomy' },
                    { id: 'faq', label: 'FAQ' },
                    { id: 'myths', label: 'Myths vs Facts' }
                  ].map(sec => (
                    <button
                      key={sec.id}
                      onClick={() => setSelectedSexualSection(sec.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase cursor-pointer whitespace-nowrap transition-all ${
                        selectedSexualSection === sec.id 
                          ? 'bg-[#3b1c24] text-white' 
                          : 'bg-slate-50 text-slate-500 hover:text-[#3b1c24]'
                      }`}
                    >
                      {sec.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="p-3.5 bg-rose-50/40 border border-rose-100/50 rounded-2xl text-[10px] text-[#3b1c24] leading-relaxed font-semibold">
                🛡️ All contents are strictly educational, anatomically and biologically precise, and aligned with international health standards. Explicit, non-educational, or pornographic materials are strictly prohibited.
              </div>
            </div>

            {/* Content block */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left span 2 column */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Consent Section */}
                {selectedSexualSection === 'consent' && (
                  <div className="bg-white border border-slate-100 rounded-3xl p-6.5 shadow-sm space-y-6">
                    <div className="space-y-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-rose-500 text-[9px] font-mono font-bold uppercase">Ethical Relationships</span>
                      <h4 className="text-sm font-bold text-[#3b1c24]">Understanding Active, Ongoing Consent</h4>
                      <p className="text-xs text-[#694e55] leading-relaxed font-light">
                        Consent is a foundational component of healthy interactions, both physical and emotional. In medical, legal, and relational contexts, consent is defined as a voluntary, enthusiastic, conscious, and clear agreement between equal participants to engage in specific activities. Consent is continuous, highly contextual, and can be revoked at any single instant by any participant.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2 leading-relaxed">
                      <h5 className="font-bold text-[#3b1c24]">The 'FRIES' Framework for Healthy Consent</h5>
                      <ul className="text-slate-500 space-y-1.5 list-disc pl-4 font-light">
                        <li><strong>F - Freely Given:</strong> Choices must be made without pressure, coercion, manipulation, or influence of drugs/alcohol.</li>
                        <li><strong>R - Reversible:</strong> Anyone can change their mind and stop an activity at any point, even if they previously agreed.</li>
                        <li><strong>I - Informed:</strong> Both partners must understand and agree to the exact details of the activity (such as using barrier protection).</li>
                        <li><strong>E - Enthusiastic:</strong> Intimacy should be based on active excitement and mutual desire, never obligation or passivity.</li>
                        <li><strong>S - Specific:</strong> Agreeing to one physical act does not imply agreement to other acts.</li>
                      </ul>
                    </div>

                    {/* Interactive Scenario simulator */}
                    <div className="p-5 rounded-2xl bg-rose-50/10 border border-rose-100 space-y-4 text-xs text-[#3b1c24]">
                      <h5 className="font-bold flex items-center gap-1.5">
                        <span>💬</span> Ethical Consent Scenario Exercise
                      </h5>
                      <p className="text-slate-400 text-[10px] leading-relaxed">Assess the following relationship scenario against healthy parameters.</p>
                      
                      <div className="space-y-3">
                        {consentScenarios.map((sc, idx) => (
                          <div key={idx} className="p-4 bg-white rounded-xl border border-slate-100 space-y-3">
                            <p className="font-medium text-slate-700 leading-relaxed font-light">"{sc.scenario}"</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => showToast(sc.isValid ? "Correct! This represents healthy active consent." : sc.explanation)}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-bold text-[10px] uppercase text-[#3b1c24] cursor-pointer"
                              >
                                Is Healthy Consent
                              </button>
                              <button
                                onClick={() => showToast(!sc.isValid ? "Correct! This does NOT meet ethical consent standards." : "Try again. This scenario is actually healthy and fully communicative.")}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-bold text-[10px] uppercase text-[#3b1c24] cursor-pointer"
                              >
                                Is NOT Healthy Consent
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Healthy Relationships & Communication */}
                {selectedSexualSection === 'relationships' && (
                  <div className="bg-white border border-slate-100 rounded-3xl p-6.5 shadow-sm space-y-6">
                    <div className="space-y-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-rose-500 text-[9px] font-mono font-bold uppercase">Mutual Respect</span>
                      <h4 className="text-sm font-bold text-[#3b1c24]">Communication Between Partners & Emotional Safety</h4>
                      <p className="text-xs text-[#694e55] leading-relaxed font-light">
                        A healthy relationship is built on emotional safety, open communication, equality, and shared respect. Expressing boundaries, desires, and limits transparently allows partners to build trust and mitigate misunderstandings. Healthy partnerships support individual autonomy, allowing both people to grow without fear of judgment, control, or isolation.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-xs">
                        <h5 className="font-bold text-[#3b1c24] flex items-center gap-1">
                          <span>❤️</span> Signs of Healthy Relationships
                        </h5>
                        <ul className="text-slate-500 space-y-1 list-disc pl-4 font-light leading-relaxed">
                          <li><strong>Mutual Support:</strong> Cheering each other's achievements and individual goals.</li>
                          <li><strong>Constructive Conflict:</strong> Disagreeing respectfully without resorting to personal insults or silent treatments.</li>
                          <li><strong>Boundaries Respected:</strong> Comfortable saying 'no' to any activity without guilt or backlash.</li>
                          <li><strong>Shared Decision Making:</strong> Financial, social, and physical parameters are agreed upon collectively.</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-rose-50/10 border border-rose-100 rounded-xl space-y-2.5 text-xs flex flex-col justify-between">
                        <div className="space-y-1">
                          <h5 className="font-bold text-[#3b1c24] flex items-center gap-1">
                            <span>💬</span> Discussion Starter Generator
                          </h5>
                          <p className="text-slate-400 text-[10px] leading-relaxed">Tap to generate an evidence-based conversation prompt to foster communication with your partner.</p>
                        </div>
                        <div className="p-3 bg-white border border-rose-100 rounded-lg text-[10.5px] italic text-[#3b1c24] font-medium min-h-[3.5rem] flex items-center justify-center text-center">
                          "{discussionStarters[activeStarterIndex]}"
                        </div>
                        <button
                          onClick={() => {
                            setActiveStarterIndex(prev => (prev + 1) % discussionStarters.length);
                            showToast("Generated new communication prompt.");
                          }}
                          className="w-full py-2 bg-[#3b1c24] text-white hover:bg-black rounded-xl text-[10px] font-bold font-mono uppercase cursor-pointer transition-colors"
                        >
                          Generate New Starter
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contraception */}
                {selectedSexualSection === 'contraception' && (
                  <div className="bg-white border border-slate-100 rounded-3xl p-6.5 shadow-sm space-y-6">
                    <div className="space-y-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-rose-500 text-[9px] font-mono font-bold uppercase">Reproductive Autonomy</span>
                      <h4 className="text-sm font-bold text-[#3b1c24]">Clinical Comparison of Contraceptive Methods</h4>
                      <p className="text-xs text-[#694e55] leading-relaxed font-light">
                        Contraceptive methods are medical strategies used to prevent unintended pregnancies. They vary significantly in their biological mechanism, typical effectiveness, ease of use, and secondary health benefits or side effects. Family planning decisions should be made in consultation with a healthcare professional to identify the safest option for your unique physiological profile.
                      </p>
                    </div>

                    {/* Interactive Contraceptive Selector */}
                    <div className="space-y-4">
                      <h5 className="text-xs font-bold text-[#3b1c24] flex items-center gap-1.5">
                        <span>🔍</span> Interactive Contraceptive Comparison Grid
                      </h5>
                      <p className="text-[10px] text-slate-400 leading-relaxed">Select methods below to view clinical effectiveness parameters.</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { name: "Hormonal Implant (e.g. Nexplanon)", rate: "99.9% effective", type: "Progestin rod", duration: "Up to 3-5 years", stis: "No STI protection", pros: "Highest efficacy, 'set-and-forget' convenience", cons: "Requires clinician insertion/removal, irregular bleeding" },
                          { name: "Intrauterine Device (IUD) - Hormonal/Copper", rate: "99.8% effective", type: "T-shaped uterine device", duration: "Up to 3-10 years", stis: "No STI protection", pros: "Extremely reliable, reversible immediately", cons: "Insertion pain, cramp changes" },
                          { name: "Oral Contraceptive Pill", rate: "91% typical effectiveness", type: "Estrogen & Progestin combined", duration: "Daily pill-taking", stis: "No STI protection", pros: "Can regulate cycles and treat acne/heavy periods", cons: "Requires strict daily discipline, side effects" },
                          { name: "Male Latex Condom", rate: "85% typical effectiveness", type: "Latex/Polyurethane barrier", duration: "Single use", stis: "Protects against most STIs", pros: "Excellent STI barrier, widely available, no hormones", cons: "Risk of tearing, user-dependent reliability" }
                        ].map((m, idx) => (
                          <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 flex flex-col justify-between">
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center">
                                <h4 className="text-xs font-bold text-[#3b1c24]">{m.name}</h4>
                                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">{m.rate}</span>
                              </div>
                              <div className="text-[10px] space-y-0.5 text-slate-500">
                                <div>Mechanism: <span className="font-semibold text-slate-700">{m.type}</span></div>
                                <div>Duration: <span className="font-semibold text-slate-700">{m.duration}</span></div>
                                <div className="text-rose-500 font-bold flex items-center gap-1">🛡️ STI protection: {m.stis}</div>
                              </div>
                            </div>
                            <div className="p-2.5 bg-white rounded-xl border border-slate-150 text-[10px] space-y-1">
                              <div><span className="font-bold text-[#3b1c24]">Pros:</span> {m.pros}</div>
                              <div><span className="font-bold text-[#3b1c24]">Cons:</span> {m.cons}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STI Prevention */}
                {selectedSexualSection === 'stis' && (
                  <div className="bg-white border border-slate-100 rounded-3xl p-6.5 shadow-sm space-y-6">
                    <div className="space-y-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-rose-500 text-[9px] font-mono font-bold uppercase">Infectious Disease Defense</span>
                      <h4 className="text-sm font-bold text-[#3b1c24]">Sexually Transmitted Infections (STIs): Transmission & Screenings</h4>
                      <p className="text-xs text-[#694e55] leading-relaxed font-light">
                        Sexually Transmitted Infections (STIs) are bacteria, viruses, or parasites passed through mucosal contact during sexual activity. Many STIs are completely asymptomatic, meaning regular diagnostic screening is critical for sexually active individuals. Dual protection (using condoms alongside another contraceptive method) is the most reliable way to prevent STI transmission.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-xs">
                        <h5 className="font-bold text-[#3b1c24]">Standard Screening Guidelines</h5>
                        <ul className="text-slate-500 space-y-1.5 list-disc pl-4 font-light leading-relaxed">
                          <li><strong>Chlamydia & Gonorrhea:</strong> Annual screens recommended for all sexually active women under 25, or when switching partners.</li>
                          <li><strong>HIV, Syphilis, & Hepatitis B:</strong> Recommended at least once, or regularly if experiencing high risk factors.</li>
                          <li><strong>HPV & Cervical Smears (Pap Smear):</strong> Initiated at age 21, repeated every 3 years to check for pre-cancerous cell changes.</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-rose-50/10 border border-rose-100 rounded-xl space-y-2.5 text-xs">
                        <h5 className="font-bold text-[#3b1c24]">Advanced Preventative Interventions</h5>
                        <p className="text-slate-500 leading-relaxed font-light font-medium">
                          Consult your clinical provider regarding:
                        </p>
                        <ul className="text-slate-500 space-y-1 list-disc pl-4 font-light leading-relaxed">
                          <li><strong>HPV Vaccine (Gardasil):</strong> Protects against high-risk strains of human papillomavirus that cause cervical/throat cancers.</li>
                          <li><strong>PrEP (Pre-Exposure Prophylaxis):</strong> Daily preventative medication that reduces the risk of contracting HIV by 99%.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sexual Wellness */}
                {selectedSexualSection === 'wellness' && (
                  <div className="bg-white border border-slate-100 rounded-3xl p-6.5 shadow-sm space-y-6">
                    <div className="space-y-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-rose-500 text-[9px] font-mono font-bold uppercase">Holistic Wellness</span>
                      <h4 className="text-sm font-bold text-[#3b1c24]">Reproductive Health and Intimate Well-being</h4>
                      <p className="text-xs text-[#694e55] leading-relaxed font-light">
                        Sexual wellness involves a healthy, positive, and respectful approach to sexuality and relationships, free from coercion, discrimination, and violence. It encompasses the psychological, physical, and emotional facets of intimacy. Preserving vaginal microbiome health (avoiding douching, synthetic scents, and harsh soaps) and understanding chronic pelvic pain conditions are key pillars of overall wellness.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-xs">
                        <h5 className="font-bold text-[#3b1c24]">Microbiome & Vulvar Care</h5>
                        <p className="text-slate-500 leading-relaxed font-light">
                          The vulva is the external area of the genitals and requires gentle washing with warm water only. Internal douching is dangerous as it strips Lactobacilli, altering vaginal pH. Wear breathable cotton undergarments to allow proper ventilation and minimize sweat accumulation.
                        </p>
                      </div>

                      <div className="p-4 bg-rose-50/10 border border-rose-100 rounded-xl space-y-2 text-xs">
                        <h5 className="font-bold text-[#3b1c24]">Pelvic Pain and Dyspareunia</h5>
                        <p className="text-slate-500 leading-relaxed font-light">
                          Pain during intimacy (dyspareunia) can stem from yeast overgrowths, endometriosis, pelvic floor hypertonicity, or stress. It is never normal. Consult your gynecologist or pelvic floor physical therapist for professional diagnostic audits.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Anatomy */}
                {selectedSexualSection === 'anatomy' && (
                  <div className="bg-white border border-slate-100 rounded-3xl p-6.5 shadow-sm space-y-6">
                    <div className="space-y-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-rose-500 text-[9px] font-mono font-bold uppercase">Anatomical Science</span>
                      <h4 className="text-sm font-bold text-[#3b1c24]">Biological & Anatomical Frameworks</h4>
                      <p className="text-xs text-[#694e55] leading-relaxed font-light">
                        Educational understanding of male and female reproductive anatomy empowers individuals to make informed reproductive decisions, recognize atypical symptoms, and communicate clearly during physical checks.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-xs">
                        <h5 className="font-bold text-[#3b1c24]">Internal Structures</h5>
                        <ul className="text-slate-500 space-y-1.5 list-disc pl-4 font-light leading-relaxed font-light">
                          <li><strong>Ovaries:</strong> Two almond-sized glands storing oocytes and secreting key hormones (estrogen, progesterone).</li>
                          <li><strong>Fallopian Tubes:</strong> Cilia-lined ducts connecting ovaries to the uterus; site of fertilization.</li>
                          <li><strong>Uterus:</strong> Muscular organ supporting gestational embryonic growth.</li>
                          <li><strong>Cervix:</strong> Lower neck of the uterus connecting to the vaginal canal.</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-rose-50/10 border border-rose-100 rounded-xl space-y-2 text-xs">
                        <h5 className="font-bold text-[#3b1c24]">External Structures (Vulva)</h5>
                        <ul className="text-slate-500 space-y-1.5 list-disc pl-4 font-light leading-relaxed font-light">
                          <li><strong>Labia Majora & Minora:</strong> Protective folds of skin cushioning the sensitive openings.</li>
                          <li><strong>Clitoris:</strong> Sensory organ with thousands of nerve endings designed purely for tactile pleasure.</li>
                          <li><strong>Urethral Opening:</strong> Small exit duct for urine, separate from the vaginal canal.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* FAQ */}
                {selectedSexualSection === 'faq' && (
                  <div className="bg-white border border-slate-100 rounded-3xl p-6.5 shadow-sm space-y-6">
                    <div className="space-y-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-rose-500 text-[9px] font-mono font-bold uppercase">Trusted Answers</span>
                      <h4 className="text-sm font-bold text-[#3b1c24]">Frequently Asked Questions (FAQ)</h4>
                      <p className="text-xs text-[#694e55] leading-relaxed font-light">
                        Clear, evidence-backed explanations to common clinical and lifestyle queries regarding intimacy and sexual wellness.
                      </p>
                    </div>

                    <div className="space-y-4 font-light">
                      {[
                        { q: "How often should I get a pap smear?", a: "Medical guidelines recommend starting Pap smears at age 21. If results are normal, it is typically repeated every 3 years. For women over 30, co-testing with an HPV test can extend the screening interval to every 5 years." },
                        { q: "What should I do if a condom breaks?", a: "Stop immediately. If intercourse took place, consider using Emergency Contraception (like the levonorgestrel Morning-After Pill) within 72 hours (or up to 120 hours depending on the brand) to prevent ovulation. Consider getting screened for STIs after 14 days." },
                        { q: "Can STIs be cured?", a: "Bacterial STIs (like chlamydia, gonorrhea, and syphilis) and parasitic infections can be completely cured with antibiotics prescribed by a physician. Viral STIs (like HIV, herpes, and HPV) cannot be cured, but their symptoms can be managed effectively with antiviral therapies." }
                      ].map((faq, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1 text-xs">
                          <h5 className="font-bold text-[#3b1c24]">Q: {faq.q}</h5>
                          <p className="text-slate-500 leading-relaxed">A: {faq.a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Myths vs Facts */}
                {selectedSexualSection === 'myths' && (
                  <div className="bg-white border border-slate-100 rounded-3xl p-6.5 shadow-sm space-y-6">
                    <div className="space-y-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-rose-500 text-[9px] font-mono font-bold uppercase">De-bias Science</span>
                      <h4 className="text-sm font-bold text-[#3b1c24]">Myths vs Facts: Clinical Clarifications</h4>
                      <p className="text-xs text-[#694e55] leading-relaxed font-light">
                        Many intimate wellness myths lead to unnecessary anxiety or unsafe health practices. Let us debunk standard myths with verified clinical consensus.
                      </p>
                    </div>

                    {/* Interactive Myth Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mythsData.map(myth => {
                        const isRevealed = !!revealedMyths[myth.id];
                        return (
                          <div key={myth.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between space-y-4">
                            <div className="space-y-2">
                              <span className="text-[9px] font-bold text-red-500 uppercase block">Myth</span>
                              <p className="text-xs font-bold text-[#3b1c24] leading-relaxed">"{myth.myth}"</p>
                              {isRevealed && (
                                <div className="p-3 bg-white border border-emerald-100 rounded-xl text-[10.5px] leading-relaxed text-slate-500 font-light">
                                  <span className="font-bold text-emerald-600 block text-[9.5px] uppercase mb-1">✓ Medical Fact</span>
                                  {myth.fact}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => setRevealedMyths({ ...revealedMyths, [myth.id]: !isRevealed })}
                              className="text-left w-full text-[10px] font-bold text-rose-500 hover:text-rose-700 uppercase cursor-pointer"
                            >
                              {isRevealed ? "Hide Fact" : "Reveal Verified Fact →"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>

              {/* Right column: Trusted resources & Directories */}
              <div className="space-y-6">
                
                {/* Trusted External Links Hub */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-5">
                  <div>
                    <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Info className="h-4 w-4 text-rose-500" />
                      Trusted Resources
                    </h3>
                    <h4 className="text-xs font-bold text-[#3b1c24] mt-0.5">Audited Public Portals</h4>
                  </div>
                  
                  <p className="text-[10.5px] text-[#694e55] leading-relaxed font-light">
                    Direct paths to international clinical standards, directories, and global reproductive databases:
                  </p>

                  <div className="space-y-3 pt-1">
                    {[
                      { name: "Mayo Clinic", desc: "Patient education materials on women's health.", link: "https://www.mayoclinic.org/healthy-lifestyle/womens-health" },
                      { name: "WHO Reproductive Health", desc: "Global standards on contraception and STIs.", link: "https://www.who.int/teams/sexual-and-reproductive-health-and-research" },
                      { name: "ACOG Guidelines", desc: "The American College of Obstetricians & Gynecologists.", link: "https://www.acog.org/clinical" },
                      { name: "Planned Parenthood", desc: "Reliable sex education, contraception advice, and resources.", link: "https://www.plannedparenthood.org/learn" }
                    ].map((hub, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 hover:bg-rose-50/20 border border-slate-100 hover:border-rose-200 transition-colors">
                        <div className="flex justify-between items-center mb-0.5">
                          <h5 className="text-[11px] font-bold text-[#3b1c24]">{hub.name}</h5>
                          <a 
                            href={hub.link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-[10px] font-bold text-rose-500 hover:underline"
                          >
                            Open Hub ↗
                          </a>
                        </div>
                        <p className="text-[9.5px] text-slate-400 leading-relaxed font-light">{hub.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
