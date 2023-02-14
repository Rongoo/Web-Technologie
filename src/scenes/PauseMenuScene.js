export class PauseMenuScene extends Phaser.Scene {
  keyW;
  keyUp;
  keyS;
  keyDown;

  keyEnter;
  keyEsc;
  keySpace;

  lastButtonChange = -200;

  index = 0;
  resumeButton;
  mainMenuButton;

  constructor() {
    super();
  }

  init() {
    this.cameras.main.setBackgroundColor('rgba(50, 50, 50, 100)');
  }

  create() {
    this.canvas = this.sys.game.canvas;
    this.cursors = this.input.keyboard.createCursorKeys();
    this.index = 0;

    this.resumeButton = this.add.sprite(this.canvas.width * 0.5, this.canvas.height * 0.6, 'start');
    this.add.text(this.resumeButton.x, this.resumeButton.y, 'Resume').setOrigin(0.5);

    this.resumeButton.setInteractive().on(
      'pointerdown',
      function startGame(pointer) {
        this.unpauseGame();
      },
      this
    );

    this.resumeButton.on(
      'pointerover',
      function startGame(pointer) {
        this.selected.setPosition(this.resumeButton.x, this.resumeButton.y);
        this.index = 0;
      },
      this
    );

    this.mainMenuButton = this.add.sprite(
      this.canvas.width * 0.5,
      this.canvas.height * 0.7,
      'cancel'
    );

    this.mainMenuButton.setInteractive().on(
      'pointerdown',
      function startGame(pointer) {
        this.gotoMainMenu();
      },
      this
    );

    this.mainMenuButton.on(
      'pointerover',
      function startGame(pointer) {
        this.selected.setPosition(this.mainMenuButton.x, this.mainMenuButton.y);
        this.index = 1;
      },
      this
    );

    this.add.text(this.mainMenuButton.x, this.mainMenuButton.y, 'Main menu').setOrigin(0.5);

    this.selected = this.add.image(this.canvas.width * 0.5, this.canvas.height * 0.6, 'selected');

    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);

    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    this.keyEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.keyEsc.on('down', this.unpauseGame, this);
  }

  update() {
    if (window.performance.now() - this.lastButtonChange > 200)
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

  confirmSelection() {
    if (this.index == 0) {
      this.unpauseGame();
    } else if (this.index == 1) {
      this.gotoMainMenu();
    }
  }

  unpauseGame() {
    this.scene.resume('game');
    this.scene.remove(this);
  }

  gotoMainMenu() {
    this.scene.start('main-menu');
    this.scene.stop('game');
    this.scene.remove('game');
    this.scene.stop(this);
    this.scene.remove(this);
  }
}
