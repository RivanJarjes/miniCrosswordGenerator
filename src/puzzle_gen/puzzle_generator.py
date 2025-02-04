import logging
import sys
import json
from solver import generate_crossword
from llm_client import generate_hints

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s: %(message)s',
    stream=sys.stderr  # Send to stderr so we can separate from JSON output
)

logger = logging.getLogger(__name__)

def generate_puzzle(theme: str = "", regenerate: bool = False, max_words: int = 100, max_attempts: int = 15, theme_words: int = 3,
                    word_tokens: int = 500, hint_tokens: int = 300):
    # Log the parameters
    logger.info(f"Starting puzzle generation with theme: {theme}")
    logger.info(f"Regenerate: {regenerate}")
    logger.info(f"Max words: {max_words}")
    logger.info(f"Max attempts: {max_attempts}")
    logger.info(f"Theme words: {theme_words}")
    logger.info(f"Word tokens: {word_tokens}")
    logger.info(f"Hint tokens: {hint_tokens}")

    # Generate the crossword puzzle
    solution = generate_crossword(theme, regenerate, max_words, max_attempts, theme_words, word_tokens)
    if solution:
        logger.info("Crossword generated successfully, generating hints...")
        hints = generate_hints(solution, theme, hint_tokens)
        logger.info("Hints generated successfully")
        return solution, hints
    else:
        logger.error("Failed to generate crossword")
        return None, None
    
if __name__ == "__main__":
    logger.info("Starting puzzle generator script")

    # Get the parameters
    theme = sys.argv[1]
    regenerate = bool(sys.argv[2].lower() == 'true')
    max_words = int(sys.argv[3])
    max_attempts = int(sys.argv[4])
    theme_words = int(sys.argv[5])
    word_tokens = int(sys.argv[6])
    hint_tokens = int(sys.argv[7])
    
    logger.info(f"Parameters: theme='{theme}', regenerate={regenerate}, max_words={max_words}, max_attempts={max_attempts}")

    # Generate the puzzle
    solution, hints = generate_puzzle(theme, regenerate, max_words, max_attempts, theme_words, word_tokens, hint_tokens)
    
    # Create and outputs a JSON
    result = {
        "solution": solution,
        "hints": hints,
        "success": solution is not None and hints is not None
    }
    
    print(json.dumps(result))
