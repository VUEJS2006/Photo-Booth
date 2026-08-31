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
  LuTimer
} from 'react-icons/lu';

// Photobooth Strip Themes (Emoji free)
const THEMES = [
  { id: 'soft-pink', name: 'Soft Pink', bg: '#FDF2F8', text: '#831843', border: '#F472B6', photoBg: '#FBCFE8' },
  { id: 'romance-rose', name: 'Romance Rose', bg: '#4A0E17', text: '#FCE7F3', border: '#FB7185', photoBg: '#2D0A10' },
  { id: 'cute-brown', name: 'Cozy Teddy', bg: '#2C1A14', text: '#FDE68A', border: '#D97706', photoBg: '#452719' },
  { id: 'milk-tea', name: 'Milk Tea', bg: '#F5EBE0', text: '#5C3D2E', border: '#D5B9B2', photoBg: '#E3D5CA' },
  { id: 'cyber-cyan', name: 'Cyber Cyan', bg: '#0F172A', text: '#E2E8F0', border: '#0891B2', photoBg: '#1E293B' },
  { id: 'midnight', name: 'Midnight Glass', bg: '#0B132B', text: '#F8FAFC', border: '#1E293B', photoBg: '#1C2541' },
  { id: 'deep-ocean', name: 'Deep Ocean', bg: '#03071E', text: '#F1F5F9', border: '#1D4ED8', photoBg: '#0F172A' },
  { id: 'pure-white', name: 'Pure White', bg: '#FFFFFF', text: '#0F172A', border: '#CBD5E1', photoBg: '#F1F5F9' },
];

// Photo Filters Presets (Emoji free)
const IMAGE_FILTERS = [
  { id: 'none', name: 'Normal', css: 'none', canvasFilter: 'none' },
  { id: 'kawaii', name: 'Soft Kawaii', css: 'brightness(112%) contrast(95%) saturate(135%) hue-rotate(-5deg)', canvasFilter: 'brightness(112%) contrast(95%) saturate(135%) hue-rotate(-5deg)' },
  { id: 'pastel', name: 'Pastel Dream', css: 'brightness(118%) contrast(90%) saturate(110%) sepia(15%)', canvasFilter: 'brightness(118%) contrast(90%) saturate(110%) sepia(15%)' },
  { id: 'peach', name: 'Warm Peach', css: 'brightness(108%) contrast(100%) saturate(130%) sepia(20%) hue-rotate(-10deg)', canvasFilter: 'brightness(108%) contrast(100%) saturate(130%) sepia(20%) hue-rotate(-10deg)' },
  { id: 'glow', name: 'Angel Glow', css: 'brightness(120%) contrast(105%) saturate(125%)', canvasFilter: 'brightness(120%) contrast(105%) saturate(125%)' },
  { id: 'vintage', name: 'Retro Film', css: 'sepia(45%) contrast(92%) brightness(105%)', canvasFilter: 'sepia(45%) contrast(92%) brightness(105%)' },
  { id: 'bw', name: 'Soft B&W', css: 'grayscale(100%) brightness(105%) contrast(110%)', canvasFilter: 'grayscale(100%) brightness(105%) contrast(110%)' },
];

const TIMER_OPTIONS = [5, 10, 20, 30];

const Home = () => {
  const [photos, setPhotos] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [selectedFilter, setSelectedFilter] = useState(IMAGE_FILTERS[0]);
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
          aspectRatio: { ideal: 4 / 3 } // Normal 4:3 aspect ratio
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn('Preferred camera settings failed, trying fallback standard video...', err);
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
        console.error('Camera access completely failed:', fallbackErr);
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
    const vWidth = video.videoWidth || 640;
    const vHeight = video.videoHeight || 480;

    // Normal 4:3 Aspect Ratio Output (640x480)
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');

    const targetRatio = 4 / 3;
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

    const cardWidth = 600;
    const photoWidth = 520;
    const photoHeight = 390; // 4:3 aspect ratio
    const padding = 40;
    const gap = 20;
    const headerHeight = 50;
    const footerHeight = 140;

    const totalHeight = padding * 2 + headerHeight + 4 * photoHeight + 3 * gap + footerHeight;

    canvas.width = cardWidth;
    canvas.height = totalHeight;

    ctx.fillStyle = selectedTheme.bg;
    ctx.fillRect(0, 0, cardWidth, totalHeight);

    ctx.strokeStyle = selectedTheme.border;
    ctx.lineWidth = 6;
    ctx.strokeRect(12, 12, cardWidth - 24, totalHeight - 24);

    ctx.fillStyle = selectedTheme.text;
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('• PHOTO BOOTH •', cardWidth / 2, padding + 25);

    let loadedCount = 0;
    photos.forEach((photoSrc, index) => {
      const img = new Image();
      img.src = photoSrc;
      img.onload = () => {
        const yPos = padding + headerHeight + index * (photoHeight + gap);

        ctx.fillStyle = selectedTheme.photoBg;
        ctx.fillRect((cardWidth - photoWidth) / 2 - 8, yPos - 8, photoWidth + 16, photoHeight + 16);

        ctx.save();
        ctx.filter = selectedFilter.canvasFilter;
        ctx.drawImage(img, (cardWidth - photoWidth) / 2, yPos, photoWidth, photoHeight);
        ctx.restore();

        loadedCount++;
        if (loadedCount === 4) {
          ctx.fillStyle = selectedTheme.text;
          ctx.font = '600 28px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(caption, cardWidth / 2, totalHeight - footerHeight / 2 - 10);

          const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          ctx.font = '400 16px sans-serif';
          ctx.globalAlpha = 0.65;
          ctx.fillText(today, cardWidth / 2, totalHeight - footerHeight / 2 + 30);
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
      {/* Dark Cyan Glassmorphism Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-blue-600/15 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-md mx-auto space-y-6">
        {/* Header Glassmorphism */}
        <header className="bg-cyan-950/20 backdrop-blur-2xl border border-cyan-500/20 p-5 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex justify-between items-center">
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

        {/* Timer Control Box */}
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

        {/* Normal Sized Camera Container (4:3 aspect ratio) */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-950/90 shadow-2xl border border-cyan-500/20 aspect-[4/3] flex items-center justify-center backdrop-blur-sm">
          {cameraError ? (
            <div className="p-6 text-center space-y-3">
              <p className="text-rose-400 text-xs font-semibold">Camera Not Found!</p>
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
              className="w-full h-full object-cover scale-x-[-1]"
            />
          )}

          {countdown && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-lg flex items-center justify-center z-20">
              <span className="text-cyan-400 text-5xl font-black tracking-widest animate-ping drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]">
                {countdown}
              </span>
            </div>
          )}

          {!cameraError && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center z-10">
              <button
                disabled={isCapturing}
                onClick={startPhotoboothSequence}
                className={`px-6 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-xl backdrop-blur-xl border transition-all ${
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
            {/* Filter Effects (Without Emojis) */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300/80 flex items-center gap-1.5 px-1">
                <LuSlidersHorizontal className="w-4 h-4 text-cyan-400" /> Filter Effects
              </h3>
              <div className="flex gap-2.5 overflow-x-auto pb-4 pt-1 px-1 scrollbar-thin scrollbar-thumb-cyan-900/50">
                {IMAGE_FILTERS.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-semibold border transition-all shrink-0 backdrop-blur-xl ${
                      selectedFilter.id === filter.id
                        ? 'border-cyan-400 bg-cyan-950/50 text-cyan-300 shadow-lg shadow-cyan-500/20'
                        : 'border-cyan-500/10 bg-cyan-950/10 text-slate-400 hover:bg-cyan-950/30 hover:text-slate-200'
                    }`}
                  >
                    {filter.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Card Themes (Without Emojis) */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300/80 flex items-center gap-1.5 px-1">
                <LuImage className="w-4 h-4 text-cyan-400" /> Card Themes
              </h3>
              <div className="flex gap-2.5 overflow-x-auto pb-4 pt-1 px-1 scrollbar-thin scrollbar-thumb-cyan-900/50">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-semibold border transition-all flex items-center gap-2 shrink-0 backdrop-blur-xl ${
                      selectedTheme.id === theme.id
                        ? 'border-cyan-400 bg-cyan-950/50 text-cyan-300 shadow-lg shadow-cyan-500/20'
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

            {/* Caption Input */}
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

            {/* Photobooth Strip Preview */}
            <div
              className="p-5 rounded-3xl border shadow-2xl transition-all duration-300 space-y-4"
              style={{
                backgroundColor: selectedTheme.bg,
                borderColor: selectedTheme.border,
                color: selectedTheme.text,
              }}
            >
              <div className="text-center text-[10px] uppercase font-bold tracking-widest opacity-60">
                • PHOTO BOOTH •
              </div>

              <div className="space-y-3">
                {photos.map((src, i) => (
                  <div
                    key={i}
                    className="p-1.5 rounded-2xl shadow-inner overflow-hidden transition-colors duration-300 aspect-[4/3]"
                    style={{ backgroundColor: selectedTheme.photoBg }}
                  >
                    <img
                      src={src}
                      alt={`Snap ${i + 1}`}
                      className="w-full h-full object-cover rounded-xl transition-all duration-300"
                      style={{ filter: selectedFilter.css }}
                    />
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

        {/* Recent Saved Gallery */}
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