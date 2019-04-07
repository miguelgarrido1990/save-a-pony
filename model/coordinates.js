
module.exports = class Coordinates {

  constructor(x, y) {
    this.x = x
    this.y = y
  }
  
  includedIn(coordinatesArray) {
    if (!Array.isArray(coordinatesArray) || coordinatesArray.length == 0)
      return false

    return !!coordinatesArray.find(element => this.equals(element))
  }

  equals(otherCoordinates) {
    if (this === undefined) {
      return otherCoordinates === undefined
    }
    if (otherCoordinates === undefined) {
      return false
    }
    return this.x === otherCoordinates.x && this.y === otherCoordinates.y
  }
}