import './style.css'
import Phaser from 'phaser'

import { MainScene } from './game/MainScene'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: '#0b0e14',
  scene: [MainScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
  },
}

new Phaser.Game(config)
