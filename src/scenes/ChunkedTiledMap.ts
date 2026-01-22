import * as ex from "excalibur";
import { TiledResource } from "@excaliburjs/plugin-tiled";

export interface ChunkedTiledMapConfig {
    tiledResource: TiledResource;
    chunkSize: number; // Size of each chunk in tiles (e.g., 16x16 tiles)
    renderDistance: number; // How many chunks around the player to render
}

interface Chunk {
    x: number;
    y: number;
    tileMaps: ex.TileMap[];
    isLoaded: boolean;
}

interface LayerInfo {
    name: string;
    z: number;
    solid: boolean;
}

export class ChunkedTiledMap {
    private tiledResource: TiledResource;
    private chunkSize: number;
    private renderDistance: number;
    private chunks: Map<string, Chunk> = new Map();
    private scene!: ex.Scene;
    private currentPlayerChunk: { x: number, y: number } = { x: -1, y: -1 };
    
    private tileWidth: number = 16;
    private tileHeight: number = 16;
    private mapWidth: number = 0;
    private mapHeight: number = 0;
    private layerInfos: LayerInfo[] = [];

    constructor(config: ChunkedTiledMapConfig) {
        this.tiledResource = config.tiledResource;
        this.chunkSize = config.chunkSize;
        this.renderDistance = config.renderDistance;
    }

    async initialize(scene: ex.Scene) {
        this.scene = scene;
        
        // Get map dimensions from the tiled resource
        const tileLayers = this.tiledResource.getTileLayers();
        if (tileLayers.length > 0) {
            const firstLayer = tileLayers[0];
            this.mapWidth = firstLayer.width;
            this.mapHeight = firstLayer.height;
            this.tileWidth = 16;
            this.tileHeight = 16;
        }

        // Store layer information
        tileLayers.forEach(layer => {
            this.layerInfos.push({
                name: layer.name,
                z: layer.tilemap.z,
                solid: layer.properties.get("solid") as boolean
            });
        });
    }

    private getChunkKey(chunkX: number, chunkY: number): string {
        return `${chunkX},${chunkY}`;   
    }

    private worldToChunk(worldX: number, worldY: number): { x: number, y: number } {
        const tileX = Math.floor(worldX / this.tileWidth);
        const tileY = Math.floor(worldY / this.tileHeight);
        return {
            x: Math.floor(tileX / this.chunkSize),
            y: Math.floor(tileY / this.chunkSize)
        };
    }

    private createChunk(chunkX: number, chunkY: number): Chunk {
        const chunk: Chunk = {
            x: chunkX, 
            y: chunkY,
            tileMaps: [],
            isLoaded: false
        };

        // Calculate tile bounds for this chunk
        const startTileX = chunkX * this.chunkSize;
        const startTileY = chunkY * this.chunkSize;
        const endTileX = Math.min(startTileX + this.chunkSize, this.mapWidth);
        const endTileY = Math.min(startTileY + this.chunkSize, this.mapHeight);
        
        const chunkWidthInTiles = endTileX - startTileX;
        const chunkHeightInTiles = endTileY - startTileY;

        // Get all tile layers from the original map
        const originalLayers = this.tiledResource.getTileLayers();

        // Create a tilemap for each layer in this chunk
        originalLayers.forEach((originalLayer, layerIndex) => {
            // Create a new tilemap for this chunk
            const chunkTileMap = new ex.TileMap({
                pos: ex.vec(startTileX * this.tileWidth, startTileY * this.tileHeight),
                tileWidth: this.tileWidth,
                tileHeight: this.tileHeight,
                rows: chunkHeightInTiles,
                columns: chunkWidthInTiles
            });

            // Copy tiles from the original layer to this chunk
            for (let localY = 0; localY < chunkHeightInTiles; localY++) {
                for (let localX = 0; localX < chunkWidthInTiles; localX++) {
                    const globalX = startTileX + localX;
                    const globalY = startTileY + localY;
                    
                    // Get the tile from the original layer
                    const originalTile = originalLayer.tilemap.getTile(globalX, globalY);
                    
                    if (originalTile) {
                        // Create a new tile in the chunk with the same graphic
                        const chunkTile = chunkTileMap.getTile(localX, localY);
                        if (chunkTile) {
                            // Copy graphics
                            if (originalTile.getGraphics().length > 0) {
                                chunkTile.clearGraphics();
                                originalTile.getGraphics().forEach(graphic => {
                                    chunkTile.addGraphic(graphic);
                                });
                            }
                            
                            // Copy collider - this is the key fix!
                            if (originalTile.solid) {
                                chunkTile.solid = true;
                            }
                            
                            // Copy custom collider if it exists
                            const originalCollider = originalTile.getColliders()[0]
                            if (originalCollider) {
                                // Clone the collider to the new tile
                                const boxCollider = ex.Shape.Box(
                                    originalCollider.bounds.width,
                                    originalCollider.bounds.height,
                                    ex.Vector.Half,
                                    originalCollider.offset
                                )
                                chunkTile.addCollider(boxCollider)
                            }
                        }
                    }
                }
            }

            // Set z-index based on layer info
            const layerInfo = this.layerInfos[layerIndex];
            if (layerInfo) {
                chunkTileMap.z = layerInfo.z;
                
                // Apply special z-index for decor layers
                if (layerInfo.name.includes("Decor")) {
                    chunkTileMap.z = 50;
                }
            }

            chunk.tileMaps.push(chunkTileMap);
        });

        return chunk;
    }

    private loadChunk(chunkX: number, chunkY: number) {
        const key = this.getChunkKey(chunkX, chunkY);
        
        // Check if chunk is out of bounds
        const maxChunkX = Math.ceil(this.mapWidth / this.chunkSize);
        const maxChunkY = Math.ceil(this.mapHeight / this.chunkSize);
        if (chunkX < 0 || chunkY < 0 || chunkX >= maxChunkX || chunkY >= maxChunkY) {
            return;
        }
        
        if (this.chunks.has(key)) {
            const chunk = this.chunks.get(key)!;
            if (!chunk.isLoaded) {
                // Add tilemaps to scene
                for (const tileMap of chunk.tileMaps) {
                    this.scene.add(tileMap);
                }
                chunk.isLoaded = true;
            }
        } else {
            // Create and load new chunk
            const chunk = this.createChunk(chunkX, chunkY);
            for (const tileMap of chunk.tileMaps) {
                this.scene.add(tileMap);
            }
            chunk.isLoaded = true;
            this.chunks.set(key, chunk);
        }
    }

    private unloadChunk(chunkX: number, chunkY: number) {
        const key = this.getChunkKey(chunkX, chunkY);
        const chunk = this.chunks.get(key);

        if (chunk && chunk.isLoaded) {
            // Remove tilemaps from scene
            for (const tileMap of chunk.tileMaps) {
                this.scene.remove(tileMap);
            }
            chunk.isLoaded = false;
        }
    }

    update(playerPos: ex.Vector) {
        const playerChunk = this.worldToChunk(playerPos.x, playerPos.y);

        // Only update if player moved to a different chunk
        if (playerChunk.x === this.currentPlayerChunk.x && 
            playerChunk.y === this.currentPlayerChunk.y) {
            return;
        }

        this.currentPlayerChunk = playerChunk;

        // Determine which chunks should be loaded
        const chunksToLoad = new Set<string>();
        for (let x = playerChunk.x - this.renderDistance; x <= playerChunk.x + this.renderDistance; x++) {
            for (let y = playerChunk.y - this.renderDistance; y <= playerChunk.y + this.renderDistance; y++) {
                chunksToLoad.add(this.getChunkKey(x, y));
            }
        }

        // Unload chunks that are too far away
        for (const [key, chunk] of this.chunks.entries()) {
            if (!chunksToLoad.has(key) && chunk.isLoaded) {
                this.unloadChunk(chunk.x, chunk.y);
            }
        }

        // Load chunks that are in range
        for (let x = playerChunk.x - this.renderDistance; x <= playerChunk.x + this.renderDistance; x++) {
            for (let y = playerChunk.y - this.renderDistance; y <= playerChunk.y + this.renderDistance; y++) {
                this.loadChunk(x, y);
            }
        }
    }

    // Clean up method
    destroy() {
        for (const chunk of this.chunks.values()) {
            if (chunk.isLoaded) {
                for (const tileMap of chunk.tileMaps) {
                    this.scene.remove(tileMap);
                }
            }
        }
        this.chunks.clear();
    }
}