import { Projectile } from '../projectiles/Projectile.js';
import { Alien } from './Alien.js';
//Erweitert ebenfalls die Klasse der Alien, bekommt aber deutlich erhöhte und Zusätzliche Eigenschaften: Schnelleres schießen und mehr Kugeln
export class BossAlien extends Alien {
  health = 75;
  maxHealth = 75;
  killScore = 4000;
  shotSpeed = 5;
  shots = 4;

  constructor(scene, x, y, proCat, cycle) {
    super(scene, x, y, 'boss_alien');
    this.lastFired = cycle;
    this.laserCooldown = 50 + Math.floor(Math.random() * 300);
    this.proCat = proCat;
  }

  shootProjectile(cycle) {
    if (cycle >= this.lastFired + this.laserCooldown) {
      let maxAngel = 400;
      let angleToSub = Math.floor(8 / this.shots);
      let actualAngle = maxAngel - angleToSub * 50;
      let angleForProjectile = actualAngle / (this.shots == 1 ? this.shots : this.shots - 1);
      for (let i = 0; i < this.shots; i++) {
        let pro = new Projectile(
          this.scene,
          this.x,
          this.y + 30,
          this.shotSpeed,
          (actualAngle / 2 - angleForProjectile * i) * 0.005,
          'goo'
        );
        pro.setCollisionCategory(this.proCat);
      }
      this.lastFired = cycle;
    }
  }
}
