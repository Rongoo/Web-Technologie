export class HighScoreScene extends Phaser.Scene {
  keyEnter;
  keySpace;

  lastButtonChange = -200;

  scores = [];

  index = 0;
  resumeButton;
  mainMenuButton;

  constructor() {
    super();
  }

  init() {
    // Holt die Highscore Liste aus dem LocalStorage
    let list = localStorage.getItem('highscore');
    if (list) {
      list = JSON.parse(list);
    } else {
      list = [];
    }

    this.scores = list;
  }

  create() {
    this.canvas = this.sys.game.canvas;
    this.index = 0;

    // score
    this.add
      .text(this.canvas.width * 0.5, this.canvas.height * 0.2, 'Highscores', { fontSize: '50px' })
      .setOrigin(0.5);

    // Zeigt 10 Scores aus der Highscore Liste an
    let scoreslen = this.scores.length >= 10 ? 10 : this.scores.length;
    for (let i = 0; i < scoreslen; i++) {
      let place = i + 1;
      let text = place + '.' + (i != 9 ? ' ' : '') + ' score: ' + this.scores[i];
      this.add.text(this.canvas.width * 0.3, this.canvas.height * (0.25 + 0.05 * i), text, {
        fontSize: '40px',
        align: 'left',
      });
    }

    // main menu button
    this.mainMenuButton = this.add.sprite(
      this.canvas.width * 0.5,
      this.canvas.height * 0.8,
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

    // hover
    this.selected = this.add.image(this.mainMenuButton.x, this.mainMenuButton.y, 'selected');

    // keylistener
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
  }

  update() {
    if (this.keySpace.isDown || this.keyEnter.isDown) {
      this.gotoMainMenu();
    }
  }

  gotoMainMenu() {
    this.scene.start('main-menu');
    this.scene.remove(this);
  }
}
