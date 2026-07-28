/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, Heart, Trophy, CheckCircle, Plus, Trash2, ArrowRight,
  TrendingUp, Dumbbell, Home, Award, Calendar, ChevronRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

interface FitnessLog {
  date: string;
  weight: number;
  activeCalories: number;
  completedExercises: number;
}

export default function WomenFitness({ onAddLog, showToast }: { onAddLog: (action: string, details: string, type: any) => Promise<void>; showToast: (msg: string) => void }) {
  const [activeType, setActiveType] = useState<'home' | 'gym'>('home');
  
  // Progress tracker logs state
  const [fitnessLogs, setFitnessLogs] = useState<FitnessLog[]>([
    { date: 'Jul 17', weight: 62.1, activeCalories: 350, completedExercises: 4 },
    { date: 'Jul 16', weight: 62.3, activeCalories: 280, completedExercises: 3 },
    { date: 'Jul 15', weight: 62.4, activeCalories: 410, completedExercises: 5 },
    { date: 'Jul 14', weight: 62.5, activeCalories: 150, completedExercises: 2 }
  ]);
  const [weightInput, setWeightInput] = useState('');
  const [caloriesInput, setCaloriesInput] = useState('');
  const [exercisesCountInput, setExercisesCountInput] = useState('3');

  // Active Challenge States
  const [joinedChallenges, setJoinedChallenges] = useState<{ [key: string]: boolean }>({
    'ch-1': true // Start pre-joined
  });
  const [challengeProgress, setChallengeProgress] = useState<{ [key: string]: number }>({
    'ch-1': 14 // 14 out of 30 days
  });

  const workoutPrograms = {
    home: [
      { id: 'h-1', name: "Full-Body Core Sculpt", duration: "25 Mins", level: "Beginner", cal: "~180 Kcal", exercises: ["Bodyweight Squats (3 sets x 15 reps)", "Glute Bridges (3 sets x 20 reps)", "Incline Push-ups (3 sets x 10 reps)", "Forearm Plank Hold (3 sets x 45 secs)"] },
      { id: 'h-2', name: "High-Intensity Pilates Burn", duration: "35 Mins", level: "Intermediate", cal: "~260 Kcal", exercises: ["Pilates Hundreds (100 beats)", "Donkey Kicks (3 sets x 15 reps each)", "Criss-Cross Oblique Twists (3 sets x 20 reps)", "Superman Back Extenders (3 sets x 12 reps)"] }
    ],
    gym: [
      { id: 'g-1', name: "Hypertrophy Glute & Leg Day", duration: "50 Mins", level: "Intermediate", cal: "~380 Kcal", exercises: ["Barbell Romanian Deadlifts (4 sets x 10 reps)", "Goblet Squats with Kettlebell (3 sets x 12 reps)", "Dumbbell Walking Lunges (3 sets x 16 steps)", "Cable Kickbacks (3 sets x 12 reps each)"] },
      { id: 'g-2', name: "Upper-Body Strength & Posture", duration: "45 Mins", level: "Advanced", cal: "~320 Kcal", exercises: ["Seated Cable Rows (4 sets x 10 reps)", "Dumbbell Shoulder Press (3 sets x 12 reps)", "Lat Pulldowns (3 sets x 10 reps)", "Tricep Overhead Extensions (3 sets x 15 reps)"] }
    ]
  };

  const challenges = [
    { id: 'ch-1', title: "30-Day Core Sprint Challenge", days: 30, prize: "50 SCUT Tokens + Elite Core Badge", desc: "Consistency build-up. Complete one 5-minute core burn workout daily." },
    { id: 'ch-2', title: "Summer Diaspora Run Sprints", days: 15, prize: "75 SCUT Tokens + Fleet Feet Badge", desc: "Cardiovascular builder. Log at least 3km of running, 4 days a week." }
  ];

  const handleAddFitnessLog = (e: React.FormEvent) => {
    e.preventDefault();
    const weight = parseFloat(weightInput);
    const calories = parseInt(caloriesInput);
    const exercises = parseInt(exercisesCountInput);

    if (isNaN(weight) || isNaN(calories) || isNaN(exercises)) {
      showToast("Please fill in valid numerical values.");
      return;
    }

    const newLogEntry: FitnessLog = {
      date: 'Jul ' + (18 + fitnessLogs.length),
      weight,
      activeCalories: calories,
      completedExercises: exercises
    };

    setFitnessLogs([newLogEntry, ...fitnessLogs]);
    setWeightInput('');
    setCaloriesInput('');
    showToast("Workout log synced and added to security progress registers!");
    onAddLog('Logged Fitness Workout', `Recorded weight: ${weight}kg, active calories: ${calories}kcal`, 'chat');
  };

  const handleAdvanceChallenge = (chId: string, maxDays: number) => {
    const current = challengeProgress[chId] || 0;
    if (current >= maxDays) {
      showToast("You have completed this challenge! Reward badge claims unlocked.");
      return;
    }
    const updated = current + 1;
    setChallengeProgress({ ...challengeProgress, [chId]: updated });
    showToast(`Logged Day ${updated}/${maxDays}! Keep pushing toward your active balance.`);
    if (updated === maxDays) {
      onAddLog('Completed Fitness Challenge', `Successfully finished challenge: ${chId}`, 'billing');
    }
  };

  const handleJoinChallenge = (chId: string) => {
    setJoinedChallenges({ ...joinedChallenges, [chId]: true });
    setChallengeProgress({ ...challengeProgress, [chId]: 0 });
    showToast("Challenge activated! Ready to sprint.");
  };

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-rose-50/40 via-[#fff0f2]/30 to-[#fdf2f4]/40 border border-rose-200/40 shadow-sm relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-gradient-to-br from-pink-300/10 to-rose-400/5 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 text-[10px] font-bold uppercase tracking-widest">Active Body</span>
              <Dumbbell className="h-4.5 w-4.5 text-rose-400 animate-bounce" />
            </div>
            <h2 className="text-3xl font-display font-extrabold text-[#3b1c24] tracking-tight">Fitness Sprints</h2>
            <p className="text-xs text-[#694e55] max-w-xl leading-relaxed">
              Explore custom high-performance home or gym training programs, join community challenges, and visualize physical progress curves securely.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveType('home')}
              className={`px-4.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                activeType === 'home' 
                  ? 'bg-[#3b1c24] text-white border-[#3b1c24]' 
                  : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
              }`}
            >
              <Home className="h-4 w-4" /> Home Workouts
            </button>
            <button
              onClick={() => setActiveType('gym')}
              className={`px-4.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                activeType === 'gym' 
                  ? 'bg-[#3b1c24] text-white border-[#3b1c24]' 
                  : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
              }`}
            >
              <Dumbbell className="h-4 w-4" /> Gym Programs
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ACTIVE PROGRAMS & EXERCISE CHECKLISTS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#3b1c24] uppercase tracking-wider flex items-center gap-2">
              <CheckCircle className="h-4.5 w-4.5 text-emerald-500 animate-pulse" />
              Active Training Programs
            </h3>
            <span className="text-xs text-slate-400">Local Cache Saved</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workoutPrograms[activeType].map(program => (
              <div key={program.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_15px_45px_rgba(243,212,217,0.05)] space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-0.5 rounded bg-rose-50 border border-rose-100 text-rose-600 font-mono text-[9px] font-bold uppercase">
                      {program.level}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">{program.duration} • {program.cal}</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#3b1c24] mt-2.5">{program.name}</h4>

                  <div className="space-y-2 pt-3 border-t border-slate-50 mt-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Exercise Protocol:</span>
                    <div className="space-y-1.5">
                      {program.exercises.map((ex, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-[#694e55] font-medium leading-normal">
                          <ChevronRight className="h-3.5 w-3.5 text-rose-400 mt-0.5 shrink-0" />
                          <span>{ex}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    showToast(`Started "${program.name}" session! Track set completion locally.`);
                    onAddLog('Started Workout Session', `Initiated program: ${program.name}`, 'chat');
                  }}
                  className="w-full mt-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 text-[#3b1c24] font-bold text-[11px] rounded-xl transition-all cursor-pointer"
                >
                  Start Workout Protocol
                </button>
              </div>
            ))}
          </div>

          {/* ACTIVE CHALLENGES */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6.5 shadow-[0_15px_45px_rgba(243,212,217,0.1)] space-y-6">
            <h3 className="text-sm font-bold text-[#3b1c24] uppercase tracking-wider flex items-center gap-2">
              <Trophy className="h-4.5 w-4.5 text-amber-500 animate-bounce" />
              Ecosystem Active Sprints
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {challenges.map(ch => {
                const joined = !!joinedChallenges[ch.id];
                const prog = challengeProgress[ch.id] || 0;
                const percent = Math.round((prog / ch.days) * 100);

                return (
                  <div key={ch.id} className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-[#3b1c24]">{ch.title}</h4>
                        {joined && <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Active</span>}
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal mt-1">{ch.desc}</p>
                      
                      <div className="bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-xl text-[9px] text-amber-800 font-bold mt-3">
                        🎁 Target Reward: {ch.prize}
                      </div>
                    </div>

                    {joined ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-slate-400">Sprint progress:</span>
                          <span className="text-[#3b1c24] font-bold">{prog} / {ch.days} Days ({percent}%)</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300" style={{ width: `${percent}%` }} />
                        </div>
                        <button
                          onClick={() => handleAdvanceChallenge(ch.id, ch.days)}
                          className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-bold transition-all cursor-pointer shadow-sm shadow-emerald-500/10"
                        >
                          Complete Today's Task
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleJoinChallenge(ch.id)}
                        className="w-full py-2 bg-[#3b1c24] hover:bg-black text-white rounded-xl text-[10px] font-bold transition-all cursor-pointer"
                      >
                        Activate Challenge Sprint
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* FITNESS PROGRESS TRACKING COLUMN */}
        <div className="space-y-8">
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-[0_15px_45px_rgba(243,212,217,0.1)] space-y-6">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <TrendingUp className="h-4.5 w-4.5 text-rose-500 animate-pulse" />
              Metas & Progress Log
            </h3>

            {/* Quick Logging form */}
            <form onSubmit={handleAddFitnessLog} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3.5 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-mono text-slate-400">Current Bodyweight (kg)</label>
                <input 
                  type="number"
                  step="0.1"
                  placeholder="e.g. 62.1"
                  value={weightInput}
                  onChange={e => setWeightInput(e.target.value)}
                  className="w-full bg-white border border-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-mono text-slate-400">Active Calories</label>
                  <input 
                    type="number"
                    placeholder="e.g. 300"
                    value={caloriesInput}
                    onChange={e => setCaloriesInput(e.target.value)}
                    className="w-full bg-white border border-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-mono text-slate-400">Exercises</label>
                  <select
                    value={exercisesCountInput}
                    onChange={e => setExercisesCountInput(e.target.value)}
                    className="w-full bg-white border border-slate-100 rounded-xl px-2 py-2 text-xs focus:outline-none"
                  >
                    <option value="1">1 Completed</option>
                    <option value="2">2 Completed</option>
                    <option value="3">3 Completed</option>
                    <option value="4">4 Completed</option>
                    <option value="5">5 Completed</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#3b1c24] hover:bg-black text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Log Today's Workout metrics
              </button>
            </form>

            {/* Recharts Analytics Chart for calories */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Caloric Output Trend</span>
              <div className="h-40 w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[...fitnessLogs].reverse()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f2dbe0" opacity={0.5} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} />
                    <YAxis stroke="#94a3b8" fontSize={9} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#ebd0d5', borderRadius: '12px', fontSize: '11px', color: '#3b1c24' }} />
                    <Area type="monotone" dataKey="activeCalories" stroke="#f43f5e" strokeWidth={2} fillOpacity={0.15} fill="url(#colorCalGradient)" />
                    <defs>
                      <linearGradient id="colorCalGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Badge Rewards preview */}
            <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-center gap-3">
              <Award className="h-9 w-9 text-amber-500 shrink-0" />
              <div>
                <h4 className="text-[11px] font-bold text-slate-700">Pioneer Fitness Badges</h4>
                <p className="text-[10px] text-slate-500 leading-normal">Earn SCUT active tokens for reaching consecutive streaks!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
