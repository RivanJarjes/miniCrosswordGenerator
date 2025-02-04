package com.example.crossword.service;

import org.springframework.stereotype.Service;

import com.example.crossword.model.Puzzle;
import com.example.crossword.repository.PuzzleRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class PuzzleService {

    private final PuzzleRepository puzzleRepository;
    private final PythonPuzzleClient pythonPuzzleClient;
    private final ObjectMapper mapper = new ObjectMapper();

    public PuzzleService(PuzzleRepository puzzleRepository,
                         PythonPuzzleClient pythonPuzzleClient) {
        this.puzzleRepository = puzzleRepository;
        this.pythonPuzzleClient = pythonPuzzleClient;
    }

    public Puzzle generatePuzzle(String theme, boolean regenerate, int maxWords, int maxAttempts, int themeWords, int wordTokens, int hintTokens) {
        // Request puzzle data from python client
        GeneratedPuzzleData data = pythonPuzzleClient.requestPuzzle(theme, regenerate, maxWords, maxAttempts, themeWords, wordTokens, hintTokens);

        if (!data.isSuccess()) {
            throw new RuntimeException("Failed to generate puzzle");
        }

        // Build a Puzzle entity
        Puzzle puzzle = new Puzzle();
        puzzle.setTheme(theme);
        try {
            puzzle.setSolutionJson(mapper.writeValueAsString(data.getSolution()));
            puzzle.setHintsJson(mapper.writeValueAsString(data.getHints()));
        } catch (Exception e) {
            throw new RuntimeException("Error converting puzzle data to JSON", e);
        }

        // Save to database (not included in this version of source code)
        return puzzleRepository.save(puzzle);
    }

    // Get a puzzle by id (not included in this version of source code)
    public Puzzle getPuzzleById(Long id) {
        return puzzleRepository.findById(id).orElse(null);
    }
}
