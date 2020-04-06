import { sRGBEncoding, PCFSoftShadowMap } from 'three'
import { init } from './ts/helpers/three-utils'
import raf from './ts/helpers/raf'
import { lerp } from './ts/helpers/utils'
import { mergeRooms, mapToMesh, addExteriorWalls, mapToWalkable } from './ts/objects/createLevel'
import roomPlans from './assets/rooms'
import { Player } from './ts/objects/Player'
import effects from './ts/effects'
import createMinimap from './ts/minimap'

const { camera, renderer, scene } = init()

renderer.shadowMap.enabled = true
renderer.outputEncoding = sRGBEncoding
renderer.pixelRatio = 2
renderer.shadowMap.enabled = true
renderer.shadowMap.type = PCFSoftShadowMap

const { composer } = effects({ renderer, scene, camera })

const _ = null // same length as a single digit
const levelPlan = [
  [_, 0, 4, _],
  [_, 1, 2, _],
  [1, 3, 1, 0],
  [4, 0, 4, _]
]

const levelMap = addExteriorWalls(mergeRooms(roomPlans, levelPlan), levelPlan)
const level = mapToMesh(levelMap)
level.castShadow = true
level.receiveShadow = true
scene.add(level)

const walkableMap = mapToWalkable(levelMap)

const player = new Player({ walkableMap })
player.position.set(20, 0, 8)
scene.add(player.obj)

createMinimap(walkableMap, [player])

window.addEventListener('keydown', e => {
  if (e.code === 'KeyA') player.velocityX = player.velocity.x - 1
  if (e.code === 'KeyD') player.velocityX = player.velocity.x + 1
  if (e.code === 'KeyW') player.velocityZ = player.velocity.z - 1
  if (e.code === 'KeyS') player.velocityZ = player.velocity.z + 1
})

window.addEventListener('keyup', e => {
  if (e.code === 'KeyA') player.velocityX = player.velocity.x + 1
  if (e.code === 'KeyD') player.velocityX = player.velocity.x - 1
  if (e.code === 'KeyW') player.velocityZ = player.velocity.z + 1
  if (e.code === 'KeyS') player.velocityZ = player.velocity.z - 1
})

// Animation

raf.subscribe(() => {
  camera.position.x = lerp(camera.position.x, player.obj.position.x, 0.05)
  camera.position.y = lerp(camera.position.y, player.obj.position.y + 40, 0.05)
  camera.position.z = lerp(camera.position.z, player.obj.position.z + 6, 0.05)
  camera.lookAt(camera.position.x, 2, camera.position.z - 6)
})

raf.subscribe(() => {
  composer.render()
})
