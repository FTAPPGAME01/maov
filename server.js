const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let gameState = {
    currentPlayer: 'Ruperto',
    score: {'Ruperto': 100000, 'Juan': 100000, 'Mauricio': 100000},
    diamondStates: [
        {available: true, emoji: '💎'},
        {available: true, emoji: '💎'},
        {available: true, emoji: '☀️'},
        {available: true, emoji: '☀️'}
    ],
    goldBarStates: [
        {available: true, emoji: '💰'},
        {available: true, emoji: '💰'},
        {available: true, emoji: '🥇'},
        {available: true, emoji: '🥇'}
    ],
    rubyStates: [
        {available: true, emoji: '🔴'},
        {available: true, emoji: '🔴'},
        {available: true, emoji: '🍀'},
        {available: true, emoji: '🍀'}
    ],
    trophyStates: [
        {available: true, emoji: '💚'},
        {available: true, emoji: '💚'},
        {available: true, emoji: '🏆'},
        {available: true, emoji: '🏆'}
    ],
    takenRowsByPlayer: {Ruperto: [], Juan: [], Mauricio: []},
    takenCount: 0,
    timeLeft: 10,
};

// This line should come after initializing `app`
app.use(express.static('public'));
io.on('connection', (socket) => {
    console.log('A user connected');
    socket.emit('initialState', gameState);

    socket.on('updateState', (updatedState) => {
        gameState = updatedState;
        io.emit('stateChanged', gameState);
    });

    socket.on('registerPlayer', (playerData) => {
        const { username, email, password } = playerData;
        if (registeredPlayers[email]) {
            socket.emit('registrationError', 'Este correo electrónico ya está registrado');
        } else {
            const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
            registeredPlayers[email] = { username, hashedPassword };
            socket.emit('registrationSuccess', { username, email });
            
            // Inicializar el jugador en el gameState
            gameState.score[username] = 100000;
            gameState.takenRowsByPlayer[username] = [];
            io.emit('updatePlayersList', Object.keys(gameState.score));
        }
    });
    socket.on('login', (loginData) => {
        const { email, password } = loginData;
        const player = registeredPlayers[email];
        if (player) {
            const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
            if (hashedPassword === player.hashedPassword) {
                socket.emit('loginSuccess', { username: player.username, email });
            } else {
                socket.emit('loginError', 'Contraseña incorrecta');
            }
        } else {
            socket.emit('loginError', 'Usuario no encontrado');
        }
    });


    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});