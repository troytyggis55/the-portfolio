import React, { useRef, useEffect } from 'react';
import GridNode from "./gridNode.ts";

const setCanvas = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, gridSize: number) => {
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const center: [number,  number] = [canvas.clientWidth / 2, canvas.clientHeight / 2];
    
    const xCount = Math.floor(width / gridSize);
    const yCount = Math.floor(height / gridSize);
    
    const xOffset = Math.floor(xCount / 2);
    const yOffset = Math.floor(yCount / 2);
    
    const iLeft = -xOffset; // Index of the leftmost column
    const iRight = xOffset - 1; // Index of the rightmost column
    const iTop = -yOffset; // Index of the bottommost row
    const iBottom = yOffset - 1; // Index of the topmost row
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    return { dpr, width, height, center, xCount, yCount, xOffset, yOffset, iLeft, iRight, iTop, iBottom }
};

const Pathfinding: React.FC = () => {
    const gridSize = 20;
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    //const accentColor =
    // getComputedStyle(document.documentElement).getPropertyValue('--foreground-color').trim();
    
    // Draw grid and handle resize when component mounts
    useEffect(() => {
        const nodes = new Map<string, GridNode>();
        const getKey = (x: number, y: number) => `${x},${y}`;
        
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { iLeft, iRight, iTop, iBottom } = setCanvas(canvas, ctx, gridSize);
        
        for (let x = iLeft; x < iRight; x++) {
            for (let y = iTop; y < iBottom; y++) {
                nodes.set(getKey(x, y), new GridNode('empty', x, y));
            }
        }

        const refreshGrid = () => {
            const { center, iLeft, iRight, iTop, iBottom } = setCanvas(canvas, ctx, gridSize);
            
            const oldNodes = new Map(nodes);
            nodes.clear();
            for (let x = iLeft; x < iRight; x++) {
                for (let y = iTop; y < iBottom; y++) {
                    nodes.set(getKey(x, y), oldNodes.get(getKey(x, y)) ?? new GridNode('empty', x, y));
                }
            }
            
            const drawGrid = () => {
                nodes.forEach((node) => {
                    node.draw(ctx, gridSize, center);
                });
            }
            
            drawGrid();
        };
        

        refreshGrid();
        window.addEventListener('resize', refreshGrid);
        return () => window.removeEventListener('resize', refreshGrid);
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed w-full h-full top-0 left-0 bg-gray-500"
        />
    );
};

export default Pathfinding;