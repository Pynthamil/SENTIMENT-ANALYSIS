import { useState, useEffect } from "react";
import axios from "axios";
import classNames from "classnames";
import { Bubble, PolarArea, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  RadialLinearScale,
  ArcElement,
  CategoryScale,
  BarElement,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import Sun from "./assets/sun.png";
import Moon from "./assets/full-moon.png";
import "./index.css";

ChartJS.register(
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  RadialLinearScale,
  ArcElement,
  CategoryScale,
  BarElement,
  ChartDataLabels
);

function App() {
  const [text, setText] = useState("");
  const [sentiment, setSentiment] = useState(null);
  const [scores, setScores] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  // Check user's preferred color scheme
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setDarkMode(mediaQuery.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const analyzeSentiment = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/analyze`, { text });
      setSentiment(res.data.sentiment);
      setScores(res.data.scores);
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      setError("Failed to analyze sentiment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getBackgroundColor = () => {
    const baseClasses = "p-4 w-100 max-w-lg rounded-lg shadow-md text-center";
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return darkMode 
          ? `${baseClasses} bg-green-900 border-green-700 text-green-100`
          : `${baseClasses} bg-green-100 border-green-500 text-green-800`;
      case "negative":
        return darkMode
          ? `${baseClasses} bg-red-900 border-red-700 text-red-100`
          : `${baseClasses} bg-red-100 border-red-500 text-red-800`;
      case "neutral":
        return darkMode
          ? `${baseClasses} bg-gray-700 border-gray-500 text-gray-100`
          : `${baseClasses} bg-gray-100 border-gray-500 text-gray-800`;
      default:
        return darkMode ? `${baseClasses} bg-gray-800` : `${baseClasses} bg-white`;
    }
  };

  const chartLabels = ["Negative", "Neutral", "Positive"];
  const chartValues = scores ? [scores["Negative"], scores["Neutral"], scores["Positive"]] : [0, 0, 0];

  // Chart data with dark mode support
  const barData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Sentiment Scores",
        data: chartValues,
        backgroundColor: darkMode
          ? ["rgba(239, 68, 68, 0.8)", "rgba(156, 163, 175, 0.8)", "rgba(52, 211, 153, 0.8)"]
          : ["rgba(255, 99, 132, 0.6)", "rgba(255, 206, 86, 0.6)", "rgba(75, 192, 192, 0.6)"],
        borderRadius: 10,
        borderWidth: 1,
      },
    ],
  };

  const polarData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Sentiment Score",
        data: chartValues,
        backgroundColor: darkMode
          ? ["rgba(239, 68, 68, 0.8)", "rgba(156, 163, 175, 0.8)", "rgba(52, 211, 153, 0.8)"]
          : ["rgba(255, 99, 132, 0.6)", "rgba(255, 206, 86, 0.6)", "rgba(75, 192, 192, 0.6)"],
      },
    ],
  };

  const bubbleData = {
    datasets: [
      {
        label: "Sentiment Spread",
        data: [
          { x: 1, y: scores?.Negative || 0, r: (scores?.Negative || 0) * 50 },
          { x: 2, y: scores?.Neutral || 0, r: (scores?.Neutral || 0) * 50 },
          { x: 3, y: scores?.Positive || 0, r: (scores?.Positive || 0) * 50 },
        ],
        backgroundColor: darkMode
          ? ["rgba(239, 68, 68, 0.8)", "rgba(156, 163, 175, 0.8)", "rgba(52, 211, 153, 0.8)"]
          : ["rgba(255, 99, 132, 0.6)", "rgba(255, 206, 86, 0.6)", "rgba(75, 192, 192, 0.6)"],
      },
    ],
  };

  // Chart options with dark mode support
  const chartOptions = {
    plugins: {
      legend: {
        labels: {
          color: darkMode ? '#E5E7EB' : '#374151',
        },
      },
      datalabels: {
        color: darkMode ? '#E5E7EB' : '#374151',
      },
    },
    scales: {
      x: {
        ticks: {
          color: darkMode ? '#E5E7EB' : '#374151',
        },
        grid: {
          color: darkMode ? 'rgba(229, 231, 235, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
      },
      y: {
        ticks: {
          color: darkMode ? '#E5E7EB' : '#374151',
        },
        grid: {
          color: darkMode ? 'rgba(229, 231, 235, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  return (
    <div className={classNames(
      "min-h-screen w-screen p-8 flex justify-center items-center transition-all overflow-hidden",
      darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900",
      { "items-start pt-16": scores }
    )}>
      <div className={classNames(
        "grid gap-6 max-w-6xl w-full transition-all",
        { "grid-cols-1": !scores, "grid-cols-2": scores }
      )}>
        {/* Left Side (Input & Sentiment Box) */}
        <div className="space-y-6 flex flex-col items-center">
          <div className={classNames(
            "p-6 w-100 max-w-lg rounded-lg shadow-md",
            darkMode ? "bg-gray-800" : "bg-white"
          )}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl font-bold">Sentiment Analyzer</h2>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full hover:bg-opacity-20 hover:bg-gray-400 transition-all"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <img src={Sun} className="w-8 h-8" alt="Light mode" /> // Sun icon - smaller size
                ) : (
                  <img src={Moon} className="w-8 h-8" alt="Dark mode" /> // Moon icon - smaller size
                )}
              </button>
            </div>
            <textarea
              className={classNames(
                "w-full rounded-md px-3.5 py-2 h-40 border focus:ring-2 focus:ring-opacity-50",
                darkMode 
                  ? "bg-gray-700 border-gray-600 focus:border-green-400 focus:ring-green-400 text-gray-100" 
                  : "border-gray-300 focus:border-green-600 focus:ring-green-600"
              )}
              placeholder="Enter text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button
              className={classNames(
                "mt-4 w-full px-3.5 py-2.5 font-semibold rounded-md hover:opacity-90",
                darkMode ? "bg-green-600 text-white" : "bg-green-500 text-white"
              )}
              onClick={analyzeSentiment}
              disabled={loading}
            >
              {loading ? "Analyzing..." : "Analyze"}
            </button>
            {error && (
              <p className={classNames(
                "mt-3 text-center",
                darkMode ? "text-red-400" : "text-red-500"
              )}>
                {error}
              </p>
            )}
          </div>
  
          {sentiment && (
            <div className={classNames(getBackgroundColor())}>
              <p className="text-lg font-medium">
                {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)} Sentiment
              </p>
            </div>
          )}
        </div>
  
        {/* Right Side (Charts) */}
        {scores && (
          <div className="grid grid-cols-2 gap-6">
            <div className={classNames(
              "rounded-lg shadow-md p-4 h-75",
              darkMode ? "bg-gray-800" : "bg-white"
            )}>
              <h3 className="text-xl font-bold text-center mb-2">Bar Chart</h3>
              <Bar data={barData} options={chartOptions} />
            </div>
            <div className={classNames(
              "rounded-lg shadow-md p-4 h-75",
              darkMode ? "bg-gray-800" : "bg-white"
            )}>
              <h3 className="text-xl font-bold text-center mb-2">Polar Area Chart</h3>
              <PolarArea data={polarData} options={chartOptions} />
            </div>
            <div className={classNames(
              "col-span-2 rounded-lg shadow-md p-4 h-64",
              darkMode ? "bg-gray-800" : "bg-white"
            )}>
              <h3 className="text-xl font-bold text-center mb-2">Bubble Chart</h3>
              <Bubble data={bubbleData} options={chartOptions} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;