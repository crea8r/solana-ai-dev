import { extendTheme } from "@chakra-ui/react";

const landingPageTheme = extendTheme({
  colors: {
    brand: {
      landingPageBgGradient: "linear(to-b, #282c5a, #80a3ff)",
      boxBgColor: "rgba(75, 82, 159, 0.8)",
      cardBgColor: "rgba(183, 191, 229, 0.4)",
      pageBgColor: "#333870",
      textAccentColor1: "#e2eaff",
      textAccentColor2: "#c9cfeb",
      textAccentColor3: "#969fd6",
      roadMapStatusColor: "#99a0d9",
    },
  },
});

export default landingPageTheme;