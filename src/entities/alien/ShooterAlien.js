import { Alien } from './Alien.js';
import { Projectile } from '../projectiles/Projectile.js';
//Erweitert ebenfalls die Klasse der Alien, bekommt aber Zusätzliche Eigenschaft: schießen
export class ShooterAlien extends Alien {
  killScore = 150;
  lastFired = 0;
  shotSpeed = 2;
  health = 1;

  proCat;
  constructor(scene, x, y, proCat, cycle) {
    super(scene, x, y, 'shooter_alien');
    this.lastFired = cycle;
    this.laserCooldown = 50 + Math.floor(Math.random() * 300);
    this.proCat = proCat;
  }

  shootProjectile(cycle) {
    if (cycle >= this.lastFired + this.laserCooldown) {
      let angle = 2 - Math.floor(Math.random() * 5);
      let pro = new Projectile(this.scene, this.x, this.y - 10, this.shotSpeed, angle, 'goo');
      pro.setCollisionCategory(this.proCat);
      this.laserCooldown = 100 + Math.floor(Math.random() * 400);
      this.lastFired = cycle;
    }
  }
}
