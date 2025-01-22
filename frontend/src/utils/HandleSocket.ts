import { Socket } from "socket.io-client";

import { Player } from "./ActiveEntities";
import state from "./StateManagement";
import { handleUnauthorizedError } from "./HandleUnauthorizedError";
import { Notification } from "../components/NotifyFaildProcess";
import { IncomingRequest } from "../components/IncomingReq";
import GebetaGame from "../game/store/gebetaObjStore";
import { GameState } from "../game/mode/Mode";
import { WinnerMenu } from "../components/WinnerMenu";

export function setupSocketHandlers(socketClient: Socket, appContainer: HTMLDivElement) {
    socketClient.on('user-went-offline', (playerId: string) => {
        state.removePlayer(playerId);
    });

    socketClient.on('user-went-online', (player: Player) => {
        if (player.id != state.user.id) {
            state.addPlayer(player);
        }
    });

    socketClient.on('challenge:faild', (reason: { challenge: any, msg: string }) => {
        const faildReqToPlayer = reason.challenge.challengee;
        Notification("Request Failed!", `${reason.msg} <br> Request to ${faildReqToPlayer.name} failed.`, appContainer);
    });

    socketClient.on('challenge:rejected', (reason: { challenge: any, msg: string }) => {
        const faildReqToPlayer = reason.challenge.challengee;
        Notification("Challenge Rejected!", `${reason.msg} <br> Request to ${faildReqToPlayer.name} failed.`, appContainer);
    });

    socketClient.on('challenge:incoming', (challenge: any) => {
        IncomingRequest("Incoming Challenge", `<b>${challenge.challenger.name}</b> has challenged you to ${challenge.gameMode} game.`, appContainer,
            () => {
                socketClient.emit('challenge:accepted', challenge);
            },
            () => {
                socketClient.emit('challenge:rejected', challenge);
            });
    });

    socketClient.on('game:start', (game: any) => {
        state.setGame(game);
        state.setPage('home');
        state.setPage('game');
    });

    socketClient.on('player:move', (gameState: GameState) => {
        const gabetaGame = GebetaGame.getInstance();
        const gebeta = gabetaGame.getGebeta();

        if (gebeta !== undefined) {
            const lastMove = gameState.gameStatus.move.pop()

            if (lastMove !== undefined) {
                const whichPit = gebeta.pits[lastMove];
                if (whichPit === undefined) {
                    //error shows up
                } else {
                    let localGameState = GebetaGame.getInstance().getGameMode()?.gameState;

                    if (localGameState) {
                        localGameState = { ...gameState };
                        localGameState.gameStatus.move.push(lastMove);
                    }

                    gebeta.animateHand(whichPit);
                }
            } else {
                //No move
            }
        }
    })

    socketClient.on('player:captured', (gameStatusAndCaptured: GameState & { capturedPit: number }) => {
        const gebetaGameStore = GebetaGame.getInstance();
        const gebetaGame = gebetaGameStore.getGebeta()
        const gameMode = gebetaGameStore.getGameMode();

        if (gebetaGame) {
            const capPit = gebetaGame.pits[gameStatusAndCaptured.capturedPit]
            capPit.flushStones()
        }

        if (gameMode) {
            gameMode.gameState = gameStatusAndCaptured;
            state.game.challengee = gameStatusAndCaptured.challengee
            state.game.challenger = gameStatusAndCaptured.challenger
        }
    })

    socketClient.on('game:over', (gameState: GameState, winner: {
        id: string,
        name: string,
        username: string,
        cupture: number
    }) => {
        const winnerMenu = WinnerMenu({
            title: (winner.id === state.user.id) ? "You win!" : "You Lose!",
            message: (winner.id === state.user.id) ?
                `You win, by capturing ${winner.cupture} stones.` :
                `You lost by only ${winner.cupture - ((state.user.id === gameState.challengee.id) ? gameState.challengee.cupture : gameState.challenger.cupture)} stones to ${winner.name}.`,
            onClose: () => {
                state.setPage("home");
                winnerMenu.remove();
            }
        });
        appContainer.appendChild(winnerMenu);
    })

    socketClient.on('disconnect', (reason, desc) => console.log("reason", reason, "desc", desc));

    socketClient.on('connect_error', async (ex) => {
        if (ex.message.includes('unauthorized')) {
            await handleUnauthorizedError(ex);
        }
        console.log("EX,", ex);
    });
}