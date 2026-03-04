import { useState, useRef, useEffect } from 'react';
import { X, RotateCw, Check, ZoomIn, ZoomOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  aspect: '1:1' | '16:9';
  onCropComplete: (croppedDataUrl: string) => void;
}

const ASPECT_RATIOS = { '1:1': 1, '16:9': 16 / 9 };

export function CropModal({ isOpen, onClose, imageSrc, aspect, onCropComplete }: CropModalProps) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const imgRef       = useRef<HTMLImageElement | null>(null);

  const [zoom, setZoom]           = useState(1);
  const [rotation, setRotation]   = useState(0);
  const [offset, setOffset]       = useState({ x: 0, y: 0 });
  const [dragging, setDragging]   = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgLoaded, setImgLoaded] = useState(false);

  // Reset on open
  useEffect(() => {
    if (isOpen) { setZoom(1); setRotation(0); setOffset({ x: 0, y: 0 }); setImgLoaded(false); }
  }, [isOpen, imageSrc]);

  // Load image
  useEffect(() => {
    if (!isOpen || !imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { imgRef.current = img; setImgLoaded(true); };
    img.src = imageSrc;
  }, [isOpen, imageSrc]);

  // Draw on canvas
  useEffect(() => {
    if (!imgLoaded || !canvasRef.current || !imgRef.current) return;
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d')!;
    const ratio  = ASPECT_RATIOS[aspect];
    const W      = canvas.width;
    const H      = canvas.height;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(W / 2 + offset.x, H / 2 + offset.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    const iw = imgRef.current.naturalWidth;
    const ih = imgRef.current.naturalHeight;
    ctx.drawImage(imgRef.current, -iw / 2, -ih / 2, iw, ih);
    ctx.restore();

    // Crop frame
    const cropW = Math.min(W * 0.85, H * 0.85 * ratio);
    const cropH = cropW / ratio;
    const cropX = (W - cropW) / 2;
    const cropY = (H - cropH) / 2;

    // Dim outside
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, W, cropY);
    ctx.fillRect(0, cropY + cropH, W, H - cropY - cropH);
    ctx.fillRect(0, cropY, cropX, cropH);
    ctx.fillRect(cropX + cropW, cropY, W - cropX - cropW, cropH);

    // Border
    ctx.strokeStyle = 'white'; ctx.lineWidth = 2;
    ctx.strokeRect(cropX, cropY, cropW, cropH);

    // Rule of thirds
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1;
    for (let i = 1; i <= 2; i++) {
      ctx.beginPath(); ctx.moveTo(cropX + (cropW * i) / 3, cropY); ctx.lineTo(cropX + (cropW * i) / 3, cropY + cropH); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cropX, cropY + (cropH * i) / 3); ctx.lineTo(cropX + cropW, cropY + (cropH * i) / 3); ctx.stroke();
    }

    // Corner handles
    const hs = 16;
    ctx.strokeStyle = 'white'; ctx.lineWidth = 3;
    const corners = [[cropX, cropY], [cropX + cropW, cropY], [cropX, cropY + cropH], [cropX + cropW, cropY + cropH]];
    const signs   = [[ 1, 1], [-1, 1], [ 1,-1], [-1,-1]];
    corners.forEach(([cx, cy], i) => {
      const [sx, sy] = signs[i];
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + sx * hs, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy + sy * hs); ctx.stroke();
    });
  }, [imgLoaded, zoom, rotation, offset, aspect]);

  const onMouseDown = (e: React.MouseEvent) => { setDragging(true); setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y }); };
  const onMouseMove = (e: React.MouseEvent) => { if (!dragging) return; setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); };
  const onMouseUp   = () => setDragging(false);
  const onTouchStart = (e: React.TouchEvent) => { const t = e.touches[0]; setDragging(true); setDragStart({ x: t.clientX - offset.x, y: t.clientY - offset.y }); };
  const onTouchMove  = (e: React.TouchEvent) => { if (!dragging) return; const t = e.touches[0]; setOffset({ x: t.clientX - dragStart.x, y: t.clientY - dragStart.y }); };
  const onWheel = (e: React.WheelEvent) => { e.preventDefault(); setZoom(z => Math.max(0.5, Math.min(4, z - e.deltaY * 0.001))); };

  const handleCrop = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ratio  = ASPECT_RATIOS[aspect];
    const W = canvas.width; const H = canvas.height;
    const cropW = Math.min(W * 0.85, H * 0.85 * ratio);
    const cropH = cropW / ratio;
    const cropX = (W - cropW) / 2;
    const cropY = (H - cropH) / 2;
    const out = document.createElement('canvas');
    out.width  = Math.round(cropW);
    out.height = Math.round(cropH);
    out.getContext('2d')!.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, out.width, out.height);
    onCropComplete(out.toDataURL('image/jpeg', 0.92));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
        >
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Recadrer la photo</h3>
              <p className="text-xs text-gray-400 mt-0.5">Glissez pour repositionner · Molette pour zoomer</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"><X size={20} /></button>
          </div>

          <div className="bg-[#111] relative">
            <canvas
              ref={canvasRef}
              width={640} height={aspect === '16:9' ? 360 : 480}
              className="w-full cursor-grab active:cursor-grabbing touch-none"
              onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
              onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onMouseUp}
              onWheel={onWheel}
            />
            {!imgLoaded && <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm">Chargement…</div>}
          </div>

          <div className="px-6 py-4 border-t border-gray-100 space-y-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"><ZoomOut size={16} /></button>
              <input type="range" min={50} max={400} step={5} value={Math.round(zoom * 100)} onChange={e => setZoom(Number(e.target.value) / 100)} className="flex-1 accent-purple-600" />
              <button onClick={() => setZoom(z => Math.min(4, z + 0.1))} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"><ZoomIn size={16} /></button>
              <span className="text-xs text-gray-400 w-10 text-right">{Math.round(zoom * 100)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={() => setRotation(r => r - 90)} className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-colors"><RotateCw size={15} className="scale-x-[-1]" /> -90°</button>
                <button onClick={() => setRotation(r => r + 90)} className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-colors"><RotateCw size={15} /> +90°</button>
                <button onClick={() => { setZoom(1); setRotation(0); setOffset({ x: 0, y: 0 }); }} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-medium text-gray-500 transition-colors">Reset</button>
              </div>
              <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
                {aspect === '1:1' ? '1:1 — Photo profil' : '16:9 — Couverture'}
              </span>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={onClose} className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors">Annuler</button>
              <button onClick={handleCrop} disabled={!imgLoaded} className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20 flex items-center justify-center gap-2 disabled:opacity-40">
                <Check size={18} /> Valider le recadrage
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
