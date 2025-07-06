import {primaryColor, foregroundColor, secondaryColor, backgroundColor} from "../theme.tsx";

type NodeState = 'empty' | 'wall' | 'start' | 'end' | 'path' | 'visited' | 'queue' | 'locked';

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
    
    touchesWall(iLeft: number, iRight: number, iTop: number, iBottom: number) {
        return this.x === iLeft || this.x === iRight || this.y === iTop || this.y === iBottom
    }

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
                    ctx.fillStyle = foregroundColor;
                    break;
                case 'start':
                    ctx.fillStyle = primaryColor;
                    break;
                case 'end':
                    ctx.fillStyle = primaryColor;
                    break;
                case 'path':
                    ctx.fillStyle = primaryColor;
                    break;
                case 'queue':
                    ctx.fillStyle = 'rgba(0, 0, 255, 1)';
                    break
                case 'visited':
                    ctx.fillStyle = 'green'//secondaryColor
                    break;
                case 'locked':
                    ctx.fillStyle = secondaryColor
                    break;
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

    clear(ctx: CanvasRenderingContext2D, size: number, center: [number, number]) {
        ctx.fillStyle = backgroundColor
        
        ctx.fillRect(
            this.x * size + center[0] - 1,
            this.y * size + center[1] - 1,
            size + 1,
            size + 1
        )
    }
    
    equals(node: GridNode | null): boolean {
        if (!node) return false
        return this.x === node.x && this.y === node.y
    }
}

export default GridNode