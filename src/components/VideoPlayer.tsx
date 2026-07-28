import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, ShieldAlert, Check, 
  Sparkles, ExternalLink, RefreshCw, AlertCircle, Eye, Share2, Film
} from 'lucide-react';
import { useTranslation } from '../lib/LanguageContext';

export interface VideoPlayerProps {
  url?: string;
  title?: string;
  description?: string;
  poster?: string;
  autoPlay?: boolean;
  className?: string;
  showModerationBtn?: boolean;
  onReportVideo?: (reason: string) => void;
}

export function parseVideoUrl(urlStr: string, shouldAutoPlay = false): { 
  type: 'youtube' | 'vimeo' | 'mp4' | 'unknown'; 
  embedUrl: string; 
  watchUrl?: string;
} {
  if (!urlStr || urlStr.includes('gtv-videos-bucket') || urlStr.includes('commondatastorage.googleapis.com')) {
    const defaultId = 'L_LUpnjgPso';
    return { 
      type: 'youtube', 
      embedUrl: `https://www.youtube.com/embed/${defaultId}?rel=0&playsinline=1&enablejsapi=1${shouldAutoPlay ? '&autoplay=1' : ''}`,
      watchUrl: `https://www.youtube.com/watch?v=${defaultId}`
    };
  }

  // YouTube
  if (urlStr.includes('youtube.com') || urlStr.includes('youtu.be')) {
    let videoId = '';
    if (urlStr.includes('embed/')) {
      videoId = urlStr.split('embed/')[1]?.split('?')[0] || '';
    } else if (urlStr.includes('v=')) {
      videoId = urlStr.split('v=')[1]?.split('&')[0] || '';
    } else if (urlStr.includes('youtu.be/')) {
      videoId = urlStr.split('youtu.be/')[1]?.split('?')[0] || '';
    }
    const finalId = videoId || 'L_LUpnjgPso';
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${finalId}?rel=0&playsinline=1&enablejsapi=1${shouldAutoPlay ? '&autoplay=1' : ''}`,
      watchUrl: `https://www.youtube.com/watch?v=${finalId}`
    };
  }

  // Vimeo
  if (urlStr.includes('vimeo.com')) {
    const vimeoId = urlStr.split('vimeo.com/')[1]?.split('?')[0] || '';
    return {
      type: 'vimeo',
      embedUrl: vimeoId ? `https://player.vimeo.com/video/${vimeoId}?playsinline=1${shouldAutoPlay ? '?autoplay=1' : ''}` : urlStr,
      watchUrl: vimeoId ? `https://vimeo.com/${vimeoId}` : urlStr
    };
  }

  // Direct MP4 / WebM / HTML5
  return {
    type: 'mp4',
    embedUrl: urlStr
  };
}

export default function VideoPlayer({
  url = 'https://www.youtube.com/embed/L_LUpnjgPso',
  title = 'SCUT Platform Presentation',
  description,
  poster = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  autoPlay = false,
  className = '',
  showModerationBtn = true,
  onReportVideo
}: VideoPlayerProps) {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [useFallbackYoutube, setUseFallbackYoutube] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  const { type, embedUrl, watchUrl } = parseVideoUrl(url, autoPlay || isPlaying);

  useEffect(() => {
    if (autoPlay && videoRef.current) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch((err) => {
        console.warn("Autoplay blocked or waiting for user gesture:", err);
      });
    }
  }, [autoPlay, url]);

  const handlePlayClick = () => {
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.warn("Playback error on direct play:", err);
      });
    }
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason) return;
    if (onReportVideo) {
      onReportVideo(reportReason);
    }
    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setShowReportModal(false);
      setReportReason('');
    }, 2000);
  };

  return (
    <div className={`relative group rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/80 shadow-2xl shadow-cyan-950/20 ${className}`}>
      
      {/* Video Display Container */}
      <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden">
        
        {/* YouTube / Vimeo Embed or Fallback YouTube */}
        {useFallbackYoutube || type === 'youtube' || type === 'vimeo' ? (
          <iframe
            src={useFallbackYoutube ? `https://www.youtube.com/embed/L_LUpnjgPso?rel=0${isPlaying || autoPlay ? '&autoplay=1' : ''}` : embedUrl}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        ) : hasError ? (
          /* Error Fallback Card */
          <div className="w-full h-full relative flex flex-col items-center justify-center p-6 text-center bg-slate-900/90 border border-slate-800">
            <img src={poster} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm" referrerPolicy="no-referrer" />
            <div className="relative z-10 space-y-3 max-w-md">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-full w-fit mx-auto text-amber-400">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-white">{t("Video Stream Offline or Unsupported")}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t("Direct MP4 stream couldn't be loaded on this network/browser. Switch to standard embedded video player.")}
              </p>
              <button
                onClick={() => { setHasError(false); setUseFallbackYoutube(true); setIsPlaying(true); }}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <Film className="h-4 w-4" />
                {t("Play Embedded Presentation")}
              </button>
            </div>
          </div>
        ) : (
          /* Direct MP4 HTML5 Video */
          <>
            <video
              ref={videoRef}
              src={embedUrl}
              poster={poster}
              controls
              autoPlay={autoPlay}
              muted={isMuted}
              playsInline
              preload="metadata"
              className="w-full h-full object-cover"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onError={() => {
                console.warn("Direct MP4 video failed to load, activating fallback YouTube embed");
                setHasError(true);
              }}
            />

            {/* Play Overlay Button if video is paused/stopped */}
            {!isPlaying && (
              <div 
                onClick={handlePlayClick}
                className="absolute inset-0 bg-slate-950/40 hover:bg-slate-950/20 transition-all flex items-center justify-center cursor-pointer z-10 group/play"
              >
                <div className="p-5 rounded-full bg-cyan-400 text-slate-950 shadow-2xl shadow-cyan-500/50 transform group-hover/play:scale-110 transition-transform flex items-center justify-center">
                  <Play className="h-8 w-8 fill-slate-950 ml-1" />
                </div>
              </div>
            )}
          </>
        )}

        {/* Video Overlay Info Bar */}
        {title && (
          <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-transparent p-3 sm:p-4 flex items-center justify-between gap-2 z-10 pointer-events-none">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0">
                VIDEO
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-white truncate drop-shadow-sm">
                {t(title)}
              </h4>
            </div>

            {showModerationBtn && (
              <button
                onClick={() => setShowReportModal(true)}
                className="pointer-events-auto p-1.5 rounded-lg bg-slate-900/80 border border-slate-700/60 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-all text-xs flex items-center gap-1 shrink-0 cursor-pointer backdrop-blur-sm"
                title={t("AI Moderation & Copyright Report")}
              >
                <ShieldAlert className="h-3.5 w-3.5 text-slate-400 hover:text-rose-400" />
                <span className="hidden sm:inline text-[10px] font-mono">{t("Moderation")}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Description / Caption Bar if provided */}
      <div className="p-3 bg-slate-900/60 border-t border-slate-800 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-3">
        {description && <p className="line-clamp-2 leading-relaxed flex-1 min-w-[200px]">{t(description)}</p>}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {type === 'youtube' && watchUrl && (
            <a
              href={watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300 hover:text-white transition-all flex items-center gap-1.5 border border-slate-700/80 cursor-pointer"
              title={t("Opțional: deschide în YouTube")}
            >
              <ExternalLink className="h-3 w-3 text-red-400" />
              <span>{t("Vizionează pe YouTube")}</span>
            </a>
          )}
          <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1 bg-cyan-950/40 px-2 py-1 rounded-lg border border-cyan-800/40">
            <Sparkles className="h-3 w-3" /> {t("SCUT Video Node")}
          </span>
        </div>
      </div>

      {/* AI Moderation Modal Overlay */}
      {showReportModal && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-30 p-4 flex flex-col justify-center items-center text-left">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <ShieldAlert className="h-4 w-4" />
                <span>{t("AI Video Moderation & Report")}</span>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                {t("Cancel")}
              </button>
            </div>

            {reportSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0" />
                <span>{t("Report logged to AI Moderation Queue. Thank you!")}</span>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-3">
                <p className="text-xs text-slate-300">
                  {t("Select or describe any compliance, copyright, or appropriateness concern:")}
                </p>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  required
                >
                  <option value="">{t("Select reason...")}</option>
                  <option value="copyright">{t("Copyright Violation / DMCA Notice")}</option>
                  <option value="inappropriate">{t("Inappropriate / Harmful Content")}</option>
                  <option value="misleading">{t("Misleading Title / Spam")}</option>
                  <option value="quality">{t("Playback or Broken Video Link")}</option>
                </select>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 bg-slate-800 hover:text-white"
                  >
                    {t("Close")}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors"
                  >
                    {t("Submit Report")}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}


