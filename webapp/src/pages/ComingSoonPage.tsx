import React, { useCallback, useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Container, Engine } from "@tsparticles/engine";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import logo from '../assets/brand/solai_logo_png.png';
import YouTube from 'react-youtube';
import { FaXTwitter } from "react-icons/fa6";
import { IoSunnyOutline, IoMoonOutline, IoMoon } from "react-icons/io5"; 


const ParticlesContainer = ({ isDarkMode }: { isDarkMode: boolean }) => {
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
    <div>  
      { init && <Particles
          id="tsparticles"
          particlesLoaded={async (container?: Container) => {
              console.log(container);
          }}
          options={{
              background: {
                  color: {
                    value: isDarkMode ? "#232734" : "#fafafa",
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
                          color: "#7aa0ff",
                          distance: 400,
                          duration: 5,
                          opacity: 0.8,
                          size: 6,
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
                      value: "#7aa0ff",
                  },
                  links: {
                      color: "#7aa0ff",
                      distance: 250,
                      enable: true,
                      opacity: 0.9,
                      width: 1,
                  },
                  move: {
                      direction: "none",
                      enable: true,
                      outModes: {
                          default: "bounce",
                      },
                      random: true,
                      speed: 3,
                      straight: false,
                  },
                  number: {
                      density: {
                          enable: true,
                          //area: 800,
                      },
                      value: 70,
                  },
                  opacity: {
                      value: 1,
                  },
                  shape: {
                      type: "circle",
                  },
                  size: {
                      value: { min: 3, max: 4 },
                  },
              },
              detectRetina: true,
          }}
      />
      }
    </div>
  );
};



export default function ComingSoon() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const opts = {
    height: '350',
    width: '600',
    playerVars: {
      autoplay: 0,
    },
  };
  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      <ParticlesContainer isDarkMode={isDarkMode} />
      <div className="flex flex-row w-full h-full">
          <div className="flex-[25vw] z-10 h-[100vh] flex flex-col items-center justify-center">
            <YouTube videoId='6xZNdc48EhQ' opts={opts} />
          </div>

        <div className="h-[100vh] flex-1 flex flex-col items-center justify-between text-center z-10 bg-white dark:bg-gray-800 rounded-lg pb-4 pt-2 shadow-2xl">
          <div className="w-full flex flex-row items-center justify-between p-2 pl-6 mb-20 ">
            <div className="flex flex-row items-center gap-2">
              <img src={logo} alt="SolAI Logo" className="w-20 h-20" />
              <h1 className="text-3xl text-[#7aa0ff] font-inconsolata">SolAI</h1>
            </div>
            <span className="pb-8 pr-8 pt-8 text-[#7aa0ff]" onClick={toggleDarkMode}>
              {isDarkMode ? <IoMoonOutline /> : <IoSunnyOutline />}
            </span>
          </div>
          <div className="w-full flex-1 flex flex-col items-center justify-between">
            <span className="w-full flex-1/2 flex flex-col items-center justify-center p-10">
              <h1 className="text-2xl mb-4 text-gray-400 dark:text-gray-400 font-semibold font-roboto-mono">Coming Soon...</h1>
              <p className="text-md text-gray-400 dark:text-gray-500"> We're working hard to bring you something amazing. Stay tuned! </p>
            </span>
          </div>
          
          <div className="w-full flex flex-row items-center justify-between p-10 pr-20 pl-20">
            
            {/* Possible feature: Email Subscription ? */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Input type="email" placeholder="Enter your email" className="h-6 w-full text-xs flex-grow max-w-xs bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 shadow-none" />
              <Button className="h-6 text-xs bg-[#ffffff] dark:bg-gray-700 hover:bg-[#ffffff] dark:hover:bg-[#222222] text-[#7aa0ff] border border-gray-300 shadow-none"> Notify Me </Button>
            </div>
            <div>
              <a href="https://x.com/usesolai" className="text-[#7aa0ff] hover:text-[#6690ff] flex flex-row items-center gap-1">
                <FaXTwitter className="text-sm" />
                <span className="text-sm pb-1">@usesolai</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
