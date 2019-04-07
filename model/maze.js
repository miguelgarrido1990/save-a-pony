const Constants = require('../constants/constants')
const Coordinates = require('./coordinates')

const DIRECTIONS = [
  Constants.NORTH,
  Constants.SOUTH,
  Constants.EAST,
  Constants.WEST
]

const indexToCellCoordinates = (index, rowLength) => new Coordinates(index % rowLength, Math.floor(index / rowLength))
const validateCoordinates = (maze, coordinates) =>
  coordinates.x >= 0 && coordinates.x < maze.width
  && coordinates.y >= 0 && coordinates.y < maze.height

module.exports = class Maze {

  constructor(mazeInfo) {
    this.width = mazeInfo.size[0]
    this.height = mazeInfo.size[1]
    this.correctPath = []
    this.pathTaken = []

    this.update(mazeInfo)
  }

  update(mazeInfo) {
    this.pony = indexToCellCoordinates(mazeInfo.pony[0], this.width)
    this.domokun = indexToCellCoordinates(mazeInfo.domokun[0], this.width)
    this.exit = indexToCellCoordinates(mazeInfo['end-point'][0], this.width)
    this.dataToCells(mazeInfo.data)

    this.pathTaken.push(this.pony)

    // If the pony steped out of the correct path we recalculate
    if (!this.pony.includedIn(this.correctPath))
      this.findPath()
    // If not we remove the current coordinates from the optimal path
    else
      this.correctPath = this.correctPath.filter(coordinates => !this.pony.equals(coordinates))

    return this
  }

  dataToCells(data) {
    this.cells = []
    for (let index = 0; index < data.length; index++) {
      const x = index % this.width
      const y = Math.floor(index / this.width)

      if (!this.cells[y])
        this.cells[y] = []

      this.cells[y][x] = data[index]

      if (data[index].includes(Constants.NORTH) && y > 0)
        this.cells[y - 1][x].push(Constants.SOUTH)

      if (data[index].includes(Constants.WEST) && x > 0)
        this.cells[y][x - 1].push(Constants.EAST)
    }
  }

  ended() {
    return this.isPonyDead() || this.isPonyOut()
  }

  isPonyOut() {
    return this.pony.equals(this.exit)
  }

  isPonyDead() {
    return this.pony.equals(this.domokun)
  }
  
  getNextMove() {
    // We calculate the dangerous coordinates to step into
    const domokunPossibilities = this.getAllAdjacentCoordinates(this.domokun)

    // Then we calculate the safeMoves
    const safeMoves = DIRECTIONS.filter(direction => {
      const nextStepCoord = this.getAdjacentCoordinates(this.pony, direction)
      return nextStepCoord && !nextStepCoord.equals(this.domokun)
        && !domokunPossibilities.find(cell => cell.equals(nextStepCoord))
    })
    if (Constants.DEBUG)
      console.debug('safe moves', safeMoves)

    // First we check if the pony can take the next optimal step safely
    const optimalMove = safeMoves.find(direction => {
      const nextStepCoord = this.getAdjacentCoordinates(this.pony, direction)
      return nextStepCoord && nextStepCoord.includedIn(this.correctPath)
        && !nextStepCoord.equals(this.domokun)
        && !domokunPossibilities.find(cell => cell.equals(nextStepCoord))
    })
    if (Constants.DEBUG)
      console.debug('optimalMove', optimalMove)
    if (optimalMove)
      return optimalMove

      // If it's not safe we take a step back
    const moveBack = safeMoves.find(direction => {
      const nextStepCoord = this.getAdjacentCoordinates(this.pony, direction)
      return nextStepCoord && nextStepCoord.includedIn(this.pathTaken)
        && !nextStepCoord.equals(this.domokun)
        && !domokunPossibilities.find(cell => cell.equals(nextStepCoord))
    })
    if (Constants.DEBUG)
      console.debug('moveBack', moveBack)
    if (moveBack)
      return moveBack

    // If there isn't way back either we'll take a random safe step
    return safeMoves[Math.floor(Math.random() * safeMoves.length)]
  }

  getAllAdjacentCoordinates(origin) {
    return DIRECTIONS
      .map(direction => this.getAdjacentCoordinates(origin, direction))
      .filter(cell => !!cell)
  }

  getAdjacentCoordinates(origin, direction) {
    const walls = this.getCell(origin)

    if (walls.includes(direction))
      return

    let adjacentCoordinates
    switch (direction) {
      case Constants.NORTH:
        adjacentCoordinates = new Coordinates(origin.x, origin.y - 1)
        break
      case Constants.SOUTH:
        adjacentCoordinates = new Coordinates(origin.x, origin.y + 1)
        break
      case Constants.EAST:
        adjacentCoordinates = new Coordinates(origin.x + 1, origin.y)
        break
      case Constants.WEST:
        adjacentCoordinates = new Coordinates(origin.x - 1, origin.y)
        break
    }

    if (!validateCoordinates(this, adjacentCoordinates))
      return

    return adjacentCoordinates
  }

  getCell(coordinates) {
    return this.cells[coordinates.y][coordinates.x]
  }

  findPath() {
    this.wasHere = []
    this.correctPath = []
    for (let col = 0; col < this.height; col++) {
      this.wasHere[col] = []
      for (let row = 0; row < this.width; row++) {
        this.wasHere[col][row] = false
      }
    }

    this.recursiveSolve(this.exit)
  }

  recursiveSolve(cell) {
    if (cell.equals(this.pony)) 
      return true
      
    if (this.wasHere[cell.y][cell.x]) 
      return false
      
    this.wasHere[cell.y][cell.x] = true

    let adjacents = this.getAllAdjacentCoordinates(cell)
    for (let adjacent of adjacents) {
      if (this.recursiveSolve(adjacent)) {
        this.correctPath.push(cell)
        return true
      }
    }
    return false
  }
}