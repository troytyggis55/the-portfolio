type NodeState = 'empty' | 'wall' | 'start' | 'end' | 'path'

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

    getAllNeighbors(grid: GridNode[][]) {
        const neighbors: GridNode[] = []
        const dirs = [
            [-1, -1], [0, -1], [1, -1],
            [1, 0], [1, 1], [0, 1],
            [-1, 1], [-1, 0]
        ]
        for (const [dx, dy] of dirs) {
            const nx = this.x + dx, ny = this.y + dy
            if (grid[nx]?.[ny]) neighbors.push(grid[nx][ny])
        }
        return neighbors
    }

    getOrthogonalNeighbors(grid: GridNode[][]) {
        const neighbors: GridNode[] = []
        const dirs = [
            [0, -1], [1, 0], [0, 1], [-1, 0]
        ]
        for (const [dx, dy] of dirs) {
            const nx = this.x + dx, ny = this.y + dy
            if (grid[nx]?.[ny]) neighbors.push(grid[nx][ny])
        }
        return neighbors
    }

    draw(ctx: CanvasRenderingContext2D, size: number, center: [number, number]) {
        if (this.state === 'empty') {
            ctx.fillStyle = 'rgba(255, 0, 0, 1)'
        } else if (this.state === 'wall') {
            ctx.fillStyle = 'rgba(0, 0, 255, 1)'//accentColor
        }
        
        ctx.fillRect(
            this.x * size + center[0] + 1,
            this.y * size + center[1] + 1,
            size - 1,
            size - 1
        )    
    }

    equals(node: GridNode) {
        return this.x === node.x && this.y === node.y
    }
}

export default GridNode