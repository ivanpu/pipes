'use strict'

/* global angular */

var app = angular.module('pipesGame', ['ngRoute'])

app.config(function ($routeProvider, $locationProvider) {
  $locationProvider.hashPrefix('')

  $routeProvider
  .when('/', {
    templateUrl: 'assets/views/board.html',
    controller: 'gameController'
  })
  .otherwise({
    redirectTo: '#/'
  })
})

app.controller('gameController', ['$scope', function ($scope) {
  $scope.gameData = {
    board: []
  }

  // cell prototype
  var Cell = {
    source: false,
    powered: false,
    type: 10,
    rotation: 0,
    up: null,
    down: null,
    left: null,
    right: null,
    aligned: function (other) {
      if (other) {
        switch (other) {
          case this.up:
            if ((
              (other.type === 10 && other.rotation === 2) ||
              (other.type === 21 && (other.rotation === 0 || other.rotation === 2)) ||
              (other.type === 22 && (other.rotation === 1 || other.rotation === 2)) ||
              (other.type === 30 && other.rotation !== 3) ||
              (other.type === 40)
            ) && (
              (this.type === 10 && this.rotation === 0) ||
              (this.type === 21 && (this.rotation === 0 || this.rotation === 2)) ||
              (this.type === 22 && (this.rotation === 0 || this.rotation === 3)) ||
              (this.type === 30 && this.rotation !== 1) ||
              (this.type === 40)
            )) return true
            break

          case this.down:
            if ((
              (other.type === 10 && other.rotation === 0) ||
              (other.type === 21 && (other.rotation === 0 || other.rotation === 2)) ||
              (other.type === 22 && (other.rotation === 0 || other.rotation === 3)) ||
              (other.type === 30 && other.rotation !== 1) ||
              (other.type === 40)
            ) && (
              (this.type === 10 && this.rotation === 2) ||
              (this.type === 21 && (this.rotation === 0 || this.rotation === 2)) ||
              (this.type === 22 && (this.rotation === 1 || this.rotation === 2)) ||
              (this.type === 30 && this.rotation !== 3) ||
              (this.type === 40)
            )) return true
            break

          case this.left:
            if ((
              (other.type === 10 && other.rotation === 1) ||
              (other.type === 21 && (other.rotation === 1 || other.rotation === 3)) ||
              (other.type === 22 && (other.rotation === 0 || other.rotation === 1)) ||
              (other.type === 30 && other.rotation !== 2) ||
              (other.type === 40)
            ) && (
              (this.type === 10 && this.rotation === 3) ||
              (this.type === 21 && (this.rotation === 1 || this.rotation === 3)) ||
              (this.type === 22 && (this.rotation === 2 || this.rotation === 3)) ||
              (this.type === 30 && this.rotation !== 0) ||
              (this.type === 40)
            )) return true
            break

          case this.right:
            if ((
              (other.type === 10 && other.rotation === 3) ||
              (other.type === 21 && (other.rotation === 1 || other.rotation === 3)) ||
              (other.type === 22 && (other.rotation === 2 || other.rotation === 3)) ||
              (other.type === 30 && other.rotation !== 0) ||
              (other.type === 40)
            ) && (
              (this.type === 10 && this.rotation === 1) ||
              (this.type === 21 && (this.rotation === 1 || this.rotation === 3)) ||
              (this.type === 22 && (this.rotation === 0 || this.rotation === 1)) ||
              (this.type === 30 && this.rotation !== 2) ||
              (this.type === 40)
            )) return true
            break
        }
      }
      return false
    },
    style: function () {
      return {
        color: this.source ? 'green' : (this.powered ? 'orange' : 'darkblue'),
        transform: 'rotate(' + (this.rotation * 90) + 'deg)',

        // temporary - until switched to images
        'font-size': '200%',
        'text-align': 'center',
        width: '1em'
      }
    },
    symbol: function () {
      switch (this.type) {
        case 10: return '╹'
        case 21: return '┃'
        case 22: return '┗'
        case 30: return '┣'
        case 40: return '╋'
        default: return '×'
      }
    }
  }

  var row, col

  // prefill the board
  for (row = 0; row < 10; ++row) {
    var newRow = []
    for (col = 0; col < 10; ++col) {
      var newCell = Object.create(Cell)

      // newCell.powered = Math.random() >= 0.5
      newCell.rotation = Math.floor(Math.random() * 4)

      newCell.type = Math.floor(Math.random() * 4 + 1) * 10
      if (newCell.type === 20) {
        newCell.type += Math.floor(Math.random() * 2 + 1)
      }

      newRow.push(newCell)
    }
    $scope.gameData.board.push(newRow)
  }

  // link cells
  for (row = 0; row < 10; ++row) {
    for (col = 0; col < 10; ++col) {
      $scope.gameData.board[row][col].up = (row === 0)
      ? $scope.gameData.board[9][col]
      : $scope.gameData.board[row - 1][col]

      $scope.gameData.board[row][col].down = (row === 9)
      ? $scope.gameData.board[0][col]
      : $scope.gameData.board[row + 1][col]

      $scope.gameData.board[row][col].left = (col === 0)
      ? $scope.gameData.board[row][9]
      : $scope.gameData.board[row][col - 1]

      $scope.gameData.board[row][col].right = (col === 9)
      ? $scope.gameData.board[row][0]
      : $scope.gameData.board[row][col + 1]
    }
  }

  // ignition!
  var source = $scope.gameData.board[Math.floor(Math.random() * 10)][Math.floor(Math.random() * 10)]
  source.source = source.powered = true

  var relight = function () {
    var row, col, cell

    // reset "powered" state
    for (row = 0; row < 10; ++row) {
      for (col = 0; col < 10; ++col) {
        cell = $scope.gameData.board[row][col]
        cell.powered = cell === source
      }
    }

    // update "powered" state
    var changed
    do {
      changed = false
      for (row = 0; row < 10; ++row) {
        for (col = 0; col < 10; ++col) {
          cell = $scope.gameData.board[row][col]
          if (!cell.powered) {
            if (
              (cell.aligned(cell.up) && cell.up.powered) ||
              (cell.aligned(cell.down) && cell.down.powered) ||
              (cell.aligned(cell.left) && cell.left.powered) ||
              (cell.aligned(cell.right) && cell.right.powered)
            ) {
              cell.powered = true
              changed = true
            }
          }
        }
      }
    } while (changed)

    // console.log($scope.gameData.board)
  }

  // basic interaction
  $scope.click = function (cell) {
    cell.rotation = (cell.rotation + 1) % 4
    relight()
  }

  // start
  relight()
}])

app.directive('ivnPipesCell', function () {
  return {
    restrict: 'E',
    templateUrl: 'assets/views/cell.html'
  }
})
