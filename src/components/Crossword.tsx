"use client";

import { useEffect, useRef, useState } from "react";
import { CrosswordGameClass } from "@/lib/CrosswordGameClass";

// Clue type for the clues object
type ClueType = {
  across: Record<string, string>;
  down: Record<string, string>;
};

export default function Crossword() {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<CrosswordGameClass | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // States
  const [clues, setClues] = useState<ClueType | null>(null);
  const [currentHint, setCurrentHint] = useState<number>(1);
  const [currentDirection, setCurrentDirection] = useState<'across' | 'down'>('across');
  const [theme, setTheme] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(true);
  const [maxAttempts, setMaxAttempts] = useState(15);
  const [maxWords, setMaxWords] = useState(100);
  const [regenerate, setRegenerate] = useState(false);
  const [isFilled, setIsFilled] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [themeWords, setthemeWords] = useState(3);
  const [wordTokens, setWordTokens] = useState(500);
  const [hintTokens, setHintTokens] = useState(300);

  // Effect
  useEffect(() => {
    // Initialize the game instance
    const container = containerRef.current;
    if (container && !gameInstanceRef.current) {
      gameInstanceRef.current = new CrosswordGameClass(container);
      setClues(gameInstanceRef.current.getClues());

      // Style the canvas element directly
      const canvas = container.querySelector("canvas");
      if (canvas) {
        canvas.style.outline = "none";
      }
    }

    // Add keyboard shortcut for debug menu
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        setShowDebug((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup
    const gameInstance = gameInstanceRef.current;
    return () => {
      if (gameInstance) {
        const canvas = container?.querySelector("canvas");
        // Cleanup all event listeners
        document.removeEventListener("keydown", gameInstance.handleKeyPress);
        canvas?.removeEventListener("click", gameInstance.handleClick);
        canvas?.removeEventListener("focus", gameInstance.handleFocus);
        canvas?.removeEventListener("blur", gameInstance.handleBlur);
        window.removeEventListener("keydown", handleKeyDown);
        gameInstanceRef.current = null;
      }
    };
  }, []);

  // Add an effect to check puzzle state
  useEffect(() => {
    const checkPuzzleState = () => {
      if (gameInstanceRef.current) {
        setIsFilled(gameInstanceRef.current.getIsFilled());
        setIsCorrect(gameInstanceRef.current.getIsCorrect());
      }
    };

    // Check initially
    checkPuzzleState();

    // Set up an interval to check periodically
    const interval = setInterval(checkPuzzleState, 500);

    // Cleanup
    return () => clearInterval(interval);
  }, []);

  // Add an effect to handle the fade animation
  useEffect(() => {
    if (isFilled) {
      // Small delay to ensure the DOM has updated
      const timer = setTimeout(() => setShowMessage(true), 50);
      return () => clearTimeout(timer);
    } else {
      setShowMessage(false);
    }
  }, [isFilled]);

  // Add click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Add an effect to update current hint and direction
  useEffect(() => {
    const updateCurrentHint = () => {
      if (gameInstanceRef.current) {
        setCurrentHint(gameInstanceRef.current.getCurrentHint());
        setCurrentDirection(gameInstanceRef.current.getDirection());
      }
    };

    // Check initially
    updateCurrentHint();

    // Set up an interval to check periodically
    const interval = setInterval(updateCurrentHint, 100);

    return () => clearInterval(interval);
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!theme.trim()) return;

    // Set loading state
    setIsLoading(true);

    // Generate the puzzle
    try {
      const response = await fetch("/api/puzzles/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theme: theme.trim(),
          maxAttempts,
          maxWords,
          regenerate,
          themeWords,
          wordTokens,
          hintTokens,
        }),
      });

      // Check if the response is ok
      if (!response.ok) {
        console.error("Server error:", {
          status: response.status,
          statusText: response.statusText,
        });
        throw new Error(
          `Failed to generate puzzle: ${response.status} ${response.statusText}`
        );
      }

      // Parse the JSON response
      const data = await response.json();
      console.log("Received puzzle data:", data);

      // Check if the data is valid
      if (!data.gridJson || !data.cluesJson) {
        console.error("Invalid puzzle data format:", data);
        throw new Error("Invalid puzzle data received");
      }

      // Parse the JSON strings into objects
      const grid = JSON.parse(data.gridJson);
      const clues = JSON.parse(data.cluesJson);

      // Update the game with new puzzle data
      if (gameInstanceRef.current) {
        gameInstanceRef.current.loadPuzzle({
          grid,
          clues,
        });
        setClues(gameInstanceRef.current.getClues());
      }
    } catch (error) {
      // Log the error
      console.error("Error generating puzzle:", error);
      alert("Failed to generate puzzle. Please try again.");
    } finally {
      // Reset the loading state
      setIsLoading(false);
    }
  };

  // Render the component
  return (
    <div className="flex flex-col items-center gap-8">
      {/* Theme Generation Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="flex gap-2">
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="Enter a theme for your crossword..."
            className="flex-1 p-2 border rounded"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
            disabled={isLoading || !theme.trim()}
          >
            {isLoading ? "Generating..." : "Generate"}
          </button>
        </div>
      </form>

      {/* Debug Settings */}
      <div className="flex flex-row items-start justify-center gap-8 w-full max-w-[1400px]">
        {showDebug && (
          <div className="w-64 p-4 bg-gray-100 rounded-lg h-fit sticky top-4">
            <h3 className="font-bold mb-4">Debug Settings (Ctrl+Shift+D)</h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <label>Max Attempts:</label>
                  <div className="relative group">
                    <div className="cursor-help text-gray-400 hover:text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="invisible group-hover:visible absolute left-6 top-0 w-64 p-2 bg-gray-800 text-white text-sm rounded shadow-lg z-10">
                      Maximum number of attempts to generate a valid themed
                      crossword puzzle using at least three words from theme
                      before settling for next highest number of themed words.
                      (Default: 15)
                    </div>
                  </div>
                </div>
                <input
                  type="number"
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(parseInt(e.target.value))}
                  className="p-1 border rounded"
                  min="1"
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <label>Words Requested per Generation:</label>
                  <div className="relative group">
                    <div className="cursor-help text-gray-400 hover:text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="invisible group-hover:visible absolute left-6 top-0 w-64 p-2 bg-gray-800 text-white text-sm rounded shadow-lg z-10">
                      Number of theme-related words to request from the AI for
                      each generation attempt. (Default: 100)
                    </div>
                  </div>
                </div>
                <input
                  type="number"
                  value={maxWords}
                  onChange={(e) => setMaxWords(parseInt(e.target.value))}
                  className="p-1 border rounded"
                  min="1"
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <label>Goal Theme Words:</label>
                  <div className="relative group">
                    <div className="cursor-help text-gray-400 hover:text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="invisible group-hover:visible absolute left-6 top-0 w-64 p-2 bg-gray-800 text-white text-sm rounded shadow-lg z-10">
                      Target number of theme-related words to include in the
                      puzzle. Going higher than 3 would be redundant usually as 
                      the best crosswords found has only 3. (Default: 3)
                    </div>
                  </div>
                </div>
                <input
                  type="number"
                  value={themeWords}
                  onChange={(e) => setthemeWords(parseInt(e.target.value))}
                  className="p-1 border rounded"
                  min="1"
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <label>Word Tokens:</label>
                  <div className="relative group">
                    <div className="cursor-help text-gray-400 hover:text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="invisible group-hover:visible absolute left-6 top-0 w-64 p-2 bg-gray-800 text-white text-sm rounded shadow-lg z-10">
                      Number of tokens to use for each word generation. (Default: 500)
                    </div>
                  </div>
                </div>
                <input
                  type="number"
                  value={wordTokens}
                  onChange={(e) => setWordTokens(parseInt(e.target.value))}
                  className="p-1 border rounded"
                  min="1"
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <label>Hint Tokens:</label>
                  <div className="relative group">
                    <div className="cursor-help text-gray-400 hover:text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="invisible group-hover:visible absolute left-6 top-0 w-64 p-2 bg-gray-800 text-white text-sm rounded shadow-lg z-10">
                      Number of tokens to use for hint generation. Take note that all hints are 
                      generated in one go, so this is the total number of tokens used for all hints. (Default: 300)
                    </div>
                  </div>
                </div>
                <input
                  type="number"
                  value={hintTokens}
                  onChange={(e) => setHintTokens(parseInt(e.target.value))}
                  className="p-1 border rounded"
                  min="1"
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <label>
                  <input
                    type="checkbox"
                    checked={regenerate}
                    onChange={(e) => setRegenerate(e.target.checked)}
                    className="mr-2"
                  />
                  Constantly Regenerate Words Each Attempt
                </label>
                <div className="relative group">
                  <div className="cursor-help text-gray-400 hover:text-gray-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="invisible group-hover:visible absolute left-6 top-0 w-64 p-2 bg-gray-800 text-white text-sm rounded shadow-lg z-10">
                    When enabled, new theme-related words will be generated for
                    each attempt instead of reusing the same set. Will make it
                    more likely to generate a puzzle with more words from the
                    theme, however, it will also make the generation process
                    slower and more expensive due to more LLM calls. (Default:
                    False)
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Crossword Game */}
        <div className="flex flex-col gap-4 flex-1">
          <div className="bg-white rounded-lg shadow-lg p-8 flex gap-4">
            <div className="flex flex-col gap-4">
              <div
                ref={containerRef}
                style={{ userSelect: "none", outline: "none" }}
              />
            </div>

            {/* Hints */}
            <div className="flex flex-col gap-4 flex-1">
              <div>
                <h2 className="font-bold mb-2 text-xl">Across</h2>
                <div className="space-y-0.5">
                  {clues?.across &&
                    Object.entries(clues.across).map(([number, clue]) => (
                      <p 
                        key={`across-${number}`} 
                        className={`text-base p-2 rounded cursor-pointer ${
                          currentDirection === 'across' && 
                          currentHint === parseInt(number)
                            ? 'bg-[#b1d7fb] hover:bg-[#81bef7]' 
                            : 'hover:bg-gray-100'
                        }`}
                        onClick={() => {
                          if (gameInstanceRef.current) {
                            gameInstanceRef.current.selectHint(parseInt(number), 'across');
                          }
                        }}
                      >
                        <span className="font-bold">{number}.</span> {clue}
                      </p>
                    ))}
                </div>
              </div>
              <div>
                <h2 className="font-bold mb-2 text-xl">Down</h2>
                <div className="space-y-0.5">
                  {clues?.down &&
                    Object.entries(clues.down).map(([number, clue]) => (
                      <p 
                        key={`down-${number}`} 
                        className={`text-base p-2 rounded cursor-pointer ${
                          currentDirection === 'down' && 
                          currentHint === parseInt(number)
                            ? 'bg-[#b1d7fb] hover:bg-[#81bef7]' 
                            : 'hover:bg-gray-100'
                        }`}
                        onClick={() => {
                          if (gameInstanceRef.current) {
                            gameInstanceRef.current.selectHint(parseInt(number), 'down');
                          }
                        }}
                      >
                        <span className="font-bold">{number}.</span> {clue}
                      </p>
                    ))}
                </div>
              </div>
            </div>

            {/* Dropdown Menu */}
            <div className="relative self-start" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown((prev) => !prev)}
                className="w-10 h-10 flex items-center justify-center border rounded bg-white hover:bg-gray-50 focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-1 w-40 bg-white border rounded shadow-lg z-10">
                  <button
                    className="w-full px-4 py-2 text-left hover:bg-gray-100"
                    onClick={() => {
                      if (!gameInstanceRef.current) return;
                      gameInstanceRef.current.revealSquare();
                      setShowDropdown(false);
                    }}
                  >
                    Reveal Square
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left hover:bg-gray-100"
                    onClick={() => {
                      if (!gameInstanceRef.current) return;
                      gameInstanceRef.current.revealPuzzle();
                      setShowDropdown(false);
                    }}
                  >
                    Reveal Puzzle
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Win/Lose Message */}
          <div
            className={`text-center text-xl font-bold transition-all duration-500 ease-in-out ${
              isFilled && showMessage ? "opacity-100" : "opacity-0"
            } ${isCorrect ? "text-green-600" : "text-red-600"}`}
          >
            <div className="relative h-8">
              <div 
                className={`absolute top-0 left-0 right-0 transition-opacity duration-500 ${
                  isCorrect ? "opacity-0 pointer-events-none hidden" : "opacity-100"
                }`}
              >
                Keep trying! Not all answers are correct.
              </div>
              <div
                className={`absolute top-0 left-0 right-0 transition-opacity duration-500 ${
                  !isCorrect ? "opacity-0 pointer-events-none hidden" : "opacity-100"
                }`}
              >
                Congratulations! You solved the puzzle!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
