import {accentColor, foregroundColor} from "../theme.tsx";

type NodeState = 'empty' | 'wall' | 'start' | 'end' | 'path' | 'visited' | 'queue';

class GridNode {
    state: NodeState
    x: number
    y: number

    distanceFromStart = Infinity
    weightedDistanceFromStart = Infinity
    previous: GridNode | null = null

    constructor(state: NodeState, x: number, y: number) {
        this.state = state
        this.x = x
        this.y = y
    }

    get isTop() { return this.y === 0 }
    get isBottom() { return false } // Set based on grid size externally if needed
    get isLeft() { return this.x === 0 }
    get isRight() { return false } // Set based on grid size externally if needed

    getManhattanDistanceTo(node: GridNode) {
        return Math.abs(this.x - node.x) + Math.abs(this.y - node.y)
    }

    getEuclideanDistanceTo(node: GridNode) {
        return Math.hypot(this.x - node.x, this.y - node.y)
    }

    draw(ctx: CanvasRenderingContext2D, size: number, center: [number, number], color: string | null = null) {
        
        if (color) {
            ctx.fillStyle = color;
        } else {
            switch (this.state) {
                case 'wall':
                    ctx.fillStyle = 'red'//foregroundColor;
                    break;
                case 'start':
                    ctx.fillStyle = accentColor;
                    break;
                case 'end':
                    ctx.fillStyle = accentColor;
                    break;
                case 'visited':
                    ctx.fillStyle = 'rgba(0, 255, 0, 1)'; // Semi-transparent yellow for path
                    break;
                case 'queue':
                    ctx.fillStyle = 'rgba(0, 0, 255, 1)';
                    break
                default:
                    return;
            }
        }
        
        ctx.fillRect(
            this.x * size + center[0] + 1,
            this.y * size + center[1] + 1,
            size - 1,
            size - 1
        )    
    }

    equals(node: GridNode | null): boolean {
        if (!node) return false
        return this.x === node.x && this.y === node.y
    }
}

export default GridNode