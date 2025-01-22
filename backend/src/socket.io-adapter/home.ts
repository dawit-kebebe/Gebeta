import { Server, Socket } from "socket.io";
import { authPlayer } from "../auth/middleware/socket.io";
import { ActiveGames, ActiveUserStore, } from "../database/inmemory";
import GameModel from "../database/models/Game"; import { IGame } from "../game/Game";
import { GameState } from "./ResponseModel";
;

const home = (ioServer: Server) => {

    ioServer.use(authPlayer);

    ioServer.on('connect', (socket: any) => {
        const activeUserStore: ActiveUserStore = ActiveUserStore.getInstance();
        const user = {
            id: socket.user.id,
            isActive: true,
            name: `${socket.user.f_name} ${socket.user.l_name}`,
            username: socket.user.username,
            socketId: socket.id
        };

        activeUserStore.addUser(user.id, user);

        ioServer.emit('user-went-online', {
            id: user.id,
            isActive: user.isActive,
            name: user.name,
            username: user.username,
        });

        socket.on('challenge', (msg: any) => {
            const challengee = activeUserStore.getUser(msg.challengee.id);

            if (challengee) {
                socket.to(challengee.socketId).emit('challenge:incoming', {
                    challenger: {
                        id: socket.user.id,
                        username: socket.user.username,
                        name: `${socket.user.f_name} ${socket.user.l_name}`,
                    },
                    challengee: {
                        id: challengee.id,
                        username: challengee.username,
                        name: challengee.name
                    },
                    gameMode: msg.gameMode
                });
            } else {
                socket.emit('challenge:faild', {
                    challenge: msg,
                    msg: "Could not find challengee."
                });
            }
        });

        socket.on('challenge:accepted', async (msg: any) => {
            const activeChallenger = activeUserStore.getUser(msg.challenger.id)
            const activeChallengee = activeUserStore.getUser(msg.challengee.id)
            if (activeChallengee && activeChallenger) {
                const gameData = {
                    challenger: {
                        id: msg.challenger.id,
                        username: msg.challenger.username,
                        name: msg.challenger.name
                    },
                    challengee: {
                        id: msg.challengee.id,
                        username: msg.challengee.username,
                        name: msg.challengee.name
                    },
                    status: "pending",
                    moves: [],
                    winner: null as any
                }
                const game = new GameModel(gameData);

                await game.save();

                const activeGames: ActiveGames = ActiveGames.getInstance();
                activeGames.addGame(game.id, gameData as IGame);

                ioServer.to(activeChallenger.socketId).to(activeChallengee.socketId).emit('game:start', {
                    gameId: game.id,
                    challenger: msg.challenger,
                    challengee: msg.challengee,
                    gameMode: msg.gameMode,
                    gameStatus: {
                        turn: msg.challenger.id,
                        move: null,
                    }
                });
            }
        })

        socket.on('challenge:rejected', (msg: any, callback: any) => {
            console.log(msg)
        })


        socket.on('game:start', (gameId) => {

        })

        socket.on('player:move', (gameState: GameState) => {
            const activeGames = ActiveGames.getInstance();
            const gameSession = activeGames.getGame(gameState.gameId);
            if (gameSession != null) {

                gameSession.moves.push(gameState.gameStatus.move[gameState.gameStatus.move.length - 1]);
                if (gameSession.challenger.id === socket.user.id) {
                    const opponent = activeUserStore.getUser(gameSession.challengee.id)
                    if (opponent === undefined) {
                        socket.emit('user:disconnected', gameSession.challengee);
                    } else {
                        socket.to(opponent.socketId).emit("player:move", { ...gameState })
                    }
                } else if (gameSession.challengee.id === socket.user.id) {
                    const opponent = activeUserStore.getUser(gameSession.challenger.id)
                    if (opponent === undefined) {
                        socket.emit('user:disconnected', gameSession.challenger);
                    } else {
                        socket.to(opponent.socketId).emit("player:move", { ...gameState })
                    }
                }
            } else {
                socket.emit("game:session:error", {
                    gameId: gameState.gameId,
                    msg: "No game was found!"
                })
            }
        })

        socket.on('player:captured', (gameState: GameState & { capturedPit: number }, callback: (res: boolean) => void) => {
            const activeGames = ActiveGames.getInstance();
            const gameSession = activeGames.getGame(gameState.gameId);
            if (gameSession != null) {
                gameSession.challengee.cupture = gameState.challengee.cupture;
                gameSession.challenger.cupture = gameState.challenger.cupture;

                if (gameSession.challenger.id === socket.user.id) {
                    const opponent = activeUserStore.getUser(gameSession.challengee.id);
                    if (opponent === undefined) {
                        socket.emit('user:disconnected', gameSession.challengee);
                    } else {
                        socket.to(opponent.socketId).emit("player:captured", { ...gameState, capturedPit: gameState.capturedPit });
                    }
                } else if (gameSession.challengee.id === socket.user.id) {
                    const opponent = activeUserStore.getUser(gameSession.challenger.id);
                    if (opponent === undefined) {
                        socket.emit('user:disconnected', gameSession.challenger);
                    } else {
                        socket.to(opponent.socketId).emit("player:captured", { ...gameState, capturedPit: gameState.capturedPit });
                    }
                }

                callback(true);
            } else {
                socket.emit("game:session:error", {
                    gameId: gameState.gameId,
                    msg: "No game was found!"
                });
            }
        });

        socket.on('game:over', (gameState: GameState, callback) => {
            const activeGames = ActiveGames.getInstance();
            const gameSession = activeGames.getGame(gameState.gameId);

            if (gameSession != null) {
                gameSession.challengee.cupture = gameState.challengee.cupture;
                gameSession.challenger.cupture = gameState.challenger.cupture;

                const emitGameOver = (winner: string) => {
                    const opponentId = winner === gameState.challenger.id ? gameSession.challengee.id : gameSession.challenger.id;
                    const opponent = activeUserStore.getUser(opponentId);

                    if (opponent === undefined) {
                        socket.emit('user:disconnected', { id: opponentId });
                    } else {
                        socket.to(opponent.socketId).emit("game:over", { ...gameState, winner });
                    }

                    socket.emit("game:over", { ...gameState, winner });
                    callback(true);
                };

                if (gameState.challengee.cupture < gameState.challenger.cupture) {
                    emitGameOver(gameState.challenger.id);
                } else if (gameState.challengee.cupture > gameState.challenger.cupture) {
                    emitGameOver(gameState.challengee.id);
                } else {
                    callback(false);
                }
            } else {
                socket.emit("game:session:error", {
                    gameId: gameState.gameId,
                    msg: "No game was found!"
                });
            }
        });

        socket.on('disconnect', (reason: any) => {
            ioServer.emit('user-went-offline', socket.user.id);
            activeUserStore.removeUser(socket.user.id);

            console.log("User removed", socket.user);
        })
    })
}

export default home;