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

    // Example subtle configuration (can be customized extensively)
    // Find more presets: https://particles.js.org/samples/presets/
    const options = {
        // Using a preset for simplicity, e.g., "nasa"
        // Remove preset and manually define options for more control
        preset: "nasa", // Other simple options: "stars", "snow"
        background: {
            // Use a transparent background so the CSS background shows through if needed,
            // or define a background color here for the canvas itself.
            color: { 
                value: 'transparent' // Make canvas background transparent
            },
        },
        particles: {
            // Lower particle density for performance
            number: {
                value: 50, // Reduced from nasa default (150)
                density: {
                    enable: true,
                    value_area: 800 // Keep density reasonable
                }
            },
            // Reduce opacity
            opacity: {
                value: 0.4, // Reduced from nasa default (0.5)
            },
            // Slow down movement slightly
            move: {
                speed: 0.8, // Reduced from nasa default (1)
            }
        },
        // Ensure it doesn't interfere with clicks on main content
        interactivity: {
            events: {
              onclick: { enable: false }, // Disable click interactions
              onhover: { enable: false }  // Disable hover interactions
            },
        },
        detectRetina: true, // Adjusts density for high-res screens
        fullScreen: { 
            enable: true, 
            zIndex: -1 // Crucial: Place canvas behind all other content
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