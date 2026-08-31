import React, { useState, useRef, useEffect } from 'react';
import {
  LuCamera,
  LuDownload,
  LuRefreshCw,
  LuSparkles,
  LuImage,
  LuTrash2,
  LuAperture,
  LuSlidersHorizontal,
  LuTimer,
  LuSticker,
  LuCheck
} from 'react-icons/lu';

// Premium Photobooth Strip Themes (Emoji Free)
const THEMES = [
  { id: 'cyber-dark', name: 'Cyber Neon', bg: '#0A0E1A', text: '#38BDF8', border: '#0284C7', photoBg: '#1E293B' },
  { id: 'koreans-cream', name: 'Korean Soft Cream', bg: '#FFFDF9', text: '#475569', border: '#E2E8F0', photoBg: '#F8FAFC' },
  { id: 'y2k-pink', name: 'Y2K Sweet Pink', bg: '#FDF2F8', text: '#DB2777', border: '#F472B6', photoBg: '#FCE7F3' },
  { id: 'midnight-luxe', name: 'Midnight Luxe', bg: '#0F172A', text: '#F8FAFC', border: '#334155', photoBg: '#1E293B' },
  { id: 'cozy-latte', name: 'Cozy Vintage Latte', bg: '#2B211B', text: '#FDE68A', border: '#B45309', photoBg: '#3D2E24' },
  { id: 'pure-contrast', name: 'Monochrome Modern', bg: '#000000', text: '#FFFFFF', border: '#333333', photoBg: '#111111' },
];

// Photo Booth Filters with Beauty Smooth Effect (Emoji Free)
const IMAGE_FILTERS = [
  { 
    id: 'beauty-smooth', 
    name: 'Beauty Smooth', 
    css: 'brightness(108%) contrast(98%) saturate(108%) sepia(5%)', 
    canvasFilter: 'brightness(108%) contrast(98%) saturate(108%) sepia(5%)' 
  },
  { 
    id: 'korean-glow', 
    name: 'Korean Bright Glow', 
    css: 'brightness(116%) contrast(94%) saturate(115%) hue-rotate(-5deg)', 
    canvasFilter: 'brightness(116%) contrast(94%) saturate(115%) hue-rotate(-5deg)' 
  },
  { 
    id: 'warm-peach', 
    name: 'Soft Peach Skin', 
    css: 'brightness(106%) contrast(102%) saturate(120%) sepia(15%) hue-rotate(-8deg)', 
    canvasFilter: 'brightness(106%) contrast(102%) saturate(120%) sepia(15%) hue-rotate(-8deg)' 
  },
  { 
    id: 'vintage-film', 
    name: 'Retro Film Booth', 
    css: 'sepia(35%) contrast(105%) brightness(102%) saturate(90%)', 
    canvasFilter: 'sepia(35%) contrast(105%) brightness(102%) saturate(90%)' 
  },
  { 
    id: 'cyber-blue', 
    name: 'Cyber Cool Blue', 
    css: 'brightness(105%) contrast(105%) hue-rotate(15deg) saturate(110%)', 
    canvasFilter: 'brightness(105%) contrast(105%) hue-rotate(15deg) saturate(110%)' 
  },
  { 
    id: 'soft-bw', 
    name: 'Classic B&W Studio', 
    css: 'grayscale(100%) brightness(106%) contrast(108%)', 
    canvasFilter: 'grayscale(100%) brightness(106%) contrast(108%)' 
  },
];

// Graphic Stickers Option (Emoji Free SVG Icons)
const STICKERS = [
  { id: 'none', name: 'None' },
  { id: 'sparkles', name: 'Sparkles', symbol: '✦' },
  { id: 'star-cross', name: 'Y2K Star', symbol: '✧' },
  { id: 'heart', name: 'Heart Stamp', symbol: '♥' },
  { id: 'crown', name: 'Crown Stamp', symbol: '♕' },
  { id: 'flower', name: 'Blossom', symbol: '✿' }
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
  const [caption, setCaption] = useState('STUDIO MEMORIES');
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
          aspectRatio: { ideal: 3 / 4 } // Mobile Standard 3:4 Aspect Ratio
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn('Fallback standard video resolution stream...', err);
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
    const targetWidth = 480;
    const targetHeight = 640; // 3:4 Aspect Ratio Portrait Output

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

    const cardWidth = 540;
    const photoWidth = 460;
    const photoHeight = 613; // Exact 3:4 aspect ratio frame inside strip
    const padding = 40;
    const gap = 24;
    const headerHeight = 60;
    const footerHeight = 150;

    const totalHeight = padding * 2 + headerHeight + 4 * photoHeight + 3 * gap + footerHeight;

    canvas.width = cardWidth;
    canvas.height = totalHeight;

    // Card Outer Background Fill
    ctx.fillStyle = selectedTheme.bg;
    ctx.fillRect(0, 0, cardWidth, totalHeight);

    // Stylish Outer Border Line
    ctx.strokeStyle = selectedTheme.border;
    ctx.lineWidth = 6;
    ctx.strokeRect(14, 14, cardWidth - 28, totalHeight - 28);

    // Card Header Title with Graphic Stamps
    ctx.fillStyle = selectedTheme.text;
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    const headerTitle = selectedSticker.symbol 
      ? `${selectedSticker.symbol} PHOTO BOOTH ${selectedSticker.symbol}` 
      : '• PHOTO BOOTH •';
    ctx.fillText(headerTitle, cardWidth / 2, padding + 30);

    let loadedCount = 0;
    photos.forEach((photoSrc, index) => {
      const img = new Image();
      img.src = photoSrc;
      img.onload = () => {
        const yPos = padding + headerHeight + index * (photoHeight + gap);

        // Photo Frame Container Inner Layer
        ctx.fillStyle = selectedTheme.photoBg;
        ctx.fillRect((cardWidth - photoWidth) / 2 - 8, yPos - 8, photoWidth + 16, photoHeight + 16);

        ctx.save();
        ctx.filter = selectedFilter.canvasFilter;
        ctx.drawImage(img, (cardWidth - photoWidth) / 2, yPos, photoWidth, photoHeight);
        ctx.restore();

        // Sticker Overlays on Top Left & Top Right of Each Frame
        if (selectedSticker.symbol) {
          ctx.fillStyle = selectedTheme.text;
          ctx.font = 'bold 24px sans-serif';
          ctx.fillText(selectedSticker.symbol, (cardWidth - photoWidth) / 2 + 20, yPos + 35);
          ctx.fillText(selectedSticker.symbol, (cardWidth + photoWidth) / 2 - 20, yPos + 35);
        }

        loadedCount++;
        if (loadedCount === 4) {
          ctx.fillStyle = selectedTheme.text;
          ctx.font = '700 26px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(caption, cardWidth / 2, totalHeight - footerHeight / 2 - 12);

          const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          ctx.font = '400 16px sans-serif';
          ctx.globalAlpha = 0.7;
          ctx.fillText(today, cardWidth / 2, totalHeight - footerHeight / 2 + 28);
          ctx.globalAlpha = 1.0;

          const dataUrl = canvas.toDataURL('image/png');

          const link = document.createElement('a');
          link.download = `photobooth-${Date.now()}.png`;
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
    <div className="min-h-screen bg-[#050C1A] text-slate-100 font-sans pb-28 px-4 pt-6 relative selection:bg-cyan-500/30 overflow-x-hidden">
      {/* Dark Ambient Glassmorphism Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-blue-600/15 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-md mx-auto space-y-6">
        {/* Header Glassmorphism */}
        <header className="bg-cyan-950/20 backdrop-blur-2xl border border-cyan-500/20 p-5 rounded-3xl shadow-xl flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-1">
              <LuSparkles className="w-3.5 h-3.5" /> Cyber Glass Studio
            </span>
            <h1 className="text-xl font-extrabold tracking-tight text-white mt-0.5">Vue Photo Booth</h1>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner backdrop-blur-xl">
            <LuAperture className="w-5 h-5" />
          </div>
        </header>

        {/* Timer Controls */}
        <div className="bg-cyan-950/20 backdrop-blur-2xl p-3.5 rounded-2xl border border-cyan-500/20 shadow-lg flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-300/80 flex items-center gap-1.5">
            <LuTimer className="w-4 h-4 text-cyan-400" /> Time Delay:
          </span>
          <div className="flex gap-1.5">
            {TIMER_OPTIONS.map((sec) => (
              <button
                key={sec}
                disabled={isCapturing}
                onClick={() => setSelectedTimer(sec)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedTimer === sec
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/40'
                    : 'bg-slate-900/40 text-slate-400 border border-cyan-500/10 hover:text-cyan-300 hover:border-cyan-500/30'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Camera Frame Container (3:4 Portrait Ratio) */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-950/90 shadow-2xl border border-cyan-500/20 aspect-[3/4] flex items-center justify-center backdrop-blur-sm">
          {cameraError ? (
            <div className="p-6 text-center space-y-3">
              <p className="text-rose-400 text-xs font-semibold">Camera Access Failed</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-slate-900/80 hover:bg-slate-800 text-xs text-white rounded-xl border border-cyan-500/30 backdrop-blur-md"
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

          {/* Sticker Overlay Preview inside Camera View */}
          {selectedSticker.symbol && !cameraError && (
            <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none text-white/80 text-xl font-bold drop-shadow">
              <span>{selectedSticker.symbol}</span>
              <span>{selectedSticker.symbol}</span>
            </div>
          )}

          {countdown && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-lg flex items-center justify-center z-20">
              <span className="text-cyan-400 text-6xl font-black tracking-widest animate-ping drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]">
                {countdown}
              </span>
            </div>
          )}

          {!cameraError && (
            <div className="absolute bottom-5 left-0 right-0 flex justify-center z-10">
              <button
                disabled={isCapturing}
                onClick={startPhotoboothSequence}
                className={`px-6 py-3.5 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-xl backdrop-blur-xl border transition-all ${
                  isCapturing
                    ? 'bg-slate-900/80 border-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 border-cyan-300/40 text-white shadow-cyan-500/30 active:scale-95'
                }`}
              >
                <LuCamera className="w-4 h-4" />
                {isCapturing ? 'Capturing Shots...' : `Take 4 Shots (${selectedTimer}s)`}
              </button>
            </div>
          )}
        </div>

        {/* Customization Options */}
        {photos.length === 4 && (
          <div className="space-y-6 pt-4 border-t border-cyan-500/20">
            {/* Filter Effects with Beauty Tone (Emoji Free) */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300/80 flex items-center gap-1.5 px-1">
                <LuSlidersHorizontal className="w-4 h-4 text-cyan-400" /> Beauty Filters
              </h3>
              <div className="flex gap-2.5 overflow-x-auto pb-3 pt-1 px-1 scrollbar-thin scrollbar-thumb-cyan-900/50">
                {IMAGE_FILTERS.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-semibold border transition-all shrink-0 backdrop-blur-xl ${
                      selectedFilter.id === filter.id
                        ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300 shadow-lg shadow-cyan-500/20'
                        : 'border-cyan-500/10 bg-cyan-950/10 text-slate-400 hover:bg-cyan-950/30 hover:text-slate-200'
                    }`}
                  >
                    {filter.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Aesthetic Stickers Selection (Emoji Free) */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300/80 flex items-center gap-1.5 px-1">
                <LuSticker className="w-4 h-4 text-cyan-400" /> Frame Graphic Stickers
              </h3>
              <div className="flex gap-2.5 overflow-x-auto pb-3 pt-1 px-1 scrollbar-thin scrollbar-thumb-cyan-900/50">
                {STICKERS.map((stk) => (
                  <button
                    key={stk.id}
                    onClick={() => setSelectedSticker(stk)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-semibold border transition-all flex items-center gap-2 shrink-0 backdrop-blur-xl ${
                      selectedSticker.id === stk.id
                        ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300 shadow-lg shadow-cyan-500/20'
                        : 'border-cyan-500/10 bg-cyan-950/10 text-slate-400 hover:bg-cyan-950/30 hover:text-slate-200'
                    }`}
                  >
                    {stk.symbol && <span className="text-base font-bold">{stk.symbol}</span>}
                    {stk.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Card Themes (Emoji Free) */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300/80 flex items-center gap-1.5 px-1">
                <LuImage className="w-4 h-4 text-cyan-400" /> Card Themes
              </h3>
              <div className="flex gap-2.5 overflow-x-auto pb-3 pt-1 px-1 scrollbar-thin scrollbar-thumb-cyan-900/50">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-semibold border transition-all flex items-center gap-2 shrink-0 backdrop-blur-xl ${
                      selectedTheme.id === theme.id
                        ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300 shadow-lg shadow-cyan-500/20'
                        : 'border-cyan-500/10 bg-cyan-950/10 text-slate-400 hover:bg-cyan-950/30 hover:text-slate-200'
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

            {/* Caption Title */}
            <div className="bg-cyan-950/20 backdrop-blur-2xl p-3.5 rounded-2xl border border-cyan-500/20 shadow-lg">
              <label className="text-[10px] uppercase font-bold text-cyan-300/80 tracking-wider block mb-1.5">
                Caption Title
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Enter title..."
                className="w-full text-xs bg-slate-950/80 text-cyan-100 rounded-xl px-3.5 py-2.5 border border-cyan-500/20 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            {/* Photobooth Strip Preview Layer */}
            <div
              className="p-5 rounded-3xl border shadow-2xl transition-all duration-300 space-y-4"
              style={{
                backgroundColor: selectedTheme.bg,
                borderColor: selectedTheme.border,
                color: selectedTheme.text,
              }}
            >
              <div className="text-center text-[10px] uppercase font-bold tracking-widest opacity-70">
                {selectedSticker.symbol ? `${selectedSticker.symbol} PHOTO BOOTH ${selectedSticker.symbol}` : '• PHOTO BOOTH •'}
              </div>

              <div className="space-y-3.5">
                {photos.map((src, i) => (
                  <div
                    key={i}
                    className="p-1.5 rounded-2xl shadow-inner overflow-hidden relative aspect-[3/4]"
                    style={{ backgroundColor: selectedTheme.photoBg }}
                  >
                    <img
                      src={src}
                      alt={`Snap ${i + 1}`}
                      className="w-full h-full object-cover rounded-xl transition-all duration-300"
                      style={{ filter: selectedFilter.css }}
                    />
                    {selectedSticker.symbol && (
                      <div className="absolute top-3 left-3 right-3 flex justify-between pointer-events-none text-white/90 text-sm font-bold drop-shadow">
                        <span>{selectedSticker.symbol}</span>
                        <span>{selectedSticker.symbol}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="text-center pt-2 pb-1 space-y-1">
                <p className="text-sm font-bold tracking-wide">{caption}</p>
                <p className="text-[10px] opacity-60">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 pt-1">
              <button
                onClick={startPhotoboothSequence}
                className="flex-1 py-3.5 rounded-2xl bg-cyan-950/30 backdrop-blur-xl border border-cyan-500/20 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-cyan-950/50 hover:text-white transition-all active:scale-95"
              >
                <LuRefreshCw className="w-4 h-4" /> Retake
              </button>
              <button
                onClick={generateCanvasAndSave}
                className="flex-2 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xl shadow-cyan-500/25 border border-cyan-400/30 transition-all active:scale-95"
              >
                <LuDownload className="w-4 h-4" /> Save Gallery
              </button>
            </div>
          </div>
        )}

        {/* Gallery Section */}
        {savedGallery.length > 0 && (
          <section className="pt-6 border-t border-cyan-500/20 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300/80 px-1">
              Recent Saved Strips
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {savedGallery.map((item) => (
                <div key={item.id} className="relative bg-cyan-950/20 backdrop-blur-2xl p-2 rounded-2xl border border-cyan-500/20 shadow-lg">
                  <img src={item.image} alt="Saved Strip" className="w-full h-auto rounded-xl" />
                  <button
                    onClick={() => deleteMemory(item.id)}
                    className="absolute top-3 right-3 p-1.5 bg-slate-950/80 text-rose-400 rounded-full hover:bg-rose-500 hover:text-white transition-all border border-cyan-500/20"
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