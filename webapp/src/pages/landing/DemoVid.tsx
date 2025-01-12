import React, { useRef, useEffect } from "react";
import { Flex } from "@chakra-ui/react";
import YouTube from "react-youtube";

interface DemoVideoSectionProps {
  videoId: string;
  width?: string;
  height?: string;
}

const DemoVideoSection: React.FC<DemoVideoSectionProps> = ({
  videoId,
  width = "100%",
  height = "100%",
}) => {
  const videoRef = useRef<any>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const onPlayerReady = (event: any) => {
    videoRef.current = event.target;
    iframeRef.current = event.target.getIframe(); 
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && videoRef.current) {
          videoRef.current.mute();
          videoRef.current.playVideo();
        } else if (videoRef.current) {
          videoRef.current.pauseVideo();
        }
      },
      { threshold: 0.5 }
    );

    if (iframeRef.current) {
      observer.observe(iframeRef.current); 
    }

    return () => {
      if (iframeRef.current) {
        observer.unobserve(iframeRef.current);
      }
    };
  }, []);

  return (
    <Flex
      h="100vh"
      w="100vw"
      position="relative"
      bgGradient="linear(to-b, blue.900, blue.800)"
      overflow="hidden"
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      >
        <YouTube
          videoId={videoId}
          opts={{
            width: width,
            height: "720px",
            playerVars: {
              autoplay: 1, 
              mute: 1, 
              modestbranding: 1,
              controls: 0,
              showinfo: 0, 
            },
          }}
          onReady={onPlayerReady} 
        />
      </div>
    </Flex>
  );
};

export default DemoVideoSection;
