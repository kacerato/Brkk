import { Scene } from 'phaser';

export class BootScene extends Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Load loading bar assets if needed
    }

    create() {
        this.scene.start('PreloadScene');
    }
}
