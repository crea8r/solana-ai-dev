import { Particles } from "@tsparticles/react";
import { useState } from "react";

import { loadSlim } from "@tsparticles/slim";
import { useEffect } from "react";

import { memo } from "react";
import { Container } from "@tsparticles/engine";
import { initParticlesEngine } from "@tsparticles/react";

const ParticlesContainer = memo(({ isDarkMode }: { isDarkMode: boolean }) => {
    const [ init, setInit ] = useState(false);
  
    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);
  
    const particlesLoaded = (container: any) => {
        console.log(container);
    };
  
    return (
      <div style={{ zIndex: 0 }} >  
        { init && <Particles
            id="tsparticles"
            particlesLoaded={async (container?: Container) => {
                console.log(container);
            }}
            options={{
                background: {
                    color: {
                      value: "transparent",
                    },
                },
                fpsLimit: 130,
                interactivity: {
                    events: {
                        onClick: {
                            enable: true,
                            mode: "repulse",
                        },
                        onHover: {
                            enable: true,
                            mode: ["grab"],
                        },
                        //resize: true,
                    },
                    modes: {
                        grab: {
                            distance: 250,
                        },
                        bubble: {
                            color: "#ffffff",
                            distance: 400,
                            duration: 5,
                            opacity: 0.2,
                            size: 3,
                        },
                        attract: {
                            enable: true,
                            distance: 1000,
                        },
                        push: {
                            quantity: 4,
                        },
                        repulse: {
                            distance: 200,
                            duration: 0.3,
                        },
                    },
                },
                particles: {
                    color: {
                        value: "#ffffff",
                    },
                    links: {
                        color: "#ffffff",
                        distance: 300,
                        enable: true,
                        opacity: 0.3,
                        width: 1,
                    },
                    move: {
                        direction: "none",
                        enable: true,
                        outModes: {
                            default: "bounce",
                        },
                        random: true,
                        speed: 2,
                        straight: false,
                    },
                    number: {
                        density: {
                            enable: true,
                            //area: 800,
                        },
                        value: 50,
                    },
                    opacity: {
                        value: 0.3,
                    },
                    shape: {
                        type: "circle",
                    },
                    size: {
                        value: { min: 4, max: 6 },
                    },
                },
                detectRetina: true,
            }}
        />
        }
      </div>
    );
  });

export default ParticlesContainer;