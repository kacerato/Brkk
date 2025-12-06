import { Scene } from 'phaser';
import { soundManager } from '../SoundManager';

export class GameScene extends Scene {
    private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private keyItem!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    private door!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    private hasKey: boolean = false;
    private isInteracting: boolean = false;

    // Virtual Input State
    public leftInput: boolean = false;
    public rightInput: boolean = false;
    public interactInput: boolean = false;

    constructor() {
        super('GameScene');
    }

    create() {
        // Setup world
        this.add.image(400, 300, 'background');
        this.physics.world.setBounds(0, 0, 800, 600);

        // Ground (Invisible)
        const ground = this.physics.add.staticGroup();
        ground.create(400, 580, undefined).setSize(800, 40).setVisible(false);

        // Door
        this.door = this.physics.add.sprite(700, 485, 'door');
        this.door.setImmovable(true);
        (this.door.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);

        // Key (Hidden somewhere or visible)
        this.keyItem = this.physics.add.sprite(100, 500, 'key');
        this.keyItem.setBounceY(0.5);

        // Player
        this.player = this.physics.add.sprite(400, 500, 'nick');
        this.player.setCollideWorldBounds(true);
        this.player.setBounce(0.1);

        // Animations
        this.anims.create({
            key: 'walk',
            frames: [
                { key: 'nick_walk1' },
                { key: 'nick' }, // Idle frame as middle
                { key: 'nick_walk2' },
                { key: 'nick' }
            ],
            frameRate: 6,
            repeat: -1
        });

        // Collisions
        this.physics.add.collider(this.player, ground);
        this.physics.add.collider(this.keyItem, ground);

        // Overlaps
        this.physics.add.overlap(this.player, this.keyItem, this.collectKey, undefined, this);
        this.physics.add.overlap(this.player, this.door, this.checkDoor, undefined, this);

        // Input
        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
        }

        // Camera
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, 800, 600);

        // Lights (Macabre atmosphere)
        this.lights.enable().setAmbientColor(0x555555);
        this.player.setPipeline('Light2D');
        this.lights.addLight(350, 200, 200).setColor(0xffffff).setIntensity(2); // Moonlight

        // Notify React UI about dialogue
        this.events.emit('dialogue', "Where am I? ... I need to find a way out.");

        // Start Ambient Sound
        // Note: Browsers block auto-play until interaction.
        // We rely on the first click/tap to unlock audio context in SoundManager
    }

    update() {
        const speed = 160;
        this.player.setVelocityX(0);

        // Combine Keyboard and Virtual Input
        let moving = false;
        if ((this.cursors?.left.isDown || this.leftInput)) {
            this.player.setVelocityX(-speed);
            this.player.setFlipX(true);
            moving = true;
        } else if ((this.cursors?.right.isDown || this.rightInput)) {
            this.player.setVelocityX(speed);
            this.player.setFlipX(false);
            moving = true;
        }

        if (moving) {
            this.player.play('walk', true);
            // Simulate footstep sound occasionally?
            // In a real game, listen to animation frames.
            if (Math.random() > 0.95) soundManager.playFootstep();
        } else {
            this.player.stop();
            this.player.setTexture('nick');
        }

        if ((this.cursors?.up.isDown || this.interactInput) && this.player.body.touching.down) {
            this.player.setVelocityY(-330);
            this.interactInput = false; // Reset jump/interact trigger
            soundManager.playFootstep(); // Jump sound placeholder
        }
    }

    private collectKey(player: any, key: any) {
        key.disableBody(true, true);
        this.hasKey = true;
        soundManager.playPickup();
        this.events.emit('dialogue', "I found a key! Maybe it opens the door.");
    }

    private checkDoor(player: any, door: any) {
        // Only trigger if interacting (jumping/up for now or specific button)
        // For simplicity in mobile, overlapping is enough to show message,
        // but let's require 'interactInput' for action.

        if (this.hasKey) {
             this.events.emit('dialogue', "The door is unlocking...");
             this.time.delayedCall(2000, () => {
                 this.events.emit('dialogue', "It's open. The nightmare continues...");
                 // Next level logic would go here
             });
        } else {
            // Debounce dialogue
            if (!this.isInteracting) {
                this.isInteracting = true;
                this.events.emit('dialogue', "It's locked. I need a key.");
                this.time.delayedCall(3000, () => this.isInteracting = false);
            }
        }
    }
}
