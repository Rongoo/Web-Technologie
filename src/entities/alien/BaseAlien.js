import { Alien } from './Alien.js';
//Erweitert Klasse der Alien, bekommt nur ein Leben mehr.
export class BaseAlien extends Alien {
  health = 2;
  constructor(scene, x, y) {
    super(scene, x, y, 'base_alien');
    //scene.add.existing(this);
  }
}
