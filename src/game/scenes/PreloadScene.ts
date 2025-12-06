import { Scene } from 'phaser';

export class PreloadScene extends Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        this.load.svg('nick', 'assets/nick.svg', { width: 64, height: 64 });
        this.load.svg('nick_walk1', 'assets/nick_walk1.svg', { width: 64, height: 64 });
        this.load.svg('nick_walk2', 'assets/nick_walk2.svg', { width: 64, height: 64 });
        this.load.svg('key', 'assets/key.svg', { width: 32, height: 32 });
        this.load.svg('door', 'assets/door.svg', { width: 64, height: 128 });
        this.load.svg('background', 'assets/background.svg', { width: 800, height: 600 });
    }

    create() {
        this.scene.start('GameScene');
    }
}
