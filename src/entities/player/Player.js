import { Projectile } from '../projectiles/Projectile.js';

export class Player extends Phaser.Physics.Matter.Sprite {
  lastFired = 0;
  firerate = 60; // cap => 10
  shotSpeed = 5;
  projetileCount = 200;
  amountUpgradesOffered = 3;
  speed = 4;
  maxHealth = 3;
  health = this.maxHealth;
  shots = 1; // cap => 10
  scoreMultiplier = 1;
  damage = 1;

  level = 1;

  projectiles = [];
  proCat;
  constructor(scene, x, y, sprite, proCat) {
    super(scene.matter.world, x, y, sprite);
    scene.add.existing(this);
    this.setPosition(x, y);
    this.setTexture(sprite);
    this.setBounce(0);
    this.proCat = proCat;
    this.body.isSensor = true;
  }

  move(dir) {
    //out of bounds protection
    var canvas = this.scene.sys.game.canvas;
    if (
      (this.x + 10 + dir < canvas.width && this.x - 10 + dir > 0) ||
      (this.x + 10 > canvas.width && dir < 0) ||
      (this.x - 10 < 0 && dir > 0)
    ) {
      this.x += dir * this.speed;
    }
  }

  shootProjectile(cycle) {
    if (cycle >= this.lastFired + this.firerate) {
      let maxAngel = 400;
      let angleToSub = Math.floor(8 / this.shots);
      let actualAngle = maxAngel - angleToSub * 50;
      let angleForProjectile = actualAngle / (this.shots == 1 ? this.shots : this.shots - 1);
      for (let i = 0; i < this.shots; i++) {
        let pro = new Projectile(
          this.scene,
          this.x,
          this.y - 10,
          -this.shotSpeed,
          (actualAngle / 2 - angleForProjectile * i) * 0.005,
          'projectile'
        );
        pro.setCollisionCategory(this.proCat);
        this.projectiles.push(pro);
      }
      this.lastFired = cycle;
    }
  }
}
