const APICalls = require('./services/APICalls')
const Constants = require('./constants/constants')

const Maze = require('./model/maze')

main()

async function main() {
  const mazeId = await APICalls.createMaze(
    Constants.DIMENSIONS.WIDTH, 
    Constants.DIMENSIONS.HEIGHT, 
    Constants.MY_LITTLE_PONY,
    Constants.DIFFICULTY
  )

  console.log('Maze ID:', mazeId)
  let mazeInfo = await APICalls.getMaze(mazeId)
  let maze = new Maze(mazeInfo)

  do {
    let nextMove = maze.getNextMove()
    await APICalls.makeAMove(mazeId, nextMove)
    mazeInfo = await APICalls.getMaze(mazeId)
    maze = maze.update(mazeInfo)

    if (Constants.DEBUG)
      console.log(await APICalls.printMaze(mazeId))

  } while (!maze.ended())

  const message = maze.isPonyDead() ? 'The pony died =´(' : 
    maze.isPonyOut() ? 'The pony made it out. YEAH!' : 
    'Oops! Something went wrong'

  console.log(message)
  return
}