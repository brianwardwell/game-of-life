import React, { Component } from 'react';


const totalBoardRows = 40;
const totalBoardColumns = 60;

//This function sets a new random board status
const newBoardStatus = (cellStatus = () => Math.random() < 0.3) => {//This is similar to setting a default value to None. It sets the cellStatus function to this anonymous function that resolves to a boolean
  const grid = [];//Sets up the outer array that will have arrays inside of it
  for (let r = 0; r < totalBoardRows; r++){
    grid[r] = [];//This loops over the outer array 40 times and inserts a blank array into the grid array every time it loops
    for (let c = 0; c < totalBoardColumns; c++){
      grid[r][c] = cellStatus()//Loops 60 times and sets a cell status to the cell that is reference at grid[r][c]
    }
  }
  return grid
};

//Creates the actual board/playing field
const BoardGrid = ({ boardStatus, onToggleCellStatus}) => {// Where is onToggleCellStatus being called from?
  const handleClick = (r,c) => onToggleCellStatus(r,c);//onToggle is another function that isn't defined but it's called here somehow.  
  

  const tr = [];// This creates the board and returns HTML
  for (let r = 0; r < totalBoardRows; r++){
    const td = []
    for (let c = 0;c < totalBoardColumns; c++){
      td.push(
        
        <td //what are the td and tr tags doing?
          key={`${r},${c}`}
          className={boardStatus[r][c] ? 'alive' : 'dead'}
          onClick={() => handleClick(r,c)}//Still confused on how this is working, how it's defined, and how it works with onToggleCellStatus
        />
      );
    }
    tr.push(<tr key={r}>{td}</tr>);
  }
  return <table><tbody>{tr}</tbody></table>
};

const Slider = ({ speed, onSpeedChange }) => {
  const handleChange = e => onSpeedChange(e.target.value);

  return (
      <input
          type='range'// this actually makes the visual slider
          min='50'
          max='1000'
          step='50'
          value={speed}
          onChange={handleChange}
      />
  );
};

  
class App extends Component{

  state = {
    boardStatus: newBoardStatus(),
    generation: 0,
    isGameRunning: false,
    speed: 500// in miliseconds

  }

  handleStep = () => {
    const nextStep = prevState => {
        const boardStatus = prevState.boardStatus;
        const clonedBoardStatus = JSON.parse(JSON.stringify(boardStatus));
        // Checks neighbors of the cell defined by r,c
        const amountTrueNeighbors = (r,c) => {
            const neighbors = [[-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1]];
            return neighbors.reduce((trueNeighbors, neighbor) => {
                const x = r + neighbor[0];
                const y = c + neighbor[1];
                const isNeighborOnBoard = (x >= 0 && x < totalBoardRows && y >= 0 && y < totalBoardColumns);
                /* No need to count more than 4 alive neighbors */
                if (trueNeighbors < 4 && isNeighborOnBoard && boardStatus[x][y]) {
                    return trueNeighbors + 1;
                } else {
  return trueNeighbors;
    }
            }, 0);
        };
  
        for (let r = 0; r < totalBoardRows; r++) {
            for (let c = 0; c < totalBoardColumns; c++) {
                const totalTrueNeighbors = amountTrueNeighbors(r,c);
      
                if (!boardStatus[r][c]) {
                    if (totalTrueNeighbors === 3) clonedBoardStatus[r][c] = true;
                } else {
                    if (totalTrueNeighbors < 2 || totalTrueNeighbors > 3) clonedBoardStatus[r][c] = false;
                }
            }
        }
  
        return clonedBoardStatus;
    };

    this.setState(prevState => ({
        boardStatus: nextStep(prevState),
        generation: prevState.generation + 1
    }));
}




  runStopButton = () => {

    return this.state.isGameRunning ?
    <button type= 'button' onClick = {this.handleStop}>Stop</button> :
    <button type= 'button' onClick = {this.handleRun}>Start</button> 
  }

  handleClearBoard = () => {

    this.setState({
        boardStatus: newBoardStatus(() => false),
        generation: 0
    });

  }

  handleNewBoard = () => {

    this.setState({
        boardStatus: newBoardStatus(),
        generation: 0
    });

  }
//the function below is isolating the specific cell that was clicked and flips boolean
  handleToggleCellStatus = (r,c) => {
    const toggleBoardStatus = prevState => {
        const clonedBoardStatus = JSON.parse(JSON.stringify(prevState.boardStatus));
        clonedBoardStatus[r][c] = !clonedBoardStatus[r][c];// this switches the boolean
        return clonedBoardStatus;
    };
    // this is the part that updates state
    this.setState(prevState => ({
        boardStatus: toggleBoardStatus(prevState)
    }));
}

handleSpeedChange = (newSpeed) => {
  this.setState({ speed: newSpeed })
} 

handleRun = () => {
  this.setState({ isGameRunning: true });
}

handleStop = () => {
  this.setState({ isGameRunning: false });
}

componentDidUpdate(prevProps, prevState){//What are prevProps and prevState and where are they defined? And why is prevProps not used in this function?
  const { isGameRunning, speed } = this.state
  const speedChanged = prevState.speed !== speed
  const gameStarted = !prevState.isGameRunning && isGameRunning
  const gameStopped = prevState.isGameRunning && !isGameRunning

  if ((isGameRunning && speedChanged) || gameStopped){
    clearInterval(this.timerID)//clearInterval is never defined anywhere, how is it used here?  
  }

  if ((isGameRunning && speedChanged) || gameStarted) {
    this.timerID = setInterval(() => {//setInterval is never defined, how is it called here?
      this.handleStep()//Somehow setInterval calls this, which is a variable set to a function above, which then calls nextStep which is a variable set to a function, then amountTrueNeighbors is called in the same way.  How does this all work??
    }, speed)//Don't understand this syntax, why is speed typed after a comma?
  }
}

  
  render() {
    const { boardStatus, isGameRunning, generation, speed} = this.state// Don't props need to be passed to a function before they can be deconstructed?  Wouldn't "props" need to be passed into render()?
  return (
    <div>
      <div className='main'>
        <h1>Game of Life</h1>
        <BoardGrid boardStatus={boardStatus} onToggleCellStatus={this.handleToggleCellStatus} />
        <h2>Rules:</h2>
        <p>1. Any live cell with fewer than two live neighbors dies.</p>
        <p>2. Any live cell with two or three live neighbors lives on to the next generation.</p>
        <p>3. Any live cell with more than three live neighbors dies.</p>
        <p>4. Any dead cell with exactly three live neighbors becomes a live cell.</p>
      </div>
      <div className='flexRow upperControls'>
        <span>
          { '+ '}
          <Slider speed={speed} onSpeedChange={this.handleSpeedChange} />
          { ' -'}
        </span>
        <span id='gen'>{`Generation: ${generation}`}</span>
      </div>
      <div className='flexRow lowerControls'>
        {this.runStopButton()}
        <button type='button' disabled={isGameRunning} onClick={this.handleStep}>Step</button>
        <button type='button' onClick={this.handleClearBoard}>Clear Board</button>
        <button type='button' onClick={this.handleNewBoard}>New Board</button>
      </div>
    </div>
  );
  }
}

export default App;