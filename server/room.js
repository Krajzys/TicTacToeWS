class Room {
    roomID
    conn1
    conn2
    board
    turn
    constructor ({roomID, conn1, board = [[' ', ' ', ' '],[' ', ' ', ' '],[' ', ' ', ' ']], turn='X', conn2 = undefined}) {
        this.roomID = roomID
        this.conn1 = conn1
        this.conn2 = conn2
        this.board = board
        this.turn = turn
    }
}

module.exports = Room