/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./pages/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                twitterWhite: "#e7e9ea",
                twitterBlue: "#308cd8",
                twitterBorder: "#2f3336",
                twitterLightGray: "#71767b",
                twitterDarkGray: "#17181c",
            }
        },
    },
    plugins: [],
}

