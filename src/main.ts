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

// const _ = null // same length as a single digit
// const levelPlan = [
//   [_, 0, 4, _],
//   [_, 1, 2, _],
//   [1, 3, 1, 0],
//   [4, 0, 4, _]
// ]

function generateLevelPlan (plans, numberOfRooms) {
  const currentPos = { x: 0, y: 0 }
  const rooms = new Array(numberOfRooms).fill({ value: null, x: undefined, y: undefined })

  for (let iteration = 0; iteration < numberOfRooms; iteration++) {
    rooms[iteration] = {
      value: Math.floor(Math.random() * plans.length),
      ...currentPos
    }

    while (rooms.filter(room => room.x === currentPos.x && room.y === currentPos.y).length > 0) {
      if (Math.random() > 0.5) {
        currentPos.x += Math.random() > 0.5 ? 1 : -1
      } else {
        currentPos.y += Math.random() > 0.5 ? 1 : -1
      }
    }
  }

  const min = {
    x: Math.min(...rooms.map(room => room.x)),
    y: Math.min(...rooms.map(room => room.y))
  }

  const max = {
    x: Math.max(...rooms.map(room => room.x)),
    y: Math.max(...rooms.map(room => room.y))
  }

  const size = Math.max(
    max.x - min.x + 1,
    max.y - min.y + 1
  )

  const plan = new Array(size).fill(new Array(size).fill(null))

  return {
    startRoom: { x: -min.x, y: -min.y },
    plan: plan.map((row, y) => {
      return row.map((_, x) => {
        const okRooms = rooms.filter(room => room.x - min.x === x && room.y - min.y === y)
        return okRooms.length > 0 ? okRooms[0].value : null
      })
    })
  }
}

const levelPlan = generateLevelPlan(roomPlans, 10)

const levelMap = addExteriorWalls(mergeRooms(roomPlans, levelPlan.plan), levelPlan.plan)
const level = mapToMesh(levelMap)
level.castShadow = true
level.receiveShadow = true
scene.add(level)

const walkableMap = mapToWalkable(levelMap)

const player = new Player({ walkableMap })
player.position.set(levelPlan.startRoom.x * 16 + 7.5, 0, levelPlan.startRoom.y * 16 + 4)
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
