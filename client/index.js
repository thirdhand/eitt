import { generateCard } from '/client/game.js';

function createClickHandler(card) {
    return function clickHandler() {
        socket.emit('playCard', card);
    }
}

function renderCards(cards) {
    let cardsElement = document.getElementById('cards');
    let fragment = document.createDocumentFragment();
    for (let card of cards) {
        let element = document.createElement('button');
        element.addEventListener('click', createClickHandler(card));
        element.textContent = JSON.stringify(card);
        fragment.appendChild(element);
    }
    cardsElement.appendChild(fragment);
}

function renderLastPlayedCard(card) {
    let lastPlayedCardElement = document.getElementById('last-played-card');
    lastPlayedCardElement.textContent = JSON.stringify(card);
}

let cards = [];
for (let i = 0; i <= 7; i++) {
    cards.push(generateCard());
}

console.log(cards);

renderCards(cards);

var socket = io();

socket.on('lastPlayed', renderLastPlayedCard);
