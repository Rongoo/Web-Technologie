export class UpgradeScene extends Phaser.Scene {
  keyA;
  keyLeft;
  keyD;
  keyRight;

  keyEnter;
  keySpace;

  lastButtonChange = -200;

  player;

  index = 0;
  upgradeButtons = [];
  selected;
  selectableUpgrades = [];
  upgrades = [
    { id: 0, name: 'Firedelay', buttonText: '-4', execute: (player) => (player.firerate -= 4) },
    { id: 1, name: 'Speed', buttonText: '+1', execute: (player) => (player.speed += 0.5) },
    { id: 2, name: 'Max Health', buttonText: '+1', execute: (player) => (player.maxHealth += 1) },
    {
      id: 3,
      name: 'Heal',
      buttonText: '2 Hp',
      execute: (player) => {
        if (player.health + 2 >= this.player.maxHealth) {
          player.health = player.maxHealth;
        } else {
          player.health += 2;
        }
      },
    },
    {
      id: 4,
      name: 'Extra Projectile',
      buttonText: '+1',
      execute: (player) => (player.shots += 1),
    },
    {
      id: 5,
      name: 'Score Multiplier',
      buttonText: '+0.1',
      execute: (player) => (player.scoreMultiplier += 0.1),
    },
    {
      id: 6,
      name: 'Upgrades Offered',
      buttonText: '+1',
      execute: (player) => (player.amountUpgradesOffered += 1),
    },
    {
      id: 7,
      name: 'Damage',
      buttonText: '+0.5',
      execute: (player) => (player.damage += 0.5),
    },
  ];

  amountUpgradesOffered = 3;

  constructor() {
    super('upgrade');
  }

  init(data) {
    this.cameras.main.setBackgroundColor('rgba(50, 50, 50, 100)');
    this.player = data.player;
    this.amountUpgradesOffered = this.player.amountUpgradesOffered;
  }

  create() {
    this.canvas = this.sys.game.canvas;
    this.cursors = this.input.keyboard.createCursorKeys();
    this.index = 0;

    // score

    this.add
      .text(this.canvas.width * 0.5, this.canvas.height * 0.35, 'Choose an upgrade', {
        fontSize: '35px',
      })
      .setOrigin(0.5);

    // upgrade buttons
    this.generateUpgradeButtons();

    // keylistener
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
  }

  generateUpgradeButtons() {
    let spriteWidth = this.textures.get('upgrade').getSourceImage().width;
    let offset = 200;
    let drawingWidth = this.canvas.width - offset;
    let distance = drawingWidth / (this.amountUpgradesOffered - 1);

    // Generiert amountUpgradesOffered Knöpfe
    for (let i = 0; i < this.amountUpgradesOffered; i++) {
      let sprite = this.add.sprite(offset / 2 + distance * i, this.canvas.height * 0.6, 'upgrade');
      this.children.bringToTop(sprite);
      sprite.on(
        'pointerover',
        function startGame(pointer) {
          this.selected.setPosition(sprite.x, sprite.y);
          this.index = i;
        },
        this
      );
      this.upgradeButtons.push(sprite);
    }

    this.selected = this.add.sprite(
      this.upgradeButtons[0].x,
      this.upgradeButtons[0].y,
      'selected_upgrade'
    );

    //Wählt zufällig amountUpgradesOffered Upgrades aus und zeigt sie dem Spieler
    let availableUpgrades = this.getAvailableUpgrades();
    for (let i = 0; i < this.amountUpgradesOffered; i++) {
      let index = this.getRandomUpgrade(availableUpgrades.length);
      let upgrade = availableUpgrades.splice(index, 1)[0];
      this.selectableUpgrades.push(upgrade);
      this.upgradeButtons[i].setInteractive().on(
        'pointerdown',
        function startGame(pointer) {
          this.applyUpgrade(upgrade);
        },
        this
      );
      // Fügt die Beschriftung ein
      this.children.bringToTop(
        this.add
          .text(
            this.upgradeButtons[i].x,
            this.upgradeButtons[i].y + 10 + spriteWidth / 2,
            upgrade.name
          )
          .setOrigin(0.5)
      );
      this.children.bringToTop(
        this.add
          .text(this.upgradeButtons[i].x, this.upgradeButtons[i].y, upgrade.buttonText, {
            color: 'grey',
          })
          .setOrigin(0.5)
      );
    }
  }

  update() {
    if (window.performance.now() - this.lastButtonChange > 200) {
      if (this.keyA.isDown || this.keyLeft.isDown) {
        this.selectNextButton(-1);
        this.lastButtonChange = window.performance.now();
      } else if (this.keyD.isDown || this.keyRight.isDown) {
        this.selectNextButton(1);
        this.lastButtonChange = window.performance.now();
      } else if (this.keySpace.isDown || this.keyEnter.isDown) {
        this.confirmSelection();
      }
    }
  }

  confirmSelection() {
    this.applyUpgrade(this.selectableUpgrades[this.index]);
  }

  selectNextButton(num) {
    if (this.index + num < 0) {
      this.index = this.upgradeButtons.length - 1;
    } else if (this.index + num > this.upgradeButtons.length - 1) {
      this.index = 0;
    } else {
      this.index += num;
    }
    let offset = 200;
    let drawingWidth = this.canvas.width - offset;
    let distance = drawingWidth / (this.amountUpgradesOffered - 1);
    this.selected.setPosition(offset / 2 + distance * this.index, this.canvas.height * 0.6);
  }

  getRandomUpgrade(num) {
    let random = Math.floor(Math.random() * num);
    return random;
  }

  applyUpgrade(upgrade) {
    upgrade.execute(this.player);
    this.scene.resume('game');
    this.scene.remove(this);
  }

  getAvailableUpgrades() {
    // Filtert Upgrades, die nicht mehr ausgewählt werden können
    let availableUpgrades = this.upgrades.slice();
    if (this.player.amountUpgradesOffered >= 5) {
      let index = availableUpgrades.findIndex((e) => e.id === 6);
      availableUpgrades.splice(index, 1);
    }

    if (this.player.shots >= 10) {
      let index = availableUpgrades.findIndex((e) => e.id === 4);
      availableUpgrades.splice(index, 1);
    }

    if (this.player.firerate <= 20) {
      let index = availableUpgrades.findIndex((e) => e.id === 0);
      availableUpgrades.splice(index, 1);
    }
    // add conditions for upgrades

    return availableUpgrades;
  }
}
