import { GameScene } from './GameScene.js';
import { HighScoreScene } from './HighScoreScene.js';

export class MainMenuScene extends Phaser.Scene {
  cursors;
  canvas;
  index = 0;

  playButton;
  highscoreButton;

  selected;
  lastButtonChange = -200;

  keyW;
  keyUp;
  keyS;
  keyDown;
  keySpace;
  keyEnter;

  constructor() {
    super('main-menu');
  }

  preload() {
    this.load.image('start', 'assets/buttons/start.png');
    this.load.image('cancel', 'assets/buttons/cancel.png');
    this.load.image('selected', 'assets/buttons/selected.png');

    this.load.image('upgrade', 'assets/buttons/upgrade.png');
    this.load.image('selected_upgrade', 'assets/buttons/selected_upgrade.png');

    this.load.image('sky', 'assets/background/nasa_stars.jpg');
    this.load.image('player', 'assets/character/player/player.png');
    this.load.image('projectile', 'assets/character/player/laser.png');

    this.load.image('base_alien', 'assets/character/alien/base_alien.png');
    this.load.image('boss_alien', 'assets/character/alien/boss_alien.png');
    this.load.image('shooter_alien', 'assets/character/alien/shooter_alien.png');
    this.load.image('goo', 'assets/character/alien/goo.png');
  }

  create() {
    this.canvas = this.sys.game.canvas;
    this.cursors = this.input.keyboard.createCursorKeys();

    this.playButton = this.add.sprite(this.canvas.width * 0.5, this.canvas.height * 0.6, 'start');
    this.playButton.setInteractive().on(
      'pointerdown',
      function startGame(pointer) {
        this.startGame();
      },
      this
    );

    this.playButton.on(
      'pointerover',
      function startGame(pointer) {
        this.selected.setPosition(this.playButton.x, this.playButton.y);
        this.index = 0;
      },
      this
    );

    this.add.text(this.playButton.x, this.playButton.y, 'Play').setOrigin(0.5);

    this.highscoreButton = this.add.sprite(
      this.canvas.width * 0.5,
      this.canvas.height * 0.7,
      'cancel'
    );

    this.add.text(this.highscoreButton.x, this.highscoreButton.y, 'Highscores').setOrigin(0.5);

    this.highscoreButton.setInteractive().on('pointerdown', function startGame(pointer) {}, this);

    this.highscoreButton.setInteractive().on(
      'pointerdown',
      function startGame(pointer) {
        this.startHighscore();
      },
      this
    );

    this.highscoreButton.on(
      'pointerover',
      function startGame(pointer) {
        this.selected.setPosition(this.highscoreButton.x, this.highscoreButton.y);
        this.index = 1;
      },
      this
    );

    this.selected = this.add.image(this.canvas.width * 0.5, this.canvas.height * 0.6, 'selected');

    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);

    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
  }

  confirmSelection() {
    if (this.index == 0) {
      this.startGame();
    } else if (this.index == 1) {
      this.startHighscore();
    }
  }

  startGame() {
    this.scene.add('game', GameScene);
    this.scene.start('game');
  }

  startHighscore() {
    this.scene.add('highscore', HighScoreScene);
    this.scene.start('highscore');
  }

  selectNextButton(num) {
    if (this.index + num < 0) {
      this.index = 1;
    } else if (this.index + num > 1) {
      this.index = 0;
    } else {
      this.index += num;
    }
    this.selected.setPosition(
      this.canvas.width * 0.5,
      this.canvas.height * (0.6 + this.index * 0.1)
    );
  }

  update() {
    if (window.performance.now() - this.lastButtonChange > 200) {
      if (this.keyS.isDown || this.keyDown.isDown) {
        this.selectNextButton(-1);
        this.lastButtonChange = window.performance.now();
      } else if (this.keyW.isDown || this.keyUp.isDown) {
        this.selectNextButton(1);
        this.lastButtonChange = window.performance.now();
      } else if (this.keySpace.isDown || this.keyEnter.isDown) {
        this.confirmSelection();
        this.lastButtonChange = window.performance.now();
      }
    }
  }
}
