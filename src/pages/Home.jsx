import React, { useState, useRef, useEffect } from 'react';
import { LuCamera, LuDownload, LuRefreshCw, LuSparkles, LuImage, LuTrash2, LuAperture } from 'react-icons/lu';

// 8 Theme Presets (Dark Blue, Pink, Romance, Cute, Brown, White)
const THEMES = [
  // Dark Blue & Cyber Themes
  { id: 'cyber-cyan', name: 'Cyber Cyan', bg: '#0F172A', text: '#E2E8F0', border: '#0891B2', photoBg: '#1E293B' },
  { id: 'midnight', name: 'Midnight Glass', bg: '#0B132B', text: '#F8FAFC', border: '#1E293B', photoBg: '#1C2541' },
  { id: 'deep-ocean', name: 'Deep Ocean', bg: '#03071E', text: '#F1F5F9', border: '#1D4ED8', photoBg: '#0F172A' },
  
  // Pink & Romance Themes
  { id: 'romance-rose', name: 'Romance Rose', bg: '#4A0E17', text: '#FCE7F3', border: '#FB7185', photoBg: '#2D0A10' },
  { id: 'soft-pink', name: 'Soft Pink', bg: '#FDF2F8', text: '#831843', border: '#F472B6', photoBg: '#FBCFE8' },
  
  // Cute & Brown Themes
  { id: 'cute-brown', name: 'Cozy Brown', bg: '#2C1A14', text: '#FDE68A', border: '#D97706', photoBg: '#452719' },
  { id: 'milk-tea', name: 'Milk Tea', bg: '#F5EBE0', text: '#5C3D2E', border: '#D5B9B2', photoBg: '#E3D5CA' },

  // Clean White Theme
  { id: 'pure-white', name: 'Pure White', bg: '#FFFFFF', text: '#0F172A', border: '#CBD5E1', photoBg: '#F1F5F9' },
];

const Home = () => {
  const [photos, setPhotos] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [caption, setCaption] = useState('STUDIO MEMORIES');
  const [stream, setStream] = useState(null);
  const [savedGallery, setSavedGallery] = useState([]);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const localData = localStorage.getItem('photobooth_memories');
    if (localData) {
      setSavedGallery(JSON.parse(localData));
    }
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 960 } },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
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
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/png');
  };

  const startPhotoboothSequence = async () => {
    if (isCapturing) return;
    setIsCapturing(true);
    setPhotos([]);

    const capturedPhotos = [];

    for (let i = 0; i < 4; i++) {
      for (let c = 3; c > 0; c--) {
        setCountdown(c);
        await new Promise((r) => setTimeout(r, 800));
      }
      setCountdown('SNAP!');
      await new Promise((r) => setTimeout(r, 200));

      const photoData = captureFrame();
      if (photoData) {
        capturedPhotos.push(photoData);
        setPhotos([...capturedPhotos]);
      }
      setCountdown(null);
      await new Promise((r) => setTimeout(r, 1000));
    }

    setIsCapturing(false);
  };

  const generateCanvasAndSave = () => {
    if (photos.length < 4) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const cardWidth = 600;
    const photoWidth = 520;
    const photoHeight = 390;
    const padding = 40;
    const gap = 20;
    const headerHeight = 40;
    const footerHeight = 120;

    const totalHeight = padding * 2 + headerHeight + 4 * photoHeight + 3 * gap + footerHeight;

    canvas.width = cardWidth;
    canvas.height = totalHeight;

    ctx.fillStyle = selectedTheme.bg;
    ctx.fillRect(0, 0, cardWidth, totalHeight);

    ctx.strokeStyle = selectedTheme.border;
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, cardWidth - 20, totalHeight - 20);

    ctx.fillStyle = selectedTheme.text;
    ctx.font = '600 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('• PHOTO BOOTH •', cardWidth / 2, padding + 20);

    let loadedCount = 0;
    photos.forEach((photoSrc, index) => {
      const img = new Image();
      img.src = photoSrc;
      img.onload = () => {
        const yPos = padding + headerHeight + index * (photoHeight + gap);

        ctx.fillStyle = selectedTheme.photoBg;
        ctx.fillRect((cardWidth - photoWidth) / 2 - 5, yPos - 5, photoWidth + 10, photoHeight + 10);
        ctx.drawImage(img, (cardWidth - photoWidth) / 2, yPos, photoWidth, photoHeight);

        loadedCount++;
        if (loadedCount === 4) {
          ctx.fillStyle = selectedTheme.text;
          ctx.font = '500 26px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(caption, cardWidth / 2, totalHeight - footerHeight / 2);

          const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          ctx.font = '400 15px sans-serif';
          ctx.globalAlpha = 0.6;
          ctx.fillText(today, cardWidth / 2, totalHeight - footerHeight / 2 + 35);
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
    <div className="min-h-screen bg-[#070A13] text-[#F8FAFC] font-sans pb-24 px-4 pt-6 relative selection:bg-[#38BDF8]/30 overflow-x-hidden">
      {/* Dynamic Background Light Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#0284C7]/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-[#3B82F6]/15 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-md mx-auto space-y-6">
        <header className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-5 rounded-3xl shadow-2xl flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#38BDF8] flex items-center gap-1">
              <LuSparkles className="w-3.5 h-3.5" /> Digital Studio
            </span>
            <h1 className="text-xl font-extrabold tracking-tight text-white mt-0.5">Dark Photobooth</h1>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-[#38BDF8] shadow-inner">
            <LuAperture className="w-5 h-5" />
          </div>
        </header>

        {/* Camera Display Box */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-950 shadow-2xl border border-slate-700/60 aspect-3/4 flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />

          {countdown && (
            <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-md flex items-center justify-center z-20">
              <span className="text-[#38BDF8] text-7xl font-black tracking-widest animate-ping drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]">
                {countdown}
              </span>
            </div>
          )}

          <div className="absolute bottom-5 left-0 right-0 flex justify-center z-10">
            <button
              disabled={isCapturing}
              onClick={startPhotoboothSequence}
              className={`px-7 py-3.5 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg backdrop-blur-md border transition-all ${
                isCapturing
                  ? 'bg-slate-800/80 border-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-sky-500/90 hover:bg-sky-400 border-sky-400/50 text-white shadow-sky-500/20 active:scale-95'
              }`}
            >
              <LuCamera className="w-4 h-4" />
              {isCapturing ? 'Capturing Shots...' : 'Take 4 Shots'}
            </button>
          </div>
        </div>

        {/* Customization Section */}
        {photos.length === 4 && (
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 px-1">
              <LuImage className="w-4 h-4 text-[#38BDF8]" /> Customize Theme & Title
            </h3>

            {/* Scrollable Themes Selection */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-2 shrink-0 backdrop-blur-md ${
                    selectedTheme.id === theme.id
                      ? 'border-[#38BDF8] bg-slate-800/90 text-white shadow-md'
                      : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:bg-slate-800/50'
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

            {/* Input Caption */}
            <div className="bg-slate-900/60 backdrop-blur-xl p-3.5 rounded-2xl border border-slate-800 shadow-sm">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                Caption Title
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Enter title..."
                className="w-full text-xs bg-slate-950/80 text-slate-200 rounded-xl px-3.5 py-2.5 border border-slate-700/60 focus:outline-none focus:border-[#38BDF8] transition-colors"
              />
            </div>

            {/* Photo Strip Output Preview */}
            <div
              className="p-5 rounded-3xl border shadow-2xl transition-all duration-300 space-y-3"
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
                    className="p-1.5 rounded-xl shadow-inner overflow-hidden transition-colors duration-300"
                    style={{ backgroundColor: selectedTheme.photoBg }}
                  >
                    <img src={src} alt={`Snap ${i + 1}`} className="w-full h-44 object-cover rounded-lg" />
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
            <div className="flex gap-2 pt-1">
              <button
                onClick={startPhotoboothSequence}
                className="flex-1 py-3.5 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-700/60 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-800 transition-all active:scale-95"
              >
                <LuRefreshCw className="w-4 h-4" /> Retake
              </button>
              <button
                onClick={generateCanvasAndSave}
                className="flex-2 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-sky-600/20 transition-all active:scale-95"
              >
                <LuDownload className="w-4 h-4" /> Save Gallery
              </button>
            </div>
          </div>
        )}

        {/* Saved Gallery Section */}
        {savedGallery.length > 0 && (
          <section className="pt-6 border-t border-slate-800/80 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Recent Saved Strips
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {savedGallery.map((item) => (
                <div key={item.id} className="relative bg-slate-900/60 backdrop-blur-md p-2 rounded-2xl border border-slate-800 shadow-md">
                  <img src={item.image} alt="Saved Strip" className="w-full h-auto rounded-xl" />
                  <button
                    onClick={() => deleteMemory(item.id)}
                    className="absolute top-3 right-3 p-1.5 bg-slate-950/80 text-rose-400 rounded-full hover:bg-rose-500 hover:text-white transition-all border border-slate-800"
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