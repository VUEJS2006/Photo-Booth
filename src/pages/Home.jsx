import React, { useState, useRef, useEffect } from 'react';
import {
  LuCamera,
  LuDownload,
  LuRefreshCw,
  LuSlidersHorizontal,
  LuTimer,
  LuSparkles,
  LuUser,
  LuLayoutGrid,
  LuTrash2
} from 'react-icons/lu';

// 8 Aesthetic Soft-Tone Photobooth Frame Templates
const FRAME_TEMPLATES = [
  {
    id: 'soft-lavender-doodle',
    name: 'Lavender Doodle Dream',
    bg: '#E9D5FF',
    stripBg: '#F3E8FF',
    photoBg: '#FFFFFF',
    text: '#6B21A8',
    border: '#C084FC',
    theme: 'lavender',
    pattern: 'plaid',
    description: 'Soft Lilac Purple with Heart Doodles & Plaid Footer'
  },
  {
    id: 'natural-sage-green',
    name: 'Natural Sage Garden',
    bg: '#DCECE6',
    stripBg: '#EAF5F1',
    photoBg: '#FFFFFF',
    text: '#2D5A4C',
    border: '#A3D0C3',
    theme: 'sage',
    pattern: 'botanical',
    description: 'Earthy Sage Green with Leaves & Cute Daisies'
  },
  {
    id: 'vintage-warm-beige',
    name: 'Warm Aesthetic Beige',
    bg: '#F7EFE5',
    stripBg: '#FFFDF9',
    photoBg: '#FFFFFF',
    text: '#78350F',
    border: '#E6D2B8',
    theme: 'vintage',
    pattern: 'dots',
    description: 'Soft Butter Cream with Minimal Lace & Bow Accents'
  },
  {
    id: 'romance-pastel-pink',
    name: 'Blush Romance Pink',
    bg: '#FCE7F3',
    stripBg: '#FDFAFC',
    photoBg: '#FFFFFF',
    text: '#9D174D',
    border: '#F472B6',
    theme: 'pink',
    pattern: 'hearts',
    description: 'Sweet Pastel Pink with Bow Ribbons & Tiny Hearts'
  },
  {
    id: 'galaxy-cosmic-night',
    name: 'Cosmic Galaxy Night',
    bg: '#1E1B4B',
    stripBg: '#2E2A72',
    photoBg: '#0F172A',
    text: '#C7D2FE',
    border: '#818CF8',
    theme: 'galaxy',
    pattern: 'stars',
    description: 'Deep Cosmic Blue with Stars & Crescent Moon'
  },
  {
    id: 'monochrome-classic-bw',
    name: 'Monochrome Noir B&W',
    bg: '#18181B',
    stripBg: '#27272A',
    photoBg: '#09090B',
    text: '#F4F4F5',
    border: '#71717A',
    theme: 'monochrome',
    pattern: 'film',
    description: 'High Contrast Black & White Film Perforations'
  },
  {
    id: 'cyber-ice-glass',
    name: 'Cyber Ice Glossy',
    bg: '#E0F2FE',
    stripBg: '#F0F9FF',
    photoBg: '#FFFFFF',
    text: '#0369A1',
    border: '#38BDF8',
    theme: 'cyber',
    pattern: 'bubbles',
    description: 'Translucent Light Ice Blue with Floating Bubbles'
  },
  {
    id: 'modern-classic-stamp',
    name: 'Modern Vintage Classic',
    bg: '#F1F5F9',
    stripBg: '#FFFFFF',
    photoBg: '#F8FAFC',
    text: '#334155',
    border: '#94A3B8',
    theme: 'classic',
    pattern: 'stamps',
    description: 'Clean Minimal Slate with Retro Stamp & Frame Edges'
  }
];

// Photo Filter Effects
const IMAGE_FILTERS = [
  { 
    id: 'porcelain-glow', 
    name: 'Glow Beauty', 
    css: 'brightness(118%) contrast(96%) saturate(108%) sepia(2%)', 
    canvasFilter: 'brightness(118%) contrast(96%) saturate(108%) sepia(2%)' 
  },
  { 
    id: 'cutie-pink', 
    name: 'Cutie Warm', 
    css: 'brightness(114%) contrast(98%) saturate(125%) hue-rotate(-12deg)', 
    canvasFilter: 'brightness(114%) contrast(98%) saturate(125%) hue-rotate(-12deg)' 
  },
  { 
    id: 'vintage-film', 
    name: 'Vintage Touch', 
    css: 'brightness(106%) contrast(102%) saturate(120%) sepia(25%) hue-rotate(-6deg)', 
    canvasFilter: 'brightness(106%) contrast(102%) saturate(120%) sepia(25%) hue-rotate(-6deg)' 
  },
  { 
    id: 'black-white', 
    name: 'Monochrome B&W', 
    css: 'grayscale(100%) brightness(110%) contrast(110%)', 
    canvasFilter: 'grayscale(100%) brightness(110%) contrast(110%)' 
  }
];

// Timer Delays
const TIMER_OPTIONS = [3, 5, 10, 20, 30];

// SVG Graphic Elements Component for Photo Booth UI
const FrameGraphicIcon = ({ type, color }) => {
  switch (type) {
    case 'lavender':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill={color}>
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      );
    case 'sage':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill={color}>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      );
    case 'galaxy':
      return (
        <svg className="w-4 h-4 animate-pulse" viewBox="0 0 24 24" fill={color}>
          <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" />
        </svg>
      );
    case 'pink':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill={color}>
          <path d="M12 10c-1.5-2-4.5-3.5-7-2 0 0 .5 3 3 4.5 2.5 1.5 4 1 4 1s-1.5 2.5-4 1c-2.5-1.5-3 4.5-3 4.5 2.5 1.5 5.5 0 7-2 1.5 2 4.5 3.5 7 2 0 0-.5-3-3-4.5-2.5-1.5-4-1-4-1s1.5-2.5 4-1c2.5 1.5 3-4.5 3-4.5-2.5-1.5-5.5 0-7 2z" />
        </svg>
      );
    default:
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill={color}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
};

const Home = () => {
  const [photos, setPhotos] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [selectedFrame, setSelectedFrame] = useState(FRAME_TEMPLATES[0]);
  const [selectedFilter, setSelectedFilter] = useState(IMAGE_FILTERS[0]);
  const [selectedTimer, setSelectedTimer] = useState(5);
  const [coupleNames, setCoupleNames] = useState('CHLOE & LEO');
  const [stream, setStream] = useState(null);
  const [savedGallery, setSavedGallery] = useState([]);
  const [cameraError, setCameraError] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const localData = localStorage.getItem('soft_aesthetic_booth_gallery');
    if (localData) setSavedGallery(JSON.parse(localData));
  }, []);

  const startCamera = async () => {
    setCameraError(false);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', aspectRatio: { ideal: 4 / 3 } },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (err) {
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setStream(fallbackStream);
        if (videoRef.current) videoRef.current.srcObject = fallbackStream;
      } catch (fallbackErr) {
        setCameraError(true);
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const captureFrame = () => {
    const video = videoRef.current;
    if (!video) return null;

    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');

    const vWidth = video.videoWidth || 640;
    const vHeight = video.videoHeight || 480;

    const targetRatio = 640 / 480;
    const currentRatio = vWidth / vHeight;
    let sWidth = vWidth;
    let sHeight = vHeight;
    let sx = 0;
    let sy = 0;

    if (currentRatio > targetRatio) {
      sWidth = vHeight * targetRatio;
      sx = (vWidth - sWidth) / 2;
    } else {
      sHeight = vWidth / targetRatio;
      sy = (vHeight - sHeight) / 2;
    }

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/png');
  };

  const startPhotoboothSequence = async () => {
    if (isCapturing) return;
    setIsCapturing(true);
    setPhotos([]);

    const capturedPhotos = [];

    for (let i = 0; i < 4; i++) {
      for (let c = selectedTimer; c > 0; c--) {
        setCountdown(c);
        await new Promise((r) => setTimeout(r, 1000));
      }
      setCountdown('SNAP!');
      await new Promise((r) => setTimeout(r, 250));

      const photoData = captureFrame();
      if (photoData) {
        capturedPhotos.push(photoData);
        setPhotos([...capturedPhotos]);
      }
      setCountdown(null);
      await new Promise((r) => setTimeout(r, 800));
    }

    setIsCapturing(false);
  };

  // Canvas Native Graphics Drawing (Stickers & Patterns)
  const drawCanvasDecorations = (ctx, x, y, width, height, frame) => {
    ctx.save();
    ctx.fillStyle = frame.border;
    ctx.strokeStyle = frame.border;

    // Draw Footer Plaid Pattern if selected
    if (frame.pattern === 'plaid') {
      ctx.globalAlpha = 0.2;
      for (let i = 0; i < width; i += 12) {
        ctx.fillRect(x + i, y + height - 80, 6, 80);
      }
      for (let j = 0; j < 80; j += 12) {
        ctx.fillRect(x, y + height - 80 + j, width, 6);
      }
      ctx.globalAlpha = 1.0;
    }

    // Draw Decorative Stickers
    const drawHeart = (hx, hy) => {
      ctx.beginPath();
      ctx.arc(hx - 3, hy - 3, 3, Math.PI, 0, false);
      ctx.arc(hx + 3, hy - 3, 3, Math.PI, 0, false);
      ctx.lineTo(hx, hy + 5);
      ctx.closePath();
      ctx.fill();
    };

    const drawSparkle = (sx, sy) => {
      ctx.beginPath();
      ctx.moveTo(sx, sy - 6);
      ctx.quadraticCurveTo(sx, sy, sx + 6, sy);
      ctx.quadraticCurveTo(sx, sy, sx, sy + 6);
      ctx.quadraticCurveTo(sx, sy, sx - 6, sy);
      ctx.quadraticCurveTo(sx, sy, sx, sy - 6);
      ctx.fill();
    };

    // Place Stickers at Corner Header
    drawHeart(x + 20, y + 22);
    drawHeart(x + width - 20, y + 22);
    drawSparkle(x + 40, y + 22);
    drawSparkle(x + width - 40, y + 22);

    ctx.restore();
  };

  const generateCanvasAndSave = () => {
    if (photos.length < 4) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const colWidth = 340;
    const gapBetweenCols = 30;
    const outerMargin = 40;
    const totalWidth = outerMargin * 2 + colWidth * 2 + gapBetweenCols;

    const photoWidth = 300;
    const photoHeight = 225;
    const photoGap = 16;
    const headerHeight = 65;
    const footerHeight = 110;

    const totalHeight = outerMargin * 2 + headerHeight + 4 * photoHeight + 3 * photoGap + footerHeight;

    canvas.width = totalWidth;
    canvas.height = totalHeight;

    ctx.fillStyle = selectedFrame.bg;
    ctx.fillRect(0, 0, totalWidth, totalHeight);

    const col1X = outerMargin;
    const col1Y = outerMargin;
    const col2X = outerMargin + colWidth + gapBetweenCols;
    const stripHeight = totalHeight - outerMargin * 2;

    // Draw Strips
    ctx.fillStyle = selectedFrame.stripBg;
    ctx.fillRect(col1X, col1Y, colWidth, stripHeight);
    ctx.strokeStyle = selectedFrame.border;
    ctx.lineWidth = 3;
    ctx.strokeRect(col1X, col1Y, colWidth, stripHeight);

    ctx.fillRect(col2X, col1Y, colWidth, stripHeight);
    ctx.strokeRect(col2X, col1Y, colWidth, stripHeight);

    // Render Stickers & Aesthetic Details
    drawCanvasDecorations(ctx, col1X, col1Y, colWidth, stripHeight, selectedFrame);
    drawCanvasDecorations(ctx, col2X, col1Y, colWidth, stripHeight, selectedFrame);

    // Header Text
    ctx.fillStyle = selectedFrame.text;
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';

    const col1CenterX = col1X + colWidth / 2;
    const col2CenterX = col2X + colWidth / 2;

    ctx.fillText('LOVEBIRDS PHOTOBOOTH', col1CenterX, col1Y + 45);
    ctx.fillText('LOVEBIRDS PHOTOBOOTH', col2CenterX, col1Y + 45);

    let loadedCount = 0;

    photos.forEach((photoSrc, index) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = photoSrc;

      img.onload = () => {
        const yPos = col1Y + headerHeight + index * (photoHeight + photoGap);

        // Photo 1 Left Strip
        const col1PhotoX = col1X + (colWidth - photoWidth) / 2;
        ctx.fillStyle = selectedFrame.photoBg;
        ctx.fillRect(col1PhotoX - 4, yPos - 4, photoWidth + 8, photoHeight + 8);

        ctx.save();
        ctx.filter = selectedFilter.canvasFilter;
        ctx.drawImage(img, col1PhotoX, yPos, photoWidth, photoHeight);
        ctx.restore();

        // Photo 2 Right Strip
        const col2PhotoX = col2X + (colWidth - photoWidth) / 2;
        ctx.fillStyle = selectedFrame.photoBg;
        ctx.fillRect(col2PhotoX - 4, yPos - 4, photoWidth + 8, photoHeight + 8);

        ctx.save();
        ctx.filter = selectedFilter.canvasFilter;
        ctx.drawImage(img, col2PhotoX, yPos, photoWidth, photoHeight);
        ctx.restore();

        loadedCount++;

        if (loadedCount === 4) {
          const today = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

          ctx.fillStyle = selectedFrame.text;
          ctx.font = 'bold 22px serif';
          ctx.fillText(coupleNames, col1CenterX, totalHeight - outerMargin - footerHeight / 2);
          ctx.font = '500 12px sans-serif';
          ctx.globalAlpha = 0.8;
          ctx.fillText(`MOMENTS IN LOVE • ${today}`, col1CenterX, totalHeight - outerMargin - footerHeight / 2 + 22);

          ctx.font = 'bold 22px serif';
          ctx.globalAlpha = 1.0;
          ctx.fillText(coupleNames, col2CenterX, totalHeight - outerMargin - footerHeight / 2);
          ctx.font = '500 12px sans-serif';
          ctx.globalAlpha = 0.8;
          ctx.fillText(`MOMENTS IN LOVE • ${today}`, col2CenterX, totalHeight - outerMargin - footerHeight / 2 + 22);
          ctx.globalAlpha = 1.0;

          // Reliable PNG Image Download Trigger
          setTimeout(() => {
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `soft-photobooth-${Date.now()}.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            const updatedGallery = [{ id: Date.now(), image: dataUrl, date: today, coupleNames }, ...savedGallery];
            setSavedGallery(updatedGallery);
            localStorage.setItem('soft_aesthetic_booth_gallery', JSON.stringify(updatedGallery));
          }, 100);
        }
      };
    });
  };

  const deleteMemory = (id) => {
    const filtered = savedGallery.filter((item) => item.id !== id);
    setSavedGallery(filtered);
    localStorage.setItem('soft_aesthetic_booth_gallery', JSON.stringify(filtered));
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 font-sans pb-28 px-3 sm:px-4 pt-4 sm:pt-6 relative overflow-x-hidden">
      {/* Background Subtle Ambient Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-purple-500/10 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute top-1/2 -right-20 w-80 h-80 bg-teal-500/10 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-md mx-auto space-y-4 sm:space-y-5">
        {/* Main Soft Dark Header Panel */}
        <header className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/40 p-4 rounded-3xl shadow-xl flex justify-between items-center">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <LuSparkles className="w-3.5 h-3.5 text-purple-400" /> Aesthetic Photobooth Studio
            </span>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white mt-0.5">Life4Cuts Soft Studio</h1>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-purple-300 shadow-inner">
            <LuSparkles className="w-5 h-5 text-purple-400" />
          </div>
        </header>

        {/* Timer Control Bar (3s, 5s, 10s, 20s, 30s) */}
        <div className="bg-slate-900/60 backdrop-blur-xl p-3.5 rounded-2xl border border-slate-700/40 shadow-lg flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 shrink-0">
            <LuTimer className="w-4 h-4 text-purple-400" /> Timer Delay:
          </span>
          <div className="flex gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
            {TIMER_OPTIONS.map((sec) => (
              <button
                key={sec}
                disabled={isCapturing}
                onClick={() => setSelectedTimer(sec)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 ${
                  selectedTimer === sec
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30 border border-purple-300'
                    : 'bg-slate-800/60 text-slate-400 border border-slate-700/30 hover:text-slate-200'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>

        {/* Viewfinder Camera Box */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-950 shadow-2xl border border-slate-800 aspect-[4/3] flex items-center justify-center">
          {cameraError ? (
            <div className="p-6 text-center space-y-3">
              <p className="text-purple-400 text-xs font-semibold">Camera Access Failed</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-slate-800 text-xs text-slate-200 rounded-xl border border-slate-700"
              >
                Retry Camera
              </button>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ filter: selectedFilter.css }}
              className="w-full h-full object-cover scale-x-[-1] transition-all"
            />
          )}

          {countdown && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-20">
              <span className="text-purple-400 text-6xl font-black tracking-widest animate-ping">
                {countdown}
              </span>
            </div>
          )}

          {!cameraError && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center z-10 px-4">
              <button
                disabled={isCapturing}
                onClick={startPhotoboothSequence}
                className={`w-full max-w-xs py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-xl border transition-all ${
                  isCapturing
                    ? 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-purple-500 hover:bg-purple-400 text-white border-purple-300 shadow-purple-500/30 active:scale-95'
                }`}
              >
                <LuCamera className="w-4.5 h-4.5" />
                {isCapturing ? 'Capturing 4 Shots...' : `Start Photobooth (${selectedTimer}s)`}
              </button>
            </div>
          )}
        </div>

        {/* Customization Options */}
        {photos.length === 4 && (
          <div className="space-y-4 pt-2 border-t border-slate-800">
            {/* Filter Selection */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 px-1">
                <LuSlidersHorizontal className="w-4 h-4 text-purple-400" /> Photo Effects
              </h3>
              <div className="flex gap-2.5 overflow-x-auto py-2 px-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {IMAGE_FILTERS.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-4 py-2 rounded-2xl text-xs font-semibold border transition-all shrink-0 ${
                      selectedFilter.id === filter.id
                        ? 'border-purple-400 bg-purple-900/40 text-purple-200 shadow-md backdrop-blur-md'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {filter.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 8 Aesthetic Frame Templates Selector */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 px-1">
                <LuLayoutGrid className="w-4 h-4 text-purple-400" /> 8 Soft Aesthetic Frame Themes
              </h3>
              <div className="grid grid-cols-2 gap-2.5 px-1">
                {FRAME_TEMPLATES.map((frame) => (
                  <button
                    key={frame.id}
                    onClick={() => setSelectedFrame(frame)}
                    className={`p-3 rounded-2xl text-left border transition-all relative overflow-hidden ${
                      selectedFrame.id === frame.id
                        ? 'border-purple-400 bg-slate-900 shadow-md ring-1 ring-purple-400'
                        : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/30"
                        style={{ backgroundColor: frame.border }}
                      />
                      <span className="text-xs font-bold text-white leading-tight">{frame.name}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight mt-1">{frame.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Couple Name Input */}
            <div className="bg-slate-900/60 backdrop-blur-xl p-3.5 rounded-2xl border border-slate-800 shadow-lg">
              <label className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block mb-1.5 flex items-center gap-1">
                <LuUser className="w-3 h-3 text-purple-400" /> Frame Footer Text
              </label>
              <input
                type="text"
                value={coupleNames}
                onChange={(e) => setCoupleNames(e.target.value)}
                placeholder="e.g. CHLOE & LEO"
                className="w-full text-xs bg-slate-950 text-slate-100 rounded-xl px-3.5 py-2.5 border border-slate-800 focus:outline-none focus:border-purple-400 transition-colors"
              />
            </div>

            {/* Live Photobooth Soft Card Preview */}
            <div
              className="p-4 rounded-3xl border shadow-2xl space-y-3 relative overflow-hidden transition-all"
              style={{
                backgroundColor: selectedFrame.bg,
                borderColor: selectedFrame.border,
                color: selectedFrame.text,
              }}
            >
              <div className="text-center text-[11px] font-bold uppercase tracking-widest opacity-80">
                LOVEBIRDS PHOTOBOOTH
              </div>

              {/* Double Photo Strips */}
              <div className="grid grid-cols-2 gap-2.5">
                {[1, 2].map((col) => (
                  <div
                    key={col}
                    className="space-y-2 p-2.5 rounded-2xl border relative overflow-hidden"
                    style={{ backgroundColor: selectedFrame.stripBg, borderColor: selectedFrame.border }}
                  >
                    {/* Frame Decorative Graphic Icons */}
                    <div className="flex justify-between items-center px-1 mb-1">
                      <FrameGraphicIcon type={selectedFrame.theme} color={selectedFrame.border} />
                      <FrameGraphicIcon type={selectedFrame.theme} color={selectedFrame.border} />
                    </div>

                    {photos.map((src, i) => (
                      <div
                        key={i}
                        className="p-1 rounded-xl shadow-sm overflow-hidden border aspect-[4/3]"
                        style={{ backgroundColor: selectedFrame.photoBg, borderColor: selectedFrame.border }}
                      >
                        <img
                          src={src}
                          alt={`Snap ${i + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                          style={{ filter: selectedFilter.css }}
                        />
                      </div>
                    ))}
                    <div className="text-center pt-2">
                      <p className="text-xs font-serif font-bold tracking-wide">{coupleNames}</p>
                      <p className="text-[9px] opacity-75 mt-0.5">
                        {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Retake and Save Buttons */}
            <div className="flex gap-2.5 pt-1">
              <button
                onClick={startPhotoboothSequence}
                className="flex-1 py-3.5 rounded-2xl bg-slate-900 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-800 transition-all active:scale-95"
              >
                <LuRefreshCw className="w-4 h-4" /> Retake
              </button>
              <button
                onClick={generateCanvasAndSave}
                className="flex-2 py-3.5 rounded-2xl bg-purple-500 hover:bg-purple-400 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xl shadow-purple-500/20 border border-purple-300 transition-all active:scale-95"
              >
                <LuDownload className="w-4 h-4" /> Save Photo Strip
              </button>
            </div>
          </div>
        )}

        {/* Saved Gallery */}
        {savedGallery.length > 0 && (
          <section className="pt-4 border-t border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Saved Romance Strips
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {savedGallery.map((item) => (
                <div key={item.id} className="relative bg-slate-900 p-2 rounded-2xl border border-slate-800 shadow-lg">
                  <img src={item.image} alt="Saved Memory" className="w-full h-auto rounded-xl" />
                  <button
                    onClick={() => deleteMemory(item.id)}
                    className="absolute top-3 right-3 p-1.5 bg-slate-950/80 text-slate-300 rounded-full hover:bg-rose-600 hover:text-white transition-all border border-slate-700"
                  >
                    <LuTrash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default Home;