import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { Vector2 } from 'three'

export default function composer ({ renderer, scene, camera }) {
  const composer = new EffectComposer(renderer)
  const bloomFx = new UnrealBloomPass(new Vector2(window.innerWidth, window.innerHeight), 0.3, 0.1, 0.01)
  const fxaa = new ShaderPass(FXAAShader)
  composer.setSize(window.innerWidth, window.innerHeight)
  composer.addPass(new RenderPass(scene, camera))
  composer.addPass(bloomFx)
  composer.addPass(fxaa)

  return { composer }
}
