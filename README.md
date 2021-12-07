# TicTacToeWS

WebSocket based simple tic tac toe

## How to run

1. Clone this repository
1. Go to server
1. Run `npm install`
1. Run server with `node server.js`
1. Open index.html in your browser
1. Enjoy

## New communication specification

Every message has exactly 3 bytes (24 bits)

```
000 0 00000000000000000000
⎹   ⎹ ⎹
⎹   ⎹ ⎹
⎹   ⎹ ⎿ Data (20 bits)
⎹   ⎹ 
⎹   ⎿ Player turn - 0=X 1=O (1 bit)
⎹
⎿ Operation Code (3 bits)
```

Operation Codes:

| Code | Meaning           | Data meaning  |
| -----|-------------------|---------------|
| 000  | Connect           | Game id       | 
| 001  | Authenticate      | Game password | 
| 010  | Start game        | none          | 
| 011  | Board state       | State of each field (e.g. board below) | 
| 100  | Stop game         | STOP Reason code | 
| 101  | Restore state     | State of each field | 
| 110  | Response Not OK   | NOK Reason code | 
| 111  | Response OK       | OK Reason code | 

TODO: come up with reason codes
Reason Codes: 

OK:

NOK:

STOP:

## Example board and board state message

00 - empty  
01 - X  
10 - O  
11 - not used  

after X move:
```
X | X | O
O | O | X
  | X |  

01 | 01 | 10
10 | 10 | 01
00 | 01 | 00

011 0 010110101001000100 00
⎹   ⎹ ⎹                  ⎹
⎹   ⎹ ⎹                  ⎿ Padded with zeros
⎹   ⎹ ⎹
⎹   ⎹ ⎿ Board state
⎹   ⎹
⎹   ⎿ Player X turn (0)
⎹
⎿ Board state message (011)
```