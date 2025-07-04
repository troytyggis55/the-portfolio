import React, { useRef, useEffect } from 'react';
import GridNode from "./gridNode.ts";
import {createNoise2D} from "simplex-noise";

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

const pause = (ms?: number) => {
    if (ms === undefined) {
        return new Promise<void>(resolve => {
            const handler = (e: KeyboardEvent) => {
                if (e.code === 'Space') {
                    window.removeEventListener('keydown', handler);
                    resolve();
                }
            };
            window.addEventListener('keydown', handler);
        });
    }
    return new Promise<void>(resolve => setTimeout(resolve, ms));
};

const Pathfinding: React.FC = () => {
    const gridSize = 20;
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    // Draw grid and handle resize when component mounts
    useEffect(() => {
        const nodes = new Map<string, GridNode>();
        let startNode: GridNode | null = null;
        let endNode: GridNode | null = null;
        
        const getKey = (x: number, y: number) => `${x},${y}`;
        
        const algorithm: 'astar' | 'dijkstra' = 'dijkstra';
        
        const isEuclidean = false;
        
        const getNeighbors = (x: number, y: number): GridNode[] => {
            const neighbors: GridNode[] = [];
            const isLeftEdge = x === iLeft;
            const isRightEdge = x === iRight;
            const isTopEdge = y === iTop;
            const isBottomEdge = y === iBottom;

            if (!isLeftEdge) neighbors.push(nodes.get(getKey(x - 1, y))!);
            if (!isRightEdge) neighbors.push(nodes.get(getKey(x + 1, y))!);
            if (!isTopEdge) neighbors.push(nodes.get(getKey(x, y - 1))!);
            if (!isBottomEdge) neighbors.push(nodes.get(getKey(x, y + 1))!);

            if (isEuclidean) {
                if (!isLeftEdge && !isTopEdge) neighbors.push(nodes.get(getKey(x - 1, y - 1))!);
                if (!isRightEdge && !isTopEdge) neighbors.push(nodes.get(getKey(x + 1, y - 1))!);
                if (!isRightEdge && !isBottomEdge) neighbors.push(nodes.get(getKey(x + 1, y + 1))!);
                if (!isLeftEdge && !isBottomEdge) neighbors.push(nodes.get(getKey(x - 1, y + 1))!);
            }

            return neighbors
        }
        
        const noise = createNoise2D()
        const getNoise = (x: number, y: number, scale: number = 50, threshold: number = 0.5) => {
            return noise(x / scale, y / scale) > threshold
        }
        
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let { center, iLeft, iRight, iTop, iBottom } = setCanvas(canvas, ctx, gridSize);

        const refreshGrid = () => {
            ({ center, iLeft, iRight, iTop, iBottom } = setCanvas(canvas, ctx, gridSize));
            
            const oldNodes = new Map(nodes);
            nodes.clear();
            for (let x = iLeft; x <= iRight; x++) {
                for (let y = iTop; y <= iBottom; y++) {
                    const oldNode = oldNodes.get(getKey(x, y));
                    if (oldNode) {
                        nodes.set(getKey(x, y), oldNode);
                    } else if (getNoise(x, y, 5, 0.2)) {
                        nodes.set(getKey(x,  y), new GridNode('wall', x, y));
                    } else {
                        nodes.set(getKey(x, y), new GridNode('empty', x, y));
                    }
                }
            }

            //const randomQuadrant = Math.floor(Math.random() * 4);
//
            //const maxTries = Math.floor(((iRight - iLeft + 1) * (iBottom - iTop + 1)) / 4);
            //let tries = 0;
            //while (startNode == null && tries < maxTries) {
            //    tries++;
            //    const xRange = randomQuadrant < 2 ? iLeft : iRight;
            //    const yRange = randomQuadrant % 2 === 0 ? iTop : iBottom;
            //    
            //    const x = Math.floor(Math.random() * xRange)
            //    const y = Math.floor(Math.random() * yRange);
            //        
            //    const key = getKey(x, y);
            //    if (nodes.has(key)) continue;
            //    startNode = new GridNode('start', x, y);
            //    nodes.set(key, startNode);
            //}
//
            //tries = 0;
            //while (startNode == null && tries < maxTries) {
            //    tries++;
            //    const xRange = randomQuadrant < 2 ? iRight : iLeft;
            //    const yRange = randomQuadrant % 2 === 0 ? iBottom : iTop;
            //    
            //    const x = Math.floor(Math.random() * xRange)
            //    const y = Math.floor(Math.random() * yRange)
            //    
            //    const key = getKey(x, y);
            //    if (nodes.has(key) || (startNode && startNode.x === x && startNode.y === y))
            //    continue;
            //    endNode = new GridNode('end', x, y);
            //    nodes.set(key, endNode);
            //}
            
            startNode = new GridNode('start', iLeft, iTop);
            endNode = new GridNode('end', iRight, iBottom);
            nodes.set(getKey(startNode.x, startNode.y), startNode);
            nodes.set(getKey(endNode.x, endNode.y), endNode);

            const drawGrid = () => {
                nodes.forEach((node) => {
                    node.draw(ctx, gridSize, center);
                });
            }
            
            drawGrid();
        };
        
        refreshGrid();

        const pathfind = () => {
            if (!startNode || !endNode) return;
            
            startNode.distanceFromStart = 0
            const queue: GridNode[] = [startNode]

            const searchStep = async () => {
                const current = queue.shift();
                if (!current || current.state === 'end') return;
                
                current.draw(ctx, gridSize, center, 'white');
                const neighbors = getNeighbors(current.x, current.y);
                
                for (const neighbor of neighbors) {
                    if (neighbor.state === 'end') break;
                    if (!(neighbor.state === 'empty' || neighbor.state === 'queue')) continue;
                    
                    if (neighbor.state === 'empty') {
                        neighbor.state = 'queue';
                        neighbor.draw(ctx, gridSize, center);
                    }

                    const neighborDistanceFromStart =
                        current.distanceFromStart + (isEuclidean
                            ? current.getEuclideanDistanceTo(neighbor)
                            : current.getManhattanDistanceTo(neighbor));

                    if (neighborDistanceFromStart < neighbor.distanceFromStart) {
                        neighbor.distanceFromStart = neighborDistanceFromStart;

                        if (algorithm === 'astar') {
                            startNode = startNode as GridNode; // TODO fiks hatløsning
                            endNode = endNode as GridNode; // TODO fiks hatløsning
                            neighbor.weightedDistanceFromStart = neighborDistanceFromStart +
                                (isEuclidean
                                    ? neighbor.getEuclideanDistanceTo(endNode)
                                    : neighbor.getManhattanDistanceTo(endNode));
                        } else {
                            neighbor.weightedDistanceFromStart = neighborDistanceFromStart;
                        }

                        neighbor.previous = current;
                        if (!queue.includes(neighbor)) queue.push(neighbor);
                    }
                }

                if (current.state !== 'start') {
                    current.state = 'visited';
                }

                current.draw(ctx, gridSize, center);

                queue.sort(
                    (a, b) =>
                        a.weightedDistanceFromStart - b.weightedDistanceFromStart || a.x - b.x || a.y - b.y
                );

                if (queue.length > 0) {
                    setTimeout(searchStep, 0);
                }
            };
            searchStep();
        }
        
        pathfind()

        window.addEventListener('resize', refreshGrid);
        return () => {
            window.removeEventListener('resize', refreshGrid);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed w-full h-full top-0 left-0"
        />
    );
};

export default Pathfinding;