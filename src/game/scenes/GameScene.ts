import { Scene } from 'phaser';
import { soundManager } from '../SoundManager';

export class GameScene extends Scene {
    private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private keyItem!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    private door!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    private wardrobe!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    private bed!: Phaser.Types.Physics.Arcade.Image; // Static
    private window!: Phaser.GameObjects.Image; // Decor

    private hasKey: boolean = false;
    private keyFound: boolean = false;
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
        this.add.image(400, 300, 'background').setPipeline('Light2D');
        this.physics.world.setBounds(0, 0, 800, 600);

        // Ground (Invisible)
        const ground = this.physics.add.staticGroup();
        ground.create(400, 580, undefined).setSize(800, 40).setVisible(false);

        // Environment Props (Layered)
        // Window
        this.window = this.add.image(600, 150, 'window').setPipeline('Light2D');

        // Bed
        this.bed = this.physics.add.staticImage(150, 520, 'bed').setPipeline('Light2D') as Phaser.Types.Physics.Arcade.Image;

        // Wardrobe (Interactive)
        this.wardrobe = this.physics.add.sprite(300, 470, 'wardrobe').setPipeline('Light2D');
        this.wardrobe.setImmovable(true);
        (this.wardrobe.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);

        // Door
        this.door = this.physics.add.sprite(750, 485, 'door_closed').setPipeline('Light2D');
        this.door.setImmovable(true);
        (this.door.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);

        // Key (Hidden initially)
        this.keyItem = this.physics.add.sprite(300, 550, 'key');
        this.keyItem.setBounceY(0.5);
        this.keyItem.setVisible(false);
        this.keyItem.disableBody(true, true); // Inactive

        // Player
        this.player = this.physics.add.sprite(400, 480, 'nick');
        this.player.setCollideWorldBounds(true);
        this.player.setBounce(0.1);
        this.player.setPipeline('Light2D');

        // Adjust hitbox
        this.player.body.setSize(60, 180);
        this.player.body.setOffset(34, 10);
        this.player.setScale(0.5);

        // Breathing Tween
        this.tweens.add({
            targets: this.player,
            scaleY: 0.48,
            scaleX: 0.51,
            y: '+=2',
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Collisions
        this.physics.add.collider(this.player, ground);
        this.physics.add.collider(this.keyItem, ground);

        // Overlaps
        this.physics.add.overlap(this.player, this.keyItem, this.collectKey, undefined, this);

        // Input
        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
        }

        // Camera
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, 800, 600);

        // Lights
        this.lights.enable().setAmbientColor(0x222222); // Darker
        this.lights.addLight(600, 150, 300).setColor(0x88aaff).setIntensity(1.5); // Window Moonlight
        const playerLight = this.lights.addLight(400, 480, 250).setColor(0xffaa00).setIntensity(1.0); // "Soul" light

        // Update light position
        this.events.on('update', () => {
            playerLight.x = this.player.x;
            playerLight.y = this.player.y;
        });

        // Intro Dialogue
        this.time.delayedCall(500, () => {
             this.events.emit('dialogue', "My head... it hurts. Why is the door locked?");
        });
    }

    update() {
        const speed = 160;
        this.player.setVelocityX(0);

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
             this.player.setAngle(Math.sin(this.time.now / 100) * 2);
            if (Math.random() > 0.95) soundManager.playFootstep();
        } else {
            this.player.setAngle(0);
        }

        // Interaction Logic
        if (this.interactInput) {
            this.interactInput = false;

            // Prioritize Key Pickup (handled by overlap auto, but let's check distance to be sure)

            // Check Wardrobe
            if (this.physics.overlap(this.player, this.wardrobe)) {
                this.checkWardrobe();
            }
            // Check Door
            else if (this.physics.overlap(this.player, this.door)) {
                 this.checkDoor();
            }
        }
    }

    private checkWardrobe() {
        if (this.isInteracting) return;
        this.isInteracting = true;

        if (!this.keyFound) {
            this.events.emit('dialogue', "It smells like rot... Wait, something is shining.");

            this.time.delayedCall(1500, () => {
                this.keyFound = true;
                this.keyItem.enableBody(true, this.wardrobe.x, this.wardrobe.y + 50, true, true);
                this.keyItem.setVisible(true);
                this.keyItem.setVelocityY(-100); // Pop out
                soundManager.playLockedSound(); // Reuse sound as 'rummage'
                this.isInteracting = false;
            });
        } else {
            this.events.emit('dialogue', "Just old clothes. Nothing else.");
            this.time.delayedCall(1000, () => this.isInteracting = false);
        }
    }

    private collectKey(player: any, key: any) {
        key.disableBody(true, true);
        this.hasKey = true;
        soundManager.playPickup();
        this.events.emit('dialogue', "I got the Old Key.");
    }

    private checkDoor() {
        if (this.hasKey) {
             if (this.isInteracting) return;
             this.isInteracting = true;

             this.events.emit('dialogue', "The key fits...");
             soundManager.playDoorOpen();
             this.door.setTexture('door_open');

             this.time.delayedCall(2000, () => {
                 this.events.emit('dialogue', "I'm leaving this nightmare.");
                 // Fade out or end
             });
        } else {
            if (!this.isInteracting) {
                this.isInteracting = true;
                this.events.emit('dialogue', "Locked. I need to find the key.");
                soundManager.playLockedSound();
                this.time.delayedCall(1500, () => this.isInteracting = false);
            }
        }
    }
}
