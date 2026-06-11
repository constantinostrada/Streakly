// tipHelper.js

// Array of actionable tips
const tips = [
  "Drink a glass of water first thing in the morning.",
  "Take a 5-minute break every hour to stretch.",
  "Write down three things you're grateful for today.",
  "Spend 10 minutes planning your day ahead.",
  "Try a new fruit or vegetable this week.",
  "Practice deep breathing for 2 minutes.",
  "Declutter your workspace to boost focus.",
  "Set a timer and focus on one task without distractions.",
  "Take a short walk outside to refresh your mind.",
  "Limit social media use to 30 minutes a day."
];

// Function to get today's tip based on day index
function getTodaysTip() {
  const now = new Date();
  const dayIndex = Math.floor(now.getTime() / (1000 * 60 * 60 * 24)) % tips.length;
  return tips[dayIndex];
}

module.exports = { getTodaysTip };
