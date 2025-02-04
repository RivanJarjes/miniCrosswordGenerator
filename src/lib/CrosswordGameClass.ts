import "@/app/styles/globals.css";

export class CrosswordGameClass {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private size: number;
  private cellSize: number;
  private padding: number;
  private selectedCell: { x: number; y: number };
  private direction: "across" | "down";
  private grid: string[][];
  private isFocused: boolean = false;
  private isActive: boolean = false;
  private isFilled: boolean = false;
  private isCorrect: boolean = false;
  private puzzle: {
    grid: string[][];
    numbers: Record<string, number>;
    clues: {
      across: Record<string, string>;
      down: Record<string, string>;
    };
  };

  constructor(container: HTMLElement, size = 5) {
    const fontFace = new FontFace("Basic-Sans", "url(/Basic-Sans.woff2)");

    fontFace
      .load()
      .then((loadedFace) => {
        (document.fonts as FontFaceSet).add(loadedFace);
        this.render();
      })
      .catch((error) => {
        console.error("Failed to load font:", error);
      });

    this.size = size;
    this.cellSize = 100;
    this.padding = 1;

    // Create canvas with pixel ratio adjustment
    const pixelRatio = window.devicePixelRatio || 1;
    this.canvas = document.createElement("canvas");
    this.canvas.width =
      (this.cellSize * this.size + this.padding * 2) * pixelRatio;
    this.canvas.height =
      (this.cellSize * this.size + this.padding * 2) * pixelRatio;
    this.canvas.style.width = `${this.cellSize * this.size + this.padding * 2}px`;
    this.canvas.style.height = `${this.cellSize * this.size + this.padding * 2}px`;
    container.appendChild(this.canvas);

    const context = this.canvas.getContext("2d");
    if (!context) throw new Error("Could not get canvas context");
    this.ctx = context;
    this.ctx.scale(pixelRatio, pixelRatio); // Scale all drawing operations

    // Game state
    this.selectedCell = { x: 0, y: 0 };
    this.direction = "across";
    this.grid = this.createEmptyGrid();

    // Sample puzzle data
    this.puzzle = {
      grid: [
        ["A", "B", "C", "D", "E"],
        ["F", "G", "H", "I", "J"],
        ["K", "L", "M", "N", "O"],
        ["P", "Q", "R", "S", "T"],
        ["U", "V", "W", "X", "Y"],
      ],
      numbers: {},
      clues: {
        across: {
          1: "---",
          6: "---",
          7: "---",
          8: "---",
          9: "---",
        },
        down: {
          1: "---",
          2: "---",
          3: "---",
          4: "---",
          5: "---",
        },
      },
    };

    this.puzzle.numbers = this.createNumbers();

    // Event listeners
    this.canvas.addEventListener("click", this.handleClick.bind(this));
    this.canvas.addEventListener("focus", this.handleFocus.bind(this));
    this.canvas.addEventListener("blur", this.handleBlur.bind(this));
    document.addEventListener("keydown", this.handleKeyPress.bind(this));

    // Make canvas focusable
    this.canvas.tabIndex = 1;

    // Initial render
    this.render();
  }

  /*
    Getters
  */

  public getIsFilled(): boolean {
    return this.isFilled;
  }

  public getIsCorrect(): boolean {
    return this.isCorrect;
  }

  public getClues() {
    return this.puzzle.clues;
  }

  // Get the current hint, used for hint highlighting
  public getCurrentHint() {
    if (this.direction === "across") {
      if (this.selectedCell.y == 0) return 1;
      else return this.selectedCell.y + 5;
    } else {
      return this.selectedCell.x + 1;
    }
  }

  // Get the current direction, used for hint highlighting
  public getDirection() {
    return this.direction;
  }

  /*
    Setters
  */

  // Load a puzzle
  public loadPuzzle(puzzleData: {
    grid: string[][];
    clues: { across: Record<string, string>; down: Record<string, string> };
  }) {
    this.puzzle = {
      ...puzzleData,
      numbers: this.createNumbers(),
    };
    this.grid = this.createEmptyGrid();
    this.selectedCell = { x: 0, y: 0 };
    this.direction = "across";
    this.isCorrect = false;
    this.isFilled = false;
    this.render();
  }

  private createEmptyGrid() {
    return Array(this.size)
      .fill(null)
      .map(() => Array(this.size).fill(""));
  }

  // Create the hint numbers for the puzzle
  private createNumbers() {
    const numbers: Record<string, number> = {};
    let count = 1;
    for (let x = 0; x < this.size; x++) {
      numbers[`${x},0`] = count;
      count++;
    }
    for (let y = 1; y < this.size; y++) {
      numbers[`0,${y}`] = count;
      count++;
    }

    return numbers;
  }

  // Handle click events
  public handleClick(event: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Convert click coordinates to grid position
    const gridX = Math.floor((x - this.padding) / this.cellSize);
    const gridY = Math.floor((y - this.padding) / this.cellSize);

    if (gridX >= 0 && gridX < this.size && gridY >= 0 && gridY < this.size) {
      if (
        this.selectedCell.x === gridX &&
        this.selectedCell.y === gridY &&
        this.isActive
      ) {
        // Toggle direction if clicking same cell
        this.direction = this.direction === "across" ? "down" : "across";
      } else {
        this.selectedCell = { x: gridX, y: gridY };
      }
      this.render();
    }
    if (!this.isActive) {
      this.canvas.focus();
      this.isActive = true;
      return;
    }
  }

  // Handle key press events
  public handleKeyPress(event: KeyboardEvent) {
    if (!this.isFocused) return;
    if (!this.isValidCell(this.selectedCell.x, this.selectedCell.y)) return;

    if (event.key.match(/^[a-zA-Z]$/)) {
      // Handle letter input
      this.grid[this.selectedCell.y][this.selectedCell.x] =
        event.key.toUpperCase();
      this.moveSelection();
      // Check if the puzzle is complete
      this.checkPuzzleComplete();
    } // Handle arrow key events
    else if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      if (this.direction === "across") {
        this.moveSelection(event.key === "ArrowRight" ? 1 : -1, true);
      } else {
        this.direction = "across";
      }
    } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      if (this.direction === "down") {
        this.moveSelection(event.key === "ArrowDown" ? 1 : -1, true);
      } else {
        this.direction = "down";
      }
    } // Handle enter/tab key events
    else if (event.key === "Enter" || event.key === "Tab") {
      this.moveLine();
    } else if (event.key === "Backspace") {
      // Handle backspace
      this.grid[this.selectedCell.y][this.selectedCell.x] = "";
      this.moveSelection(-1);
      this.checkPuzzleComplete();
    }

    this.render();
  }

  public handleFocus() {
    this.isFocused = true;
    this.render();
  }

  public handleBlur() {
    this.isFocused = false;
    this.render();
  }

  private checkPuzzleComplete() {
    let allFilled = true;
    let allCorrect = true;

    // Check if all cells are filled and correct
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        if (this.grid[y][x] === "") {
          allFilled = false;
        }
        if (this.grid[y][x] !== this.puzzle.grid[y][x]) {
          allCorrect = false;
        }
      }
    }

    this.isFilled = allFilled;
    this.isCorrect = allFilled && allCorrect;
    return this.isCorrect;
  }

  private moveSelection(delta = 1, arrow: boolean = false) {
    if (this.direction === "across") {
      // If user types last character, move to next row/column
      if (
        !arrow &&
        this.selectedCell.x + delta >= this.size &&
        !this.isFilled
      ) {
        if (this.selectedCell.y + 1 < this.size) {
          this.selectedCell.y++;
          this.selectedCell.x = 0;
        } else {
          this.direction = "down";
          this.selectedCell.y = 0;
          this.selectedCell.x = 0;
        }
        return;
      }
      this.selectedCell.x = Math.min(
        Math.max(0, this.selectedCell.x + delta),
        this.size - 1
      );
    } else {
      this.selectedCell.y = Math.min(
        Math.max(0, this.selectedCell.y + delta),
        this.size - 1
      );
    }
  }

  // Move the selection to the next row/column
  private moveLine() {
    if (this.direction === "across" && this.selectedCell.y < this.size - 1) {
      this.selectedCell.y++;
      this.selectedCell.x = 0;
    } else if (
      this.direction === "down" &&
      this.selectedCell.x < this.size - 1
    ) {
      this.selectedCell.x++;
      this.selectedCell.y = 0;
    } else {
      this.direction = this.direction === "across" ? "down" : "across";
      this.selectedCell.x = 0;
      this.selectedCell.y = 0;
    }
  }

  private isValidCell(x: number, y: number) {
    return x >= 0 && x < this.size && y >= 0 && y < this.size;
  }

  private render() {
    // Clear canvas
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const cellX = x * this.cellSize + this.padding;
        const cellY = y * this.cellSize + this.padding;

        // Draw cell background
        this.ctx.fillStyle = "#ffffff";

        if (
          (this.direction === "across" &&
            x != this.selectedCell.x &&
            y == this.selectedCell.y) ||
          (this.direction === "down" &&
            x == this.selectedCell.x &&
            y != this.selectedCell.y)
        )
          this.ctx.fillStyle = "#b1d7fb";

        if (x === this.selectedCell.x && y === this.selectedCell.y) {
          this.ctx.fillStyle = "#ffeb3b";
        }
        this.ctx.fillRect(cellX, cellY, this.cellSize, this.cellSize);

        // Draw cell border
        this.ctx.strokeStyle = "#000000";
        this.ctx.strokeRect(cellX, cellY, this.cellSize, this.cellSize);

        // Draw cell number
        const cellKey = `${x},${y}`;
        if (this.puzzle.numbers[cellKey]) {
          this.ctx.fillStyle = "#000000";
          this.ctx.font = "32px Basic-Sans";
          this.ctx.textAlign = "left";
          this.ctx.textBaseline = "top";
          this.ctx.fillText(
            this.puzzle.numbers[cellKey].toString(),
            cellX + 2,
            cellY + 2
          );
        }

        // Draw letter
        if (this.grid[y][x]) {
          this.ctx.fillStyle = "#000000";
          this.ctx.font = "75px Basic-Sans";
          this.ctx.textAlign = "center";
          this.ctx.textBaseline = "middle";
          this.ctx.fillText(
            this.grid[y][x],
            cellX + this.cellSize / 2,
            cellY + this.cellSize * 0.7
          );
        }
      }
    }
  }

  public revealSquare() {
    const x = this.selectedCell.x;
    const y = this.selectedCell.y;
    this.grid[y][x] = this.puzzle.grid[y][x];
    this.checkPuzzleComplete();
    this.render();
  }

  public revealPuzzle() {
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        this.grid[y][x] = this.puzzle.grid[y][x];
      }
    }
    this.checkPuzzleComplete();
    this.render();
  }

  public selectHint(hintNumber: number, direction: "across" | "down") {
    this.direction = direction;
    if (direction === "across") {
      if (hintNumber === 1) {
        this.selectedCell = { x: 0, y: 0 };
      } else {
        this.selectedCell = { x: 0, y: hintNumber - 5 };
      }
    } else {
      this.selectedCell = { x: hintNumber - 1, y: 0 };
    }
    this.canvas.focus();
    this.isActive = true;
    this.render();
  }
}
