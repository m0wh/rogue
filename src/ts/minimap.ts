// eslint-disable-next-line no-unused-vars
import { Player } from './objects/Player'
import raf from './helpers/raf'

export default function createMinimap (mapArray: boolean[][], players: Player[]): void {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  const pixelSize = 5

  canvas.style.position = 'absolute'
  canvas.style.right = (pixelSize / 2) + 'px'
  canvas.style.top = (pixelSize / 2) + 'px'

  canvas.width = mapArray[0].length * pixelSize
  canvas.height = mapArray.length * pixelSize
  canvas.style.width = mapArray[0].length * (pixelSize / 2) + 'px'
  canvas.style.height = mapArray.length * (pixelSize / 2) + 'px'

  document.body.append(canvas)

  raf.subscribe(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    mapArray.forEach((row, y) => {
      row.forEach((pixel, x) => {
        ctx.fillStyle = 'white'
        if (pixel) ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
      })
    })

    players.forEach(player => {
      ctx.fillStyle = 'red'
      const x = player.position.x
      const y = player.position.z
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
    })
  })
}
