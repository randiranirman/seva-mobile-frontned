/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ink: "#0E0E0C",
        paper: "#F3F1E8",
        card: "#FFFFFF",
        signal: "#FFC20E",
        gray: "#5C5A50",
        line: "#CFCCBC",
        hold: "#BDBAA8",
        "muted-fill": "#DCD9CA",
        "ink-soft": "#2A2A26",
      },
      borderRadius: { chip: "8px", ctl: "10px", card: "12px", ticket: "14px" },
      fontFamily: {
        display: ["ArchivoNarrow_700Bold"],
        body: ["Archivo_500Medium"],
        "body-bold": ["Archivo_700Bold"],
        "body-black": ["Archivo_800ExtraBold"],
        mono: ["JetBrainsMono_600SemiBold"],
        "mono-bold": ["JetBrainsMono_700Bold"],
      },
    },
  },
  plugins: [],
};
