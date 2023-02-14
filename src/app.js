import { MainMenuScene } from './scenes/MainMenuScene.js';

var config = {
  type: Phaser.WEBGL,
  fps: {
    
    target: 140,
    forceSetTimeOut: true,
  },
  width: 1000,
  height: 800,
  parent: 'game',
  physics: {
    default: 'matter',
    matter: {
      gravity: { y: 0 },
    },
  },
  scene: [MainMenuScene],
};
const game = new Phaser.Game(config);
