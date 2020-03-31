import { BufferGeometry, BufferAttribute, MeshPhysicalMaterial, Mesh } from 'three'
import VoxelWorld from './VoxelWorld'

export default function createRoom (plan): Mesh {
  const cellSize = plan.length
  const world = new VoxelWorld(cellSize)

  plan.forEach((row, z) => {
    row.forEach((pixel, x) => {
      const bin = pixel.toString(2)
      bin.split('').forEach((elev, y) => {
        if (elev === '1') {
          world.setVoxel(x, y, z, 1)
        }
      })
    })
  })

  const { positions, normals, indices } = world.generateGeometryDataForCell(0, 0, 0)
  const geometry = new BufferGeometry()
  const material = new MeshPhysicalMaterial({ color: 0xFFCC88 })

  const positionNumComponents = 3
  const normalNumComponents = 3
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), positionNumComponents))
  geometry.setAttribute('normal', new BufferAttribute(new Float32Array(normals), normalNumComponents))
  geometry.setIndex(indices)

  return new Mesh(geometry, material)
}
