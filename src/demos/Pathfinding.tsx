import React, { useEffect, useRef } from 'react';
import GridNode from './gridNode.ts';
import { createNoise2D } from 'simplex-noise';

/** Simple mutex used to synchronize canvas updates */
class Mutex {
    private locked = false;
    private waiting: Array<() => void> = [];

    async lock() {
        if (!this.locked) {
            this.locked = true;
            return;
        }
        await new Promise<void>(resolve => this.waiting.push(resolve));
    }

    unlock() {
        const next = this.waiting.shift();
        if (next) {
            next();
        } else {
            this.locked = false;
        }
    }
}

const gridSize = 40;
const algorithm: 'astar' | 'dijkstra' = 'dijkstra';
const isEuclidean = false;

const noise = createNoise2D();
const getNoise = (x: number, y: number, scale = 50, threshold = 0.5) =>
    noise(x / scale, y / scale) > threshold;

const getKey = (x: number, y: number) => `${x},${y}`;

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
    
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    ctx.imageSmoothingEnabled = false;
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    return { dpr, width, height, center, xCount, yCount, xOffset, yOffset, iLeft, iRight, iTop, iBottom }
};


const Pathfinding: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    // Draw grid and handle resize when component mounts
    useEffect( () => {
        const mutex = new Mutex();

        let pathFound = false;

        const nodes = new Map<string, GridNode>();
        let startNode: GridNode | null = null;
        let endNode: GridNode | null = null;
        
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
                        if (oldNode.touchesWall(iLeft, iRight, iTop, iBottom) && oldNode.state === 'locked') oldNode.state = 'visited';
                        
                        
                        nodes.set(getKey(x, y), oldNode);
                    } else if (getNoise(x, y, 5, 0.5)) {
                        nodes.set(getKey(x,  y), new GridNode('wall', x, y));
                    } else {
                        nodes.set(getKey(x, y), new GridNode('empty', x, y));
                    }
                }
            }
            
            const drawGrid = () => {
                nodes.forEach((node) => {
                    node.draw(ctx, gridSize, center);
                });
            }
            
            drawGrid();
        };

        const initGrid = () => {
            
            const iSubLeft = Math.ceil(iLeft / 2);
            const iSubRight = Math.floor(iRight / 2);
            const iSubTop = Math.ceil(iTop / 2);
            const iSubBottom = Math.floor(iBottom / 2);
            
            const randomQuadrant = Math.floor(Math.random() * 4);
            const startRange = [] // [maxLeft, maxRight, maxTop, maxBottom]
            const endRange = [] // [maxLeft, maxRight, maxTop, maxBottom]
            
            // Left half
            if (randomQuadrant < 2) {
                startRange[0] = iLeft;
                endRange[0] = iSubRight;
                
                startRange[1] = iSubLeft
                endRange[1] = iRight;
            } else {
                startRange[0] = iSubRight;
                endRange[0] = iLeft
                
                startRange[1] = iRight;
                endRange[1] = iSubLeft;
            }
            
            // Top half
            if (randomQuadrant % 2 === 0) {
                startRange[2] = iTop;
                endRange[2] = iSubBottom;
                
                startRange[3] = iSubTop;
                endRange[3] = iBottom;
            } else {
                startRange[2] = iSubBottom;
                endRange[2] = iTop;
                
                startRange[3] = iBottom;
                endRange[3] = iSubTop;
            }

            // Lag et kors for å teste skalering
            for (let i = iLeft; i <= iRight; i++) {
                const node = nodes.get(getKey(i, 0));
                if (node) {
                    node.state = 'wall';
                    node.draw(ctx, gridSize, center);
                } else {
                    nodes.set(getKey(i, 0), new GridNode('wall', i, 0));
                }
            }

            for (let i = iTop; i <= iBottom; i++) {
                const node = nodes.get(getKey(0, i));
                if (node) {
                    node.state = 'wall';
                    node.draw(ctx, gridSize, center);
                } else {
                    nodes.set(getKey(0, i), new GridNode('wall', 0, i));
                }
            }

            refreshGrid()
            
            const startLocations: [number, number][] = []
            for (let x = startRange[0]; x <= startRange[1]; x++) {
                for (let y = startRange[2]; y <= startRange[3]; y++) {
                    if (nodes.get(getKey(x, y))?.state === 'empty') {
                        startLocations.push([x, y]);
                    }
                }
            }
            
            const endLocations: [number, number][] = []
            for (let x = endRange[0]; x <= endRange[1]; x++) {
                for (let y = endRange[2]; y <= endRange[3]; y++) {
                    if (nodes.get(getKey(x, y))?.state === 'empty') {
                        endLocations.push([x, y]);
                    }
                }
            }
            
            const startIndex = Math.floor(Math.random() * startLocations.length);
            const endIndex = Math.floor(Math.random() * endLocations.length);
            
            startNode = new GridNode('start', startLocations[startIndex][0], startLocations[startIndex][1]);
            endNode = new GridNode('end', endLocations[endIndex][0], endLocations[endIndex][1]);
            
            nodes.set(getKey(startNode.x, startNode.y), startNode);
            nodes.set(getKey(endNode.x, endNode.y), endNode);
        }
        
        const resetSearch = () => {
            pathFound = false;

            nodes.forEach((node) => {
                if (node.state === 'visited' || node.state === 'locked' || node.state === 'queue' || node.state === 'path') {
                    node.state = 'empty';
                    node.previous = null;
                    node.distanceFromStart = Infinity;
                    node.weightedDistanceFromStart = Infinity;
                    node.clear(ctx, gridSize, center);
                }
            });
            
            if (startNode) {
                startNode.distanceFromStart = Infinity;
                startNode.weightedDistanceFromStart = Infinity;
                startNode.previous = null;
            }
            
            if (endNode) {
                endNode.distanceFromStart = Infinity;
                endNode.weightedDistanceFromStart = Infinity;
                endNode.previous = null;
            }
        }

        const initPathfind = () => {
            if (!startNode || !endNode) return false;

            startNode.distanceFromStart = 0;

            const queue: GridNode[] = [startNode];

            nodes.forEach((node) => {
                if (node.state === 'queue' || node.state === 'visited') {
                    node.state = 'queue';
                    queue.push(node);
                }
            });

            queue.sort(
                (a, b) =>
                    a.weightedDistanceFromStart - b.weightedDistanceFromStart
            );

            return queue;
        };

        const searchStep = (queue: GridNode[]) => {
            const current = queue.shift();
            if (!current) {
                console.log('No path found');
                return;
            }

            if (current.state === 'end' || pathFound) {
                pathFound = true;
                //showPath(current);
                resetSearch();
                return;
            }
            const neighbors = getNeighbors(current.x, current.y);

            for (const neighbor of neighbors) {
                if (!neighbor || !(neighbor.state === 'empty' || neighbor.state === 'queue' || neighbor.state === 'end')) continue;

                if (neighbor.state === 'empty') neighbor.state = 'queue';

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
                if (current.touchesWall(iLeft, iRight, iTop, iBottom)) {
                    current.state = 'visited';
                } else {
                    current.state = 'locked';
                }
            }

            current.draw(ctx, gridSize, center);

            queue.sort(
                (a, b) =>
                    a.weightedDistanceFromStart - b.weightedDistanceFromStart
            );

            setTimeout(() => {
                withLock(() => searchStep(queue));
            }, 0);
        };

        const pathfind = () => {
            const queue = initPathfind();
            if (!queue) return false;
            searchStep(queue);
        };        
        

        const withLock = async (fn: () => Promise<void> | void) => {
            await mutex.lock();
            try {
                await fn();
            } finally {
                mutex.unlock();
            }
        };
        
        
        // Run initialization code
        initGrid();
        withLock(pathfind)


        // Add event listeners / loop code
        const resizeObserver = new ResizeObserver(async () => {
            await withLock(refreshGrid);
            await withLock(pathfind);
        })

        resizeObserver.observe(canvas);
        
        return () => {
            resizeObserver.disconnect();
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

