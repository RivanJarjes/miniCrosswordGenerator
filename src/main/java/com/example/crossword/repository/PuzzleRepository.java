package com.example.crossword.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.crossword.model.Puzzle;

@Repository
public interface PuzzleRepository extends JpaRepository<Puzzle, Long> {
    // Could be used later for database operations, removed from this version of source code
}
