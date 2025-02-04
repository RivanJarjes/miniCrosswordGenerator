package com.example.crossword.service;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public class GeneratedPuzzleData {
    private List<String> solution;
    private List<String> hints;
    private boolean success;

    // Default constructor for Jackson
    public GeneratedPuzzleData() {
    }

    // Getters and setters
    @JsonProperty("solution")
    public List<String> getSolution() {
        return solution;
    }

    @JsonProperty("solution")
    public void setSolution(List<String> solution) {
        this.solution = solution;
    }

    @JsonProperty("hints")
    public List<String> getHints() {
        return hints;
    }

    @JsonProperty("hints")
    public void setHints(List<String> hints) {
        this.hints = hints;
    }

    @JsonProperty("success")
    public boolean isSuccess() {
        return success;
    }

    @JsonProperty("success")
    public void setSuccess(boolean success) {
        this.success = success;
    }
}
