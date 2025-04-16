import React, { useCallback } from 'react';
import Particles from "react-tsparticles";
// Required to load the engine and presets, adjust paths as needed for specific features
import { loadFull } from "tsparticles"; 
// Or loadSlim if you only need basic features: import { loadSlim } from "tsparticles-slim";

function AnimatedBackground() {
    const particlesInit = useCallback(async engine => {
        // console.log(engine);
        // Initializes the tsParticles instance (engine) here, adding custom shapes or presets
        // loads the full bundle (loadFull) for all features
        await loadFull(engine);
        // Or use loadSlim(engine) for a smaller bundle
    }, []);

    const particlesLoaded = useCallback(async container => {
        // console.log(container);
        // Optional: callback when particles container is loaded
    }, []);

    // Revert to original basic manual configuration
    const options = {
        background: {
            color: { 
                value: 'transparent' // Keep transparent background
            },
        },
        fpsLimit: 60, // Limit FPS for performance
        particles: {
            color: {
                value: "#cccccc" // Revert to simple grey particles
            },
            links: {
                color: "#cccccc", // Revert to simple grey links
                distance: 150,
                enable: true,
                opacity: 0.3, // Revert opacity
                width: 1
                // REMOVE optional link warp/triangles
            },
            move: {
                direction: "none",
                enable: true,
                outModes: {
                    default: "bounce"
                },
                random: false,
                speed: 1, // Slower speed
                straight: false
            },
            number: {
                density: {
                    enable: true,
                    area: 800
                },
                value: 40 // Reduced number of particles
            },
            opacity: {
                value: 0.3 // Subtle opacity
            },
            shape: {
                type: "circle"
            },
            size: {
                value: { min: 1, max: 3 } // Small particles
            }
        },
        interactivity: {
            events: {
              onclick: { enable: false },
              onhover: { enable: false }
            },
        },
        detectRetina: true,
        fullScreen: { 
            enable: true, 
            zIndex: -1 // Keep behind content
        }
    };

    return (
        <Particles
            id="tsparticles"
            init={particlesInit}
            loaded={particlesLoaded}
            options={options}
        />
    );
}

export default AnimatedBackground; 