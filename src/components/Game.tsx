import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { BootScene } from '../game/scenes/BootScene';
import { PreloadScene } from '../game/scenes/PreloadScene';
import { GameScene } from '../game/scenes/GameScene';

const Game: React.FC = () => {
    const gameRef = useRef<Phaser.Game | null>(null);
    const [dialogue, setDialogue] = useState<string>("");
    const [showDialogue, setShowDialogue] = useState(false);

    useEffect(() => {
        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            width: 800,
            height: 450, // 16:9 Aspect for Mobile Landscape usually
            parent: 'game-container',
            backgroundColor: '#000000',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { x: 0, y: 300 },
                    debug: false
                }
            },
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH
            },
            scene: [BootScene, PreloadScene, GameScene]
        };

        const game = new Phaser.Game(config);
        gameRef.current = game;

        // Listen for dialogue events
        game.events.on('dialogue', (text: string) => {
            setDialogue(text);
            setShowDialogue(true);
            setTimeout(() => setShowDialogue(false), 4000);
        });

        // HACK: Hook into the active scene to pass React state inputs
        // In a real app, use a Singleton InputManager
        const interval = setInterval(() => {
           const scene = game.scene.getScene('GameScene') as GameScene;
           if (scene) {
               // Re-attach event listener if scene restarts?
               // Better: The scene emits, we listen on the Game instance (which is global here)
               scene.events.off('dialogue'); // clear old
               scene.events.on('dialogue', (text: string) => {
                   setDialogue(text);
                   setShowDialogue(true);
                   setTimeout(() => setShowDialogue(false), 4000);
               });
           }
        }, 1000);

        return () => {
            clearInterval(interval);
            game.destroy(true);
        };
    }, []);

    const handleInput = (action: string, active: boolean) => {
        const scene = gameRef.current?.scene.getScene('GameScene') as GameScene;
        if (scene) {
            if (action === 'left') scene.leftInput = active;
            if (action === 'right') scene.rightInput = active;
            if (action === 'interact') scene.interactInput = active;
        }
    };

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', backgroundColor: '#000' }}>
            <div id="game-container" style={{ width: '100%', height: '100%' }} />

            {/* Dialogue Overlay */}
            {showDialogue && (
                <div style={{
                    position: 'absolute',
                    bottom: '20%',
                    left: '10%',
                    right: '10%',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '2px solid #fff',
                    color: '#fff',
                    padding: '20px',
                    fontFamily: 'Courier New, monospace',
                    fontSize: '18px',
                    borderRadius: '5px',
                    pointerEvents: 'none' // Click through
                }}>
                    <span style={{ color: 'red', fontWeight: 'bold' }}>Nick:</span> {dialogue}
                </div>
            )}

            {/* Virtual Controls */}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                display: 'flex',
                gap: '20px'
            }}>
                <button
                    onMouseDown={() => handleInput('left', true)}
                    onMouseUp={() => handleInput('left', false)}
                    onTouchStart={() => handleInput('left', true)}
                    onTouchEnd={() => handleInput('left', false)}
                    style={btnStyle}
                >←</button>
                <button
                    onMouseDown={() => handleInput('right', true)}
                    onMouseUp={() => handleInput('right', false)}
                    onTouchStart={() => handleInput('right', true)}
                    onTouchEnd={() => handleInput('right', false)}
                    style={btnStyle}
                >→</button>
            </div>

            <div style={{
                position: 'absolute',
                bottom: '20px',
                right: '20px'
            }}>
                 <button
                    onMouseDown={() => handleInput('interact', true)}
                    onMouseUp={() => handleInput('interact', false)}
                    onTouchStart={() => handleInput('interact', true)}
                    onTouchEnd={() => handleInput('interact', false)}
                    style={{...btnStyle, backgroundColor: 'rgba(0, 100, 200, 0.5)'}} // Blue/Neutral for interact
                >ACTION</button>
            </div>
        </div>
    );
};

const btnStyle: React.CSSProperties = {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    border: '2px solid white',
    color: 'white',
    fontSize: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none',
    touchAction: 'none'
};

export default Game;
