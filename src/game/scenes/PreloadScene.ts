import { Scene } from 'phaser';

export class PreloadScene extends Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        // Character assets (Larger size for detail)
        this.load.svg('nick', 'assets/nick.svg', { width: 128, height: 200 });
        this.load.svg('nick_walk1', 'assets/nick_walk1.svg', { width: 128, height: 200 });
        this.load.svg('nick_walk2', 'assets/nick_walk2.svg', { width: 128, height: 200 });

        // Props
        this.load.svg('key', 'assets/key.svg', { width: 32, height: 32 });
        this.load.svg('door_closed', 'assets/door_closed.svg', { width: 60, height: 100 });
        this.load.svg('door_open', 'assets/door_open.svg', { width: 60, height: 100 });

        // Background
        this.load.svg('background', 'assets/background.svg', { width: 800, height: 600 });
    }

    create() {
        this.scene.start('GameScene');
    }
}
