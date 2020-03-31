import { PointLight, Mesh, sRGBEncoding, PCFSoftShadowMap, Object3D, CylinderBufferGeometry, MeshStandardMaterial } from 'three'
import { init } from './ts/helpers/three-utils'
import RAF from './ts/helpers/raf'
import { lerp } from './ts/helpers/utils'
import createRoom from './ts/createRoom'
import roomPlans from './assets/rooms'

const raf = new RAF()
const { camera, renderer, scene } = init()

renderer.shadowMap.enabled = true
renderer.outputEncoding = sRGBEncoding
renderer.pixelRatio = 2
renderer.shadowMap.enabled = true
renderer.shadowMap.type = PCFSoftShadowMap

const _ = null
const levelPlan = [
  [_, 0, 4, _],
  [_, 1, 2, _],
  [1, 3, 1, 0],
  [4, 0, 4, _]
]

const roomSize = roomPlans[0].length

const level = new Object3D()
levelPlan.forEach((row, x) => {
  row.forEach((planId, z) => {
    if (roomPlans[planId]) {
      const plan = roomPlans[planId]
      const room = createRoom(plan)
      room.castShadow = true
      room.receiveShadow = true
      room.position.x = x * roomSize - (roomSize * levelPlan.length / 2)
      room.position.z = z * roomSize - (roomSize * levelPlan.length / 2)
      level.add(room)
    }
  })
})

scene.add(level)

const light = new PointLight(0xffee88, 1, 100, 2)
light.add(new Mesh(
  new CylinderBufferGeometry(0.3, 0.3, 3, 8),
  new MeshStandardMaterial({ emissive: 0xffffee, emissiveIntensity: 1 / 0.04, color: 0x000000 })
))
light.castShadow = true
light.power = 10
scene.add(light)

// Move
const position = { x: 4, y: 4 }
const velocity = { x: 0, y: 0 }

window.addEventListener('keydown', e => {
  if (e.key === 'q') velocity.x = Math.max(-1, Math.min(1, velocity.x - 1))
  if (e.key === 'd') velocity.x = Math.max(-1, Math.min(1, velocity.x + 1))
  if (e.key === 'z') velocity.y = Math.max(-1, Math.min(1, velocity.y - 1))
  if (e.key === 's') velocity.y = Math.max(-1, Math.min(1, velocity.y + 1))
})

window.addEventListener('keyup', e => {
  if (e.key === 'q') velocity.x = Math.max(-1, Math.min(1, velocity.x + 1))
  if (e.key === 'd') velocity.x = Math.max(-1, Math.min(1, velocity.x - 1))
  if (e.key === 'z') velocity.y = Math.max(-1, Math.min(1, velocity.y + 1))
  if (e.key === 's') velocity.y = Math.max(-1, Math.min(1, velocity.y - 1))
})

// Animation

raf.subscribe(() => {
  position.x += velocity.x / 5
  position.y += velocity.y / 5
  camera.position.set(
    lerp(camera.position.x, position.x, 0.1),
    20,
    lerp(camera.position.z, position.y + 6, 0.1)
  )
  camera.lookAt(camera.position.x, 0, camera.position.z - 6)
  light.position.set(position.x, 3, position.y)
})

raf.subscribe(() => {
  renderer.render(scene, camera)
})
