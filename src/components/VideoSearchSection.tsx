import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, X, Video, Play, Filter, Tag, User, Clock, Eye, Sparkles, 
  Film, CheckCircle2, ChevronRight, Layers, ArrowRight
} from 'lucide-react';
import VideoPlayer from './VideoPlayer';
import { useTranslation } from '../lib/LanguageContext';

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  category: 'Tutoriale' | 'Noutăți' | 'SCUT AI' | 'SCUT Pay' | 'SCUT Water' | 'Marketplace' | 'Comunitate' | 'Ghiduri';
  author: string;
  keywords: string[];
  url: string;
  poster: string;
  duration: string;
  date: string;
  views: string;
}

export const SAMPLE_VIDEOS: VideoItem[] = [
  {
    id: 'v1',
    title: 'Welcome to SCUT AI Ecosystem — Official Introduction',
    description: 'Discover how SCUT AI, SCUT Water, Marketplace, and Decentralized Services seamlessly interact in a unified web platform.',
    category: 'SCUT AI',
    author: 'Echipa SCUT AI',
    keywords: ['scut ai', 'introduction', 'platform', 'gemini', 'ecosystem', 'prezentare', 'tutorial', 'oficial'],
    url: 'https://www.youtube.com/embed/L_LUpnjgPso',
    poster: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    duration: '02:15',
    date: '2026-07-20',
    views: '12.4K'
  },
  {
    id: 'v2',
    title: 'Ghid de Utilizare SCUT Pay & Portofel Digital',
    description: 'Află cum să efectuezi plăți rapide, să configurezi vauchere și să gestionezi tokenii SCUT în siguranță.',
    category: 'SCUT Pay',
    author: 'Alexandru Popa (Finance Lead)',
    keywords: ['scut pay', 'plati', 'portofel', 'tokens', 'recompense', 'ghid', 'finance', 'credits', 'tranzactii'],
    url: 'https://www.youtube.com/embed/M7lc1UVf-VE',
    poster: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
    duration: '04:30',
    date: '2026-07-18',
    views: '8.9K'
  },
  {
    id: 'v3',
    title: 'Monitorizarea Rețelei SCUT Water în Timp Real',
    description: 'Explorarea senzorilor IoT de apă, parametrii fizico-chimici și alertele automate din rețeaua SCUT Water.',
    category: 'SCUT Water',
    author: 'Dr. Elena Radu',
    keywords: ['scut water', 'apa', 'senzori', 'calitate', 'iot', 'tutorial', 'retea', 'monitorizare', 'mediu'],
    url: 'https://www.youtube.com/embed/aqz-KE-BPKQ',
    poster: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=80',
    duration: '03:45',
    date: '2026-07-15',
    views: '6.2K'
  },
  {
    id: 'v4',
    title: 'Ghid Vânzători Marketplace SCUT — Publicare & Vânzare Asset-uri',
    description: 'Învață cum să adaugi produse digitale, coduri sursă, prompt-uri și servicii pe SCUT Marketplace.',
    category: 'Marketplace',
    author: 'Cristina Munteanu',
    keywords: ['marketplace', 'vanzator', 'produse', 'checkout', 'magazin', 'ghid', 'cumparaturi', 'comert'],
    url: 'https://www.youtube.com/embed/kffacxfA7G4',
    poster: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    duration: '05:10',
    date: '2026-07-12',
    views: '15.1K'
  },
  {
    id: 'v5',
    title: 'Ce este nou în SCUT AI v3.5 — Multimodalitate & Viteza Ultra-Rapidă',
    description: 'Scurtă prezentare a ultimelor actualizări de performanță, noi modele Gemini și suport pentru instrucțiuni vocale.',
    category: 'Noutăți',
    author: 'Echipa DevoOps SCUT',
    keywords: ['noutati', 'actualizari', 'gemini 3.5', 'speed', 'ai', 'news', 'release', 'functii', 'vaz'],
    url: 'https://www.youtube.com/embed/EngW7tLk6fc',
    poster: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80',
    duration: '01:50',
    date: '2026-07-22',
    views: '22.8K'
  },
  {
    id: 'v6',
    title: 'Ghid Comunitate SCUT — Conectează-te cu alți creatori',
    description: 'Cum să participi în spațiile de chat, forumuri, comunități speciale SCUT Women și SCUT Men.',
    category: 'Comunitate',
    author: 'Mihai Stoica',
    keywords: ['comunitate', 'chat', 'forum', 'grupuri', 'network', 'discutii', 'support', 'social'],
    url: 'https://www.youtube.com/embed/2lAe1cqCOXo',
    poster: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    duration: '03:15',
    date: '2026-07-10',
    views: '9.4K'
  },
  {
    id: 'v7',
    title: 'Crearea de Chei API și Rularea Sandbox-ului SCUT AI',
    description: 'Tutorial practic pas-cu-pas pentru dezvoltatori: generare API keys, Sandbox tester și integrare Bearer token.',
    category: 'Tutoriale',
    author: 'Tech Lead Gabriel',
    keywords: ['tutorial', 'api keys', 'sandbox', 'developers', 'code', 'integrare', 'bearer token', 'dev'],
    url: 'https://www.youtube.com/embed/tgbNymZ7vqY',
    poster: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    duration: '06:20',
    date: '2026-07-08',
    views: '18.3K'
  },
  {
    id: 'v8',
    title: 'Ghid de Securitate SCUT: Criptare End-to-End & Protecția Datelor',
    description: 'Principii esențiale privind siguranța contului, autentificarea în doi pași și izolarea datelor personale.',
    category: 'Ghiduri',
    author: 'Departamentul de Securitate',
    keywords: ['ghiduri', 'securitate', 'criptare', 'privacy', 'firebase', 'protectie', 'gdpr', 'safety'],
    url: 'https://www.youtube.com/embed/ScMzIvxBSi4',
    poster: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
    duration: '04:05',
    date: '2026-07-05',
    views: '11.0K'
  }
];

export const VIDEO_CATEGORIES = [
  'Toate',
  'Tutoriale',
  'Noutăți',
  'SCUT AI',
  'SCUT Pay',
  'SCUT Water',
  'Marketplace',
  'Comunitate',
  'Ghiduri'
] as const;

export default function VideoSearchSection() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Toate');
  const [activeVideo, setActiveVideo] = useState<VideoItem>(SAMPLE_VIDEOS[0]);
  const playerRef = React.useRef<HTMLDivElement>(null);

  const handleSelectVideo = (video: VideoItem) => {
    setActiveVideo(video);
    if (playerRef.current) {
      playerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Real-time video filtering based on query + category
  const filteredVideos = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return SAMPLE_VIDEOS.filter(video => {
      // Category filter match
      const matchCategory = 
        selectedCategory === 'Toate' || 
        video.category.toLowerCase() === selectedCategory.toLowerCase();

      if (!matchCategory) return false;
      if (!q) return true;

      // Realtime text search across title, category, author, description, and keywords
      const titleMatch = video.title.toLowerCase().includes(q);
      const categoryMatch = video.category.toLowerCase().includes(q);
      const authorMatch = video.author.toLowerCase().includes(q);
      const descMatch = video.description.toLowerCase().includes(q);
      const keywordMatch = video.keywords.some(kw => kw.toLowerCase().includes(q));

      return titleMatch || categoryMatch || authorMatch || descMatch || keywordMatch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 text-left">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Video className="h-4 w-4 text-cyan-400" />
            <span>{t("SCUT Video Media Center")}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
            {t("Explore Video Tutorials & Presentations")}
          </h2>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-cyan-400 font-mono font-bold">
            {filteredVideos.length} {t("videos found")}
          </span>
        </div>
      </div>

      {/* SEARCH BAR ABOVE VIDEOS */}
      <div className="relative w-full">
        <div className="relative flex items-center">
          <Search className="absolute left-4 h-5 w-5 text-cyan-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("Căutați videoclipuri după titlu, categorie, autor sau cuvinte-cheie...")}
            className="w-full pl-12 pr-10 py-3.5 bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 focus:border-cyan-400 rounded-2xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 shadow-lg transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-all cursor-pointer"
              title={t("Șterge căutarea")}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* CATEGORY FILTER PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <div className="text-xs text-slate-500 font-mono uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
          <Filter className="h-3.5 w-3.5 text-cyan-400" />
          <span>{t("Filtre")}:</span>
        </div>
        {VIDEO_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 via-cyan-400/20 to-teal-500/20 border border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/10'
                  : 'bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{t(cat)}</span>
              {isActive && <CheckCircle2 className="h-3 w-3 text-cyan-400" />}
            </button>
          );
        })}
      </div>

      {/* FEATURED ACTIVE VIDEO DISPLAY */}
      {activeVideo && (
        <div ref={playerRef} className="rounded-2xl border border-slate-800 bg-slate-950/80 overflow-hidden shadow-2xl space-y-0 scroll-mt-6">
          <VideoPlayer
            key={activeVideo.id}
            url={activeVideo.url}
            title={activeVideo.title}
            description={activeVideo.description}
            poster={activeVideo.poster}
            autoPlay={true}
            className="border-0 shadow-none"
          />
          <div className="p-4 sm:p-6 bg-slate-900/60 border-t border-slate-800/80 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20">
                {t(activeVideo.category)}
              </span>
              <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-slate-500" /> {activeVideo.author}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5 text-slate-500" /> {activeVideo.views}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-slate-500" /> {activeVideo.duration}
                </span>
              </div>
            </div>

            {/* Keywords / Tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <Tag className="h-3 w-3 text-slate-500" />
              {activeVideo.keywords.map((kw, idx) => (
                <button
                  key={idx}
                  onClick={() => setSearchQuery(kw)}
                  className="text-[11px] font-mono text-slate-400 hover:text-cyan-300 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800 hover:border-cyan-500/30 transition-all cursor-pointer"
                >
                  #{kw}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FILTERED VIDEO GRID RESULTS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider font-mono">
            {t("Toate Videoclipurile")} ({filteredVideos.length})
          </h3>
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('Toate'); }}
              className="text-xs text-cyan-400 hover:underline cursor-pointer"
            >
              {t("Resetează căutarea și filtrele")}
            </button>
          )}
        </div>

        {filteredVideos.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
            <Film className="h-10 w-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-300">
              {t("Niciun videoclip nu se potrivește căutării")}
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {t("Încearcă alt cuvânt-cheie sau resetează categoria selectată.")}
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('Toate'); }}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              {t("Arată toate videoclipurile")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVideos.map((video) => {
              const isSelected = activeVideo.id === video.id;
              return (
                <div
                  key={video.id}
                  onClick={() => handleSelectVideo(video)}
                  className={`group relative rounded-xl border overflow-hidden transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-400/80 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400/50'
                      : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Thumbnail Container */}
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                    <img
                      src={video.poster}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-cyan-400 font-bold">
                      {t(video.category)}
                    </div>
                    <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-slate-950/90 text-[10px] font-mono text-slate-300">
                      {video.duration}
                    </div>
                    {/* Play Overlay Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/40">
                      <div className="p-3 rounded-full bg-cyan-400 text-slate-950 shadow-lg transform group-hover:scale-110 transition-transform">
                        <Play className="h-5 w-5 fill-slate-950 ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 line-clamp-2 transition-colors">
                        {t(video.title)}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {t(video.description)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800/60">
                      <span className="truncate">{video.author}</span>
                      <span>{video.views}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
