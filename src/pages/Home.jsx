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

// 6 Aesthetic Frame Templates with Built-in Decorative Stickers
const FRAME_TEMPLATES = [
  {
    id: 'kawaii-mint-bear',
    name: 'Kawaii Bear & Fish',
    bg: '#0F2B2E',
    stripBg: '#133E43',
    photoBg: '#1E4F55',
    text: '#A7F3D0',
    border: '#2DD4BF',
    stickerTheme: 'bear-fish',
    description: 'Pastel Mint with Cute Bear & Fish Graphic Details'
  },
  {
    id: 'cyan-cyber-glass',
    name: 'Cyan Glass Glow',
    bg: '#041B2D',
    stripBg: '#092C44',
    photoBg: '#0F3A59',
    text: '#38BDF8',
    border: '#0EA5E9',
    stickerTheme: 'cyber-sparkle',
    description: 'Glowing Cyan Glass Borders & Floating Sparkles'
  },
  {
    id: 'sweet-pink-bow',
    name: 'Sweet Pink Ribbon',
    bg: '#251020',
    stripBg: '#3C1733',
    photoBg: '#541F48',
    text: '#F472B6',
    border: '#F43F5E',
    stickerTheme: 'pink-heart',
    description: 'Lovely Pink Bow Ribbons & Small Heart Stickers'
  },
  {
    id: 'pastel-star-cloud',
    name: 'Sky Cloud & Stars',
    bg: '#0A2136',
    stripBg: '#123454',
    photoBg: '#1A456E',
    text: '#7DD3FC',
    border: '#38BDF8',
    stickerTheme: 'star-cloud',
    description: 'Cute Sky Clouds & Little Glowing Stars'
  },
  {
    id: 'midnight-minimal-white',
    name: 'Minimal Aesthetic White',
    bg: '#09151F',
    stripBg: '#F8FAFC',
    photoBg: '#0F172A',
    text: '#0F172A',
    border: '#94A3B8',
    stickerTheme: 'minimal-sparkle',
    description: 'Clean White Photobooth Card with Subtle Dots'
  },
  {
    id: 'deep-purple-anniversary',
    name: 'Deep Purple Romance',
    bg: '#180E29',
    stripBg: '#2A1745',
    photoBg: '#3A1F5E',
    text: '#E9D5FF',
    border: '#A855F7',
    stickerTheme: 'purple-bow',
    description: 'Modern Dark Purple & Delicate Graphic Accents'
  }
];

// Porcelain Brightness Beauty Filters
const IMAGE_FILTERS = [
  { 
    id: 'porcelain-bright', 
    name: 'Porcelain Glow', 
    css: 'brightness(118%) contrast(96%) saturate(105%) sepia(2%)', 
    canvasFilter: 'brightness(118%) contrast(96%) saturate(105%) sepia(2%)' 
  },
  { 
    id: 'snow-white', 
    name: 'Pure Snow', 
    css: 'brightness(124%) contrast(92%) saturate(110%) hue-rotate(-4deg)', 
    canvasFilter: 'brightness(124%) contrast(92%) saturate(110%) hue-rotate(-4deg)' 
  },
  { 
    id: 'rosy-pink', 
    name: 'Rosy Youth', 
    css: 'brightness(112%) contrast(98%) saturate(125%) sepia(10%) hue-rotate(-10deg)', 
    canvasFilter: 'brightness(112%) contrast(98%) saturate(125%) sepia(10%) hue-rotate(-10deg)' 
  },
  { 
    id: 'vintage-film', 
    name: 'Vintage Touch', 
    css: 'brightness(105%) contrast(100%) saturate(120%) sepia(25%) hue-rotate(-5deg)', 
    canvasFilter: 'brightness(105%) contrast(100%) saturate(120%) sepia(25%) hue-rotate(-5deg)' 
  }
];

// Timer Options
const TIMER_OPTIONS = [3, 5, 10, 20, 30];

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
    const localData = localStorage.getItem('cyan_glass_booth_gallery');
    if (localData) {
      setSavedGallery(JSON.parse(localData));
    }
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

  // Canvas Vector Sticker Graphics Renderer (Pure Image Art - No Emoji)
  const drawStickersOnCanvas = (ctx, x, y, width, height, theme, accentColor) => {
    ctx.save();
    ctx.fillStyle = accentColor;
    ctx.strokeStyle = accentColor;

    if (theme === 'bear-fish') {
      // Cute Bear Ears Sticker on Top Left
      ctx.beginPath();
      ctx.arc(x + 25, y + 20, 8, 0, Math.PI * 2);
      ctx.arc(x + 45, y + 20, 8, 0, Math.PI * 2);
      ctx.fill();

      // Cute Fish Silhouette Top Right
      ctx.beginPath();
      ctx.ellipse(x + width - 30, y + 25, 10, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + width - 20, y + 25);
      ctx.lineTo(x + width - 12, y + 20);
      ctx.lineTo(x + width - 12, y + 30);
      ctx.closePath();
      ctx.fill();
    } else if (theme === 'pink-heart' || theme === 'purple-bow') {
      // Heart / Bow Sticker Graphic
      const drawLittleHeart = (hx, hy) => {
        ctx.beginPath();
        ctx.arc(hx - 4, hy - 4, 4, Math.PI, 0, false);
        ctx.arc(hx + 4, hy - 4, 4, Math.PI, 0, false);
        ctx.lineTo(hx, hy + 6);
        ctx.closePath();
        ctx.fill();
      };
      drawLittleHeart(x + 25, y + 25);
      drawLittleHeart(x + width - 25, y + 25);
    } else {
      // Sparkling Star Vector Stickers
      const drawSparkle = (sx, sy, r) => {
        ctx.beginPath();
        ctx.moveTo(sx, sy - r);
        ctx.quadraticCurveTo(sx, sy, sx + r, sy);
        ctx.quadraticCurveTo(sx, sy, sx, sy + r);
        ctx.quadraticCurveTo(sx, sy, sx - r, sy);
        ctx.quadraticCurveTo(sx, sy, sx, sy - r);
        ctx.fill();
      };
      drawSparkle(x + 25, y + 25, 10);
      drawSparkle(x + width - 25, y + 25, 10);
    }
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

    // Background Canvas Fill
    ctx.fillStyle = selectedFrame.bg;
    ctx.fillRect(0, 0, totalWidth, totalHeight);

    const col1X = outerMargin;
    const col1Y = outerMargin;
    const col2X = outerMargin + colWidth + gapBetweenCols;
    const stripHeight = totalHeight - outerMargin * 2;

    // Left Strip Background
    ctx.fillStyle = selectedFrame.stripBg;
    ctx.fillRect(col1X, col1Y, colWidth, stripHeight);
    ctx.strokeStyle = selectedFrame.border;
    ctx.lineWidth = 3;
    ctx.strokeRect(col1X, col1Y, colWidth, stripHeight);

    // Right Strip Background
    ctx.fillRect(col2X, col1Y, colWidth, stripHeight);
    ctx.strokeRect(col2X, col1Y, colWidth, stripHeight);

    // Draw Graphic Stickers
    drawStickersOnCanvas(ctx, col1X, col1Y, colWidth, stripHeight, selectedFrame.stickerTheme, selectedFrame.border);
    drawStickersOnCanvas(ctx, col2X, col1Y, colWidth, stripHeight, selectedFrame.stickerTheme, selectedFrame.border);

    // Header Text
    ctx.fillStyle = selectedFrame.text;
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';

    const col1CenterX = col1X + colWidth / 2;
    const col2CenterX = col2X + colWidth / 2;

    ctx.fillText('LOVEBIRDS PHOTOBOOTH', col1CenterX, col1Y + 45);
    ctx.fillText('LOVEBIRDS PHOTOBOOTH', col2CenterX, col2Y + 45);

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

          // Footer Text
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

          // Safe PNG Download Trigger
          setTimeout(() => {
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `cyan-aesthetic-strip-${Date.now()}.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            const updatedGallery = [{ id: Date.now(), image: dataUrl, date: today, coupleNames }, ...savedGallery];
            setSavedGallery(updatedGallery);
            localStorage.setItem('cyan_glass_booth_gallery', JSON.stringify(updatedGallery));
          }, 100);
        }
      };
    });
  };

  const deleteMemory = (id) => {
    const filtered = savedGallery.filter((item) => item.id !== id);
    setSavedGallery(filtered);
    localStorage.setItem('cyan_glass_booth_gallery', JSON.stringify(filtered));
  };

  return (
    <div className="min-h-screen bg-[#031726] text-cyan-50 font-sans pb-28 px-3 sm:px-4 pt-4 sm:pt-6 relative overflow-x-hidden">
      {/* Cyan Glassmorphism Glow Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-cyan-500/20 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute top-1/2 -right-20 w-80 h-80 bg-teal-500/15 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-md mx-auto space-y-4 sm:space-y-5">
        {/* Main Header Glass Panel */}
        <header className="bg-cyan-950/40 backdrop-blur-xl border border-cyan-500/30 p-4 rounded-3xl shadow-xl flex justify-between items-center">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
              <LuSparkles className="w-3.5 h-3.5 text-cyan-400" /> Aesthetic Photobooth
            </span>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white mt-0.5">Dark Cyan Glass Studio</h1>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-cyan-900/40 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-inner">
            <LuSparkles className="w-5 h-5 text-cyan-400" />
          </div>
        </header>

        {/* Timer Control Bar (3s, 5s, 10s, 20s, 30s) */}
        <div className="bg-cyan-950/40 backdrop-blur-xl p-3.5 rounded-2xl border border-cyan-500/20 shadow-lg flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5 shrink-0">
            <LuTimer className="w-4 h-4 text-cyan-400" /> Timer Delay:
          </span>
          <div className="flex gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
            {TIMER_OPTIONS.map((sec) => (
              <button
                key={sec}
                disabled={isCapturing}
                onClick={() => setSelectedTimer(sec)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 ${
                  selectedTimer === sec
                    ? 'bg-cyan-400 text-white shadow-lg shadow-cyan-400/30 border border-cyan-200'
                    : 'bg-cyan-950/60 text-cyan-300/60 border border-cyan-500/10 hover:text-cyan-200'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>

        {/* Camera Viewfinder */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-950 shadow-2xl border border-cyan-500/30 aspect-[4/3] flex items-center justify-center">
          {cameraError ? (
            <div className="p-6 text-center space-y-3">
              <p className="text-cyan-400 text-xs font-semibold">Camera Access Failed</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-cyan-950 text-xs text-cyan-200 rounded-xl border border-cyan-500/30"
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
              <span className="text-cyan-400 text-6xl font-black tracking-widest animate-ping">
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
                    : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 border-cyan-200 shadow-cyan-400/30 active:scale-95'
                }`}
              >
                <LuCamera className="w-4.5 h-4.5" />
                {isCapturing ? 'Capturing 4 Shots...' : `Start Photobooth (${selectedTimer}s)`}
              </button>
            </div>
          )}
        </div>

        {/* Customization Glass Panels */}
        {photos.length === 4 && (
          <div className="space-y-4 pt-2 border-t border-cyan-500/20">
            {/* Porcelain Beauty Filters with Smooth Scroll */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300/80 flex items-center gap-1.5 px-1">
                <LuSlidersHorizontal className="w-4 h-4 text-cyan-400" /> Porcelain Photo Filters
              </h3>
              <div className="flex gap-2 overflow-x-auto py-1 px-1 scrollbar-thin scrollbar-thumb-cyan-900">
                {IMAGE_FILTERS.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-4 py-2 rounded-2xl text-xs font-semibold border transition-all shrink-0 ${
                      selectedFilter.id === filter.id
                        ? 'border-cyan-400 bg-cyan-900/80 text-cyan-200 shadow-md backdrop-blur-md'
                        : 'border-cyan-500/10 bg-cyan-950/40 text-slate-400 hover:text-cyan-200'
                    }`}
                  >
                    {filter.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Frame Templates Selector */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300/80 flex items-center gap-1.5 px-1">
                <LuLayoutGrid className="w-4 h-4 text-cyan-400" /> Cute Sticker Frame Templates
              </h3>
              <div className="grid grid-cols-2 gap-2.5 px-1">
                {FRAME_TEMPLATES.map((frame) => (
                  <button
                    key={frame.id}
                    onClick={() => setSelectedFrame(frame)}
                    className={`p-3 rounded-2xl text-left border transition-all relative overflow-hidden ${
                      selectedFrame.id === frame.id
                        ? 'border-cyan-400 bg-cyan-950/90 shadow-md ring-1 ring-cyan-400'
                        : 'border-cyan-500/10 bg-cyan-950/30 hover:border-cyan-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/30"
                        style={{ backgroundColor: frame.border }}
                      />
                      <span className="text-xs font-bold text-white leading-tight">{frame.name}</span>
                    </div>
                    <p className="text-[10px] text-cyan-200/50 leading-tight">{frame.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Couple / User Name Input */}
            <div className="bg-cyan-950/40 backdrop-blur-xl p-3.5 rounded-2xl border border-cyan-500/20 shadow-lg">
              <label className="text-[10px] uppercase font-extrabold text-cyan-300/80 tracking-wider block mb-1.5 flex items-center gap-1">
                <LuUser className="w-3 h-3 text-cyan-400" /> Frame Footer Names
              </label>
              <input
                type="text"
                value={coupleNames}
                onChange={(e) => setCoupleNames(e.target.value)}
                placeholder="e.g. CHLOE & LEO"
                className="w-full text-xs bg-slate-950/80 text-cyan-100 rounded-xl px-3.5 py-2.5 border border-cyan-500/20 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            {/* Live Photobooth Double Strip Card Preview */}
            <div
              className="p-3.5 rounded-3xl border shadow-2xl space-y-3 relative overflow-hidden backdrop-blur-md"
              style={{
                backgroundColor: selectedFrame.bg,
                borderColor: selectedFrame.border,
                color: selectedFrame.text,
              }}
            >
              <div className="text-center text-[11px] font-bold uppercase tracking-widest opacity-80">
                LOVEBIRDS PHOTOBOOTH
              </div>

              {/* 2 Strips Side by Side */}
              <div className="grid grid-cols-2 gap-2.5">
                {[1, 2].map((col) => (
                  <div
                    key={col}
                    className="space-y-2 p-2 rounded-2xl border relative overflow-hidden"
                    style={{ backgroundColor: selectedFrame.stripBg, borderColor: selectedFrame.border }}
                  >
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
                    <div className="text-center pt-1.5">
                      <p className="text-xs font-serif font-bold tracking-wide">{coupleNames}</p>
                      <p className="text-[9px] opacity-75 mt-0.5">
                        {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 pt-1">
              <button
                onClick={startPhotoboothSequence}
                className="flex-1 py-3.5 rounded-2xl bg-cyan-950/60 backdrop-blur-xl border border-cyan-500/30 text-cyan-200 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-cyan-900 transition-all active:scale-95"
              >
                <LuRefreshCw className="w-4 h-4" /> Retake
              </button>
              <button
                onClick={generateCanvasAndSave}
                className="flex-2 py-3.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-xl shadow-cyan-400/20 border border-cyan-200 transition-all active:scale-95"
              >
                <LuDownload className="w-4 h-4" /> Save Photo Strip
              </button>
            </div>
          </div>
        )}

        {/* Saved Gallery */}
        {savedGallery.length > 0 && (
          <section className="pt-4 border-t border-cyan-500/20 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300/80 px-1">
              Saved Romance Strips
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {savedGallery.map((item) => (
                <div key={item.id} className="relative bg-cyan-950/40 backdrop-blur-xl p-2 rounded-2xl border border-cyan-500/20 shadow-lg">
                  <img src={item.image} alt="Saved Memory" className="w-full h-auto rounded-xl" />
                  <button
                    onClick={() => deleteMemory(item.id)}
                    className="absolute top-3 right-3 p-1.5 bg-slate-950/80 text-cyan-300 rounded-full hover:bg-rose-600 hover:text-white transition-all border border-cyan-500/20"
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