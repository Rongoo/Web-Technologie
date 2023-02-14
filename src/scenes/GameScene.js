import { Player } from '../entities/player/Player.js';
import { BaseAlien } from '../entities/alien/BaseAlien.js';
import { ShooterAlien } from '../entities/alien/ShooterAlien.js';
import { PauseMenuScene } from './PauseMenuScene.js';
import { GameOverScene } from './GameOverScene.js';
import { UpgradeScene } from './UpgradeScene.js';
import { BossAlien } from '../entities/alien/BossAlien.js';

export class GameScene extends Phaser.Scene {
  keyW;
  keyA;
  keyS;
  keyD;

  keyEsc;
  keySpace;

  canvas;

  player;
  nextUpgrade = 1500;
  lastUpgrade = 0;
  progressbar;
  progressbarBackground;
  progressbarWidth = 200;

  healthDisplay;
  bossHealthbarBackground;
  bossHealthbar;
  bossHealthbarWidth = 200;

  waveDisplay;

  rowCount = 6;
  alienDistance = 40;
  distanceFromTop = 40;
  aliens = [];

  score = 0;
  scoreDisplay;
  cycle = 0;

  wave = 0;
  boss;

  constructor() {
    super('game');
  }

  create() {
    this.canvas = this.sys.game.canvas;

    /* Erstellen der Kollissionskategorien
       Diese werden verwendet um die Art der Kollision zu erfassen 
    */
    this.playerCat = this.matter.world.nextCategory();
    this.playerProCat = this.matter.world.nextCategory();
    this.alienCat = this.matter.world.nextCategory();
    this.alienProCat = this.matter.world.nextCategory();

    // Erstellen des Spieler Objects
    this.player = new Player(
      this,
      this.canvas.width / 2,
      this.canvas.height - 30,
      'player',
      this.playerProCat
    );
    this.player.setCollisionCategory(this.playerCat);

    // Erstellung der Scoreanzeige
    this.scoreDisplay = this.add.text(this.canvas.width / 2 - 20, 10, this.score, {
      align: 'right',
      fixedWidth: this.canvas.width / 2,
      fontSize: '20px',
    });

    // Erstellung der Erfahrungsleiste
    this.progressbarBackground = this.add
      .rectangle(650, 10, this.progressbarWidth, 20, 0x666666)
      .setOrigin(0, 0);
    this.progressbar = this.add
      .rectangle(this.progressbarBackground.x, this.progressbarBackground.y, 1, 20, 0x000066)
      .setOrigin(0, 0);

    // Erstellung der Bosslebensleiste
    this.bossHealthbarBackground = this.add
      .rectangle(250, 10, this.bossHealthbarWidth, 20, 0x666666)
      .setOrigin(0, 0);
    this.bossHealthbarBackground.setVisible(false);

    this.bossHealthbar = this.add
      .rectangle(this.bossHealthbarBackground.x, this.bossHealthbarBackground.y, 1, 20, 0x660000)
      .setOrigin(0, 0);
    this.bossHealthbar.setVisible(false);

    // Erstellung der Spieler Lebensanzeige
    this.healthDisplay = this.add.text(20, 10, this.player.health + '/' + this.player.maxHealth, {
      align: 'left',
      fixedWidth: this.canvas.width / 2,
      fontSize: '20px',
    });

    // Erstellung der Wellenanzeige
    this.waveDisplay = this.add.text(this.canvas.width / 2, 10, 'Wave 1', {
      align: 'left',
      fixedWidth: this.canvas.width / 2,
      fontSize: '20px',
    });

    // Erstellen der KeyListener
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);

    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);

    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.keyEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.keyEsc.on('down', this.pauseGame, this);

    // Kollistionsüberprüfung
    this.matter.world.on(
      'collisionstart',
      (event) => {
        for (let i = 0; i < event.pairs.length; i++) {
          let colliderA = event.pairs[i].bodyA.collisionFilter.category;
          let colliderB = event.pairs[i].bodyB.collisionFilter.category;

          // Überprüfung ob der Spieler getroffen hat
          if (colliderA == this.alienCat && colliderB == this.playerProCat) {
            let alien = event.pairs[i].bodyA.gameObject;
            let projectile = (colliderB = event.pairs[i].bodyB.gameObject);
            if (alien != null && projectile != null) {
              this.shootAlien(projectile, alien);
            }
          } else if (colliderB == this.alienCat && colliderA == this.playerProCat) {
            let alien = event.pairs[i].bodyB.gameObject;
            let projectile = (colliderB = event.pairs[i].bodyA.gameObject);
            if (alien != null && projectile != null) {
              this.shootAlien(projectile, alien);
            }
          }
          // Überprüfung ob der Spieler getroffen wurde
          else if (colliderA == this.playerCat && colliderB == this.alienProCat) {
            let player = event.pairs[i].bodyA.gameObject;
            let projectile = (colliderB = event.pairs[i].bodyB.gameObject);
            projectile.remove();
            if (player != null && projectile != null) {
              this.shootPlayer(player);
            }
          } else if (colliderB == this.playerCat && colliderA == this.alienProCat) {
            let player = event.pairs[i].bodyB.gameObject;
            let projectile = (colliderB = event.pairs[i].bodyA.gameObject);
            projectile.remove();
            if (player != null) {
              this.shootPlayer(player);
            }
          }
        }
      },
      this
    );

    this.generateAliens();
  }

  update() {
    /*
      Die cycle Variable wird verwendet um den Abklingzeit der Schüsse zuberechnen
    */
    this.cycle++;

    // Überprüfen, ob der Spieler verloren hat
    if (this.player.health <= 0) {
      this.gameOver();
    }

    // Überprüfung, ob eine der relevanten Tasten gedrückt sind
    if (this.keyW.isDown || this.keySpace.isDown || this.keyUp.isDown) {
      this.player.shootProjectile(this.cycle);
    }
    if (this.keyA.isDown || this.keyLeft.isDown) {
      this.player.move(-1);
    }
    if (this.keyS.isDown) {
      // Spezial fähigkeit?
    }
    if (this.keyD.isDown || this.keyRight.isDown) {
      this.player.move(1);
    }

    // Überprüfung, ob die Aliens die schießen können schießen dürfen
    this.aliens.forEach((row) => {
      row.forEach((alien) => {
        if ((alien instanceof ShooterAlien || alien instanceof BossAlien) && alien.active) {
          alien.shootProjectile(this.cycle);
        }
      });
    });

    // Entfert Reihen aus der Simulation, die keine lebendigen Aliens hat
    this.removeAlienEmptyRow();

    // Überprüft, ob die Aliens am Rand sind und um drehen müssen
    this.alienMovement();

    // Überprüft, ob der Score des Spielers hoch genug ist um ein neues Upgrade zu erhalten
    this.checkForUpgrade();

    // Aktualisiert die HP des Spieler und des Bosses (falls vorhanden)
    this.updateHealth();
    this.updateBossHealthbar();
  }

  gameOver() {
    this.scene.pause();
    // Wird benötigt, da es zu einem doppelten durchführen kommen kann und der name der Scene dann nicht mehr eindeutig wäre
    if (!this.scene.get('game-over')) {
      // Startet die "Game Over" Scene
      this.scene.add('game-over', GameOverScene);
      this.scene.launch('game-over', { score: this.score });
    }
  }

  checkForUpgrade() {
    if (this.nextUpgrade <= this.score) {
      this.lastUpgrade = this.nextUpgrade;
      this.nextUpgrade += Math.floor(1.2 * Math.sqrt(this.player.level) * 1500);
      this.player.level++;
      this.scene.pause();
      // Wird benötigt, da es zu einem doppelten durchführen kommen kann und der name der Scene dann nicht mehr eindeutig wäre
      if (!this.scene.get('upgrade')) {
        // Startet die "Upgrade" Scene
        this.scene.add('upgrade', UpgradeScene);
        this.scene.launch('upgrade', { player: this.player });
      }
      this.updateProgressbar();
    }
  }

  pauseGame() {
    this.scene.pause();
    // Wird benötigt, da es zu einem doppelten durchführen kommen kann und der name der Scene dann nicht mehr eindeutig wäre
    if (!this.scene.get('pause-menu')) {
      // Startet das "Pause" Menü
      this.scene.add('pause-menu', PauseMenuScene);
      this.scene.launch('pause-menu');
    }
  }

  removeAlienEmptyRow() {
    let rowToRemove = -1;

    this.aliens.forEach((alienRow) => {
      // Überprüft ob mindestens ein Alien in der Reihe noch aktive ist
      let shouldRemove = true;
      alienRow.forEach((alien) => {
        if (alien.visible) {
          alien.active = true;
        }
        if (alien.active) {
          shouldRemove = false;
        }
      });
      if (shouldRemove) {
        rowToRemove = this.aliens.findIndex((e) => e === alienRow);
      }
    });
    // Entfernt die letzte leere Reihe
    if (rowToRemove >= 0) {
      this.aliens.splice(rowToRemove, 1);
    }
    // Überprüft, ob es keine aktiven Reihen mehr gibt
    if (this.aliens.length === 0) {
      // Entfernt Spieler Projektile
      this.player.projectiles.forEach((p) => {
        if (p.active) {
          p.remove();
        }
      });
      this.player.projectiles = [];

      // Startet eine neue Welle nach 2 Sekunden
      setTimeout(this.generateAliens(), 2000);
    }
  }

  generateAliens() {
    this.updateWave();
    // Überprüft, ob eine Bosswelle gestartet werden soll
    if (this.wave % 3) {
      this.normalWave();
    } else {
      this.bossWave();
    }
  }

  bossWave() {
    let alienRow = [];

    // Erstellt die Basis des BossAliens
    let x = this.canvas.width / 2;
    let bossAlien = new BossAlien(this, x, 100, this.alienProCat, this.cycle);
    bossAlien.setCollisionCategory(this.alienCat);
    bossAlien.setVelocityX(bossAlien.speed);

    // Setzt die HP anhand der aktuellen Wellennummer
    var hp = this.wave / 2;
    bossAlien.health = Math.ceil(bossAlien.health * hp);
    bossAlien.maxHealth = bossAlien.health;

    // Setzt die globale Referenz für die HP Leiste
    this.boss = bossAlien;

    // Fügt die Adds auf der linken Seite hinzu
    for (let i = 5; i >= 0; i--) {
      let x = bossAlien.x - (60 + i * 30);
      let y = bossAlien.y + (i % 2 ? 10 : 0);
      let add = new ShooterAlien(this, x, y, this.alienProCat, this.cycle);
      add.setVelocityX(bossAlien.speed);
      add.health = Math.ceil(5 * hp);
      add.setCollisionCategory(this.alienCat);
      alienRow.push(add);
    }

    // Setzt das Boss Alien in die Mitte
    alienRow.push(bossAlien);

    // Fügt die Adds auf der rechten Seite hinzu
    for (let i = 0; i < 6; i++) {
      let x = bossAlien.x + (60 + i * 30);
      let y = bossAlien.y + (i % 2 ? 10 : 0);
      let add = new ShooterAlien(this, x, y, this.alienProCat, this.cycle);
      add.setVelocityX(bossAlien.speed);
      add.health = Math.ceil(5 * hp);
      add.setCollisionCategory(this.alienCat);
      alienRow.push(add);
    }

    // Setzt die Welle als aktuelle Welle
    this.aliens.push(alienRow);

    // Aktiviert die Boss HP Leiste
    this.shouldShowBossHealthbar = true;
    this.showBossHealthbar();
  }

  normalWave() {
    // Berechnet wie viele Aliens pro Reihe erstellt werden sollen
    let spriteWidth = this.textures.get('base_alien').getSourceImage().width;
    let alienCount = Math.floor(((this.canvas.width / spriteWidth) * 0.4) / 4) * 4 + 2;
    // Berechnet wie viele Aliens insgesamt im Spiel sind
    var maxAliens = alienCount * 6 - 3;
    console.log(maxAliens);
    // Setzt Boss Variablen zurück
    this.shouldShowBossHealthbar = false;
    this.showBossHealthbar();
    this.boss = null;

    // Berechnet wie viele Punkt ungefähr in dieser Welle seinen sollen
    var difficulty = maxAliens * 100 + 300 + Math.log10(this.wave) * 1000;

    // Zieht dem basis Score ab und berechnet wie viele "Shooter" geben sollte
    var leftover = difficulty - maxAliens * 100;
    var shooter = leftover / 50;

    // Berechnet den HP Multiplikator
    var hp = this.wave / 2;

    // Berechnet viele "Shooter" es pro Reihe geben sollte
    var shooterPerRow = Math.floor(shooter / this.rowCount);

    for (let row = 0; row < this.rowCount; row++) {
      // Berechnet wie viele Aliens es in der aktuellen Reihe geben soll
      let rowAlienCount = alienCount;
      if (row % 2 === 1) {
        rowAlienCount--;
      }

      // Berechnet den Abstand zur Wand
      let marign = (this.canvas.width - this.alienDistance * rowAlienCount) / 2 - spriteWidth;

      let alienRow = [];
      // Wahrscheinlichkeit, dass ein Alien ein Shooter wird
      let shooterPorp = shooterPerRow / rowAlienCount;

      for (let i = 1; i <= rowAlienCount; i++) {
        // Berechnen der Alien Position
        let x = this.alienDistance * i + marign;
        let y = this.distanceFromTop + spriteWidth + this.alienDistance * row;

        let alien;
        // Generiert eine Zufallszahl und überprüft ob ein Shooter erstellt werden soll
        if (shooterPorp > Math.random()) {
          alien = new ShooterAlien(this, x, y, this.alienProCat, this.cycle);
        } else {
          alien = new BaseAlien(this, x, y);
        }
        alien.setCollisionCategory(this.alienCat);
        alien.setVelocityX(alien.speed);

        // Skaliert die HP des Aliens mit Hilfe des HP Multiplikators
        alien.health = Math.ceil(alien.health * hp);

        alienRow.push(alien);
      }
      // Fügt die Reihe dem Spielfeld hinzu
      this.aliens.push(alienRow);
    }
  }

  updateHealth() {
    this.healthDisplay.setText(this.player.health + '/' + this.player.maxHealth);
  }

  updateScore(number) {
    // Rundet den Score auf eine ganze Zahl und zeigt ihn an
    this.score += Math.floor(number);
    this.scoreDisplay.setText(this.score);
    this.updateProgressbar();
  }

  updateWave() {
    this.wave++;
    this.waveDisplay.setText('Wave ' + this.wave);
  }

  updateProgressbar() {
    // Berechnet den Score, der seid dem letzen Upgrade dazu gekommen ist
    let newScore = this.score - this.lastUpgrade;

    // Berechnet den Score, der für das nächst Upgrade benötigt wird
    let nextLevel = this.nextUpgrade - this.lastUpgrade;

    // Berechnet wie breit die Erfahrungsleiste seinen muss und setzt sie
    let progressbarSize = this.progressbarWidth * (newScore / nextLevel);
    progressbarSize =
      progressbarSize > this.progressbarWidth ? this.progressbarWidth : progressbarSize;
    this.progressbar.setSize(progressbarSize, 20);
  }

  alienMovement() {
    this.aliens.forEach((row) => {
      let active = row.filter((x) => x.active);
      if (active.length > 0) {
        let dir = 0;
        // Überprüft Alien der am weitestens links, ob er die Wand berührt
        if (active[0].x - active[0].width / 2 <= 0) {
          dir = 1;
        }
        // Überprüft Alien der am weitestens rechts, ob er die Wand berührt
        else if (
          active[active.length - 1].x + active[active.length - 1].width / 2 >=
          this.canvas.width
        ) {
          dir = -1;
        }
        // Wenn eine Wand berührt wird die Geschwindigkeit der Aliens angepasst
        if (dir !== 0) {
          active.forEach((alien) => {
            alien.setVelocityX(alien.speed * dir);
          });
        }
      }
    });
  }

  shootAlien(projectile, alien) {
    projectile.remove();
    alien.health -= this.player.damage;
    // Entfernt das Alien, wenn es 0 oder weniger HP hat
    if (alien.health <= 0) {
      this.updateScore(alien.killScore * this.player.scoreMultiplier);
      alien.destroy();
    }
  }
  shootPlayer(player) {
    player.health--;
    this.updateHealth();
  }

  showBossHealthbar() {
    this.bossHealthbarBackground.setVisible(this.shouldShowBossHealthbar);
    this.bossHealthbar.setVisible(this.shouldShowBossHealthbar);
  }

  updateBossHealthbar() {
    if (this.boss != null && this.shouldShowBossHealthbar) {
      let healthbarSize = this.bossHealthbarWidth * (this.boss.health / this.boss.maxHealth);
      healthbarSize = healthbarSize < 0 ? 0 : healthbarSize;
      this.bossHealthbar.setSize(healthbarSize, 20);
    }
  }
}
