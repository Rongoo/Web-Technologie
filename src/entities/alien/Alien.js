//Klasse die Grundeigenschaften von Alien definiert => Punkte bei Abschuss, Bewegungsgeschwindigkeit, Leben
export class Alien extends Phaser.Physics.Matter.Sprite {
  killScore = 100;
  speed = 1;
  health = 1;

  constructor(scene, x, y, sprite) {
    super(scene.matter.world, x, y, sprite);
    scene.add.existing(this);
    this.setPosition(x, y);
    this.setTexture(sprite);
    this.setFrictionAir(0);
    this.setBounce(0);
    this.body.isSensor = true;
  }
}
