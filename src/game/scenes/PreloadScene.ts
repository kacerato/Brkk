import { Scene } from 'phaser';

export class PreloadScene extends Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        // Character assets - Using High Res PNG
        this.load.image('nick', 'assets/nick.png');

        // Props
        this.load.svg('key', 'assets/key.svg', { width: 32, height: 32 });
        this.load.svg('door_closed', 'assets/door_closed.svg', { width: 60, height: 100 });
        this.load.svg('door_open', 'assets/door_open.svg', { width: 60, height: 100 });
        this.load.svg('wardrobe', 'assets/wardrobe.svg', { width: 100, height: 180 });
        this.load.svg('bed', 'assets/bed.svg', { width: 150, height: 80 });
        this.load.svg('window', 'assets/window.svg', { width: 80, height: 120 });

        // Background
        this.load.svg('background', 'assets/background.svg', { width: 800, height: 600 });
    }

    create() {
        this.scene.start('GameScene');
    }
}
