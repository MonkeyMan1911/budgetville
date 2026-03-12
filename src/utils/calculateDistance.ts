import { vec } from "excalibur"

export function calculateYDistance(numTiles: number): number {
    return numTiles * 16
}
export function calculateXDistance(numTiles: number): number {
    return numTiles * 16 + 8
}
export function calculatePosition(numTilesX: number, numTilesY: number): ex.Vector {
    return vec(calculateXDistance(numTilesX), calculateYDistance(numTilesY))
}