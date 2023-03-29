var board = [];
var rows;
var columns;

var mines;
var minesLocation = [];
var tilesClicked = 0;
var gameOver;
var goal;
var flag = false;
var firstClick = true;
var flagsPlaced = 0;

var rules = "Custom Difficulty rules: \n The amount of mines you are allowed to have is: (rows * columns) / 4 (you must have at least 1 mine). The number of rows and columns can not be less than 1 and greater than 20. \n \n Premade Difficulties: \n Easy: 8x8 grid with 10 mines \n Medium: 14x14 grid with 40 mines \n Hard: 20x20 grid with 99 mines";

function $(id)
{
    return document.getElementById(id);
}

function addClass(element, newClass)
{
    element.classList.add(newClass);
}

function removeClass(element, removeClass)
{
    element.classList.remove(removeClass);
}

/** 
*This function is used when selecting a premade difficulty. It passes on predefined values to game variables.
*/
function premadeStart()
{
    if($("easy").checked == true)
    {
        rows = 8;
        columns = 8;
        mines = 10;
        flagsPlaced = mines;
        goal = rows * columns - mines;
        addClass($("selection"), "w3-hide");
        removeClass($("playArea"), "w3-hide");
        startGame();
    }
    else if($("medium").checked == true)
    {
        rows = 14;
        columns = 14;
        mines = 40;
        flagsPlaced = mines;
        goal = rows * columns - mines;
        addClass($("selection"), "w3-hide");
        removeClass($("playArea"), "w3-hide");
        startGame();
    }
    else if($("hard").checked == true)
    {
        rows = 20;
        columns = 20;
        mines = 99;
        flagsPlaced = mines;
        goal = rows * columns - mines;
        addClass($("selection"), "w3-hide");
        removeClass($("playArea"), "w3-hide");
        startGame();
    }
    else
    {
        alert("You did not select a pre-made option. Please try again.");
    }
}

/**
 * This function is used when selecting a custom difficulty. It passes on custom values to game variables.
 */
function customStart()
{
    let mineCount = parseInt($("minesAmount").value);
    let rowCount = parseInt($("rowsAmount").value);
    let columnCount = parseInt($("columnsAmount").value);

    console.log(mineCount);

    if(isNaN(mineCount) || isNaN(rowCount) || isNaN(columnCount) || columnCount < 1 || columnCount > 20 || rowCount < 1 || rowCount > 20 || mineCount < 1 || mineCount > (rowCount * columnCount) / 4)
    {
        alert("Invalid input. The amount of mines you are allowed to have is: (rows * columns) / 4 (you must have at least 1 mine). Rows and columns can not be less than 1 and greater than 20. \n With all of this in mind please try inputting the values again.")
        $("minesAmount").value = 1;
        $("rowsAmount").value = 1;
        $("columnsAmount").value = 1;
    }
    else
    {
        rows = rowCount;
        columns = columnCount;
        mines = mineCount;
        flagsPlaced = mines;
        goal = rows * columns - mines;
        addClass($("selection"), "w3-hide");
        removeClass($("playArea"), "w3-hide");
        startGame();
    }
}

/**
 * This function generates the board 
 */
function startGame()
{
    $("flagsCount").innerHTML = mines;

    for(let i = 0; i < rows; i++)
    {
        let row = [];
        let div = document.createElement("div");
        addClass(div, "w3-row");
        addClass(div, "w3-center");
        let tile = borderCell();
        div.append(tile);
        for(let j = 0; j < columns; j++)
        {
            tile = document.createElement("div");
            tile.id = i.toString() + "-" + j.toString();
            addClass(tile, "w3-light-green");
            addClass(tile, "w3-border");
            addClass(tile, "w3-border-cyan");
            addClass(tile, "w3-cell");
            tile.innerHTML = "&nbsp;";
            tile.style = "width: 4%;"
            tile.addEventListener("click", tileClicked);
            div.append(tile);
            row.push(tile)
        }
        tile = borderCell();
        div.append(tile);
        $("board").append(div);
        board.push(row);
    }
}

function borderCell()
{
    let tile = document.createElement("div");
    addClass(tile, "w3-border");
    addClass(tile, "w3-border-teal");
    addClass(tile, "w3-cell");
    tile.style = "width: 4%;"
    tile.innerHTML = "💣";
    return tile;
}

/**
 * This function is called whenever a tile on the board is clicked.  There are multiple scenarios that can take place when a tile is clicked which are as follows:
 * 1) The first time a tile is clicked, the mine locations are generated by calling the setMines() function. A mine cannot be on the tile that was clicked or on its neighbours.
 * 2) If the flag button is clicked, 2 things can happen, either a flag is set on the tile, or a flag is removed off of the tile if it already had a flag placed. The inner HTML of the "flagsCount" element is updated in both cases.
 * 3) Tiles that contain a flag cannot be clicked on
 * 4) If the tile contains a mine, the game ends and the player is informed. All of the mines in the play area are shown using the showMines() function
 * 5) If the game ended, none of the tiles can be clicked on, as well as the flag button
 * 6) If none of the above happens, then the checkMine() function is called
 * 7) If all of the tiles that do not contain bombs are clicked, the win() function is called and the game ends
 * @returns nothing, return is just used to exit out of the function in some cases
 */
function tileClicked()
{
    let tile = this;
    let coordinates = tile.id.split("-");
    let row = parseInt(coordinates[0]);
    let column = parseInt(coordinates[1]);

    if(firstClick)
    {
        setMines(row, column);
        firstClick = false;
        removeClass($("flagButton"), "w3-disabled");
        $("flagButton").addEventListener("click", flagClicked);
    }

    if(gameOver || tile.classList.contains("w3-green"))
    {
        return;
    }

    if(flag)
    {
        if(tile.innerHTML == "&nbsp;")
        {
            tile.innerHTML = "🚩";
            flagsPlaced--;
            updateFlagNumber(flagsPlaced);
        }
        else if(tile.innerHTML == "🚩")
        {
            tile.innerHTML = "&nbsp;";
            flagsPlaced++;
            updateFlagNumber(flagsPlaced);
        }
        return;
    }

    if(tile.innerHTML == "🚩")
    {
        return;
    }

    if(minesLocation.includes(tile.id))
    {
        alert("GAME OVER! You clicked on a mine.");
        gameOver = true;
        showMines();
        $("flagButton").disabled = true;
        return;
    }
    checkMine(row, column);

    if(tilesClicked == goal)
    {
        win();
        return;
    }
}

/**
 * This function is called whenever the flag button is clicked. It determines whether or not a flag is placed on a tile. It also hides/unhides a header that informs the player if the button is enabled
 */
function flagClicked()
{
    if(!flag)
    {
        flag = true;
        removeClass($("flagEnabledText"), "w3-hide")
    }
    else
    {
        flag = false;
        addClass($("flagEnabledText"), "w3-hide")
    }
}

/**
 * This function generates mine locations randomly. Mines cannot be generated on the first tile clicked, as well as its neighbours or on tiles that already contain a mine
 */
function setMines(r, c)
{
    for(let i = 1; i <= mines; i++)
    {
        let row = parseInt(Math.random() * rows);
        let column = parseInt(Math.random() * columns);
        let mine = row.toString() + "-" + column.toString();

        while(minesLocation.includes(mine) || 
                ((row == r - 1 && column == c - 1) || (row == r - 1 && column == c) || (row == r - 1 && column == c + 1)) || //top neighbouring tiles
                ((row == r && column == c - 1) || (row == r && column == c) || (row == r && column == c + 1)) || //left and right neighbouring tiles as well as the tile clicked
                ((row == r + 1 && column == c - 1) || (row == r + 1 && column == c) || (row == r + 1 && column == c + 1))) //bottom neighbouring tiles
        {
            row = parseInt(Math.random() * rows);
            column = parseInt(Math.random() * columns);
            mine = row.toString() + "-" + column.toString();
        }

        console.log(mine);
        minesLocation.push(mine);
    }
}

/**
 * This function reveals all mines when it is called by putting the "💣" emoji as the inner HTML of the tiles in question
 */
function showMines()
{
    for (let i= 0; i < rows; i++)
    {
        for (let j = 0; j < columns; j++)
        {
            let tile = board[i][j];
            if (minesLocation.includes(tile.id))
            {
                tile.innerHTML = "💣";
                removeClass(tile, "w3-w3-light-green")
                addClass(tile, "w3-red");                
            }
        }
    }
}

/**
 * This function checks for mines around the clicked tile. It is a recursive function. Multiple scenarios can occur which are as follows:
 * 1) If the tile is not within the area of the board, nothing happens
 * 2) If the tile was already previously revealed at some point (which is indicated by the class "w3-green") nothing happens
 * 3) If the first two scenarios don't play out, we increment the counter for the amount of tiles the player has clicked and check how many mines the tiles neighbours contain by calling the checkNeighbour function. Again, in this scenario there are multiple outcomes which are as follows:
 *              a) If we found at least 1 mine, we update the inner HTML of the tile
 *              b) If there were no mines found, we use recursion and call this function on the neighbouring tiles.
 *              c) If all of the tiles that do not contain a mine are revealed, the game is won and the player is notified
 * @param {*} row The row of the clicked tile
 * @param {*} column  The column of the clicked tile
 * @returns 
 */
function checkMine(row, column)
{
    if(row < 0 || row >= rows || column < 0 || column >= columns)
    {
        return;
    }

    if(gameOver)
    {
        return;
    }

    let clickedTile = board[row][column];

    if(clickedTile.classList.contains("w3-green"))
    {
        return;
    }

    removeClass(clickedTile, "w3-light-green");
    addClass(clickedTile, "w3-green");

    tilesClicked++;
    let minesFound = 0;

    //Upper neighbours
    minesFound += checkNeighbour(row - 1, column - 1);
    minesFound += checkNeighbour(row - 1, column);
    minesFound += checkNeighbour(row - 1, column + 1);

    //Left and right neighbours
    minesFound += checkNeighbour(row, column - 1);
    minesFound += checkNeighbour(row, column + 1);

    //Bottom neighbours
    minesFound += checkNeighbour(row + 1, column - 1);
    minesFound += checkNeighbour(row + 1, column);
    minesFound += checkNeighbour(row + 1, column + 1);

    if(minesFound > 0)
    {
        clickedTile.innerHTML = minesFound.toString();
        removeClass(clickedTile, "w3-text-green");
        addClass(clickedTile, "w3-green");
        addClass(clickedTile, numColor(minesFound));
    }
    else
    {
        //Upper neighbours
        checkMine(row - 1, column - 1);
        checkMine(row - 1, column);
        checkMine(row - 1, column + 1);

        //Left and right neighbours
        checkMine(row, column - 1);
        checkMine(row, column + 1);

        //Bottom neighbours
        checkMine(row + 1, column - 1);
        checkMine(row + 1, column);
        checkMine(row + 1, column + 1);
    }
}

/**
 * This function checks a neighbouring tile of the tile that has been clicked, specifically whether or not it has a mine
 * @param {*} row Row of the neighbouring tile
 * @param {*} column Column of the neighbouring tile
 * @returns 0 or 1 depending on if the tile in question contains a mine
 */
function checkNeighbour(row, column)
{
    if(row < 0 || row >= rows || column < 0 || column >= columns)
    {
        return 0;
    }

    if(minesLocation.includes(row.toString() + "-" + column.toString()))
    {
        return 1;
    }
    return 0;
}

/**
 * This function determines the color of the text compared to the mines on the neighbouring tiles
 * @param {*} number The number of mines on neighbouring tiles
 * @returns The w3 HTML class of the color of the text
 */
function numColor(number)
{
    let color;
    switch(number)
    {
        case 1:
            color = "w3-text-deep-purple";
            break;
        case 2:
            color = "w3-text-orange";
            break;
        case 3:
            color = "w3-text-red";
            break;
        case 4:
            color = "w3-text-purple";
            break;
        case 5:
            color = "w3-text-brown";
            break;
        case 6:
            color = "w3-text-teal";
            break;
        case 7:
            color = "w3-text-black";
            break;
        case 8:
            color = "w3-text-gray";
            break;
        default:
            break;
    }
    return color;
}

function mainMenu()
{
    location.reload();
}

/**
 * This function is called when the player has won
 */
function win()
{
    gameOver = true;
    $("boardText").innerHTML = "All Mines Cleared!!!";
    addClass($("boardText"), "w3-text-teal");
    alert("Congratulations, you won!\n Please reload the page if you wish to play again.");
}

/**
 * This function updates the inner HTML of the "flagsCount" element according to the amount of flags placed compared to the amount of mines that are present
 * @param {*} flagNumber The amount of flags placed compared to the amount of mines that are present
 */
function updateFlagNumber(flagNumber)
{
    $("flagsCount").innerHTML = flagNumber;
}

/**
 * When the page loads, multiple buttons have events added which, when triggered, call certain functions.
 */
window.onload = function(){
    $("helpBtn").addEventListener("click", function(){alert(rules);})
    $("helpBtnPhone").addEventListener("click", function(){alert(rules);})
    $("premadeBtn").addEventListener("click", premadeStart);
    $("customBtn").addEventListener("click", customStart);
    $("premadeBtnPhone").addEventListener("click", premadeStart);
    $("customBtnPhone").addEventListener("click", customStart);
    $("mainMenu").addEventListener("click", mainMenu);
}
