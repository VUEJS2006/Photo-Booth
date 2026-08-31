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
  LuSparkles
} from 'react-icons/lu';

// Romantic & Couple Photobooth Themes (Emoji Free)
const THEMES = [
  { id: 'burgundy-love', name: 'Burgundy Wine', bg: '#7A353B', text: '#FFFFFF', border: '#58242A', photoBg: '#522227' },
  { id: 'rose-romance', name: 'Rose Romance', bg: '#9E4759', text: '#FFF0F3', border: '#7A3241', photoBg: '#6E2A38' },
  { id: 'blush-pink', name: 'Blush Pink', bg: '#FCE7F3', text: '#9D174D', border: '#F472B6', photoBg: '#FBCFE8' },
  { id: 'soft-cherry', name: 'Soft Cherry', bg: '#4C1D24', text: '#FFE4E6', border: '#E11D48', photoBg: '#381318' },
  { id: 'creamy-white', name: 'Creamy Studio', bg: '#FAF5EF', text: '#4A3B32', border: '#E6D7C3', photoBg: '#FFFFFF' },
  { id: 'vintage-cocoa', name: 'Cozy Chocolate', bg: '#3D2622', text: '#FDE68A', border: '#B45309', photoBg: '#2A1916' },
  { id: 'pure-black', name: 'Classic Black', bg: '#121212', text: '#FFFFFF', border: '#333333', photoBg: '#1E1E1E' }
];

// Bright & Porcelain Beauty Filters for Couples (Emoji Free)
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
    id: 'bright-velvet', 
    name: 'Soft Bright Velvet', 
    css: 'brightness(115%) contrast(102%) saturate(115%) sepia(6%)', 
    canvasFilter: 'brightness(115%) contrast(102%) saturate(115%) sepia(6%)' 
  },
  { 
    id: 'warm-romantic', 
    name: 'Warm Sunset Light', 
    css: 'brightness(108%) contrast(100%) saturate(130%) sepia(18%) hue-rotate(-6deg)', 
    canvasFilter: 'brightness(108%) contrast(100%) saturate(130%) sepia(18%) hue-rotate(-6deg)' 
  },
  { 
    id: 'soft-monochrome', 
    name: 'Retro Romantic B&W', 
    css: 'grayscale(100%) brightness(110%) contrast(105%)', 
    canvasFilter: 'grayscale(100%) brightness(110%) contrast(105%)' 
  }
];

const STICKERS = [
  { id: 'none', name: 'None' },
  { id: 'heart-stamp', name: 'Double Hearts', symbol: '♥♥' },
  { id: 'sparkles', name: 'Shining Stars', symbol: '✦✦' },
  { id: 'ribbon-stamp', name: 'Classic Stamp', symbol: '✤' },
  { id: 'crown-stamp', name: 'Sweet Crown', symbol: '♕' }
];

const TIMER_OPTIONS = [5, 10, 20, 30];

const Home = () => {
  const [photos, setPhotos] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [selectedFilter, setSelectedFilter] = useState(IMAGE_FILTERS[0]);
  const [selectedSticker, setSelectedSticker] = useState(STICKERS[1]);
  const [selectedTimer, setSelectedTimer] = useState(5);
  const [caption, setCaption] = useState('PHOTO4CUT');
  const [stream, setStream] = useState(null);
  const [savedGallery, setSavedGallery] = useState([]);
  const [cameraError, setCameraError] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const localData = localStorage.getItem('photobooth_memories');
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
          aspectRatio: { ideal: 4 / 3 } // 4:3 Wide Screen for Couples
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
    const targetHeight = 480; // Standard 4:3 Couple Fit Ratio

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

  // Generate Photo4Cut Double Strip Canvas (Side-by-Side Strips like Korean Booth)
  const generateCanvasAndSave = () => {
    if (photos.length < 4) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const colWidth = 360;
    const gapBetweenCols = 30;
    const outerMargin = 40;
    const totalWidth = outerMargin * 2 + colWidth * 2 + gapBetweenCols;

    const photoWidth = 320;
    const photoHeight = 240; // 4:3 Ratio Photo
    const photoGap = 18;
    const headerHeight = 50;
    const footerHeight = 120;

    const totalHeight = outerMargin * 2 + headerHeight + 4 * photoHeight + 3 * photoGap + footerHeight;

    canvas.width = totalWidth;
    canvas.height = totalHeight;

    // Fill Background
    ctx.fillStyle = selectedTheme.bg;
    ctx.fillRect(0, 0, totalWidth, totalHeight);

    // Decorative Header Text for both columns
    ctx.fillStyle = selectedTheme.text;
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';

    const col1CenterX = outerMargin + colWidth / 2;
    const col2CenterX = outerMargin + colWidth + gapBetweenCols + colWidth / 2;

    const headerText = selectedSticker.symbol 
      ? `${selectedSticker.symbol} MEMORIES ${selectedSticker.symbol}` 
      : '• ROMANCE STUDIO •';

    ctx.fillText(headerText, col1CenterX, outerMargin + 30);
    ctx.fillText(headerText, col2CenterX, outerMargin + 30);

    let loadedCount = 0;
    photos.forEach((photoSrc, index) => {
      const img = new Image();
      img.src = photoSrc;
      img.onload = () => {
        const yPos = outerMargin + headerHeight + index * (photoHeight + photoGap);

        // Column 1 Photo Draw
        const col1PhotoX = outerMargin + (colWidth - photoWidth) / 2;
        ctx.fillStyle = selectedTheme.photoBg;
        ctx.fillRect(col1PhotoX - 6, yPos - 6, photoWidth + 12, photoHeight + 12);

        ctx.save();
        ctx.filter = selectedFilter.canvasFilter;
        ctx.drawImage(img, col1PhotoX, yPos, photoWidth, photoHeight);
        ctx.restore();

        // Column 2 Photo Draw (Duplicate for Double Strip)
        const col2PhotoX = outerMargin + colWidth + gapBetweenCols + (colWidth - photoWidth) / 2;
        ctx.fillStyle = selectedTheme.photoBg;
        ctx.fillRect(col2PhotoX - 6, yPos - 6, photoWidth + 12, photoHeight + 12);

        ctx.save();
        ctx.filter = selectedFilter.canvasFilter;
        ctx.drawImage(img, col2PhotoX, yPos, photoWidth, photoHeight);
        ctx.restore();

        // Draw Stamps if selected
        if (selectedSticker.symbol) {
          ctx.fillStyle = selectedTheme.text;
          ctx.font = '18px sans-serif';
          ctx.fillText(selectedSticker.symbol, col1PhotoX + 15, yPos + 25);
          ctx.fillText(selectedSticker.symbol, col2PhotoX + 15, yPos + 25);
        }

        loadedCount++;
        if (loadedCount === 4) {
          const today = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

          // Footer Titles Column 1
          ctx.fillStyle = selectedTheme.text;
          ctx.font = 'bold 22px sans-serif';
          ctx.fillText(`[ ${caption} ]`, col1CenterX, totalHeight - footerHeight / 2 - 5);
          ctx.font = '400 14px sans-serif';
          ctx.globalAlpha = 0.7;
          ctx.fillText(today, col1CenterX, totalHeight - footerHeight / 2 + 25);
          ctx.globalAlpha = 1.0;

          // Footer Titles Column 2
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
          localStorage.setItem('photobooth_memories', JSON.stringify(updatedGallery));
        }
      };
    });
  };

  const deleteMemory = (id) => {
    const filtered = savedGallery.filter((item) => item.id !== id);
    setSavedGallery(filtered);
    localStorage.setItem('photobooth_memories', JSON.stringify(filtered));
  };

  return (
    <div className="min-h-screen bg-[#11090C] text-rose-50 font-sans pb-28 px-4 pt-6 relative overflow-x-hidden">
      {/* Ambient Romantic Red Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-rose-900/20 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-pink-900/20 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-md mx-auto space-y-5">
        {/* Clean Romance Studio Header */}
        <header className="bg-rose-950/30 backdrop-blur-2xl border border-rose-500/20 p-4.5 rounded-3xl shadow-xl flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-rose-300 flex items-center gap-1">
              <LuHeart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" /> Couple Photo Booth
            </span>
            <h1 className="text-lg font-bold tracking-tight text-white mt-0.5">Romance Studio</h1>
          </div>
          <div className="w-9 h-9 rounded-2xl bg-rose-900/30 border border-rose-500/30 flex items-center justify-center text-rose-300 shadow-inner">
            <LuSparkles className="w-4 h-4" />
          </div>
        </header>

        {/* Timer Control Bar */}
        <div className="bg-rose-950/20 backdrop-blur-2xl p-3.5 rounded-2xl border border-rose-500/20 shadow-lg flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-300/90 flex items-center gap-1.5">
            <LuTimer className="w-4 h-4 text-rose-400" /> Timer Delay:
          </span>
          <div className="flex gap-1.5">
            {TIMER_OPTIONS.map((sec) => (
              <button
                key={sec}
                disabled={isCapturing}
                onClick={() => setSelectedTimer(sec)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedTimer === sec
                    ? 'bg-rose-700 text-white shadow-lg shadow-rose-900/40 border border-rose-400/30'
                    : 'bg-slate-900/40 text-slate-400 border border-rose-500/10 hover:text-rose-300'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>

        {/* Wide Camera Frame (4:3 Fit for Couples) */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-950 shadow-2xl border border-rose-500/20 aspect-[4/3] flex items-center justify-center backdrop-blur-sm">
          {cameraError ? (
            <div className="p-6 text-center space-y-3">
              <p className="text-rose-400 text-xs font-semibold">Camera Access Error</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-slate-900/80 hover:bg-slate-800 text-xs text-white rounded-xl border border-rose-500/30"
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
            <div className="absolute top-3 left-3 right-3 flex justify-between pointer-events-none text-rose-200/90 text-sm font-bold">
              <span>{selectedSticker.symbol}</span>
              <span>{selectedSticker.symbol}</span>
            </div>
          )}

          {countdown && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-lg flex items-center justify-center z-20">
              <span className="text-rose-400 text-5xl font-black tracking-widest animate-ping">
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
                    : 'bg-rose-700 hover:bg-rose-600 border-rose-400/40 text-white shadow-rose-900/50 active:scale-95'
                }`}
              >
                <LuCamera className="w-4 h-4" />
                {isCapturing ? 'Capturing Shots...' : `Take 4 Shots (${selectedTimer}s)`}
              </button>
            </div>
          )}
        </div>

        {/* Customizations Area */}
        {photos.length === 4 && (
          <div className="space-y-5 pt-3 border-t border-rose-500/20">
            {/* Bright & Porcelain Beauty Filters */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-300/80 flex items-center gap-1.5 px-1">
                <LuSlidersHorizontal className="w-4 h-4 text-rose-400" /> Bright Beauty Filters
              </h3>
              <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1 px-1 scrollbar-thin scrollbar-thumb-rose-950">
                {IMAGE_FILTERS.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-semibold border transition-all shrink-0 ${
                      selectedFilter.id === filter.id
                        ? 'border-rose-400 bg-rose-950/80 text-rose-200 shadow-md'
                        : 'border-rose-500/10 bg-slate-900/40 text-slate-400 hover:text-rose-200'
                    }`}
                  >
                    {filter.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Stamps Selection */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-300/80 flex items-center gap-1.5 px-1">
                <LuHeart className="w-4 h-4 text-rose-400" /> Photo Stamps
              </h3>
              <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1 px-1 scrollbar-thin scrollbar-thumb-rose-950">
                {STICKERS.map((stk) => (
                  <button
                    key={stk.id}
                    onClick={() => setSelectedSticker(stk)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-semibold border transition-all flex items-center gap-2 shrink-0 ${
                      selectedSticker.id === stk.id
                        ? 'border-rose-400 bg-rose-950/80 text-rose-200 shadow-md'
                        : 'border-rose-500/10 bg-slate-900/40 text-slate-400 hover:text-rose-200'
                    }`}
                  >
                    {stk.symbol && <span className="text-sm font-bold">{stk.symbol}</span>}
                    {stk.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Romance Themes */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-300/80 flex items-center gap-1.5 px-1">
                <LuImage className="w-4 h-4 text-rose-400" /> Romantic Card Themes
              </h3>
              <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1 px-1 scrollbar-thin scrollbar-thumb-rose-950">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-semibold border transition-all flex items-center gap-2 shrink-0 ${
                      selectedTheme.id === theme.id
                        ? 'border-rose-400 bg-rose-950/80 text-rose-200 shadow-md'
                        : 'border-rose-500/10 bg-slate-900/40 text-slate-400 hover:text-rose-200'
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
            <div className="bg-rose-950/20 backdrop-blur-2xl p-3.5 rounded-2xl border border-rose-500/20 shadow-lg">
              <label className="text-[10px] uppercase font-bold text-rose-300/80 tracking-wider block mb-1.5">
                Bottom Caption Title
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Enter title..."
                className="w-full text-xs bg-slate-950/80 text-rose-100 rounded-xl px-3.5 py-2.5 border border-rose-500/20 focus:outline-none focus:border-rose-400 transition-colors"
              />
            </div>

            {/* Double Strip Photo4Cut Live Preview */}
            <div
              className="p-4 rounded-3xl border shadow-2xl space-y-3"
              style={{
                backgroundColor: selectedTheme.bg,
                borderColor: selectedTheme.border,
                color: selectedTheme.text,
              }}
            >
              <div className="text-center text-[10px] uppercase font-bold tracking-widest opacity-80">
                {selectedSticker.symbol ? `${selectedSticker.symbol} PHOTO4CUT ${selectedSticker.symbol}` : '• PHOTO4CUT •'}
              </div>

              {/* 2-Column Photo4Cut Double Strip Grid Display */}
              <div className="grid grid-cols-2 gap-3">
                {/* Column 1 Strip */}
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

                {/* Column 2 Strip */}
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
                className="flex-1 py-3.5 rounded-2xl bg-rose-950/40 backdrop-blur-xl border border-rose-500/20 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-rose-950/70 hover:text-white transition-all active:scale-95"
              >
                <LuRefreshCw className="w-4 h-4" /> Retake
              </button>
              <button
                onClick={generateCanvasAndSave}
                className="flex-2 py-3.5 rounded-2xl bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xl shadow-rose-900/40 border border-rose-400/30 transition-all active:scale-95"
              >
                <LuDownload className="w-4 h-4" /> Save Double Strips
              </button>
            </div>
          </div>
        )}

        {/* Gallery Section */}
        {savedGallery.length > 0 && (
          <section className="pt-5 border-t border-rose-500/20 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-300/80 px-1">
              Saved Romance Strips
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {savedGallery.map((item) => (
                <div key={item.id} className="relative bg-rose-950/20 backdrop-blur-2xl p-2 rounded-2xl border border-rose-500/20 shadow-lg">
                  <img src={item.image} alt="Saved Memory" className="w-full h-auto rounded-xl" />
                  <button
                    onClick={() => deleteMemory(item.id)}
                    className="absolute top-3 right-3 p-1.5 bg-slate-950/80 text-rose-400 rounded-full hover:bg-rose-600 hover:text-white transition-all border border-rose-500/20"
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