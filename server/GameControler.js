export function GameControler(room, playerList, roomList) {
    let self = {
        room: room,
        connected: [],
        lastPlayerId: 0,
        plusTwoInPlay: 0,
        plusFourInPlay: false,
        turnRotation: 1,
        turnSkip: 1
    }
    self.calculateScores = function () {
        let scores = {}
        for (let i = 0; i < this.connected.length; i++) {
            let score = 0
            let id = this.connected[i]
            let currentPlayer = playerList[id]
            for (let j = 0; j < currentPlayer.cards.length; j++) {
                let card = currentPlayer.cards[j]
                if (isNaN(Number(card.value))) {
                    if (card.color === 'black') {
                        score += 50
                    }
                    else {
                        score += 20
                    }
                }
                else {
                    score += Number(card.value)
                }
            }
            scores[id] = score
        }
        return scores
    }
    self.dealCards = function () {
        let cards = [];
        for (let i = 0; i < 7; i++) {
            cards.push(generateCard(true));
        }
        return cards
    }
    self.dealNewRound = function () {
        let scores = this.calculateScores()
        let idWithHighestScore = 0
        let highestScore = 0
        for (let id in scores) {
            let score = scores[id]
            if (score >= highestScore) {
                highestScore = score
                idWithHighestScore = id
            }
        }
        for (let i = 0; i < this.connected.length; i++) {
            let id = this.connected[i]
            let currentPlayer = playerList[id]
            let score = scores[id]
            if (currentPlayer.scores.length > 0) {
                score += currentPlayer.scores[currentPlayer.scores.length - 1]
            }
            currentPlayer.scores.push(score)
            currentPlayer.cards = this.dealCards()
            currentPlayer.hasTurn = false
            currentPlayer.pressedEitt = false
        }
        this.plusFourInPlay = false
        this.plusTwoInPlay = 0
        this.turnRotation = 1
        this.turnSkip = 1
        playerList[idWithHighestScore].hasTurn = true
        this.playCard(generateCard(false))
        this.turnSwitch()
        this.sendGameStatus()
    }
    self.drawCards = function (number = 1) {
        let cards = [];
        if (this.lastPlayedCard.value == '+4') {
            number = 4
        }
        else if (this.plusTwoInPlay) {
            number = this.plusTwoInPlay * 2;
        }
        for (let i = 0; i < number; i++) {
            cards.push(generateCard(true));
        }
        return cards;
    }
    self.playCard = function (card) {
        this.lastPlayedCard = card
        if (card.value == '+4') this.plusFourInPlay = true
        else if (card.value == '+2') this.plusTwoInPlay = this.plusTwoInPlay + 1
        else if (card.value == 'R') this.turnRotation = (this.turnRotation * -1)
        else if (card.value == 'S') this.turnSkip = 2
        this.pressedEitt = false
}
    self.turnAssign = function () {
        let hasTurn = false;
        for(let i = 0; i < this.connected.length; i++){
            let currentPlayer = playerList[this.connected[i]]
            if (currentPlayer.hasTurn) hasTurn = true;
        }
        if (!hasTurn) {
            let randomId = this.connected[Math.floor(Math.random() * this.connected.length)];
            playerList[randomId].hasTurn = true;
        }
    }
    self.turnSwitch = function () {
        let nextPlayer = 0;
        let nextPlayerTurn = 99;
        for(let i = 0; i < this.connected.length; i++){
            let currentPlayer = playerList[this.connected[i]]
            if (currentPlayer.hasTurn){
                nextPlayerTurn = nextPlayer + (1 * this.turnRotation * this.turnSkip);
                currentPlayer.hasTurn = false;
                this.turnSkip = 1;
            }
            nextPlayer++;
        }
        while(nextPlayerTurn > (this.connected.length - 1)) nextPlayerTurn = nextPlayerTurn - this.connected.length;
        while(nextPlayerTurn < 0) nextPlayerTurn = this.connected.length + nextPlayerTurn
        nextPlayer = 0;
        for(let i = 0; i < this.connected.length; i++){
            let currentPlayer = playerList[this.connected[i]]
            if (nextPlayer == nextPlayerTurn) {
                currentPlayer.hasTurn = true;
            }
            nextPlayer++;
        }
    }
    self.sendGameStatus = function () {
        let pack = [];
        for(let i = 0; i < this.connected.length; i++){
            let currentPlayer = playerList[this.connected[i]]
            pack.push({
                id:currentPlayer.id,
                name:currentPlayer.name,
                numberOfCards:currentPlayer.cards.length,
                hasTurn:currentPlayer.hasTurn,
                pressedEitt:currentPlayer.pressedEitt,
                scores:currentPlayer.scores
            });
        }
        for(let i = 0; i < this.connected.length; i++){
            let currentPlayer = playerList[this.connected[i]]
            let gameStatus = {
                id: currentPlayer.id,
                cards: currentPlayer.cards,
                hasTurn: currentPlayer.hasTurn,
                playerList: pack,
                lastPlayedCard: this.lastPlayedCard
            };
            currentPlayer.emit('gameStatus', gameStatus);
        }
    }
    self.sendRoomStatus = function () {
        let pack = [];
        for(let i in roomList){
            let currentRoom = roomList[i]
            pack.push({
                room:currentRoom.room
            });
        }
        for(let i = 0; i < this.connected.length; i++){
            let currentPlayer = playerList[this.connected[i]]
            currentPlayer.emit('roomStatus', pack);
        }
    }
    self.playCard(generateCard(false))
    return self
}

function generateCard(allowPlusFour) {
    let colors = ['blue', 'red', 'green', 'yellow'];
    let values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+2', 'R', 'S', 'W'];
    if (allowPlusFour) {
        values.push('+4')
    }
    let color = 'black';
    let value = values[Math.floor(Math.random() * values.length)];
    if (value !== '+4' && value !== 'W') {
        color = colors[Math.floor(Math.random() * colors.length)];
    }
    return { color, value };
}