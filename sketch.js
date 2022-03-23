var mazeSize = 600;
var cellSize = 30;
var cellsPerRow = mazeSize / cellSize;
const grid = new Map();
const stack = [];
var current;
var instant = false;
//solve
var enablePath = false;
var solved = false;
var hasPath = false;
//user selects cells
var enableUserSelect = false;
var startIndex = 0;
var endIndex = cellsPerRow*cellsPerRow-1;
var clickedTimes = 0;

function setup() {
    createCanvas(mazeSize,mazeSize);
    setupBtns();
    // frameRate(1);
    var cellIndex = 0;
    for (let i = 0; i < mazeSize; i+=cellSize) {
        for (let j = 0; j < mazeSize; j+=cellSize) {
            grid.set(cellIndex,new Cell(j, i, cellIndex));
            cellIndex++;
        }
    }
    current = grid.get(startIndex);
    stack.push(current);
}

function draw() {
    background(255);
    if (instant) {
        generateMazeInstantly();
    } else {
        generateMaze();
    }
    mouseHover(mouseX,mouseY);
}

function generateMaze() {
    generateCell();
    if (stack.length > 0) { //visit all cells as long as stack is not empty
        noStroke();
        fill(55, 204, 0, 60);
        rect(current.posX,current.posY,cellSize,cellSize);
        current.visited = true;
        current = stack.pop();
        chosenCell = chooseUnvisitedNeighbor(current);
        if (chosenCell) {
            stack.push(current);
            removeWalls(current,chosenCell);
            stack.push(chosenCell);
            current = chosenCell;
        }
    } else {
        document.querySelector(".set-position button").disabled = false;
        if (enablePath) displayPath();
    }
}

function generateMazeInstantly() {
    while (stack.length > 0) { //visit all cells as long as stack is not empty
        current.visited = true;
        current = stack.pop();
        chosenCell = chooseUnvisitedNeighbor(current);
        if (chosenCell) {
            stack.push(current);
            removeWalls(current,chosenCell);
            stack.push(chosenCell);
            current = chosenCell;
        }
    }
    document.querySelector(".set-position button").disabled = false;
    generateCell();
    if (enablePath) displayPath();
}

function resetMaze() {
    current = null;
    solved = false;
    hasPath = false;
    stack.length = 0; //clear stack
    grid.clear(); //clear grid
    cellsPerRow = mazeSize / cellSize; //recalculate number of cells per row
    startIndex = 0; //recalculate start index
    endIndex = cellsPerRow*cellsPerRow-1; //recalculate end index
    enableUserSelect = false;
    setup(); //setup again
}

function Cell(posX, posY, index) {
    this.posX = posX;
    this.posY = posY;
    this.visited = false;
    this.correctPath = false;
    this.walls = [true,true,true,true]; //top right bot left
    var top = index-cellsPerRow, right = index+1, bottom = index+cellsPerRow, left = index-1;
    if (index % cellsPerRow == 0) left = -1; //if the first cell of a row -> no left neighbors
    if ((index+1) % cellsPerRow == 0) right = -1; //if the last cell of a row -> no right neighbors
    this.neighbors = [top, right, bottom, left]; //top right bot left 
}

function generateCell() {
    stroke(0);
    for (var i of grid.values()) {
        if (i.walls[0]) {
            line(i.posX, i.posY, i.posX+cellSize, i.posY); //top
        }
        if (i.walls[1]) {
            line(i.posX+cellSize, i.posY, i.posX+cellSize, i.posY+cellSize); //right
        }
        if (i.walls[2]) {
            line(i.posX+cellSize, i.posY+cellSize, i.posX, i.posY+cellSize); //bottom
        }
        if (i.walls[3]) {
            line(i.posX, i.posY, i.posX, i.posY+cellSize); //left
        }
    }
    noStroke();
    fill(218,165,32);
    var start = grid.get(startIndex); //show start and end cell
    var end = grid.get(endIndex);
    circle(start.posX+cellSize/2,start.posY+cellSize/2,cellSize/2);
    circle(end.posX+cellSize/2,end.posY+cellSize/2,cellSize/2);
}

function chooseUnvisitedNeighbor(cell) {
    var arr = [];
    for (let i of cell.neighbors) {
        if (grid.has(i) && !grid.get(i).visited) { //if neighbor in grid and neighbor not visited
            arr.push(grid.get(i));
        }
    }
    if (arr.length > 0) { //there are still unvisited neighbors
        var chosenNeighbor = Math.floor(Math.random() * arr.length);
        return arr[chosenNeighbor];
    }
}

function removeWalls(cell,chosenCell) {
    if (cell.posX < chosenCell.posX) {
        cell.walls[1] = false;
        chosenCell.walls[3] = false;
    } else if (cell.posX > chosenCell.posX) {
        cell.walls[3] = false;
        chosenCell.walls[1] = false;
    } else if (cell.posY < chosenCell.posY) {
        cell.walls[2] = false;
        chosenCell.walls[0] = false;
    } else {
        cell.walls[0] = false;
        chosenCell.walls[2] = false;
    }
}

//solve
function displayPath() {
    if (!solved) { //only need to solve (find the path) once and next time just display path
        for (var cell of grid.values())
            cell.visited = false;
        var startCell = grid.get(startIndex);
        var endCell = grid.get(endIndex);
        endCell.correctPath = true;
        hasPath = solve(startCell, endCell);
        solved = true; //indicate that the solve() has run once
    }
    if (hasPath) {
        noStroke();
        for (cell of grid.values()) {
            if (cell.correctPath) {
                fill(55, 204, 0, 60);
                rect(cell.posX,cell.posY,cellSize,cellSize);
            }
        }
    }
}

function solve(currCell, endCell) {
    if (currCell.posX == endCell.posX && currCell.posY == endCell.posY)
        return true;
    if (currCell.visited)
        return false;

    currCell.visited = true;

    if (grid.has(currCell.neighbors[0]) && !currCell.walls[0]) { //if not top edge of maze and no walls top
        if (solve(grid.get(currCell.neighbors[0]), endCell)) { // then move 1 cell up
            currCell.correctPath = true;
            return true;
        }
    }
    if (grid.has(currCell.neighbors[1]) && !currCell.walls[1]) { //if not right edge of maze and no walls right
        if (solve(grid.get(currCell.neighbors[1]), endCell)) { // then move 1 cell to the right
            currCell.correctPath = true;
            return true;
        }
    }
    if (grid.has(currCell.neighbors[2]) && !currCell.walls[2]) { //if not bottom edge of maze and no walls bottom
        if (solve(grid.get(currCell.neighbors[2]), endCell)) { // then move 1 cell down
            currCell.correctPath = true;
            return true;
        }
    }
    if (grid.has(currCell.neighbors[3]) && !currCell.walls[3]) { //if not left edge of maze and no walls left
        if (solve(grid.get(currCell.neighbors[3]), endCell)) { // then move 1 cell to the left
            currCell.correctPath = true;
            return true;
        }
    }
    return false; //no paths found
}

//hover
function mouseHover(x,y) {
    if (enableUserSelect) { //only check when maze has been generated
        for (let cell of grid.values()) {
            if (cell.posX <= x && x <= cell.posX + cellSize && cell.posY <= y && y <= cell.posY + cellSize) { //check if clicked in current cell
                noStroke();
                fill(255, 0, 0, 60);
                rect(cell.posX,cell.posY,cellSize,cellSize);
                break;
            }
        }
    }
}

function mouseClicked() {
    if (enableUserSelect) { //only check when maze has been generated
        for (let key of grid.keys()) {
            let cell = grid.get(key);
            if (cell.posX <= mouseX && mouseX <= cell.posX + cellSize && cell.posY <= mouseY && mouseY <= cell.posY + cellSize) { //check if clicked in current cell
                if (clickedTimes == 0) {
                    startIndex = key;
                    clickedTimes++;
                } else {
                    endIndex = key;
                    clickedTimes = 0;
                }
                break;  
            }
        }
    }
}

function setupBtns() {
    var resetBtn = document.getElementById("reset");
    var sizeBtn = document.getElementById("maze-size");
    var solutionBox = document.getElementById("sol");
    var instantBox = document.getElementById("instantly");
    var setPositionBtn = document.querySelector(".set-position button");

    setPositionBtn.disabled = true;
    resetBtn.onclick = resetMaze;

    sizeBtn.onclick = function() { //set maze size
        var choices = document.forms[0];
        for (var i = 1; i < choices.length; i++) { //i starts at 1 because 0 is button
            if (choices[i].checked) {
                if (choices[i].value === "large") { //600 , 20
                    mazeSize = 600;
                    cellSize = 20;
                } else if (choices[i].value === "medium") { //600, 30
                    mazeSize = 600;
                    cellSize = 30;
                } else { //400, 40
                    mazeSize = 400;
                    cellSize = 40;
                }
                resetMaze();
            }
        }
    }

    solutionBox.onchange = function() { // show solution
        if (solutionBox.checked) {
            enablePath = true;
        } else {
            enablePath = false;
        }
    }

    instantBox.onchange = function() { //generate maze instantly
        if (instantBox.checked) {
            instant = true;
        } else {
            instant = false;
        }
    }

    setPositionBtn.onclick = function() {
        if (this.innerHTML === "Set position") {
            this.innerHTML = "Confirm?";
            enableUserSelect = true;
            enablePath = false;
            resetBtn.disabled = true;
            sizeBtn.disabled = true;
            solutionBox.disabled = true;
        } else {
            this.innerHTML = "Set position";
            enableUserSelect = false;
            if (solutionBox.checked) enablePath = true;
            resetBtn.disabled = false;
            sizeBtn.disabled = false;
            solutionBox.disabled = false;
            for (let cell of grid.values()) cell.correctPath = false; //reset correctPath
            solved = false;
        }
    }
}