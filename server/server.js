const WebSocket = require("ws")
const Room = require('./room')

const wss = new WebSocket.Server({ port: 3456 })

let rooms = []
let board = []

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

function searchForRoom(roomID) {
    let foundRoom = undefined
    let roomIndex = -1
    for (let i = 0; i < rooms.length; i++) {
        let room = rooms[i]
        if (room.roomID === roomID) {
            foundRoom = room
            roomIndex = i
            break
        }
    }
    return {room: foundRoom, index: roomIndex}
}

wss.on("connection", ws => {
    console.log("New client connected!")

    ws.on("message", data => {
        console.log(`Client has send to us: ${data}`)
        let dataAsString = data.toString()

        if (dataAsString.startsWith('CONNECT')) {
            let roomName = dataAsString.substr(dataAsString.indexOf(' ') + 1)
            console.log(`Searching for room '${roomName}'`)

            const {room: foundRoom, index: roomIndex} = searchForRoom(roomName)
            if (foundRoom !== undefined) {
                console.log('Room was found')
                if (foundRoom.conn1 !== undefined && foundRoom.conn2 !== undefined) {
                    console.log('Room is full. Rejecting this current connection')
                    ws.send('REJECT Room full')
                    ws.close()
                }
                if (foundRoom.conn2 === undefined) {
                    ws.connNo = 2
                    foundRoom.conn2 = ws
                    ws.send('CONNECTED O')
                } else if (foundRoom.conn1 === undefined) {
                    ws.connNo = 1
                    foundRoom.conn1 = ws
                    ws.send('CONNECTED X')
                }
                ws.send(`STATE ${boardToString(foundRoom.board)}`)
                ws.send(`TURN ${foundRoom.turn}`)
            } else {
                console.log('Room not found. Creating new room')
                ws.connNo = 1
                const newRoom = new Room({roomID: roomName, conn1: ws})
                rooms.push(newRoom)
                ws.send('CONNECTED X')
            }
            ws.roomID = roomName
        }
        else if (dataAsString.startsWith('STATE')) {
            const {room: foundRoom, index: roomIndex} = searchForRoom(ws.roomID)
            let {board} = foundRoom
            board = boardFromString(dataAsString.substr(dataAsString.indexOf(' ') + 1))
            foundRoom.board = board
            if (ws.connNo === 1) {
                foundRoom.conn2.send(`STATE ${boardToString(board)}`)
            } else {
                foundRoom.conn1.send(`STATE ${boardToString(board)}`)
            }
        }
        else if (dataAsString.startsWith('TURN')) {
            const {room: foundRoom, index: _roomIndex} = searchForRoom(ws.roomID)
            foundRoom.turn = dataAsString.substr(dataAsString.indexOf(' ') + 1)
        }
    })

    ws.on("close", () => {
        console.log("Client has disconnected!")

        const {room: foundRoom, index: roomIndex} = searchForRoom(ws.roomID)
        if (foundRoom !== undefined) {
            console.log('Room was found. Removing player from room')
            if (ws.connNo === 1) {
                foundRoom.conn1 = undefined
            }
            else {
                foundRoom.conn2 = undefined
            }

            if (foundRoom.conn1 === undefined && foundRoom.conn2 === undefined) {
                console.log('Room is empty. Deleting room')
                rooms.splice(roomIndex)
            }
        } else {
            console.log('Room not found.')
        }
    })
})