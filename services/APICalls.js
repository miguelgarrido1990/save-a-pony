const fetch = require('node-fetch')
const Constants = require('../constants/constants')

const VALID_DIRECTIONS = [
	Constants.NORTH,
  Constants.SOUTH,
  Constants.EAST,
  Constants.WEST
]

const ENDPOINT = Constants.BASE_URL + Constants.MAZE_PATH

module.exports.createMaze = async function (width, height, playerName, difficulty) {
  if (!validateDimensions(width, height)) {
      return new Error(`The width and height dimensions should not exceed the following constraints MIN=${Constants.DIMENSION_CONSTRAINTS.MIN} MAX=${Constants.DIMENSION_CONSTRAINTS.MAX}`)
  }

  if (!validateDifficulty(difficulty)) {
    return new Error(`The level of difficulty should not exceed the following constraints MIN=${Constants.DIFFICULTY_CONSTRAINTS.MIN} MAX=${Constants.DIFFICULTY_CONSTRAINTS.MAX}`)
  }
  
  const reqBody = {
    'maze-width': width,
    'maze-height': height,
    'maze-player-name': playerName,
    'difficulty': difficulty
  }

  const reqPayload = { 
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(reqBody) 
  }

  let response = await fetch(ENDPOINT, reqPayload)
  let data = await response.json()
  
  return data ? data.maze_id : null
}

module.exports.getMaze = async function (mazeId) {
  let response = await fetch(`${ENDPOINT}/${mazeId}`)
  let data = await response.json()
  return data
}

module.exports.makeAMove = async function (mazeId, direction) {
  if (!validateDirection(direction)) {
    return {}
  }

  const reqPayload = { 
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ direction })
  }

  let response = await fetch(`${ENDPOINT}/${mazeId}`, reqPayload)
  if (response.status == 200) {
    let data = await response.json()
    return data
  }
  return 
}

module.exports.printMaze = async function (mazeId) {
  let response = await fetch(`${ENDPOINT}/${mazeId}/${Constants.PRINT_PATH}`)
  let data = await response.text()
  return data
}

function validateDimensions(width, height) {
  return width >= Constants.DIMENSION_CONSTRAINTS.MIN
    && width <= Constants.DIMENSION_CONSTRAINTS.MAX
    && height >= Constants.DIMENSION_CONSTRAINTS.MIN
    && height <= Constants.DIMENSION_CONSTRAINTS.MAX
}

function validateDifficulty(difficulty) {
  return difficulty >= Constants.DIFFICULTY_CONSTRAINTS.MIN
    && difficulty <= Constants.DIFFICULTY_CONSTRAINTS.MAX
}

function validateDirection(direction) {
  return VALID_DIRECTIONS.includes(direction)
}
