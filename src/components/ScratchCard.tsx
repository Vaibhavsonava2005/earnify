'use client';
import { useRef, useEffect, useState } from 'react';

interface ScratchCardProps {
    width?: number;
    height?: number;
    onComplete: () => void;
    children: React.ReactNode;
}

export default function ScratchCard({ width = 300, height = 300, onComplete, children }: ScratchCardProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const isCompletedRef = useRef(false); // Ref for synchronous checking

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Initialize Canvas - Silver Overlay
        ctx.fillStyle = '#C0C0C0'; // Silver color
        ctx.fillRect(0, 0, width, height);

        // Add "SCRATCH HERE" Text
        ctx.fillStyle = '#666';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('SCRATCH NOW!', width / 2, height / 2);

        let isDrawing = false;

        const getBrushPos = (e: MouseEvent | TouchEvent) => {
            const rect = canvas.getBoundingClientRect();
            let clientX, clientY;

            if ('touches' in e) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = (e as MouseEvent).clientX;
                clientY = (e as MouseEvent).clientY;
            }

            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        };

        const scratch = (e: MouseEvent | TouchEvent) => {
            if (!isDrawing || isCompletedRef.current) return;
            e.preventDefault(); // Prevent scrolling on mobile

            const { x, y } = getBrushPos(e);

            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(x, y, 20, 0, 2 * Math.PI); // Brush size
            ctx.fill();

            checkCompletion();
        };

        const checkCompletion = () => {
            if (isCompletedRef.current) return;

            // Check pixels to see how much is cleared
            // Optimization: checking every 10th pixel to save perf
            const imageData = ctx.getImageData(0, 0, width, height);
            const pixels = imageData.data;
            let transparentPixels = 0;
            const totalPixels = pixels.length / 4;

            for (let i = 3; i < pixels.length; i += 4 * 10) {
                if (pixels[i] === 0) transparentPixels++;
            }

            // If > 40% cleared, auto-complete
            if (transparentPixels / (totalPixels / 10) > 0.4) {
                isCompletedRef.current = true; // Sync update
                setIsCompleted(true); // UI update

                canvas.style.transition = 'opacity 0.5s ease';
                canvas.style.opacity = '0';
                setTimeout(() => {
                    onComplete();
                }, 500);
            }
        };

        const startDrawing = (e: MouseEvent | TouchEvent) => { isDrawing = true; scratch(e); };
        const endDrawing = () => { isDrawing = false; };

        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', scratch);
        canvas.addEventListener('mouseup', endDrawing);
        canvas.addEventListener('mouseleave', endDrawing);

        canvas.addEventListener('touchstart', startDrawing);
        canvas.addEventListener('touchmove', scratch);
        canvas.addEventListener('touchend', endDrawing);

        return () => {
            canvas.removeEventListener('mousedown', startDrawing);
            canvas.removeEventListener('mousemove', scratch);
            canvas.removeEventListener('mouseup', endDrawing);
            canvas.removeEventListener('mouseleave', endDrawing);

            canvas.removeEventListener('touchstart', startDrawing);
            canvas.removeEventListener('touchmove', scratch);
            canvas.removeEventListener('touchend', endDrawing);
        };
    }, [onComplete, width, height]); // Removed isCompleted dependency

    return (
        <div style={{ position: 'relative', width, height, margin: '0 auto', overflow: 'hidden', borderRadius: '10px' }}>
            {/* Underlying Content (Reward) */}
            <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                zIndex: 1
            }}>
                {children}
            </div>

            {/* Scratch Canvas */}
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                style={{ position: 'relative', zIndex: 2, cursor: 'grab', background: '#C0C0C0' }}
            />
        </div>
    );
}
