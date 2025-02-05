# Mini Crossword Generator
An AI-powered crossword puzzle generator
## Description
A web-app based off of the New York Times' Mini Crossword which allows the user to generate a custom themed crossword.
Built with built with Next.JS, Python, and Spring Boot, it works by (*(optionally)* repeatedly) generating words from a LLM (Perplexity or a fine tuned GPT model were used) where a backtracking algorithm would attempt to find a crossword with the goal amount of themed words included alongside an existing word list. The LLM is used again for generating hints.

https://github.com/user-attachments/assets/e5dc5ae0-9bbc-4c73-994d-c373f6f05b34

### Features
- Theme-based puzzle generation
- Interactive crossword interface
- NYT Mini-style clues and answers
- Real-time puzzle validation
- Debug mode for customizing generation parameters

### Tech Stack
- Frontend: Next.js, TypeScript, Tailwind CSS
- Backend: Spring Boot, Java
- AI: OpenAI/Perplexity APIs for word and clue generation
- ~~Database: JPA/Hibernate~~ (originally was used when this service was up on my website (taken down because api calls expensive), taken off the source)
## Usage
Requirements
- [Python OpenAPI module](https://pypi.org/project/openai/)
- npm
Run the web application with `npm run dev` at root, and run the backend service with `./mvnw spring-boot:run`
## Limitations
- Currently limited to a 5x5 grid size unlike the real NYT Mini-Crossword
- It can be a slow generation process, as it can take up to 2 minutes depending on the settings you establish. This is due to the API calls and the use of ~~Python~~.
- Theme matching isn't perfect, you're usually getting 4-5 theme words at best when you change that parameter.
- Some generated clues may not be coherant or may be inappropriate. I recommend using Perplexity for word and hint generation because it's been the most reliable during testing and has the most recent knowledge.
## Next Steps
- [ ] Implement more dynamic grid sizes.
