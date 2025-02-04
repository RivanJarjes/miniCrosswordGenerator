package com.example.crossword.service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class PythonPuzzleClient {
    private static final Logger logger = LoggerFactory.getLogger(PythonPuzzleClient.class);

    @Value("${app.python.script.path}")
    private String pythonScriptPath;

    public GeneratedPuzzleData requestPuzzle(String theme, boolean regenerate, int maxWords, int maxAttempts, int themeWords, int wordTokens, int hintTokens) {
        try {
            // python puzzle_generator.py <theme> <regenerate> <max_words> <max_attempts> <theme_words> <word_tokens> <hint_tokens>
            ProcessBuilder processBuilder = new ProcessBuilder(
                "python", pythonScriptPath, theme, String.valueOf(regenerate), String.valueOf(maxWords), 
                String.valueOf(maxAttempts), String.valueOf(themeWords), String.valueOf(wordTokens), String.valueOf(hintTokens)
            );
            processBuilder.redirectErrorStream(true); // Merge stderr into stdout
            
            logger.info("Starting Python process with command: {}", String.join(" ", processBuilder.command()));
            Process process = processBuilder.start();

            // Read stdout 
            BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream())
            );
            StringBuilder jsonOutput = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                // If the line looks like JSON (starts with {), collect it for parsing
                if (line.trim().startsWith("{")) {
                    jsonOutput.append(line);
                } else {
                    // Log any non-JSON output (Python logs)
                    logger.info("Python: {}", line);
                }
            }

            // Wait for the script to finish
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                logger.error("Python script failed with exit code: {}", exitCode);
                throw new RuntimeException("Python script returned error code: " + exitCode);
            }

            if (jsonOutput.length() == 0) {
                logger.error("No JSON output received from Python script");
                throw new RuntimeException("No JSON output received from Python script");
            }

            // Parse the JSON output
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(jsonOutput.toString(), GeneratedPuzzleData.class);

        } catch (IOException | InterruptedException e) {
            logger.error("Failed to call Python script", e);
            throw new RuntimeException("Failed to call Python script", e);
        }
    }
}
