import { BufferGeometry, BufferAttribute, MeshPhysicalMaterial, Mesh } from 'three'
import VoxelWorld from '../helpers/VoxelWorld'

type LevelMap = (number | null)[][]

export function mergeRooms (roomMaps: Array<LevelMap>, levelMapping: LevelMap): LevelMap {
  const roomSize = roomMaps[0].length
  const levelSize = { x: levelMapping[0].length * roomSize, y: levelMapping.length * roomSize }
  const fullLevel: LevelMap = new Array(levelSize.y).fill(new Array(levelSize.x).fill(null))

  return fullLevel.map((row, absY) => row.map((_cell, absX) => {
    const roomX = Math.floor(absX / roomSize)
    const roomY = Math.floor(absY / roomSize)
    const mapX = absX % roomSize
    const mapY = absY % roomSize

    const roomId = levelMapping[roomY][roomX]
    const roomMap = roomMaps[roomId]

    return roomMap ? roomMap[mapY][mapX] : null
  }))
}

export function addExteriorWalls (map: LevelMap, levelMapping: LevelMap): LevelMap {
  const newMap = map
  const roomSize = map.length / levelMapping.length

  levelMapping.forEach((row, y) => {
    const nullOrNotExist = (X, Y) => {
      if (X < 0 || Y < 0 || X >= levelMapping.length || Y >= levelMapping.length) {
        return true
      } else {
        return levelMapping[Y][X] === null
      }
    }

    row.forEach((_room, x) => {
      if (levelMapping[y][x] !== null) {
        if (nullOrNotExist(x, y - 1)) {
          for (let i = 0; i < roomSize; i++) {
            newMap[y * roomSize][x * roomSize + i] = 255
          }
        } if (nullOrNotExist(x, y + 1)) {
          for (let i = 0; i < roomSize; i++) {
            newMap[(y + 1) * roomSize - 1][x * roomSize + i] = 255
          }
        } if (nullOrNotExist(x - 1, y)) {
          for (let i = 0; i < roomSize; i++) {
            newMap[y * roomSize + i][x * roomSize] = 255
          }
        } if (nullOrNotExist(x + 1, y)) {
          for (let i = 0; i < roomSize; i++) {
            newMap[y * roomSize + i][(x + 1) * roomSize - 1] = 255
          }
        }
      }
    })
  })
  return newMap
}

export function mapToMesh (map: LevelMap): Mesh {
  const cellSize = map.length
  const world = new VoxelWorld(cellSize)

  map.forEach((row, z) => {
    row.forEach((pixel, x) => {
      const bin = pixel ? pixel.toString(2) : '00000000'
      bin.split('').forEach((elev, y) => {
        if (elev === '1') {
          world.setVoxel(x, y, z, 1)
        }
      })
    })
  })

  const { positions, normals, indices } = world.generateGeometryDataForCell(0, 0, 0)
  const geometry = new BufferGeometry()
  const material = new MeshPhysicalMaterial({
    color: 0xFFFFFF,
    roughness: 0.8,
    metalness: 0.2
  })

  const positionNumComponents = 3
  const normalNumComponents = 3
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), positionNumComponents))
  geometry.setAttribute('normal', new BufferAttribute(new Float32Array(normals), normalNumComponents))
  geometry.setIndex(indices)

  return new Mesh(geometry, material)
}

export function mapToWalkable (map: LevelMap): boolean[][] {
  return map.map((row, z) => row.map((pixel, x) => {
    const bin = pixel ? pixel.toString(2) : '00000000'
    return bin.substr(0, 4) === '1000'
  }))
}
