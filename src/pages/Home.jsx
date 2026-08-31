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
  LuCrown,
  LuFlower2,
  LuSmile
} from 'react-icons/lu';

// Modern Cyan Dark Glassmorphism + Classic Romance Vintage Themes
const THEMES = [
  { id: 'cyan-glass', name: 'Cyan Dark Glass', bg: '#0A192F', text: '#38BDF8', border: '#1E293B', photoBg: '#0F172A', glassBg: 'rgba(15, 23, 42, 0.75)' },
  { id: 'vintage-sepia', name: 'Vintage Romance', bg: '#2C1D11', text: '#FDE047', border: '#78350F', photoBg: '#1C130B', glassBg: 'rgba(44, 29, 17, 0.75)' },
  { id: 'burgundy-love', name: 'Burgundy Velvet', bg: '#4A121A', text: '#FDA4AF', border: '#9F1239', photoBg: '#2D0B10', glassBg: 'rgba(74, 18, 26, 0.75)' },
  { id: 'blush-pink', name: 'Blush Softness', bg: '#3B0764', text: '#F472B6', border: '#7E22CE', photoBg: '#24043D', glassBg: 'rgba(59, 7, 100, 0.75)' },
  { id: 'cozy-espresso', name: 'Cozy Espresso', bg: '#1F1917', text: '#F59E0B', border: '#44403C', photoBg: '#141110', glassBg: 'rgba(31, 25, 23, 0.75)' },
  { id: 'midnight-classic', name: 'Midnight Classic', bg: '#090D16', text: '#E2E8F0', border: '#334155', photoBg: '#020617', glassBg: 'rgba(9, 13, 22, 0.75)' }
];

// Bright & Porcelain Filters
const IMAGE_FILTERS = [
  { 
    id: 'porcelain-bright', 
    name: 'Porcelain White', 
    css: 'brightness(118%) contrast(96%) saturate(105%) sepia(2%)', 
    canvasFilter: 'brightness(118%) contrast(96%) saturate(105%) sepia(2%)' 
  },
  { 
    id: 'snow-white', 
    name: 'Pure Snow Glow', 
    css: 'brightness(124%) contrast(92%) saturate(110%) hue-rotate(-4deg)', 
    canvasFilter: 'brightness(124%) contrast(92%) saturate(110%) hue-rotate(-4deg)' 
  },
  { 
    id: 'rosy-pink', 
    name: 'Rosy Pink Tone', 
    css: 'brightness(112%) contrast(98%) saturate(125%) sepia(10%) hue-rotate(-10deg)', 
    canvasFilter: 'brightness(112%) contrast(98%) saturate(125%) sepia(10%) hue-rotate(-10deg)' 
  },
  { 
    id: 'vintage-warm', 
    name: 'Vintage Sepia Touch', 
    css: 'brightness(105%) contrast(100%) saturate(120%) sepia(25%) hue-rotate(-5deg)', 
    canvasFilter: 'brightness(105%) contrast(100%) saturate(120%) sepia(25%) hue-rotate(-5deg)' 
  },
  { 
    id: 'soft-monochrome', 
    name: 'Retro Mono Classic', 
    css: 'grayscale(100%) brightness(110%) contrast(105%)', 
    canvasFilter: 'grayscale(100%) brightness(110%) contrast(105%)' 
  }
];

// Cute Icons & Stickers
const STICKERS = [
  { id: 'panda', name: 'Panda Bear', symbol: '🐼' },
  { id: 'heart-stamp', name: 'Double Hearts', symbol: '💖' },
  { id: 'crown-stamp', name: 'Sweet Crown', symbol: '👑' },
  { id: 'sparkles', name: 'Shining Stars', symbol: '✨' },
  { id: 'ribbon-stamp', name: 'Pink Ribbon', symbol: '🎀' },
  { id: 'flower', name: 'Cherry Blossom', symbol: '🌸' }
];

const TIMER_OPTIONS = [5, 10, 20, 30];

const Home = () => {
  const [photos, setPhotos] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [selectedFilter, setSelectedFilter] = useState(IMAGE_FILTERS[0]);
  const [selectedSticker, setSelectedSticker] = useState(STICKERS[0]);
  const [selectedTimer, setSelectedTimer] = useState(5);
  const [caption, setCaption] = useState('ROMANCE BOOTH');
  const [stream, setStream] = useState(null);
  const [savedGallery, setSavedGallery] = useState([]);
  const [cameraError, setCameraError] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const localData = localStorage.getItem('cyan_photobooth_gallery');
    if (localData) {
      setSavedGallery(JSON.parse(localData));
    }
  }, []);

  const startCamera = async () => {
    setCameraError(false);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          aspectRatio: { ideal: 4 / 3 } // Wide Screen 4:3 for Couples
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        setStream(fallbackStream);
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
        }
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
    const targetWidth = 640;
    const targetHeight = 480;

    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');

    const vWidth = video.videoWidth || targetWidth;
    const vHeight = video.videoHeight || targetHeight;

    const targetRatio = targetWidth / targetHeight;
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

  const generateCanvasAndSave = () => {
    if (photos.length < 4) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const colWidth = 360;
    const gapBetweenCols = 30;
    const outerMargin = 40;
    const totalWidth = outerMargin * 2 + colWidth * 2 + gapBetweenCols;

    const photoWidth = 320;
    const photoHeight = 240;
    const photoGap = 18;
    const headerHeight = 50;
    const footerHeight = 120;

    const totalHeight = outerMargin * 2 + headerHeight + 4 * photoHeight + 3 * photoGap + footerHeight;

    canvas.width = totalWidth;
    canvas.height = totalHeight;

    // Background
    ctx.fillStyle = selectedTheme.bg;
    ctx.fillRect(0, 0, totalWidth, totalHeight);

    // Header Text
    ctx.fillStyle = selectedTheme.text;
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';

    const col1CenterX = outerMargin + colWidth / 2;
    const col2CenterX = outerMargin + colWidth + gapBetweenCols + colWidth / 2;

    const headerText = selectedSticker.symbol 
      ? `${selectedSticker.symbol} ROMANCE STUDIO ${selectedSticker.symbol}` 
      : '• ROMANCE STUDIO •';

    ctx.fillText(headerText, col1CenterX, outerMargin + 30);
    ctx.fillText(headerText, col2CenterX, outerMargin + 30);

    let loadedCount = 0;
    photos.forEach((photoSrc, index) => {
      const img = new Image();
      img.src = photoSrc;
      img.onload = () => {
        const yPos = outerMargin + headerHeight + index * (photoHeight + photoGap);

        // Column 1
        const col1PhotoX = outerMargin + (colWidth - photoWidth) / 2;
        ctx.fillStyle = selectedTheme.photoBg;
        ctx.fillRect(col1PhotoX - 6, yPos - 6, photoWidth + 12, photoHeight + 12);

        ctx.save();
        ctx.filter = selectedFilter.canvasFilter;
        ctx.drawImage(img, col1PhotoX, yPos, photoWidth, photoHeight);
        ctx.restore();

        // Column 2
        const col2PhotoX = outerMargin + colWidth + gapBetweenCols + (colWidth - photoWidth) / 2;
        ctx.fillStyle = selectedTheme.photoBg;
        ctx.fillRect(col2PhotoX - 6, yPos - 6, photoWidth + 12, photoHeight + 12);

        ctx.save();
        ctx.filter = selectedFilter.canvasFilter;
        ctx.drawImage(img, col2PhotoX, yPos, photoWidth, photoHeight);
        ctx.restore();

        // Icon Overlay
        if (selectedSticker.symbol) {
          ctx.font = '22px sans-serif';
          ctx.fillText(selectedSticker.symbol, col1PhotoX + 25, yPos + 30);
          ctx.fillText(selectedSticker.symbol, col2PhotoX + 25, yPos + 30);
        }

        loadedCount++;
        if (loadedCount === 4) {
          const today = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

          ctx.fillStyle = selectedTheme.text;
          ctx.font = 'bold 22px sans-serif';
          ctx.fillText(`[ ${caption} ]`, col1CenterX, totalHeight - footerHeight / 2 - 5);
          ctx.font = '400 14px sans-serif';
          ctx.globalAlpha = 0.7;
          ctx.fillText(today, col1CenterX, totalHeight - footerHeight / 2 + 25);
          ctx.globalAlpha = 1.0;

          ctx.fillStyle = selectedTheme.text;
          ctx.font = 'bold 22px sans-serif';
          ctx.fillText(`[ ${caption} ]`, col2CenterX, totalHeight - footerHeight / 2 - 5);
          ctx.font = '400 14px sans-serif';
          ctx.globalAlpha = 0.7;
          ctx.fillText(today, col2CenterX, totalHeight - footerHeight / 2 + 25);
          ctx.globalAlpha = 1.0;

          const dataUrl = canvas.toDataURL('image/png');

          const link = document.createElement('a');
          link.download = `photo4cut-${Date.now()}.png`;
          link.href = dataUrl;
          link.click();

          const updatedGallery = [{ id: Date.now(), image: dataUrl, date: today, caption }, ...savedGallery];
          setSavedGallery(updatedGallery);
          localStorage.setItem('cyan_photobooth_gallery', JSON.stringify(updatedGallery));
        }
      };
    });
  };

  const deleteMemory = (id) => {
    const filtered = savedGallery.filter((item) => item.id !== id);
    setSavedGallery(filtered);
    localStorage.setItem('cyan_photobooth_gallery', JSON.stringify(filtered));
  };

  return (
    <div className="min-h-screen bg-[#060D17] text-cyan-50 font-sans pb-28 px-4 pt-6 relative overflow-x-hidden">
      {/* Modern Cyan Glass Glowing Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/15 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-blue-600/15 rounded-full blur-[150px]" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-teal-500/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-md mx-auto space-y-5">
        {/* Modern Cyan Glassmorphism Header */}
        <header className="bg-slate-900/40 backdrop-blur-2xl border border-cyan-500/30 p-4.5 rounded-3xl shadow-[0_8px_32px_0_rgba(0,195,255,0.1)] flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
              <LuHeart className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" /> Romance Photo Studio
            </span>
            <h1 className="text-lg font-bold tracking-tight text-white mt-0.5">Photo4Cut Booth</h1>
          </div>
          <div className="w-9 h-9 rounded-2xl bg-cyan-950/60 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-inner backdrop-blur-md">
            <LuSparkles className="w-4.5 h-4.5" />
          </div>
        </header>

        {/* Timer Glass Bar */}
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedTimer === sec
                    ? 'bg-cyan-400 text-white shadow-lg shadow-cyan-500/30 font-extrabold border border-cyan-300'
                    : 'bg-slate-950/40 text-slate-400 border border-cyan-500/10 hover:text-cyan-300'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>

        {/* Wide Camera Viewfinder (4:3 Fit) */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-950 shadow-2xl border border-cyan-500/30 aspect-[4/3] flex items-center justify-center backdrop-blur-sm">
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

          {selectedSticker.symbol && !cameraError && (
            <div className="absolute top-3 left-4 right-4 flex justify-between pointer-events-none text-cyan-200 text-lg">
              <span>{selectedSticker.symbol}</span>
              <span>{selectedSticker.symbol}</span>
            </div>
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
                className={`px-6 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-xl border transition-all ${
                  isCapturing
                    ? 'bg-slate-900/80 border-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black border-cyan-300 shadow-cyan-500/30 active:scale-95'
                }`}
              >
                <LuCamera className="w-4.5 h-4.5" />
                {isCapturing ? 'Capturing Shots...' : `Take 4 Shots (${selectedTimer}s)`}
              </button>
            </div>
          )}
        </div>

        {/* Customizations Section */}
        {photos.length === 4 && (
          <div className="space-y-5 pt-3 border-t border-cyan-500/20">
            {/* Beauty Filters */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300/80 flex items-center gap-1.5 px-1">
                <LuSlidersHorizontal className="w-4 h-4 text-cyan-400" /> Bright Beauty Filters
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

            {/* Cute Icons / Stamps */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300/80 flex items-center gap-1.5 px-1">
                <LuSmile className="w-4 h-4 text-cyan-400" /> Cute Icon Stamps
              </h3>
              <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1 px-1 scrollbar-thin scrollbar-thumb-cyan-950">
                {STICKERS.map((stk) => (
                  <button
                    key={stk.id}
                    onClick={() => setSelectedSticker(stk)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-semibold border transition-all flex items-center gap-2 shrink-0 ${
                      selectedSticker.id === stk.id
                        ? 'border-cyan-400 bg-cyan-950/80 text-cyan-200 shadow-md backdrop-blur-md'
                        : 'border-cyan-500/10 bg-slate-900/40 text-slate-400 hover:text-cyan-200'
                    }`}
                  >
                    <span className="text-base">{stk.symbol}</span>
                    {stk.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Romance & Vintage Themes */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300/80 flex items-center gap-1.5 px-1">
                <LuImage className="w-4 h-4 text-cyan-400" /> Vintage & Romance Themes
              </h3>
              <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1 px-1 scrollbar-thin scrollbar-thumb-cyan-950">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-semibold border transition-all flex items-center gap-2 shrink-0 ${
                      selectedTheme.id === theme.id
                        ? 'border-cyan-400 bg-cyan-950/80 text-cyan-200 shadow-md backdrop-blur-md'
                        : 'border-cyan-500/10 bg-slate-900/40 text-slate-400 hover:text-cyan-200'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: theme.bg }}
                    />
                    {theme.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Caption Input */}
            <div className="bg-slate-900/40 backdrop-blur-2xl p-3.5 rounded-2xl border border-cyan-500/20 shadow-lg">
              <label className="text-[10px] uppercase font-bold text-cyan-300/80 tracking-wider block mb-1.5">
                Bottom Caption Title
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Enter title..."
                className="w-full text-xs bg-slate-950/80 text-cyan-100 rounded-xl px-3.5 py-2.5 border border-cyan-500/20 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            {/* Live Double Strip Photobooth Preview */}
            <div
              className="p-4 rounded-3xl border shadow-2xl space-y-3"
              style={{
                backgroundColor: selectedTheme.bg,
                borderColor: selectedTheme.border,
                color: selectedTheme.text,
              }}
            >
              <div className="text-center text-[11px] uppercase font-bold tracking-widest opacity-80 flex items-center justify-center gap-2">
                <span>{selectedSticker.symbol}</span>
                <span>ROMANCE STUDIO</span>
                <span>{selectedSticker.symbol}</span>
              </div>

              {/* 2-Column Double Strip Display */}
              <div className="grid grid-cols-2 gap-3">
                {/* Column 1 */}
                <div className="space-y-2">
                  {photos.map((src, i) => (
                    <div
                      key={`col1-${i}`}
                      className="p-1 rounded-xl shadow-sm overflow-hidden relative aspect-[4/3]"
                      style={{ backgroundColor: selectedTheme.photoBg }}
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
                    <p className="text-xs font-bold tracking-wide">[ {caption} ]</p>
                    <p className="text-[9px] opacity-70 mt-0.5">
                      {new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-2">
                  {photos.map((src, i) => (
                    <div
                      key={`col2-${i}`}
                      className="p-1 rounded-xl shadow-sm overflow-hidden relative aspect-[4/3]"
                      style={{ backgroundColor: selectedTheme.photoBg }}
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
                    <p className="text-xs font-bold tracking-wide">[ {caption} ]</p>
                    <p className="text-[9px] opacity-70 mt-0.5">
                      {new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
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

        {/* Gallery Section */}
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