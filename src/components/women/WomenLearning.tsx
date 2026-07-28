/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, GraduationCap, CheckCircle, Award, Play, Star, Sparkle,
  ArrowRight, ShieldCheck, DollarSign, Briefcase, RefreshCw, Layers
} from 'lucide-react';

interface Lesson {
  title: string;
  duration: string;
  content: string;
}

interface Course {
  id: string;
  title: string;
  category: 'Safety' | 'Finance' | 'Business';
  instructor: string;
  rating: number;
  duration: string;
  lessonsCount: number;
  lessons: Lesson[];
  quiz: {
    question: string;
    options: string[];
    correct: string;
  };
}

export default function WomenLearning({ onAddLog, showToast }: { onAddLog: (action: string, details: string, type: any) => Promise<void>; showToast: (msg: string) => void }) {
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  
  // Quiz and Certificate states
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [passedQuiz, setPassedQuiz] = useState(false);
  const [certificates, setCertificates] = useState<{ [courseId: string]: boolean }>({});

  const courses: Course[] = [
    {
      id: 'cr-1',
      title: "Women's Safety Education & Self Defense Protocols",
      category: 'Safety',
      instructor: "Elena Popescu (Self-Defense Trainer)",
      rating: 4.9,
      duration: "45 mins",
      lessonsCount: 3,
      lessons: [
        { title: "Situational Awareness & Risk Metrics", duration: "15 mins", content: "Learn to read structural spaces. Always maintain visual boundaries, locate exits, and identify secure cells in social venues. Trust your biological panic indexes — they are refined risk signals." },
        { title: "De-escalation Strategies & Speech Bounds", duration: "15 mins", content: "Use authoritative, low-pitch vocal tones to draw public attention. Build strict verbal safety parameters. Examples: 'Back away now' or 'Do not touch me'. Never negotiate boundary breaches." },
        { title: "Tactical Physical Self-Defense Basics", duration: "15 mins", content: "Focus on vulnerable sensory nodes: throat, eyes, ears, and groin. Use the palm heel strike instead of closed fists to avoid bone fractures. Forceful thrusts create safe windows to retreat." }
      ],
      quiz: {
        question: "What is the primary objective of tactical self-defense?",
        options: [
          "To engage in prolonged physical combat",
          "To disable the target momentarily to escape to safety",
          "To capture and hold the aggressor"
        ],
        correct: "To disable the target momentarily to escape to safety"
      }
    },
    {
      id: 'cr-2',
      title: "Financial Literacy & Wealth Preservation Studio",
      category: 'Finance',
      instructor: "Ioana Radu (Venture Capital Partner)",
      rating: 5.0,
      duration: "1 hour",
      lessonsCount: 3,
      lessons: [
        { title: "Compound Interest & Capital Buffers", duration: "20 mins", content: "Understand compound growth. Reinvest yields immediately. Establish an emergency liquid safety reserve covering at least 6 months of cellular and living requirements before buying high-risk assets." },
        { title: "Real Estate & Safe Asset Classes", duration: "20 mins", content: "Explore index funds, high-yield deposit structures, and real estate. Learn about the Romanian diaspora property optimization indexes. Minimize speculative leverage." },
        { title: "DeFi & Cryptographic Assets", duration: "20 mins", content: "How blockchain rails optimize secure capital transfer. Learn to navigate cold storage wallets, gas fees, and yield generation parameters safely without exposing private keys." }
      ],
      quiz: {
        question: "What should be established before allocating capital to high-risk assets?",
        options: [
          "A speculative credit card loan",
          "A liquid safety reserve covering 6 months of expenses",
          "A list of high-leverage trading options"
        ],
        correct: "A liquid safety reserve covering 6 months of expenses"
      }
    },
    {
      id: 'cr-3',
      title: "Business Academy: Idea to Diaspora Venture Launch",
      category: 'Business',
      instructor: "Simona Dumitrescu (Fintech Founder)",
      rating: 4.8,
      duration: "1.5 hours",
      lessonsCount: 3,
      lessons: [
        { title: "Structuring Cap Tables & Seed Capital", duration: "30 mins", content: "Avoid founder dilution in early venture rounds. Structure convertible notes and equity pools cleanly. Learn the parameters of safe cap-table growth metrics." },
        { title: "Product-Market Fit & Feedback Loops", duration: "30 mins", content: "Validate with 10 real customers before writing production code. Build low-fidelity landing pages or interactive wireframes. Measure retention before marketing spend." },
        { title: "Global Scaling & Intellectual Property", duration: "30 mins", content: "Secure patents and trademarks early. Map EU regulatory structures (GDPR compliance) and scale services through localized digital models." }
      ],
      quiz: {
        question: "How should you validate product market fit in the early stage?",
        options: [
          "By spending heavily on search advertisements",
          "By obtaining feedback from 10 real customers before full-scale coding",
          "By hiring a team of global scaling advisors"
        ],
        correct: "By obtaining feedback from 10 real customers before full-scale coding"
      }
    }
  ];

  const handleLessonComplete = () => {
    if (!activeCourse) return;
    if (activeLessonIndex < activeCourse.lessons.length - 1) {
      setActiveLessonIndex(activeLessonIndex + 1);
      showToast("Completed lesson module! Proceeding...");
    } else {
      setShowQuiz(true);
      setSelectedQuizOption(null);
      setQuizFinished(false);
      showToast("All lesson modules completed. Course evaluation unlocked!");
    }
  };

  const handleEvaluateQuiz = () => {
    if (!activeCourse) return;
    const isCorrect = selectedQuizOption === activeCourse.quiz.correct;
    setQuizFinished(true);
    setPassedQuiz(isCorrect);
    
    if (isCorrect) {
      setCertificates({ ...certificates, [activeCourse.id]: true });
      showToast(`Congratulations! You passed the evaluation block. Certificate issued.`);
      onAddLog('Passed Academy Course', `Earned certificate for: ${activeCourse.title}`, 'billing');
    } else {
      showToast("Evaluation score insufficient. Re-read lesson details and try again.");
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
              <span className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 text-[10px] font-bold uppercase tracking-widest">Academy</span>
              <GraduationCap className="h-4.5 w-4.5 text-rose-400 animate-pulse" />
            </div>
            <h2 className="text-3xl font-display font-extrabold text-[#3b1c24] tracking-tight">Academy & Learning</h2>
            <p className="text-xs text-[#694e55] max-w-xl leading-relaxed">
              Acquire elite credentials, complete financial and venture capital sprints, practice safety de-escalation, and secure downloadable diplomas.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/5 border border-emerald-500/15 text-emerald-700 rounded-2xl text-xs font-bold shadow-inner">
            <CheckCircle className="h-4 w-4" />
            Venture-Accredited
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: COURSE SELECTION & CERTIFICATES */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-[#3b1c24] uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="h-4.5 w-4.5 text-rose-500 animate-pulse" />
            Accredited Courses
          </h3>

          <div className="space-y-3">
            {courses.map(course => {
              const hasCertificate = !!certificates[course.id];
              return (
                <div 
                  key={course.id} 
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3.5 hover:shadow-lg hover:shadow-rose-100/10 cursor-pointer bg-white ${
                    activeCourse?.id === course.id ? 'border-rose-400 ring-1 ring-rose-100' : 'border-slate-100'
                  }`}
                  onClick={() => {
                    setActiveCourse(course);
                    setActiveLessonIndex(0);
                    setShowQuiz(false);
                    setQuizFinished(false);
                  }}
                >
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[9px] font-mono font-bold text-rose-500 uppercase">
                      <span>{course.category} Academy</span>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        <Star className="h-3 w-3 fill-amber-500" />
                        <span>{course.rating}</span>
                      </div>
                    </div>
                    <h4 className="text-xs font-bold text-[#3b1c24] leading-snug">{course.title}</h4>
                    <span className="text-[10px] text-slate-400 block font-medium">Instructor: {course.instructor}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-50 text-[10px] font-mono text-slate-400">
                    <span>{course.duration} • {course.lessonsCount} lessons</span>
                    {hasCertificate ? (
                      <span className="text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <Award className="h-3.5 w-3.5" /> Certified
                      </span>
                    ) : (
                      <span className="text-rose-500 font-bold hover:underline flex items-center gap-1">
                        Start <ArrowRight className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* CERTIFICATES VAULT */}
          {Object.values(certificates).some(Boolean) && (
            <div className="bg-gradient-to-br from-[#3b1c24] to-[#1e0e12] rounded-3xl p-5 shadow-2xl text-white space-y-4 border border-rose-950/20">
              <h4 className="text-xs font-mono font-bold text-rose-300 uppercase tracking-widest flex items-center gap-1.5">
                <Award className="h-4 w-4" /> Credentials Desk
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed font-light">
                Your secure educational certificates are certified on localized blockchain parameters.
              </p>
              
              <div className="space-y-2">
                {courses.map(course => {
                  if (!certificates[course.id]) return null;
                  return (
                    <div key={course.id} className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between text-xs">
                      <span className="font-bold truncate max-w-[150px]">{course.title}</span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">Pass (100%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* CENTER & RIGHT COLUMN: ACTIVE COURSE LESSON PLAYER */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {activeCourse ? (
              <motion.div 
                key={activeCourse.id}
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white border border-slate-100 rounded-3xl p-6.5 shadow-[0_15px_45px_rgba(243,212,217,0.1)] space-y-6"
              >
                {!showQuiz ? (
                  <div className="space-y-6">
                    {/* Lesson Header */}
                    <div className="flex flex-col md:flex-row justify-between gap-4 pb-4 border-b border-slate-100">
                      <div>
                        <span className="text-[9px] font-mono font-bold text-rose-500 uppercase">Lesson {activeLessonIndex + 1} of {activeCourse.lessons.length}</span>
                        <h3 className="text-sm font-bold text-[#3b1c24] mt-0.5">{activeCourse.lessons[activeLessonIndex].title}</h3>
                        <p className="text-xs text-slate-400 mt-1">Instructor: {activeCourse.instructor}</p>
                      </div>

                      <div className="text-[10px] text-slate-400 font-mono bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 flex items-center gap-1 shrink-0 h-fit self-start md:self-auto">
                        <Play className="h-3 w-3 fill-slate-400" /> {activeCourse.lessons[activeLessonIndex].duration}
                      </div>
                    </div>

                    {/* Lesson Content Area */}
                    <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 h-24 w-24 bg-[#fff0f2]/40 rounded-full blur-xl pointer-events-none" />
                      
                      <div className="space-y-4 relative">
                        <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Lesson Syllabus Core</h4>
                        <p className="text-xs text-[#3b1c24] font-medium leading-relaxed bg-white p-5 rounded-xl border border-slate-100/50 shadow-sm">
                          {activeCourse.lessons[activeLessonIndex].content}
                        </p>
                      </div>
                    </div>

                    {/* Lesson Progress Navigation */}
                    <div className="flex justify-between items-center pt-2">
                      <button
                        onClick={() => setActiveLessonIndex(prev => Math.max(0, prev - 1))}
                        disabled={activeLessonIndex === 0}
                        className="px-4 py-2 rounded-xl border border-slate-100 text-slate-500 hover:bg-slate-50 transition-all text-xs font-bold disabled:opacity-40"
                      >
                        Previous Lesson
                      </button>

                      <button
                        onClick={handleLessonComplete}
                        className="px-5 py-2.5 rounded-xl bg-[#3b1c24] text-white hover:bg-black transition-all text-xs font-bold flex items-center gap-1"
                      >
                        {activeLessonIndex === activeCourse.lessons.length - 1 ? 'Evaluate Course' : 'Next Lesson'} <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  // Quiz and Evaluation Area
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <div className="pb-3 border-b border-slate-100 flex justify-between items-center">
                      <div>
                        <span className="text-[9px] font-mono font-bold text-rose-500 uppercase">COURSE EVALUATION</span>
                        <h3 className="text-sm font-bold text-[#3b1c24]">{activeCourse.title}</h3>
                      </div>
                      <button
                        onClick={() => setShowQuiz(false)}
                        className="text-[10px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        Back to lessons
                      </button>
                    </div>

                    {!quizFinished ? (
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-slate-600">{activeCourse.quiz.question}</h4>
                        <div className="grid grid-cols-1 gap-2.5">
                          {activeCourse.quiz.options.map((opt, i) => (
                            <button
                              key={i}
                              onClick={() => setSelectedQuizOption(opt)}
                              className={`text-left p-3.5 rounded-xl border transition-all text-xs font-semibold cursor-pointer flex justify-between items-center ${
                                selectedQuizOption === opt 
                                  ? 'bg-rose-500/10 border-rose-400 text-rose-800' 
                                  : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <span>{opt}</span>
                              <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                                selectedQuizOption === opt ? 'border-rose-500 bg-rose-500' : 'border-slate-300 bg-white'
                              }`}>
                                {selectedQuizOption === opt && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                              </div>
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={handleEvaluateQuiz}
                          disabled={!selectedQuizOption}
                          className="w-full py-3 bg-[#3b1c24] hover:bg-black text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40"
                        >
                          Submit Evaluation
                        </button>
                      </div>
                    ) : (
                      // Evaluation result
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-6 space-y-4"
                      >
                        {passedQuiz ? (
                          <>
                            <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 w-fit mx-auto">
                              <Award className="h-10 w-10 text-emerald-500 animate-bounce" />
                            </div>
                            <h4 className="text-base font-black text-[#3b1c24]">Evaluation Passed successfully!</h4>
                            <p className="text-xs text-[#694e55] leading-relaxed max-w-sm mx-auto">
                              You have mastered the parameters for {activeCourse.title}. Your certified diploma has been recorded locally on this browser.
                            </p>

                            {/* CERTIFICATE DISPLAY MOCKUP */}
                            <div className="p-6 bg-slate-50 border-2 border-double border-slate-200 rounded-2xl max-w-md mx-auto relative text-left space-y-4">
                              <div className="flex justify-between items-center">
                                <span className="text-[8px] font-mono text-slate-400">CERTIFICATE ID: SCUT-AC-{activeCourse.id}</span>
                                <GraduationCap className="h-4.5 w-4.5 text-rose-400" />
                              </div>
                              <div className="text-center space-y-1">
                                <h5 className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Diploma of Mastery</h5>
                                <p className="text-xs font-serif font-black text-[#3b1c24]">Diaspora Member</p>
                                <p className="text-[9px] text-[#694e55] leading-relaxed">
                                  for successfully navigating and completing the full curriculum bounds of:
                                </p>
                                <p className="text-xs font-bold text-rose-600">{activeCourse.title}</p>
                              </div>
                              <div className="flex justify-between items-center text-[8px] font-mono text-slate-400 pt-2 border-t border-slate-200/50">
                                <span>SCUT Academy Desk</span>
                                <span>VERIFIED STABLE</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="p-4 rounded-full bg-rose-500/10 border border-rose-500/20 w-fit mx-auto">
                              <RefreshCw className="h-10 w-10 text-rose-500 animate-spin" />
                            </div>
                            <h4 className="text-base font-black text-[#3b1c24]">Score Insufficient (0%)</h4>
                            <p className="text-xs text-slate-500 max-w-xs mx-auto">
                              Double-check your syllabus bounds and retake the evaluation quiz.
                            </p>
                          </>
                        )}

                        <div className="flex justify-center gap-3 pt-2">
                          <button
                            onClick={() => {
                              setShowQuiz(false);
                              setQuizFinished(false);
                            }}
                            className="px-4 py-2 border border-slate-100 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all cursor-pointer"
                          >
                            Re-read Lessons
                          </button>
                          <button
                            onClick={() => {
                              setShowQuiz(true);
                              setSelectedQuizOption(null);
                              setQuizFinished(false);
                            }}
                            className="px-5 py-2 bg-[#3b1c24] hover:bg-black text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                          >
                            Try Quiz Again
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <div className="h-full min-h-[300px] border border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-6 text-center text-slate-400">
                <GraduationCap className="h-10 w-10 text-rose-300 animate-bounce mb-3" />
                <span className="text-xs font-semibold text-slate-500">Select a course from the academy desk to start learning.</span>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
