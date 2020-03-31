export default class RAF {
  private subscribers: Array<RAFSubscription> = []

  constructor () {
    this.update()
  }

  public subscribe (f: () => void): RAFSubscription {
    const sub = new RAFSubscription(f)
    this.subscribers.push(sub)
    return sub
  }

  public unSubscibe (sub: RAFSubscription): void {
    const index = this.subscribers.indexOf(sub)
    this.subscribers.splice(index)
  }

  private update (): void {
    this.subscribers.forEach(sub => {
      sub.execute()
    })
    requestAnimationFrame(this.update.bind(this))
  }
}

class RAFSubscription {
  private f: () => void = () => {}
  private isPlaying: boolean = true

  constructor (f) {
    this.f = f
  }

  public play (): void { this.isPlaying = true }
  public pause (): void { this.isPlaying = false }

  public execute (force: boolean = false): void {
    if (this.isPlaying || force) {
      this.f()
    }
  }
}
