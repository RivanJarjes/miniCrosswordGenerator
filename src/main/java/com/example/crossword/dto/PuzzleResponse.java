package com.example.crossword.dto;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import com.example.crossword.model.Puzzle;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

public class PuzzleResponse {
    private Long id;
    private String theme;
    private String gridJson;
    private String cluesJson;

    private static final ObjectMapper mapper = new ObjectMapper();

    public static PuzzleResponse fromEntity(Puzzle puzzle) {
        PuzzleResponse response = new PuzzleResponse();
        response.id = puzzle.getId();
        response.theme = puzzle.getTheme();
        try {
            List<String> solution = mapper.readValue(puzzle.getSolutionJson(), new TypeReference<List<String>>() {});
            List<String> hints = mapper.readValue(puzzle.getHintsJson(), new TypeReference<List<String>>() {});

            // Format grid data
            response.gridJson = mapper.writeValueAsString(solution);

            // Format clues data
            Map<String, Map<String, String>> clues = new HashMap<>();
            Map<String, String> acrossClues = new HashMap<>();
            Map<String, String> downClues = new HashMap<>();

            // First 5 hints are for across clues
            for (int i = 0; i < 5; i++) {
                acrossClues.put(String.valueOf(i + 1), hints.get(i));
            }
            // Last 5 hints are for down clues
            for (int i = 5; i < 10; i++) {
                downClues.put(String.valueOf(i - 4), hints.get(i));
            }

            clues.put("across", acrossClues);
            clues.put("down", downClues);
            response.cluesJson = mapper.writeValueAsString(clues);

        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error parsing JSON from database", e);
        }
        return response;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTheme() {
        return theme;
    }

    public void setTheme(String theme) {
        this.theme = theme;
    }

    public String getGridJson() {
        return gridJson;
    }

    public void setGridJson(String gridJson) {
        this.gridJson = gridJson;
    }

    public String getCluesJson() {
        return cluesJson;
    }

    public void setCluesJson(String cluesJson) {
        this.cluesJson = cluesJson;
    }
}

