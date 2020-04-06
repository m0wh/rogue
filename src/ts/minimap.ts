// eslint-disable-next-line no-unused-vars
import { Player } from './objects/Player'
import raf from './helpers/raf'

export default function createMinimap (mapArray: boolean[][], players: Player[]): void {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  canvas.style.position = 'absolute'
  canvas.style.right = '0'
  canvas.style.top = '0'

  canvas.width = mapArray[0].length * 3
  canvas.height = mapArray.length * 3
  canvas.style.width = mapArray[0].length * 3 + 'px'
  canvas.style.height = mapArray.length * 3 + 'px'

  document.body.append(canvas)

  raf.subscribe(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    mapArray.forEach((row, y) => {
      row.forEach((pixel, x) => {
        ctx.fillStyle = 'white'
        if (pixel) ctx.fillRect(x * 3, y * 3, 3, 3)
      })
    })

    players.forEach(player => {
      ctx.fillStyle = 'red'
      const x = Math.round(player.position.x)
      const y = Math.round(player.position.z)
      ctx.fillRect(x * 3, y * 3, 3, 3)
    })
  })
}
