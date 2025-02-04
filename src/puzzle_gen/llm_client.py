from openai import OpenAI
from typing import List
import os
from pathlib import Path
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

current_dir = Path(__file__).parent
env_path = current_dir / 'key.env'

# Force reload environment variables
os.environ.clear()
load_dotenv(env_path, override=True)

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
#PERPLEXITY_API_KEY = os.getenv('PERPLEXITY_API_KEY') # Alternative for more expensive model, better for recent events
#print(f"Full Perplexity API Key: {PERPLEXITY_API_KEY}")  # Temporarily print full key to debug
logger.info(f"Full OpenAI API Key: {OPENAI_API_KEY}")  # Temporarily print full key to debug

if not OPENAI_API_KEY:
    raise ValueError("Invalid API keys in key.env file")

#perplexity_client = OpenAI(api_key=PERPLEXITY_API_KEY, base_url="https://api.perplexity.ai")
openai_client = OpenAI(api_key=OPENAI_API_KEY, base_url="https://api.openai.com/v1")

def get_candidate_words(theme: str = "", num_words: int = 100, words_to_avoid: List[str] = [], tokens: int = 500) -> List[str]:
    prompt_text = (
        (f"Generate exactly {num_words} different " if num_words != -1 else "Generate as many as you can different ") +
        f" real, 5-letter (must be an actual word or commonly used abbreviation) English words that could be used in a crossword puzzle." +
        (f" Must be related to '{theme}'." if theme else "") +
        " Use common English words that often appear in crosswords." +
        " Return only uppercase words, separated by commas, nothing else." +
        " Try to reference recent events, popular culture, and other current events." +
        (f" Exclude: {', '.join(words_to_avoid[:20])}..." if words_to_avoid else "")
    )

    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",  
        messages=[
            {"role": "user", "content": prompt_text}
        ],
        max_tokens=tokens,      # Increased to allow for more words (~5 tokens per word × 100 words)
        temperature=0.9,     # Higher creativity for more diverse word suggestions
        n=1,                 # One set of words is sufficient
        presence_penalty=0.6, # Strong penalty to avoid repetitive words
        frequency_penalty=0.6,# Strong penalty to encourage diverse vocabulary
        top_p=0.95           # Slightly constrain randomness to ensure valid words
    )
    
    words_text = response.choices[0].message.content
    words = [word.strip().upper() for word in words_text.split(',') if word.strip()]
    
    if num_words != -1:
        logger.info(f"Requested {num_words} words, got {len(words)} words")
    else:
        logger.info(f"Generated {len(words)} words")
    return words

def generate_hints(crossword: List[str], theme: str = "", tokens: int = 300) -> List[str]:
    #Get Down Words
    down_words = ["".join(col) for col in zip(*crossword)]
    words = crossword + down_words # Full Word List
    logger.info(f"Words: {words}")

    prompt_text = (
        f"Give me a clue for the following words in the style of the NYT mini crossword." +
        (f" If the word can relate to '{theme}', make sure to include that in the clue." if theme else "") +
        f"Return the clues' text with each hint on a new line." +
        f"Words: {words}" 
    )

    response = openai_client.chat.completions.create(
        model="ft:gpt-4o-mini-2024-07-18:personal:hint-generator:AuqXCuWg",
        messages=[{"role": "user", "content": prompt_text}],
        max_tokens=tokens,    # ~30 tokens per hint × 10 hints
        temperature=0.8,   # Slightly higher creativity for variety across hints
        n=1,              # One set of hints is sufficient since we're generating multiple at once
        presence_penalty=0.3,  # Encourage variety between hints
        frequency_penalty=0.3  # Discourage repetitive language patterns
    )   

    hints = response.choices[0].message.content
    # Split into a list of hints and remove white space
    hints = hints.splitlines()
    hints = [hint.strip() for hint in hints if hint.strip()]
    # Remove numbered list prefixes if present (e.g. "1. ", "2. ", etc) b/c already in web app
    hints = [hint[4:] if len(hint) > 4 and hint[:2].isdigit() and hint[2] == '.' and hint[3] == ' ' else hint[3:] if len(hint) > 3 and hint[0].isdigit() and hint[1] == '.' and hint[2] == ' ' else hint for hint in hints]
    return hints

# Test case
if __name__ == "__main__":
    words = get_candidate_words("car brands")
    logger.info(words)

    hints = generate_hints(
        words,
        "car brands")
    
    logger.info(hints)
