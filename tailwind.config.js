/** @type {import('tailwindcss').Config} */

const daisy = require("daisyui");
const tailwindTypography = require("@tailwindcss/typography");

const childrenSupport = ({ addVariant }) => {
    addVariant("child", "& > *");
    addVariant("child-hover", "& > *:hover");
};

module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}'
    ],
    theme: {
        extend: {},
        screen: {
            sm: 425,
            md: 768,
            lg: 1024,
            xl: 1280,
            "2xl": 1440,
        }
    },

    daisyui: {
        styled: true,
        themes: ['dark', 'light'],
        base: true,
        utils: true,
        logs: true,
        rtl: false,
        prefix: "",
        darkTheme: "dark",
    },

    plugins: [tailwindTypography, daisy, childrenSupport],
}

