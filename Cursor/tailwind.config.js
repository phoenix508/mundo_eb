/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.ejs"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      backgroundImage: {
        'beijing': "url('https://cdn.pixabay.com/photo/2022/08/06/02/24/temple-of-heaven-7367827_960_720.jpg')", // Great Wall of China
        'paris': "url('https://paristickets.tours/wp-content/uploads/2022/09/paris-at-spring.jpg')", // Eiffel Tower
        'tokyo': "url('https://cdn.pixabay.com/photo/2020/11/06/20/46/palace-5718893_960_720.jpg')", // Shibuya cityscape
        'newyork': "url('https://fullsuitcase.com/wp-content/uploads/2022/05/One-day-in-New-York-USA-NYC-day-trip-itinerary.jpg')", // NYC skyline
        'venice': "url('https://thetourguy.com/wp-content/uploads/2020/11/St-Marks-Square-Venice-Top-Attraction-700-x-425.jpeg')", // Venice canals
        'mexicocity': "url('https://lp-cms-production.imgix.net/2024-10/shutterstock1005708952.jpg?auto=format&q=72&w=1440&h=810&fit=crop')" // Mexico City Palacio
      }
    },
  },
  plugins: [],
} 