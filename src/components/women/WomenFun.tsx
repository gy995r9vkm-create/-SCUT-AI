/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, Sparkles, Trophy, Gamepad2, Gift, CheckCircle, HelpCircle,
  Award, Play, Star, Sparkle, RefreshCw, Layers, ChevronRight, Heart
} from 'lucide-react';

interface Question {
  q: string;
  options: { text: string; score: string }[];
}

export default function WomenFun({ onAddLog, showToast }: { onAddLog: (action: string, details: string, type: any) => Promise<void>; showToast: (msg: string) => void }) {
  const [activeSubTab, setActiveSubTab] = useState<'games' | 'quizzes' | 'rewards'>('games');

  // Game 1 State: Color Harmonies
  const [activeColorPairing, setActiveColorPairing] = useState<number>(0);
  const [scoreColorPairing, setScoreColorPairing] = useState(0);
  const colorQuestions = [
    { target: 'Deep Plum (#3b1c24)', options: ['Soft Blush Pink', 'Neon Green', 'Hot Orange'], correct: 'Soft Blush Pink', tip: 'Plum and blush create a highly refined luxury aesthetic.' },
    { target: 'Earthy Sage Green', options: ['Pure White', 'Muted Terracotta', 'Neon Purple'], correct: 'Muted Terracotta', tip: 'Sage and terracotta create a grounded, natural organic balance.' },
    { target: 'Classic Navy Blue', options: ['Muted Mustard Gold', 'Fuchsia', 'Dark Grey'], correct: 'Muted Mustard Gold', tip: 'Navy and mustard create a timeless professional contrast.' }
  ];

  // Personality Test State
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [quizResult, setQuizResult] = useState<string | null>(null);

  const styleQuiz: Question[] = [
    {
      q: "Select your preferred weekend morning setting:",
      options: [
        { text: "Reading in a minimalist loft with filtered white light", score: "Minimalist" },
        { text: "Browsing vintage markets and antique botanical archives", score: "Boho" },
        { text: "Attending a high-integrity tech venture panel in London", score: "Classic" },
        { text: "Experimenting with spatial designs on a digital canvas", score: "Avant-Garde" }
      ]
    },
    {
      q: "Your ideal wardrobe color palette consist of:",
      options: [
        { text: "Monochromatic slates, creams, and pure black", score: "Minimalist" },
        { text: "Warm rusts, earth sage, ochres, and olive", score: "Boho" },
        { text: "Navy blazers, crisp poplin blue, and gold trims", score: "Classic" },
        { text: "Deconstructed shapes in asymmetric silver and metallic", score: "Avant-Garde" }
      ]
    },
    {
      q: "Which piece of jewelry defines you best?",
      options: [
        { text: "A single ultra-thin solid platinum ring", score: "Minimalist" },
        { text: "Layered raw turquoise and heavy hammered bronzes", score: "Boho" },
        { text: "An elegant row of matched freshwater baroque pearls", score: "Classic" },
        { text: "A bold, geometric architectural ear cuff", score: "Avant-Garde" }
      ]
    }
  ];

  // Daily Tasks state
  const [completedTasks, setCompletedTasks] = useState<{ [key: string]: boolean }>({});
  const dailyTasks = [
    { id: 't-1', task: "Drink 2.0 Liters of water today", points: 10 },
    { id: 't-2', task: "Complete 4-7-8 Pranayama breathing cycle", points: 15 },
    { id: 't-3', task: "Explore a beauty formula tutorial", points: 20 }
  ];

  // Contest Submission state
  const [contestInput, setContestInput] = useState('');
  const [submittedContest, setSubmittedContest] = useState(false);

  const handleColorAnswer = (choice: string) => {
    const isCorrect = choice === colorQuestions[activeColorPairing].correct;
    if (isCorrect) {
      setScoreColorPairing(scoreColorPairing + 10);
      showToast("Correct! Premium match achieved. +10 Points.");
    } else {
      showToast("Oops! Contrast mismatch. Try matching complementary tones.");
    }
    if (activeColorPairing < colorQuestions.length - 1) {
      setActiveColorPairing(activeColorPairing + 1);
    } else {
      showToast(`Game finished! Total Harmony score: ${scoreColorPairing + (isCorrect ? 10 : 0)} Points.`);
      onAddLog('Completed Color Game', `Scored ${scoreColorPairing + (isCorrect ? 10 : 0)} in design simulator`, 'chat');
      setActiveColorPairing(0);
      setScoreColorPairing(0);
    }
  };

  const handleQuizAnswer = (score: string) => {
    const newAnswers = [...selectedAnswers, score];
    setSelectedAnswers(newAnswers);
    if (currentQuestionIndex < styleQuiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Calculate dominant persona
      const counts: { [key: string]: number } = {};
      let dominant = "Minimalist";
      let maxCount = 0;
      newAnswers.forEach(ans => {
        counts[ans] = (counts[ans] || 0) + 1;
        if (counts[ans] > maxCount) {
          maxCount = counts[ans];
          dominant = ans;
        }
      });
      setQuizResult(dominant);
      onAddLog('Finished Persona Quiz', `Determined Style Profile: ${dominant}`, 'chat');
    }
  };

  const handleClaimTask = (taskId: string, points: number) => {
    setCompletedTasks({ ...completedTasks, [taskId]: true });
    showToast(`Claimed +${points} SCUT Tokens! Synced with core wallet balances.`);
    onAddLog('Claimed Daily Quest', `Finished task ${taskId} for ${points} SCUT`, 'billing');
  };

  const handleContestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contestInput.trim()) {
      showToast("Please enter an aesthetic description or link to submit.");
      return;
    }
    setSubmittedContest(true);
    setContestInput('');
    showToast("Aesthetic lookbook entry uploaded securely to the SCUT Community board!");
    onAddLog('Entered Design Contest', 'Submitted summer design dossier', 'security');
  };

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-rose-50/40 via-[#fff0f2]/30 to-[#fdf2f4]/40 border border-rose-200/40 shadow-sm relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-gradient-to-br from-pink-300/10 to-rose-400/5 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 text-[10px] font-bold uppercase tracking-widest">Aesthetics</span>
              <Flame className="h-4.5 w-4.5 text-rose-400 animate-pulse" />
            </div>
            <h2 className="text-3xl font-display font-extrabold text-[#3b1c24] tracking-tight">Fun & Contests</h2>
            <p className="text-xs text-[#694e55] max-w-xl leading-relaxed">
              Engage in interactive color-harmony puzzles, discover your personal luxury style archetype, submit lookbooks, and claim daily SCUT tokens.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-white/60 border border-rose-100 rounded-2xl shadow-sm">
            {[
              { id: 'games', label: 'Play Mini-Games', icon: Gamepad2 },
              { id: 'quizzes', label: 'Quizzes & Personality', icon: HelpCircle },
              { id: 'rewards', label: 'Contests & Badges', icon: Trophy }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase cursor-pointer whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    activeSubTab === tab.id 
                      ? 'bg-[#3b1c24] text-white' 
                      : 'bg-transparent text-slate-500 hover:text-[#3b1c24]'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT & CENTER: ACTIVE TAB EXPERIENCE */}
        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence mode="wait">
            
            {/* MINI GAMES */}
            {activeSubTab === 'games' && (
              <motion.div 
                key="games"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-slate-100 rounded-3xl p-6.5 shadow-[0_15px_45px_rgba(243,212,217,0.1)] space-y-6"
              >
                <div>
                  <h3 className="text-sm font-bold text-[#3b1c24] uppercase tracking-wider flex items-center gap-2">
                    <Gamepad2 className="h-4.5 w-4.5 text-rose-500" />
                    Color Harmony Matcher
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Test your design intuition! Select the complementary luxury tone that creates the highest aesthetic harmony index.
                  </p>
                </div>

                {/* Question Block */}
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl space-y-5 text-center relative overflow-hidden">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">MATCH LEVEL {activeColorPairing + 1} / {colorQuestions.length}</span>
                  
                  <div className="flex flex-col items-center justify-center gap-2.5">
                    <div className="h-4.5 w-4.5 rounded-full bg-rose-200 text-rose-600 font-bold flex items-center justify-center text-[10px]">🎨</div>
                    <span className="text-sm font-semibold text-slate-500">Pair this core canvas tone:</span>
                    <span className="text-lg font-black text-[#3b1c24]">{colorQuestions[activeColorPairing].target}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                    {colorQuestions[activeColorPairing].options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleColorAnswer(opt)}
                        className="py-3 px-4 bg-white hover:bg-rose-50 border border-slate-100 text-xs font-bold text-[#3b1c24] rounded-xl transition-all cursor-pointer hover:border-rose-300"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  <div className="text-[10px] text-slate-400 italic font-medium pt-2">
                    💡 Hint: {colorQuestions[activeColorPairing].tip}
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-400">Total Harmony Score:</span>
                  <span className="text-emerald-600 font-extrabold">{scoreColorPairing} Points</span>
                </div>
              </motion.div>
            )}

            {/* QUIZZES & PERSONALITY TESTS */}
            {activeSubTab === 'quizzes' && (
              <motion.div 
                key="quizzes"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-slate-100 rounded-3xl p-6.5 shadow-[0_15px_45px_rgba(243,212,217,0.1)] space-y-6"
              >
                <div>
                  <h3 className="text-sm font-bold text-[#3b1c24] uppercase tracking-wider flex items-center gap-2">
                    <HelpCircle className="h-4.5 w-4.5 text-pink-500" />
                    Personal Luxury Style Archetype
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Answer these 3 strategic aesthetic preferences to let SCUT Athena map your dominant fashion design profile.
                  </p>
                </div>

                <AnimatePresence mode="wait">
                  {!quizStarted ? (
                    <div className="text-center py-8 space-y-4">
                      <div className="p-4 rounded-full bg-pink-500/10 border border-pink-500/20 w-fit mx-auto">
                        <Award className="h-8 w-8 text-pink-500 animate-pulse" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-700">Ready to locate your archetype?</h4>
                      <button
                        onClick={() => {
                          setQuizStarted(true);
                          setCurrentQuestionIndex(0);
                          setSelectedAnswers([]);
                          setQuizResult(null);
                        }}
                        className="px-6 py-3 bg-[#3b1c24] hover:bg-black text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                      >
                        <Play className="h-3 w-3 fill-white" /> Start Style assessment
                      </button>
                    </div>
                  ) : !quizResult ? (
                    <motion.div 
                      key={currentQuestionIndex}
                      initial={{ opacity: 0, x: 10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-4"
                    >
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                        <span>QUESTION {currentQuestionIndex + 1} / {styleQuiz.length}</span>
                        <span>Athena Style Engine</span>
                      </div>
                      
                      <h4 className="text-xs font-bold text-[#3b1c24] bg-slate-50 p-4 rounded-xl border border-slate-100">
                        {styleQuiz[currentQuestionIndex].q}
                      </h4>

                      <div className="grid grid-cols-1 gap-2.5 pt-2">
                        {styleQuiz[currentQuestionIndex].options.map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => handleQuizAnswer(opt.score)}
                            className="text-left py-3 px-4 bg-white hover:bg-pink-50 border border-slate-100 hover:border-pink-300 text-xs text-[#3b1c24] font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-between"
                          >
                            <span>{opt.text}</span>
                            <ChevronRight className="h-4 w-4 text-slate-300" />
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }} 
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-6 bg-pink-500/5 border border-pink-500/10 rounded-2xl text-center space-y-4"
                    >
                      <div className="p-4 rounded-full bg-pink-500/10 border border-pink-500/20 w-fit mx-auto">
                        <Sparkles className="h-8 w-8 text-pink-500" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-pink-600 uppercase tracking-widest">Diagnostic Outcome Achieved</span>
                      <h4 className="text-base font-black text-[#3b1c24]">Your Profile: {quizResult} Aesthetician</h4>
                      
                      <p className="text-xs text-[#694e55] leading-relaxed max-w-md mx-auto">
                        {quizResult === 'Minimalist' && "You prioritize high-purity shapes, premium solid fibers, absolute neutral palettes, and spacious negative design boundaries. Focus on cashmere investments."}
                        {quizResult === 'Boho' && "You align beautifully with earthy rust pigments, botanical floral layered silhouettes, raw turquoise jewelry, and rich regional craft traditions."}
                        {quizResult === 'Classic' && "Your style is defined by structured blazers, freshwater pearls, navy-and-gold contrasts, and timeless mid-century tailoring. Pure elegance."}
                        {quizResult === 'Avant-Garde' && "You are an absolute pioneer. You experiment with asymmetric architectural drapes, metallic accessories, deconstructed hems, and futuristic styles."}
                      </p>

                      <button
                        onClick={() => setQuizStarted(false)}
                        className="px-5 py-2.5 rounded-xl bg-[#3b1c24] hover:bg-black text-white text-[10px] font-bold transition-all cursor-pointer"
                      >
                        Retake Assessment
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* CONTESTS & BADGES */}
            {activeSubTab === 'rewards' && (
              <motion.div 
                key="rewards"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-slate-100 rounded-3xl p-6.5 shadow-[0_15px_45px_rgba(243,212,217,0.1)] space-y-6"
              >
                <div>
                  <h3 className="text-sm font-bold text-[#3b1c24] uppercase tracking-wider flex items-center gap-2">
                    <Trophy className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
                    Diaspora Design Contests
                  </h3>
                  <p className="text-xs text-[#694e55] mt-1 leading-relaxed">
                    Submit your custom lookbook outlines, or digital creative design dossiers to vote and share in pooled SCUT developer tokens.
                  </p>
                </div>

                <div className="p-5 bg-amber-500/5 border border-amber-500/10 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono font-bold text-amber-800 uppercase tracking-widest">Active Contest Block</span>
                    <span className="text-[10px] font-bold text-[#3b1c24] bg-white px-2.5 py-0.5 rounded-lg border border-amber-200">1,500 RON Pool</span>
                  </div>
                  <h4 className="text-xs font-bold text-[#3b1c24]">"My Summer In Romania" Creative Lookbook</h4>
                  <p className="text-[11px] text-[#694e55] leading-relaxed font-light">
                    Submit your look matching clean linen, regional embroidery, or soft rose aesthetics. Entries close in 4 days.
                  </p>

                  <AnimatePresence mode="wait">
                    {!submittedContest ? (
                      <form onSubmit={handleContestSubmit} className="space-y-2.5">
                        <textarea
                          placeholder="Type look description (colors, materials, or upload folder references)..."
                          value={contestInput}
                          onChange={e => setContestInput(e.target.value)}
                          className="w-full h-20 bg-white border border-slate-100 rounded-xl p-3 text-xs text-[#3b1c24] focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="w-full py-2 bg-[#3b1c24] hover:bg-black text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          Submit Creative Contest Entry
                        </button>
                      </form>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 bg-emerald-500/5 border border-emerald-500/10 text-emerald-800 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="h-4.5 w-4.5" /> Successfully registered! Your entry is live.
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* RIGHT COLUMN: DAILY TASKS & BADGES VAULT */}
        <div className="space-y-8">
          
          {/* DAILY TASKS */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-[0_15px_45px_rgba(243,212,217,0.1)] space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkle className="h-4 w-4 text-rose-500 animate-spin" style={{ animationDuration: '6s' }} />
              Daily Active Quests
            </h3>
            
            <div className="space-y-2">
              {dailyTasks.map(t => {
                const claimed = !!completedTasks[t.id];
                return (
                  <div key={t.id} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between gap-3 text-xs font-medium">
                    <div className="space-y-0.5">
                      <p className={`text-slate-700 font-bold ${claimed ? 'line-through text-slate-400' : ''}`}>{t.task}</p>
                      <span className="text-[10px] text-rose-500 font-bold">+{t.points} Tokens</span>
                    </div>
                    
                    <button
                      disabled={claimed}
                      onClick={() => handleClaimTask(t.id, t.points)}
                      className={`px-2.5 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                        claimed 
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                          : 'bg-[#3b1c24] hover:bg-black text-white'
                      }`}
                    >
                      {claimed ? 'Claimed' : 'Claim'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* BADGES VAULT */}
          <div className="bg-gradient-to-br from-[#3b1c24] to-[#1e0e12] rounded-3xl p-6 shadow-2xl text-white space-y-5 relative overflow-hidden border border-rose-950/20">
            <div className="absolute -bottom-12 -left-12 h-28 w-28 bg-pink-500/10 rounded-full filter blur-xl pointer-events-none" />
            
            <div className="flex items-center gap-2.5">
              <Award className="h-5 w-5 text-rose-300" />
              <div>
                <h3 className="text-xs font-mono font-bold text-rose-300 uppercase tracking-widest">Rewards Vault</h3>
                <h4 className="text-xs font-bold text-white">Your Earned SCUT Badges</h4>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                { name: "Founder Star", unlocked: true, color: "from-pink-500 to-rose-600" },
                { name: "Zen Curator", unlocked: true, color: "from-emerald-500 to-teal-600" },
                { name: "Harmony Pioneer", unlocked: false, color: "from-amber-400 to-orange-500" },
                { name: "Security Guardian", unlocked: false, color: "from-blue-500 to-indigo-600" }
              ].map((bg, i) => (
                <div 
                  key={i} 
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center space-y-1.5 transition-all ${
                    bg.unlocked 
                      ? 'bg-white/5 border-white/10 text-white' 
                      : 'bg-black/20 border-white/5 text-slate-500'
                  }`}
                >
                  <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${bg.unlocked ? bg.color : 'from-slate-700 to-slate-800'} flex items-center justify-center font-bold text-white text-xs shadow-inner`}>
                    {bg.unlocked ? "⭐" : "🔒"}
                  </div>
                  <span className="text-[10px] font-bold truncate w-full">{bg.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
