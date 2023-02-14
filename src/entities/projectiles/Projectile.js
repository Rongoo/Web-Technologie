export class Projectile extends Phaser.Physics.Matter.Sprite {
  constructor(scene, x, y, speed, angle, sprite) {
    super(scene.matter.world, x, y, sprite);
    scene.add.existing(this);
    this.setPosition(x, y);
    this.setTexture(sprite);
    this.setFrictionAir(0);
    this.fire(x, y, speed, angle);
    this.body.isSensor = true;
  }

  fire(x, y, speed, angle) {
    this.setPosition(x, y);

    this.setActive(true);
    this.setVisible(true);

    this.setVelocityY(speed);
    this.setVelocityX(angle);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    var canvas = this.scene.sys.game.canvas;
    if (this.y <= 0 || this.y >= canvas.height || this.x <= 0 || this.x >= canvas.width) {
      this.remove();
    }
  }

  remove() {
    this.setPosition(-100, -100);
    this.setActive(false);
    this.setVisible(false);
    this.destroy();
  }
}
