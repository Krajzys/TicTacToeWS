
// ws.addEventListener("open", () => {
    //     console.log("We are connected!")
    
    //     ws.send('Some kind of message!')
    // })
    
    // ws.addEventListener("message", (data) => {
        //     console.log("we received " + data.data)
        // })

let board = [
    [' ', ' ', ' '],
    [' ', ' ', ' '],
    [' ', ' ', ' ']
]

let currPlayer = 'X'
let turn = 'X'
let state = ''
let ws = undefined
let connStatus = 'Not connected'

function checkWin() {
    let win = ''
    for (let i = 0; i < 3; i++) {
        // Row win
        if (board[i][0] === turn && board[i][1] === turn && board[i][2] === turn) {
            console.log(`${turn} Wins!`)
            win = turn
        }
        // Column win
        else if (board[0][i] === turn && board[1][i] === turn && board[2][i] === turn) {
            console.log(`${turn} Wins!`)
            win = turn
        }
    }
    // Across win
    if ((board[0][0] === turn && board[1][1] === turn && board[2][2] === turn) ||
        (board[2][0] === turn && board[1][1] === turn && board[0][2] === turn)) {
        win = turn
    }
    let gameOn = false
    if (win === '') {
        board.forEach((row) => {
            row.forEach((field) => {
                if (field === ' ') {
                    gameOn = true
                }
            })
        })
        if (!gameOn) {
            win = '-'
        }
    }
    return win
}

function checkMove(x, y) {
    if (board[x][y] !== ' ') {
        return false
    }
    return true
}

function boardFromString(boardString) {
    let boardArray = [[],[],[]]
    for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
            boardArray[x].push(boardString[x*3+y])
        }
    }
    
    return boardArray
}

function boardToString(boardArray) {
    let boardString = ''
    for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
            boardString += boardArray[x][y]
        }
    }

    return boardString
}

function generateID() {
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890='
    let ID = ''
    for (let i = 0; i < 5; i++) {
        let index = Math.floor(Math.random()*characters.length)
        ID += characters.charAt(index)
    }
    return ID
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector(`#myCanvas`)
    const resetButton = document.querySelector(`#resetButton`)
    const infoBox = document.querySelector(`.infoBox`)
    const playAs = document.querySelector(`.playAs`)
    const connectionStatus = document.querySelector(`.connectionStatus`)
    const gameIDInput = document.querySelector(`#gameID`)
    const connectButton = document.querySelector(`#connectButton`)
    const generateIDButton = document.querySelector(`#generateIDButton`)

    let xsize = canvas.clientWidth/3
    let ysize = canvas.clientHeight/3

    infoBox.innerText = `${turn} turn`
    drawBoard()

    generateIDButton.addEventListener('click', (event) => {
        gameIDInput.value = generateID()
        connectionStatus.innerText = `Share this code (${gameIDInput.value}) with your friend`
    })

    connectButton.addEventListener('click', (event) => {
        if (gameIDInput.value === '') {
            return
        }

        
        if (ws !== undefined) {
            infoBox.innerText = 'You already have one open connection!'
            return
        }
        
        board = [
            [' ', ' ', ' '],
            [' ', ' ', ' '],
            [' ', ' ', ' ']
        ]
        turn = 'X'
        state = ''
        infoBox.innerText = `${turn} turn`
        drawBoard()
        resetButton.setAttribute('hidden', true)

        ws = new WebSocket(`ws://localhost:3456`)

        ws.addEventListener('open', () => {
            console.log('Connected to Server!')
            ws.send(`CONNECT ${gameIDInput.value}`)
        })

        ws.addEventListener('message', (data) => {
            console.log(`We received the following message ${data.data}`)
            let dataAsString = data.data.toString()
            if (dataAsString.startsWith('CONNECTED')) {
                currPlayer = dataAsString.substr(dataAsString.indexOf(' ') + 1)
                playAs.innerText = `You play as ${currPlayer}`
                connStatus = 'Waiting for other player'
                connectionStatus.innerText = 'Connected, waiting for other player'
            }
            if (dataAsString.startsWith('START')) {
                connStatus = 'Connected'
                connectionStatus.innerText = 'Connected, both players present'
            }
            if (dataAsString.startsWith('LEFT')) {
                connStatus = 'Waiting for other player'
                connectionStatus.innerText = 'Connected, waiting for other player'
            }
            if (dataAsString.startsWith('REJECT')) {
                connectionStatus.innerText = 'The game you are trying to join is full'
            }
            if (dataAsString.startsWith('STATE')) {
                let boardState = dataAsString.substr(dataAsString.indexOf(' ') + 1)
                board = boardFromString(boardState)
                let wins = checkWin()
                if (wins === '-') {
                    state = 'draw'
                    infoBox.innerText = 'It\'s a draw!\n'
                    infoBox.innerText += `Press Reset to restart`
                } else if (wins !== '') {
                    state = 'win'
                    infoBox.innerText = `${wins} has won!\n`
                    infoBox.innerText += `Press Reset to restart`
                }
                else {
                    turn = (turn === 'X')?'O':'X'
                    infoBox.innerText = `${turn} turn`
                }
                drawBoard()
            }
            if (dataAsString.startsWith('TURN')) {
                turn = dataAsString.substr(dataAsString.indexOf(' ') + 1)
                infoBox.innerText = `${turn} turn`
                let wins = checkWin()
                if (wins === '-') {
                    state = 'draw'
                    infoBox.innerText = 'It\'s a draw!\n'
                    infoBox.innerText = `Press Reset to restart`
                } else if (wins !== '') {
                    state = 'win'
                    infoBox.innerText = `${wins} has won!\n`
                    infoBox.innerText += `Press Reset to restart`
                }
                else {
                    infoBox.innerText = `${turn} turn`
                }
                drawBoard()
            }
        })

        ws.addEventListener('close', () => {
            ws = undefined
        })
    })

    resetButton.addEventListener('click', (event) => {
        board = [
            [' ', ' ', ' '],
            [' ', ' ', ' '],
            [' ', ' ', ' ']
        ]
        turn = 'X'
        state = ''
        infoBox.innerText = `${turn} turn`
        drawBoard()
    })

    canvas.addEventListener('click', (event) => {
        console.log(`Click at: ${event.offsetX} ${event.offsetY}`)
        let x = Math.floor(event.offsetX / xsize)
        let y = Math.floor(event.offsetY / ysize)

        console.log(`Translates to: ${x} ${y}`)

        if ((state === '' && ws === undefined) || (connStatus === 'Connected' && turn === currPlayer)) {
            let moveOK = checkMove(x, y)
            if (moveOK) {
                board[x][y] = turn
                drawBoard()
                let wins = checkWin()
                if (wins === '-') {
                    state = 'draw'
                    infoBox.innerText = 'It\'s a draw!\n'
                    infoBox.innerText =+ `Press Reset to restart`
                } else if (wins !== '') {
                    state = 'win'
                    infoBox.innerText = `${wins} has won!\n`
                    infoBox.innerText += `Press Reset to restart`
                } else {
                    turn = (turn === 'X')?'O':'X'
                    infoBox.innerText = `${turn} turn`
                }
                ws.send(`STATE ${boardToString(board)}`)
                ws.send(`TURN ${turn}`)
            }
        }
    })

    function drawX(x, y) {
        let ctx = canvas.getContext('2d')
        ctx.moveTo(x, y)
        ctx.lineTo(x+xsize, y+ysize)
        ctx.stroke()
        ctx.moveTo(x+xsize, y)
        ctx.lineTo(x, y+ysize)
        ctx.stroke()
    }

    function drawO(x, y) {
        let ctx = canvas.getContext('2d')
        ctx.beginPath();
        ctx.arc(x, y, (xsize < ysize)? xsize/2 : ysize/2, 0, 2 * Math.PI);
        ctx.stroke();
    }

    function drawBoard() {
        let ctx = canvas.getContext('2d')
        ctx.fillStyle = "#FFFFFF"
        ctx.fillRect(0, 0, 400, 400)

        // Draw lines
        for (let i = 1; i < 3; i++) {
            ctx.beginPath()
            ctx.moveTo(xsize*i, 0)
            ctx.lineTo(xsize*i, canvas.clientWidth)
            ctx.stroke()
            ctx.moveTo(0, ysize*i)
            ctx.lineTo(canvas.clientHeight, ysize*i)
            ctx.stroke()
        }

        // Draw symbols
        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                if (board[x][y] === 'X') {
                    drawX(xsize*x, ysize*y)
                }
                if (board[x][y] === 'O') {
                    drawO(xsize*x+(xsize/2), ysize*y+(ysize/2))
                }
            }
        }
    }
})
