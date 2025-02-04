package com.example.crossword.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;

@Entity
public class Puzzle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String theme;

    @Lob
    private String solutionJson;

    @Lob
    private String hintsJson;

    // Constructors, getters, and setters
    public Long getId() {
        return id;
    }
    public String getTheme() {
        return theme;
    }
    public String getSolutionJson() {
        return solutionJson;
    }
    public String getHintsJson() {
        return hintsJson;
    }

    public void setTheme(String theme) {
        this.theme = theme;
    }

    public void setSolutionJson(String solutionJson) {
        this.solutionJson = solutionJson;
    }

    public void setHintsJson(String hintsJson) {
        this.hintsJson = hintsJson;
    }
}
