import { PointLight, Mesh, CylinderBufferGeometry, MeshStandardMaterial, Object3D, Vector3 } from 'three'
import raf from '../helpers/raf'
import { lerp } from '../helpers/utils'

export class Player {
  public position = new Vector3(0, 0, 0)
  public velocity = new Vector3(0, 0, 0)
  private lerpVelocity = new Vector3(0, 0, 0)
  public obj = new Object3D()
  private walkableMap: boolean[][] | null
  private radius: number = 0.5

  constructor ({ walkableMap = null }: { walkableMap: boolean[][] | null }) {
    this.walkableMap = walkableMap

    const light = new PointLight(0xFFCC88, 1, 100, 2)
    const lightObj = new Mesh(new CylinderBufferGeometry(this.radius / 2, this.radius, 3, 8), new MeshStandardMaterial({ emissive: 0xffffee, emissiveIntensity: 1 / 0.04, color: 0x000000 }))
    lightObj.position.y = -2
    light.add(lightObj)
    light.castShadow = true
    light.power = 10
    light.shadow.mapSize.width = 2048
    light.position.set(0.5, 5.5, 0.5)
    light.shadow.mapSize.height = 2048
    this.obj.add(light)

    raf.subscribe(() => {
      const canWalkOn = (x, z) => this.walkableMap[Math.round(z)][Math.round(x)]

      const newLerpVelocity = new Vector3(
        lerp(this.lerpVelocity.x, this.velocity.x, 0.2),
        lerp(this.lerpVelocity.y, this.velocity.y, 0.1),
        lerp(this.lerpVelocity.z, this.velocity.z, 0.2)
      )

      this.lerpVelocity.copy(newLerpVelocity)

      if (canWalkOn(this.position.x + this.lerpVelocity.x / 5 + (this.lerpVelocity.x > 0 ? this.radius : -this.radius), this.position.z)) {
        this.position.x += this.lerpVelocity.x / 5
      } else {
        this.lerpVelocity.x = 0
      }

      if (canWalkOn(this.position.x, this.position.z + this.lerpVelocity.z / 5 + (this.lerpVelocity.z > 0 ? this.radius : -this.radius))) {
        this.position.z += this.lerpVelocity.z / 5
      } else {
        this.lerpVelocity.z = 0
      }

      this.position.y += this.lerpVelocity.y / 5

      this.obj.position.set(this.position.x, 0, this.position.z)
    })
  }

  set velocityX (value) { this.velocity.x = Math.max(-1, Math.min(1, value)) }
  set velocityZ (value) { this.velocity.z = Math.max(-1, Math.min(1, value)) }
}
