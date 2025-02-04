package com.example.crossword.dto;

public class PuzzleRequest {
    private String theme;
    private String gridJson;
    private String cluesJson;
    private boolean regenerate;
    private int maxWords;
    private int maxAttempts;
    private int themeWords;
    private int wordTokens;
    private int hintTokens;

    // Getters and setters
    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }
    public String getGridJson() { return gridJson; }
    public void setGridJson(String gridJson) { this.gridJson = gridJson; }
    public String getCluesJson() { return cluesJson; }
    public void setCluesJson(String cluesJson) { this.cluesJson = cluesJson; }
    public boolean isRegenerate() { return regenerate; }
    public void setRegenerate(boolean regenerate) { this.regenerate = regenerate; }
    public int getMaxWords() { return maxWords; }
    public void setMaxWords(int maxWords) { this.maxWords = maxWords; }
    public int getMaxAttempts() { return maxAttempts; }
    public void setMaxAttempts(int maxAttempts) { this.maxAttempts = maxAttempts; }
    public int getThemeWords() { return themeWords; }
    public void setThemeWords(int themeWords) { this.themeWords = themeWords; }
    public int getWordTokens() { return wordTokens; }
    public void setWordTokens(int wordTokens) { this.wordTokens = wordTokens; }
    public int getHintTokens() { return hintTokens; }
    public void setHintTokens(int hintTokens) { this.hintTokens = hintTokens; }
}
