import React, { useState, useRef, useEffect } from 'react';
import {
  LuCamera,
  LuDownload,
  LuRefreshCw,
  LuImage,
  LuTrash2,
  LuHeart,
  LuSlidersHorizontal,
  LuTimer,
  LuSparkles,
  LuUser,
  LuLayers
} from 'react-icons/lu';

// 6 Custom Aesthetic Frame Textures (No Emojis - Pure High-End Aesthetic Borders)
const FRAME_TEXTURES = [
  {
    id: 'victorian-lace',
    name: 'Victorian Lace',
    bg: '#181214',
    photoBg: '#281E22',
    text: '#FDF0D5',
    border: '#D4AF37',
    style: 'lace',
    description: 'Classic Vintage Lace & Gold Filigree'
  },
  {
    id: 'cyan-cyber-glass',
    name: 'Cyan Cyber Glass',
    bg: '#051329',
    photoBg: '#0A2246',
    text: '#38BDF8',
    border: '#0EA5E9',
    style: 'glass',
    description: 'Neon Cyan & Translucent Glass Glow'
  },
  {
    id: 'romantic-filigree',
    name: 'Romantic Filigree',
    bg: '#1C0A15',
    photoBg: '#321427',
    text: '#F472B6',
    border: '#EC4899',
    style: 'filigree',
    description: 'Floral Heart Ornaments & Soft Glow'
  },
  {
    id: 'silver-royalty',
    name: 'Silver Royalty Lace',
    bg: '#0F172A',
    photoBg: '#1E293B',
    text: '#E2E8F0',
    border: '#94A3B8',
    style: 'silver',
    description: 'Metallic Silver & Elegant Damask'
  },
  {
    id: 'y2k-retro-chrome',
    name: 'Y2K Retro Chrome',
    bg: '#0A0A0C',
    photoBg: '#18181B',
    text: '#A855F7',
    border: '#C084FC',
    style: 'chrome',
    description: 'Futuristic Glossy Chrome Edges'
  },
  {
    id: 'pearl-minimal',
    name: 'Rose Pearl Minimal',
    bg: '#1A1417',
    photoBg: '#2B2026',
    text: '#FECDD3',
    border: '#FB7185',
    style: 'minimal',
    description: 'Double Fine Line Corner Details'
  }
];

// Bright Porcelain Beauty Filters
const IMAGE_FILTERS = [
  { 
    id: 'porcelain-bright', 
    name: 'Porcelain Glow', 
    css: 'brightness(118%) contrast(96%) saturate(105%) sepia(2%)', 
    canvasFilter: 'brightness(118%) contrast(96%) saturate(105%) sepia(2%)' 
  },
  { 
    id: 'snow-white', 
    name: 'Pure Snow White', 
    css: 'brightness(124%) contrast(92%) saturate(110%) hue-rotate(-4deg)', 
    canvasFilter: 'brightness(124%) contrast(92%) saturate(110%) hue-rotate(-4deg)' 
  },
  { 
    id: 'rosy-pink', 
    name: 'Rosy Pink Youth', 
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

const TIMER_OPTIONS = [5, 10, 20, 30];

const Home = () => {
  const [photos, setPhotos] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [selectedFrame, setSelectedFrame] = useState(FRAME_TEXTURES[0]);
  const [selectedFilter, setSelectedFilter] = useState(IMAGE_FILTERS[0]);
  const [selectedTimer, setSelectedTimer] = useState(5);
  const [coupleNames, setCoupleNames] = useState('CHLOE & LEO');
  const [stream, setStream] = useState(null);
  const [savedGallery, setSavedGallery] = useState([]);
  const [cameraError, setCameraError] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const localData = localStorage.getItem('cyan_glass_gallery_v2');
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

  // Canvas Drawing with Aesthetic Frame Textures & Lace Borders
  const drawFrameTextures = (ctx, x, y, width, height, frameStyle, color) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    // 1. Victorian Lace Pattern
    if (frameStyle === 'lace') {
      ctx.strokeRect(x, y, width, height);
      ctx.strokeRect(x + 5, y + 5, width - 10, height - 10);
      
      // Lace Loops Top/Bottom
      for (let i = x + 10; i < x + width - 10; i += 12) {
        ctx.beginPath();
        ctx.arc(i, y + 3, 4, 0, Math.PI);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(i, y + height - 3, 4, Math.PI, 0);
        ctx.stroke();
      }
    } 
    // 2. Cyan Cyber Glass Glow Lines
    else if (frameStyle === 'glass') {
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.strokeRect(x, y, width, height);
      ctx.shadowBlur = 0;

      // Corner Accents
      const cLen = 15;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x - 4, y + cLen); ctx.lineTo(x - 4, y - 4); ctx.lineTo(x + cLen, y - 4);
      ctx.moveTo(x + width - cLen, y - 4); ctx.lineTo(x + width + 4, y - 4); ctx.lineTo(x + width + 4, y + cLen);
      ctx.moveTo(x - 4, y + height - cLen); ctx.lineTo(x - 4, y + height + 4); ctx.lineTo(x + cLen, y + height + 4);
      ctx.moveTo(x + width - cLen, y + height + 4); ctx.lineTo(x + width + 4, y + height + 4); ctx.lineTo(x + width + 4, y + height - cLen);
      ctx.stroke();
    } 
    // 3. Romantic Filigree
    else if (frameStyle === 'filigree') {
      ctx.strokeRect(x, y, width, height);
      // Double inner frame
      ctx.strokeRect(x + 6, y + 6, width - 12, height - 12);
    } 
    // 4. Silver Royalty Lace
    else if (frameStyle === 'silver') {
      ctx.strokeRect(x, y, width, height);
      ctx.strokeRect(x + 4, y + 4, width - 8, height - 8);
      ctx.strokeRect(x + 8, y + 8, width - 16, height - 16);
    } 
    // Default Clean Double Line
    else {
      ctx.strokeRect(x, y, width, height);
      ctx.strokeRect(x + 4, y + 4, width - 8, height - 8);
    }
  };

  const generateCanvasAndSave = () => {
    if (photos.length < 4) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const colWidth = 360;
    const gapBetweenCols = 35;
    const outerMargin = 45;
    const totalWidth = outerMargin * 2 + colWidth * 2 + gapBetweenCols;

    const photoWidth = 320;
    const photoHeight = 240;
    const photoGap = 18;
    const headerHeight = 60;
    const footerHeight = 130;

    const totalHeight = outerMargin * 2 + headerHeight + 4 * photoHeight + 3 * photoGap + footerHeight;

    canvas.width = totalWidth;
    canvas.height = totalHeight;

    // Background Gradient Layer
    const bgGradient = ctx.createLinearGradient(0, 0, totalWidth, totalHeight);
    bgGradient.addColorStop(0, selectedFrame.bg);
    bgGradient.addColorStop(1, selectedFrame.photoBg);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, totalWidth, totalHeight);

    // Draw Strip Outer Lace Textures
    const col1X = outerMargin / 2;
    const col1Y = outerMargin / 2;
    const stripWidth = colWidth + outerMargin / 2;
    const stripHeight = totalHeight - outerMargin;

    const col2X = outerMargin + colWidth + gapBetweenCols - outerMargin / 4;
    const col2Y = outerMargin / 2;

    drawFrameTextures(ctx, col1X, col1Y, stripWidth, stripHeight, selectedFrame.style, selectedFrame.border);
    drawFrameTextures(ctx, col2X, col2Y, stripWidth, stripHeight, selectedFrame.style, selectedFrame.border);

    // Header Title Text
    ctx.fillStyle = selectedFrame.text;
    ctx.font = 'bold 22px serif';
    ctx.textAlign = 'center';

    const col1CenterX = outerMargin + colWidth / 2;
    const col2CenterX = outerMargin + colWidth + gapBetweenCols + colWidth / 2;

    const headerText = 'LOVEBIRDS PHOTOBOOTH';

    ctx.fillText(headerText, col1CenterX, outerMargin + 35);
    ctx.fillText(headerText, col2CenterX, outerMargin + 35);

    let loadedCount = 0;
    photos.forEach((photoSrc, index) => {
      const img = new Image();
      img.src = photoSrc;
      img.onload = () => {
        const yPos = outerMargin + headerHeight + index * (photoHeight + photoGap);

        // Column 1 Photo
        const col1PhotoX = outerMargin + (colWidth - photoWidth) / 2;
        ctx.fillStyle = selectedFrame.photoBg;
        ctx.fillRect(col1PhotoX - 6, yPos - 6, photoWidth + 12, photoHeight + 12);

        ctx.save();
        ctx.filter = selectedFilter.canvasFilter;
        ctx.drawImage(img, col1PhotoX, yPos, photoWidth, photoHeight);
        ctx.restore();

        // Photo Frame Accent Border
        ctx.strokeStyle = selectedFrame.border;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(col1PhotoX, yPos, photoWidth, photoHeight);

        // Column 2 Photo
        const col2PhotoX = outerMargin + colWidth + gapBetweenCols + (colWidth - photoWidth) / 2;
        ctx.fillStyle = selectedFrame.photoBg;
        ctx.fillRect(col2PhotoX - 6, yPos - 6, photoWidth + 12, photoHeight + 12);

        ctx.save();
        ctx.filter = selectedFilter.canvasFilter;
        ctx.drawImage(img, col2PhotoX, yPos, photoWidth, photoHeight);
        ctx.restore();

        ctx.strokeRect(col2PhotoX, yPos, photoWidth, photoHeight);

        loadedCount++;
        if (loadedCount === 4) {
          const today = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

          // Footer Couple Names
          ctx.fillStyle = selectedFrame.text;
          ctx.font = 'bold 24px serif';
          ctx.fillText(coupleNames, col1CenterX, totalHeight - footerHeight / 2 - 5);
          ctx.font = '500 13px sans-serif';
          ctx.globalAlpha = 0.8;
          ctx.fillText(`MOMENTS IN LOVE • ${today}`, col1CenterX, totalHeight - footerHeight / 2 + 25);
          ctx.globalAlpha = 1.0;

          ctx.fillStyle = selectedFrame.text;
          ctx.font = 'bold 24px serif';
          ctx.fillText(coupleNames, col2CenterX, totalHeight - footerHeight / 2 - 5);
          ctx.font = '500 13px sans-serif';
          ctx.globalAlpha = 0.8;
          ctx.fillText(`MOMENTS IN LOVE • ${today}`, col2CenterX, totalHeight - footerHeight / 2 + 25);
          ctx.globalAlpha = 1.0;

          const dataUrl = canvas.toDataURL('image/png');

          const link = document.createElement('a');
          link.download = `aesthetic-lace-booth-${Date.now()}.png`;
          link.href = dataUrl;
          link.click();

          const updatedGallery = [{ id: Date.now(), image: dataUrl, date: today, coupleNames }, ...savedGallery];
          setSavedGallery(updatedGallery);
          localStorage.setItem('cyan_glass_gallery_v2', JSON.stringify(updatedGallery));
        }
      };
    });
  };

  const deleteMemory = (id) => {
    const filtered = savedGallery.filter((item) => item.id !== id);
    setSavedGallery(filtered);
    localStorage.setItem('cyan_glass_gallery_v2', JSON.stringify(filtered));
  };

  return (
    <div className="min-h-screen bg-[#030914] text-cyan-50 font-sans pb-28 px-4 pt-6 relative overflow-x-hidden">
      {/* Background Cyan Glass Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-blue-600/20 rounded-full blur-[160px]" />
      </div>

      <div className="relative z-10 max-w-md mx-auto space-y-5">
        {/* Header */}
        <header className="bg-slate-900/40 backdrop-blur-2xl border border-cyan-500/30 p-4.5 rounded-3xl shadow-xl flex justify-between items-center relative overflow-hidden">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
              <LuHeart className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" /> Aesthetic Frame Photobooth
            </span>
            <h1 className="text-lg font-black tracking-tight text-white mt-0.5">Lace & Glass Romance</h1>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-cyan-950/60 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
            <LuSparkles className="w-5 h-5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
        </header>

        {/* Timer Control Bar */}
        <div className="bg-slate-900/40 backdrop-blur-2xl p-3.5 rounded-2xl border border-cyan-500/20 shadow-lg flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-300/90 flex items-center gap-1.5">
            <LuTimer className="w-4 h-4 text-cyan-400" /> Timer Delay:
          </span>
          <div className="flex gap-1.5">
            {TIMER_OPTIONS.map((sec) => (
              <button
                key={sec}
                disabled={isCapturing}
                onClick={() => setSelectedTimer(sec)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  selectedTimer === sec
                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/40 border border-cyan-300'
                    : 'bg-slate-950/40 text-slate-400 border border-cyan-500/10 hover:text-cyan-300'
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
              <p className="text-cyan-400 text-xs font-semibold">Camera Access Error</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-slate-900/80 hover:bg-slate-800 text-xs text-white rounded-xl border border-cyan-500/30"
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
              className="w-full h-full object-cover scale-x-[-1] transition-all duration-300"
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
            <div className="absolute bottom-4 left-0 right-0 flex justify-center z-10">
              <button
                disabled={isCapturing}
                onClick={startPhotoboothSequence}
                className={`px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2 shadow-xl border transition-all ${
                  isCapturing
                    ? 'bg-slate-900/80 border-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 border-cyan-300 shadow-cyan-500/30 active:scale-95'
                }`}
              >
                <LuCamera className="w-4.5 h-4.5" />
                {isCapturing ? 'Capturing Shots...' : `Take 4 Shots (${selectedTimer}s)`}
              </button>
            </div>
          )}
        </div>

        {/* Customization Glass Panels */}
        {photos.length === 4 && (
          <div className="space-y-5 pt-3 border-t border-cyan-500/20">
            {/* Filters */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300/80 flex items-center gap-1.5 px-1">
                <LuSlidersHorizontal className="w-4 h-4 text-cyan-400" /> Porcelain Beauty Filters
              </h3>
              <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1 px-1 scrollbar-thin scrollbar-thumb-cyan-950">
                {IMAGE_FILTERS.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-semibold border transition-all shrink-0 ${
                      selectedFilter.id === filter.id
                        ? 'border-cyan-400 bg-cyan-950/80 text-cyan-200 shadow-md backdrop-blur-md'
                        : 'border-cyan-500/10 bg-slate-900/40 text-slate-400 hover:text-cyan-200'
                    }`}
                  >
                    {filter.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 6 Aesthetic Frame Textures Selector */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300/80 flex items-center gap-1.5 px-1">
                <LuLayers className="w-4 h-4 text-cyan-400" /> 6 Aesthetic Frame Textures
              </h3>
              <div className="grid grid-cols-2 gap-2.5 px-1">
                {FRAME_TEXTURES.map((frame) => (
                  <button
                    key={frame.id}
                    onClick={() => setSelectedFrame(frame)}
                    className={`p-3 rounded-2xl text-left border transition-all relative overflow-hidden ${
                      selectedFrame.id === frame.id
                        ? 'border-cyan-400 bg-cyan-950/80 shadow-md ring-1 ring-cyan-400'
                        : 'border-cyan-500/10 bg-slate-900/40 hover:border-cyan-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/30"
                        style={{ backgroundColor: frame.border }}
                      />
                      <span className="text-xs font-bold text-white">{frame.name}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">{frame.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Couple Names Input */}
            <div className="bg-slate-900/40 backdrop-blur-2xl p-3.5 rounded-2xl border border-cyan-500/20 shadow-lg">
              <label className="text-[10px] uppercase font-extrabold text-cyan-300/80 tracking-wider block mb-1.5 flex items-center gap-1">
                <LuUser className="w-3 h-3 text-cyan-400" /> Couple Names (Bottom Title)
              </label>
              <input
                type="text"
                value={coupleNames}
                onChange={(e) => setCoupleNames(e.target.value)}
                placeholder="e.g. CHLOE & LEO"
                className="w-full text-xs bg-slate-950/80 text-cyan-100 rounded-xl px-3.5 py-2.5 border border-cyan-500/20 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            {/* Photobooth Double Strip Card Preview */}
            <div
              className="p-4 rounded-3xl border shadow-2xl space-y-3 relative overflow-hidden backdrop-blur-md"
              style={{
                backgroundColor: selectedFrame.bg,
                borderColor: selectedFrame.border,
                color: selectedFrame.text,
              }}
            >
              <div className="text-center text-[11px] font-serif font-bold uppercase tracking-widest opacity-80">
                LOVEBIRDS PHOTOBOOTH
              </div>

              {/* 2 Columns Double Strip Display */}
              <div className="grid grid-cols-2 gap-3">
                {/* Strip 1 */}
                <div
                  className="space-y-2 p-2 border rounded-2xl relative"
                  style={{ borderColor: selectedFrame.border, backgroundColor: 'rgba(0,0,0,0.2)' }}
                >
                  {photos.map((src, i) => (
                    <div
                      key={`col1-${i}`}
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
                    <p className="text-[9px] opacity-70 mt-0.5">
                      MOMENTS IN LOVE • {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Strip 2 */}
                <div
                  className="space-y-2 p-2 border rounded-2xl relative"
                  style={{ borderColor: selectedFrame.border, backgroundColor: 'rgba(0,0,0,0.2)' }}
                >
                  {photos.map((src, i) => (
                    <div
                      key={`col2-${i}`}
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
                    <p className="text-[9px] opacity-70 mt-0.5">
                      MOMENTS IN LOVE • {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 pt-1">
              <button
                onClick={startPhotoboothSequence}
                className="flex-1 py-3.5 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-cyan-500/30 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-800 hover:text-white transition-all active:scale-95"
              >
                <LuRefreshCw className="w-4 h-4" /> Retake
              </button>
              <button
                onClick={generateCanvasAndSave}
                className="flex-2 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-xl shadow-cyan-500/20 border border-cyan-300 transition-all active:scale-95"
              >
                <LuDownload className="w-4 h-4" /> Save Double Strips
              </button>
            </div>
          </div>
        )}

        {/* Saved Gallery */}
        {savedGallery.length > 0 && (
          <section className="pt-5 border-t border-cyan-500/20 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300/80 px-1">
              Saved Romance Strips
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {savedGallery.map((item) => (
                <div key={item.id} className="relative bg-slate-900/40 backdrop-blur-2xl p-2 rounded-2xl border border-cyan-500/20 shadow-lg">
                  <img src={item.image} alt="Saved Memory" className="w-full h-auto rounded-xl" />
                  <button
                    onClick={() => deleteMemory(item.id)}
                    className="absolute top-3 right-3 p-1.5 bg-slate-950/80 text-cyan-400 rounded-full hover:bg-rose-600 hover:text-white transition-all border border-cyan-500/20"
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