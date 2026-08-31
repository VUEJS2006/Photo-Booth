import React, { useState, useRef, useEffect } from 'react';
import {
  LuCamera,
  LuDownload,
  LuRefreshCw,
  LuHeart,
  LuSlidersHorizontal,
  LuTimer,
  LuSparkles,
  LuUser,
  LuLayoutGrid,
  LuSmile
} from 'react-icons/lu';

// 6 Exact Match Photo Booth Frame Templates based on User Screenshot
const FRAME_TEMPLATES = [
  {
    id: 'cute-kawaii-pastel',
    name: 'Kawaii Bear & Fish',
    bg: '#E2F7E1',
    stripBg: '#F3FCF3',
    photoBg: '#FFFFFF',
    text: '#2D5A27',
    border: '#A8E6CF',
    style: 'kawaii',
    description: 'Pastel Green/Yellow Cute Characters (Top Left in Screenshot)'
  },
  {
    id: 'minimalist-aesthetic',
    name: 'Minimalist Clean White',
    bg: '#F8F9FA',
    stripBg: '#FFFFFF',
    photoBg: '#1A1A1A',
    text: '#111827',
    border: '#E5E7EB',
    style: 'minimal',
    description: 'Clean Elegant Aesthetic Strip with Modern Serif Font'
  },
  {
    id: 'pink-heart-romance',
    name: 'Pink Heart Romance',
    bg: '#FFE5EC',
    stripBg: '#FFF0F5',
    photoBg: '#FFFFFF',
    text: '#D90429',
    border: '#FFB3C1',
    style: 'pink-hearts',
    description: 'Sweet Pink Love Hearts & Bow Ribbon'
  },
  {
    id: 'classic-film-black',
    name: 'Classic Black Strip',
    bg: '#121212',
    stripBg: '#1A1A1A',
    photoBg: '#000000',
    text: '#FFFFFF',
    border: '#333333',
    style: 'film-black',
    description: 'Pure Black Aesthetic Photo Booth Frame'
  },
  {
    id: 'anniversary-purple',
    name: 'Deep Purple Romance',
    bg: '#1E1B4B',
    stripBg: '#2E2A62',
    photoBg: '#0F0D23',
    text: '#E0E7FF',
    border: '#6366F1',
    style: 'purple-gold',
    description: 'Elegant Dark Purple Anniversary Style'
  },
  {
    id: 'sky-blue-aesthetic',
    name: 'Sky Blue Cloud',
    bg: '#E0F2FE',
    stripBg: '#F0F9FF',
    photoBg: '#FFFFFF',
    text: '#0369A1',
    border: '#BAE6FD',
    style: 'sky-blue',
    description: 'Soft Sky Blue & Pastel Aesthetic'
  }
];

// Aesthetic Beauty Filters
const IMAGE_FILTERS = [
  { 
    id: 'porcelain-glow', 
    name: 'Porcelain Glow', 
    css: 'brightness(115%) contrast(96%) saturate(105%)', 
    canvasFilter: 'brightness(115%) contrast(96%) saturate(105%)' 
  },
  { 
    id: 'bright-soft', 
    name: 'Bright & Soft', 
    css: 'brightness(122%) contrast(92%) saturate(110%)', 
    canvasFilter: 'brightness(122%) contrast(92%) saturate(110%)' 
  },
  { 
    id: 'warm-pink-touch', 
    name: 'Rosy Warmth', 
    css: 'brightness(110%) contrast(98%) saturate(120%) sepia(8%)', 
    canvasFilter: 'brightness(110%) contrast(98%) saturate(120%) sepia(8%)' 
  },
  { 
    id: 'retro-monochrome', 
    name: 'B&W Film', 
    css: 'grayscale(100%) contrast(110%) brightness(105%)', 
    canvasFilter: 'grayscale(100%) contrast(110%) brightness(105%)' 
  }
];

const TIMER_OPTIONS = [3, 5, 10];

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
    const localData = localStorage.getItem('aesthetic_booth_gallery');
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

  // Drawing Clean Frame Decorations on Canvas
  const drawFrameDecorations = (ctx, x, y, width, height, style, color) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    if (style === 'kawaii') {
      // Small Cute Stars/Polka Dots Corner Accents
      ctx.fillStyle = '#FFD166';
      ctx.beginPath();
      ctx.arc(x + 20, y + 25, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + width - 20, y + 25, 8, 0, Math.PI * 2);
      ctx.fill();
    } else if (style === 'pink-hearts') {
      // Heart Outline Accents
      ctx.fillStyle = '#FF4D6D';
      ctx.beginPath();
      ctx.arc(x + 25, y + 25, 6, 0, Math.PI * 2);
      ctx.arc(x + width - 25, y + 25, 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (style === 'purple-gold') {
      ctx.strokeRect(x + 8, y + 8, width - 16, height - 16);
    }
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
    const headerHeight = 60;
    const footerHeight = 110;

    const totalHeight = outerMargin * 2 + headerHeight + 4 * photoHeight + 3 * photoGap + footerHeight;

    canvas.width = totalWidth;
    canvas.height = totalHeight;

    // Fill Outer Canvas Background
    ctx.fillStyle = selectedFrame.bg;
    ctx.fillRect(0, 0, totalWidth, totalHeight);

    // Draw Left and Right Photo Strips
    const col1X = outerMargin;
    const col1Y = outerMargin;
    const col2X = outerMargin + colWidth + gapBetweenCols;
    const stripHeight = totalHeight - outerMargin * 2;

    // Column 1 Background Strip
    ctx.fillStyle = selectedFrame.stripBg;
    ctx.fillRect(col1X, col1Y, colWidth, stripHeight);
    ctx.strokeStyle = selectedFrame.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(col1X, col1Y, colWidth, stripHeight);

    // Column 2 Background Strip
    ctx.fillRect(col2X, col1Y, colWidth, stripHeight);
    ctx.strokeRect(col2X, col1Y, colWidth, stripHeight);

    // Decorate Strips
    drawFrameDecorations(ctx, col1X, col1Y, colWidth, stripHeight, selectedFrame.style, selectedFrame.border);
    drawFrameDecorations(ctx, col2X, col2Y, colWidth, stripHeight, selectedFrame.style, selectedFrame.border);

    // Header Title Text
    ctx.fillStyle = selectedFrame.text;
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';

    const col1CenterX = col1X + colWidth / 2;
    const col2CenterX = col2X + colWidth / 2;

    const headerText = 'PHOTO BOOTH';

    ctx.fillText(headerText, col1CenterX, col1Y + 40);
    ctx.fillText(headerText, col2CenterX, col2Y + 40);

    let loadedCount = 0;
    photos.forEach((photoSrc, index) => {
      const img = new Image();
      img.src = photoSrc;
      img.onload = () => {
        const yPos = col1Y + headerHeight + index * (photoHeight + photoGap);

        // Column 1 Photo Draw
        const col1PhotoX = col1X + (colWidth - photoWidth) / 2;
        ctx.fillStyle = selectedFrame.photoBg;
        ctx.fillRect(col1PhotoX - 4, yPos - 4, photoWidth + 8, photoHeight + 8);

        ctx.save();
        ctx.filter = selectedFilter.canvasFilter;
        ctx.drawImage(img, col1PhotoX, yPos, photoWidth, photoHeight);
        ctx.restore();

        // Column 2 Photo Draw
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
          ctx.globalAlpha = 0.75;
          ctx.fillText(today, col1CenterX, totalHeight - outerMargin - footerHeight / 2 + 22);

          ctx.font = 'bold 22px serif';
          ctx.globalAlpha = 1.0;
          ctx.fillText(coupleNames, col2CenterX, totalHeight - outerMargin - footerHeight / 2);
          ctx.font = '500 12px sans-serif';
          ctx.globalAlpha = 0.75;
          ctx.fillText(today, col2CenterX, totalHeight - outerMargin - footerHeight / 2 + 22);

          const dataUrl = canvas.toDataURL('image/png');

          const link = document.createElement('a');
          link.download = `photo-booth-${Date.now()}.png`;
          link.href = dataUrl;
          link.click();

          const updatedGallery = [{ id: Date.now(), image: dataUrl, date: today, coupleNames }, ...savedGallery];
          setSavedGallery(updatedGallery);
          localStorage.setItem('aesthetic_booth_gallery', JSON.stringify(updatedGallery));
        }
      };
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 px-4 pt-6 relative">
      <div className="max-w-md mx-auto space-y-5">
        {/* Header */}
        <header className="bg-slate-900/90 border border-slate-800 p-4 rounded-3xl shadow-lg flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-pink-400 flex items-center gap-1">
              <LuSparkles className="w-3.5 h-3.5" /> Aesthetic Photobooth
            </span>
            <h1 className="text-lg font-black tracking-tight text-white mt-0.5">Photo Strip Studio</h1>
          </div>
          <div className="w-9 h-9 rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
            <LuSmile className="w-5 h-5" />
          </div>
        </header>

        {/* Timer Control Bar */}
        <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <LuTimer className="w-4 h-4 text-pink-400" /> Delay Timer:
          </span>
          <div className="flex gap-2">
            {TIMER_OPTIONS.map((sec) => (
              <button
                key={sec}
                disabled={isCapturing}
                onClick={() => setSelectedTimer(sec)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedTimer === sec
                    ? 'bg-pink-500 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>

        {/* Camera Viewfinder */}
        <div className="relative rounded-3xl overflow-hidden bg-black shadow-2xl border border-slate-800 aspect-[4/3] flex items-center justify-center">
          {cameraError ? (
            <div className="p-6 text-center space-y-3">
              <p className="text-rose-400 text-xs font-semibold">Camera Access Failed</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-slate-800 text-xs text-white rounded-xl"
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
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-20">
              <span className="text-pink-400 text-6xl font-black animate-ping">
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
                    ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-pink-500 hover:bg-pink-400 text-white border-pink-400 active:scale-95'
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
          <div className="space-y-5 pt-3 border-t border-slate-800">
            {/* Filter Selector */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <LuSlidersHorizontal className="w-4 h-4 text-pink-400" /> Photo Filters
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {IMAGE_FILTERS.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all shrink-0 ${
                      selectedFilter.id === filter.id
                        ? 'border-pink-500 bg-pink-500/20 text-pink-300'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {filter.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Frame Templates Selector (Matches User Screenshot) */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <LuLayoutGrid className="w-4 h-4 text-pink-400" /> Frame Templates (From Screenshot)
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                {FRAME_TEMPLATES.map((frame) => (
                  <button
                    key={frame.id}
                    onClick={() => setSelectedFrame(frame)}
                    className={`p-3 rounded-2xl text-left border transition-all ${
                      selectedFrame.id === frame.id
                        ? 'border-pink-500 bg-slate-900 ring-1 ring-pink-500'
                        : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/20"
                        style={{ backgroundColor: frame.stripBg }}
                      />
                      <span className="text-xs font-bold text-white">{frame.name}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">{frame.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Couple / User Name Input */}
            <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1 flex items-center gap-1">
                <LuUser className="w-3 h-3 text-pink-400" /> Frame Footer Text
              </label>
              <input
                type="text"
                value={coupleNames}
                onChange={(e) => setCoupleNames(e.target.value)}
                placeholder="e.g. CHLOE & LEO"
                className="w-full text-xs bg-slate-950 text-white rounded-xl px-3.5 py-2.5 border border-slate-800 focus:outline-none focus:border-pink-500"
              />
            </div>

            {/* Preview Card */}
            <div
              className="p-4 rounded-3xl border shadow-xl space-y-3"
              style={{
                backgroundColor: selectedFrame.bg,
                borderColor: selectedFrame.border,
                color: selectedFrame.text,
              }}
            >
              <div className="text-center text-[11px] font-bold uppercase tracking-widest opacity-80">
                PHOTO BOOTH
              </div>

              {/* 2 Strips Side by Side */}
              <div className="grid grid-cols-2 gap-3">
                {[1, 2].map((col) => (
                  <div
                    key={col}
                    className="space-y-2 p-2 rounded-2xl border"
                    style={{ backgroundColor: selectedFrame.stripBg, borderColor: selectedFrame.border }}
                  >
                    {photos.map((src, i) => (
                      <div
                        key={i}
                        className="p-1 rounded-lg overflow-hidden border aspect-[4/3]"
                        style={{ backgroundColor: selectedFrame.photoBg, borderColor: selectedFrame.border }}
                      >
                        <img
                          src={src}
                          alt={`Snap ${i + 1}`}
                          className="w-full h-full object-cover rounded"
                          style={{ filter: selectedFilter.css }}
                        />
                      </div>
                    ))}
                    <div className="text-center pt-1">
                      <p className="text-xs font-bold tracking-wide">{coupleNames}</p>
                      <p className="text-[9px] opacity-70">
                        {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5">
              <button
                onClick={startPhotoboothSequence}
                className="flex-1 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-800"
              >
                <LuRefreshCw className="w-4 h-4" /> Retake
              </button>
              <button
                onClick={generateCanvasAndSave}
                className="flex-2 py-3.5 rounded-2xl bg-pink-500 hover:bg-pink-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg border border-pink-400"
              >
                <LuDownload className="w-4 h-4" /> Save Photo Strip
              </button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default Home;