import React from 'react';

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

// Server Component TipWidget
const TipWidget = async () => {
  // Calculate current day index
  const now = new Date();
  const dayIndex = Math.floor(now.getTime() / (1000 * 60 * 60 * 24)) % tips.length;
  const tip = tips[dayIndex];

  return (
    <div className="tip-card">
      <h3>Tip del día</h3>
      <p>{tip}</p>

      {/* Plain <style> (not styled-jsx) so this stays a Server Component; selectors scoped under .tip-card */}
      <style>{`
        .tip-card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 16px;
          background-color: #f9f9f9;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          max-width: 300px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
            Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        .tip-card h3 {
          margin: 0 0 8px 0;
          font-size: 1.25rem;
          color: #333;
        }
        .tip-card p {
          margin: 0;
          font-size: 1rem;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default TipWidget;
