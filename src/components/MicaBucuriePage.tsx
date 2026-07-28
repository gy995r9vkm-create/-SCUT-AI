import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, Sparkles, Coffee, Gift, MessageSquare, Smile, 
  Send, RefreshCw, Star, Info, Sun, HeartHandshake, Award
} from 'lucide-react';
import { User } from '../types';

interface MicaBucuriePageProps {
  user: User | null;
  onNavigate: (page: string) => void;
  onAddLog: (action: string, details: string, type: 'chat' | 'billing' | 'api' | 'security') => Promise<void>;
}

export default function MicaBucuriePage({ user, onNavigate, onAddLog }: MicaBucuriePageProps) {
  const [affirmation, setAffirmation] = useState<string>(
    "Aici este Mica Ta Bucurie de astăzi: Ești un arhitect de idei extraordinar, iar munca ta are puterea de a aduce lumină celor din jur!"
  );
  const [generating, setGenerating] = useState(false);
  const [smileMeter, setSmileMeter] = useState(72);
  const [vouchers, setVouchers] = useState<any[]>([
    { id: 'v-1', recipient: 'Mama', type: 'Virtual Coffee', code: 'BUCURIE-COFFEE-8120', claimed: false },
    { id: 'v-2', recipient: 'Gabriel', type: 'Smile Voucher', code: 'BUCURIE-SMILE-4412', claimed: true }
  ]);

  // Voucher state
  const [newRecipient, setNewRecipient] = useState('');
  const [voucherType, setVoucherType] = useState('Virtual Coffee');

  // Interactive challenges
  const challenges = [
    "Trimite-i cuiva drag un mesaj scurt în care să-i spui de ce îl apreciezi.",
    "Închide ochii pentru 30 de secunde și gândește-te la 3 lucruri bune care ți s-au întâmplat săptămâna asta.",
    "Bea un pahar cu apă încet, respirând adânc și bucurându-te de moment.",
    "Fă-ți un ceai bun sau o cafea aromată și nu te atinge de telefon timp de 5 minute în timp ce le bei."
  ];
  const [activeChallenge, setActiveChallenge] = useState(challenges[0]);

  const generateAffirmation = async () => {
    setGenerating(true);
    try {
      // Hit backend sandbox/chat endpoint to generate a custom small joy in Romanian/English!
      const response = await fetch('/api/sandbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: "Generează o 'mică bucurie' (o frază scurtă, pozitivă, caldă și încurajatoare în limba română pentru utilizatorul SCUT Platform, de maxim 2 propoziții).",
          temperature: 0.85
        })
      });
      const data = await response.json();
      if (data.choices && data.choices[0] && data.choices[0].message) {
        setAffirmation(data.choices[0].message.content);
        setSmileMeter(prev => Math.min(100, prev + Math.floor(Math.random() * 5) + 2));
        onAddLog('Mica Bucurie Generated', 'A custom Romanian small joy quote was requested and compiled.', 'chat');
      }
    } catch (err) {
      // Fallback
      const localJoy = [
        "Fiecare linie de cod pe care o scrii aduce ordine în haos. Continuă să creezi cu drag!",
        "Meriți să te oprești 2 minute, să respiri adânc și să zâmbești. Totul va fi minunat!",
        "Micile bucurii sunt cele care fac viața frumoasă. Meriți o zi plină de soare și zâmbete!",
        "Ai realizat atât de multe până acum. Fii mândru de drumul tău și păstrează-ți inima deschisă."
      ];
      setAffirmation(localJoy[Math.floor(Math.random() * localJoy.length)]);
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipient) return;

    const code = `BUCURIE-${voucherType.split(' ')[0].toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newV = {
      id: 'v-' + Math.random().toString(36).substring(2, 9),
      recipient: newRecipient,
      type: voucherType,
      code,
      claimed: false
    };

    setVouchers([newV, ...vouchers]);
    setNewRecipient('');
    setSmileMeter(prev => Math.min(100, prev + 5));
    onAddLog('Mica Bucurie Gift Minted', `Sent virtual ${voucherType} to ${newRecipient}`, 'chat');
  };

  const cycleChallenge = () => {
    const currentIdx = challenges.indexOf(activeChallenge);
    const nextIdx = (currentIdx + 1) % challenges.length;
    setActiveChallenge(challenges[nextIdx]);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white pt-24 pb-16">
      {/* Visual background accents */}
      <div className="absolute top-1/4 -left-1/4 h-[400px] w-[400px] rounded-full bg-rose-500/5 blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/3 -right-1/4 h-[500px] w-[500px] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none animate-pulse" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="border-b border-slate-900 pb-8 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-medium mb-3">
            <Heart className="h-3.5 w-3.5 text-rose-400 fill-rose-400 animate-pulse" />
            <span>Mica Bucurie (The Small Joy Module)</span>
          </div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-white">
            Mica <span className="text-rose-400">Bucurie</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1 leading-relaxed font-light">
            A sanctuary of positive vibrations and small acts of kindness in the SCUT platform. Breathe, smile, and share appreciation.
          </p>
        </div>

        {/* Content Layout Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* AI Positive Affirmation Card */}
          <div className="lg:col-span-8 space-y-8">
            <div className="rounded-3xl border border-slate-900 bg-gradient-to-br from-slate-950 via-slate-950 to-rose-950/20 p-8 shadow-xl backdrop-blur-md relative overflow-hidden">
              <div className="absolute -top-10 -right-10 h-32 w-32 bg-rose-500/5 rounded-full pointer-events-none blur-xl" />
              
              <h2 className="font-display text-lg font-bold text-slate-200 flex items-center gap-2 mb-6">
                <Sparkles className="h-4 w-4 text-rose-400" />
                Gândul Bun Generat de Inteligența SCUT
              </h2>

              <div className="bg-slate-950/60 border border-slate-900 p-8 rounded-2xl relative min-h-[140px] flex items-center justify-center text-center">
                <p className="text-sm md:text-base font-light leading-relaxed text-slate-200 italic">
                  "{affirmation}"
                </p>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400">
                    <Smile className="h-4 w-4" />
                  </div>
                  <span className="text-xs text-slate-400 font-light">
                    Măsurătorul de Zâmbete al Platformei: <span className="text-rose-400 font-mono font-bold">{smileMeter}%</span>
                  </span>
                </div>

                <button
                  onClick={generateAffirmation}
                  disabled={generating}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-display font-semibold text-slate-950 bg-gradient-to-r from-rose-400 to-amber-300 hover:from-rose-300 hover:to-amber-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Se aduc gânduri bune...
                    </>
                  ) : (
                    <>
                      <Heart className="h-4 w-4 fill-slate-950" />
                      Alt Gând Bun de Astăzi
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Daily Smile Challenge Card */}
            <div className="rounded-3xl border border-slate-900 bg-slate-950/80 p-8 shadow-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                  <HeartHandshake className="h-5 w-5 text-rose-400" />
                  Provocarea Ta Zilnică de Zâmbit
                </h3>
                <button
                  onClick={cycleChallenge}
                  className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" /> Schimbă
                </button>
              </div>

              <div className="bg-slate-900/40 border border-slate-900/60 p-6 rounded-2xl relative flex flex-col justify-between min-h-[120px]">
                <p className="text-xs md:text-sm text-slate-300 font-light leading-relaxed">
                  {activeChallenge}
                </p>
                <div className="flex items-center gap-2 mt-4 text-[10px] text-slate-500">
                  <Award className="h-3.5 w-3.5 text-rose-400" />
                  <span>Finalizează această provocare mică pentru a-ți însenina ziua!</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mica Bucurie Voucher Generator (Share Positive Vibes) */}
          <div className="lg:col-span-4 space-y-8">
            <div className="rounded-3xl border border-slate-900 bg-slate-950/80 p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 h-24 w-24 bg-rose-500/5 rounded-bl-full pointer-events-none" />
              
              <h3 className="font-display text-sm font-bold text-white flex items-center gap-2 mb-4">
                <Coffee className="h-4 w-4 text-rose-400" />
                Mintează un Cadou de Bucurie
              </h3>

              <p className="text-[11px] text-slate-400 leading-relaxed mb-4 font-light">
                Vrei să-i trimiți cuiva un zâmbet virtual? Completează detaliile mai jos pentru a genera un cod unic de voucher pe care îl poți trimite ca un cadou!
              </p>

              <form onSubmit={handleCreateVoucher} className="space-y-4">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1.5">Recipient Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mama, Prieten Drag..."
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-900 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-rose-500/30 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1.5">Appreciation Gift</label>
                  <select
                    value={voucherType}
                    onChange={(e) => setVoucherType(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-900 rounded-xl p-3 text-slate-300 focus:outline-none focus:border-rose-500/30"
                  >
                    <option value="Virtual Coffee">O Cafea Virtuală Caldă ☕</option>
                    <option value="Sincere Thank You">Un Mulțumesc Sincer ❤️</option>
                    <option value="Warm Virtual Hug">O Îmbrățișare Călduroasă 🤗</option>
                    <option value="Warm Evening Tea">Un Ceai Cald de Seară 🫖</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-display font-semibold text-slate-950 bg-rose-400 hover:bg-rose-300 transition-all text-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Gift className="h-4 w-4 fill-slate-950" />
                  Mintează Voucher de Zâmbet
                </button>
              </form>
            </div>

            {/* Generated Vouchers list */}
            <div className="rounded-3xl border border-slate-900 bg-slate-950/40 p-6 shadow-md">
              <h3 className="font-display text-xs font-bold text-slate-300 mb-3 flex items-center gap-1.5">
                <Sun className="h-3.5 w-3.5 text-rose-400 animate-spin-slow" />
                Voucherele Tale Mintate
              </h3>

              <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                {vouchers.map((v) => (
                  <div key={v.id} className="bg-slate-950 border border-slate-900 rounded-2xl p-3 space-y-1.5 text-xs relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-10 w-10 bg-rose-500/5 rounded-bl-full pointer-events-none" />
                    
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{v.type}</span>
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.25 rounded ${v.claimed ? 'bg-slate-900 text-slate-600' : 'bg-rose-500/10 text-rose-400 border border-rose-500/15'}`}>
                        {v.claimed ? 'Claimed' : 'Active'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500">Pentru: {v.recipient}</div>
                    <div className="font-mono text-[9px] text-cyan-400 bg-slate-900 p-1 rounded border border-slate-900 text-center tracking-wide">{v.code}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
