export class GameOverScene extends Phaser.Scene {
  keyEnter;
  keySpace;

  lastButtonChange = -200;

  score = 0;

  index = 0;
  resumeButton;
  mainMenuButton;

  constructor() {
    super();
  }

  init(data) {
    this.cameras.main.setBackgroundColor('rgba(50, 50, 50, 100)');
    this.score = data.score;
  }

  create() {
    this.canvas = this.sys.game.canvas;
    this.cursors = this.input.keyboard.createCursorKeys();
    this.index = 0;

    // Score Anzeige
    this.add
      .text(this.canvas.width * 0.5, this.canvas.height * 0.23, 'Game Over', { fontSize: '50px' })
      .setOrigin(0.5);

    this.add
      .text(this.canvas.width * 0.5, this.canvas.height * 0.3, 'Score:', { fontSize: '40px' })
      .setOrigin(0.5);
    this.add
      .text(this.canvas.width * 0.5, this.canvas.height * 0.35, this.score, { fontSize: '35px' })
      .setOrigin(0.5);

    // Hauptmenü Knopf
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

    // Hover Cursor
    this.selected = this.add.image(this.canvas.width * 0.5, this.canvas.height * 0.7, 'selected');

    // Keylistener
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
  }

  update() {
    if (this.keySpace.isDown || this.keyEnter.isDown) {
      this.gotoMainMenu();
    }
  }

  gotoMainMenu() {
    // Fügt den Score der Highscore Liste hinzu, sortiert diese und trimt sie auf Länge 10
    let list = localStorage.getItem('highscore');
    if (list) {
      list = JSON.parse(list);
      list.push(this.score);
      list.sort(function (a, b) {
        return b - a;
      });
      if (list.length > 10) {
        list = list.slice(0, 10);
      }
    } else {
      list = [this.score];
    }
    localStorage.setItem('highscore', JSON.stringify(list));

    this.scene.start('main-menu');
    this.scene.remove('game');
    this.scene.remove(this);
  }
}
