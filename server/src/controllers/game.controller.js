import Game from "../models/game.model.js";
import { sendInternalError } from "../lib/utils.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import { Chess } from 'chess.js';

export const makeMove = async (req, res) => {
    try {
        const { gameId } = req.params;
        const { from, to } = req.body;
        const userId = req.user._id;

        // Find the game
        const game = await Game.findById(gameId)
            .populate('players', 'userName profilePic') // Add fields you need
            .populate('turn', 'userName')
            .populate('winner', 'userName')
            .populate('invitedBy', 'userName');
        if (!game) {
            return res.status(404).json({ message: "Game not found" });
        }

        // Verify it's the user's turn
        if (game.turn._id.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Not your turn" });
        }

        // Create chess instance with current position
        const chess = new Chess(game.currentPosition);

        // Verify correct color is moving
        const isWhite = game.invitedBy._id.toString() === userId.toString();
        if ((isWhite && chess.turn() !== 'w') || (!isWhite && chess.turn() !== 'b')) {
            return res.status(403).json({ message: "Wrong color piece" });
        }

        // Attempt to make the move
        try {
            chess.move({ from, to });
        } catch (error) {
            return res.status(400).json({ message: "Invalid move" });
        }

        // Update game state
        game.currentPosition = chess.fen();
        
        // Check if game is over
        if (chess.isGameOver()) {
            game.status = 'completed';
            if (chess.isCheckmate()) {
                game.result = 'checkmate';
                game.winner = game.turn;
            }
        }

        // Switch turns to the other player
        game.turn = game.players.find(player => 
            player._id.toString() !== userId.toString()
        );


        await game.save();

        // After saving, fetch the updated and populated game
        const updatedGame = await Game.findById(gameId)
            .populate('players', 'userName profilePic')
            .populate('turn', 'userName')
            .populate('winner', 'userName')
            .populate('invitedBy', 'userName');

        // Notify other player through socket
        io.to(`game:${gameId}`).emit("moveMade", {
            gameId,
            from,
            to,
            fen: game.currentPosition,
            turn: game.turn,
            isGameOver: chess.isGameOver(),
            isCheckmate: chess.isCheckmate(),
            game: updatedGame
        });

        return res.status(200).json(game);
    } catch (error) {
        return sendInternalError(error, res, "makeMove");
    }
};

export const getGame = async (req, res) => {
    try {
        const { gameId } = req.params;
        const userId = req.user._id;

        const game = await Game.findById(gameId)
            .populate('players', 'userName profilePic') // Populate player usernames
            .populate('winner', 'userName')
            .populate('turn', 'userName')
            .populate('invitedBy', 'userName');

        if (!game) {
            return res.status(404).json({ message: "Game not found" });
        }

        // Verify user is a player in this game
        if (!game.players.some(player => player._id.toString() === userId.toString())) {
            return res.status(403).json({ message: "Not authorized to view this game" });
        }

        return res.status(200).json(game);
    } catch (error) {
        return sendInternalError(error, res, "getGame");
    }
};

export const getGames = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const games = await Game.find({ 
            players: userId,
            status: { $in: ['active', 'pending'] } // Only get active and pending games by default
        })
            .populate('players', 'userName profilePic')
            .populate('winner', 'userName')
            .populate('turn', 'userName')
            .populate('invitedBy', 'userName')
            .sort({ updatedAt: -1 }); // Most recent games first

        return res.status(200).json(games);
    } catch (error) {
        return sendInternalError(error, res, "getGames");
    }
};

export const offerDraw = async (req, res) => {
    try {
        const { gameId } = req.params;
        const userId = req.user._id;

        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({ message: "Game not found" });
        }

        // Verify user is a player in this game
        if (!game.players.some(player => player._id.toString() === userId.toString())) {
            return res.status(403).json({ message: "Not authorized" });
        }

        // Can't offer draw if game is already over
        if (game.status !== 'active') {
            return res.status(400).json({ message: "Game is not active" });
        }

        // Update draw offer
        game.drawOffer = {
            by: userId,
            offeredAt: new Date()
        };
        await game.save();

        // Notify other player through socket
        const otherPlayerId = game.players.find(playerId => 
            playerId.toString() !== userId.toString()
        );
        io.to(`game:${gameId}`).emit("drawOffered", {
            gameId,
            offeredBy: userId
        });

        return res.status(200).json(game);
    } catch (error) {
        return sendInternalError(error, res, "offerDraw");
    }
};

export const respondToDrawOffer = async (req, res) => {
    try {
        const { gameId } = req.params;
        const { accept } = req.body;
        const userId = req.user._id;

        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({ message: "Game not found" });
        }

        // Verify there's an active draw offer
        if (!game.drawOffer) {
            return res.status(400).json({ message: "No active draw offer" });
        }

        // Verify user is the one receiving the draw offer
        if (game.drawOffer.by.toString() === userId.toString()) {
            return res.status(403).json({ message: "Cannot respond to your own draw offer" });
        }

        if (accept) {
            game.status = 'drawn';
            game.result = 'draw';
        }
        
        // Clear draw offer regardless of response
        game.drawOffer = undefined;
        await game.save();

        // Notify players through socket
        io.to(`game:${gameId}`).emit("drawOfferResponse", {
            gameId,
            accepted: accept,
            respondedBy: userId
        });

        return res.status(200).json(game);
    } catch (error) {
        return sendInternalError(error, res, "respondToDrawOffer");
    }
};

export const resign = async (req, res) => {
    try {
        const { gameId } = req.params;
        const userId = req.user._id;

        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({ message: "Game not found" });
        }

        // Verify user is a player in this game
        if (!game.players.some(player => player._id.toString() === userId.toString())) {
            return res.status(403).json({ message: "Not authorized" });
        }

        // Can't resign if game is already over
        if (game.status !== 'active') {
            return res.status(400).json({ message: "Game is not active" });
        }

        // Set game as resigned and declare other player as winner
        game.status = 'resigned';
        game.result = 'resignation';
        game.winner = game.players.find(playerId => 
            playerId.toString() !== userId.toString()
        );
        await game.save();

        // Notify players through socket
        io.to(`game:${gameId}`).emit("gameResigned", {
            gameId,
            resignedBy: userId,
            winner: game.winner
        });

        return res.status(200).json(game);
    } catch (error) {
        return sendInternalError(error, res, "resign");
    }
};

export const sendGameInvite = async (req, res) => {
    try {
        const { opponentId } = req.body;
        const userId = req.user._id;

        // Create new game with invited status
        const game = new Game({
            players: [userId, opponentId],
            status: 'invited',
            invitedBy: userId
        });

        await game.save();

        // Notify opponent through socket
        io.to(getReceiverSocketId(opponentId)).emit("gameInvite", {
            gameId: game._id,
            invitedBy: userId
        });

        return res.status(201).json(game);
    } catch (error) {
        return sendInternalError(error, res, "sendGameInvite");
    }
};

export const acceptGameInvite = async (req, res) => {
    try {
        const { gameId } = req.params;
        const userId = req.user._id;

        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({ message: "Game not found" });
        }

        // Verify user was invited
        if (!game.players.includes(userId) || game.invitedBy.toString() === userId.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        // Update game status and set initial turn
        game.status = 'active';
        game.turn = game.invitedBy; // First player (inviter) starts
        await game.save();

        // Notify original inviter through socket
        io.to(getReceiverSocketId(game.invitedBy)).emit("gameInviteAccepted", {
            gameId: game._id,
            acceptedBy: userId
        });

        return res.status(200).json(game);
    } catch (error) {
        return sendInternalError(error, res, "acceptGameInvite");
    }
};

export const declineGameInvite = async (req, res) => {
    try {
        const { gameId } = req.params;
        const userId = req.user._id;

        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({ message: "Game not found" });
        }

        // Verify user was invited
        if (!game.players.includes(userId) || game.invitedBy.toString() === userId.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        await Game.findByIdAndDelete(gameId);

        // Notify original inviter through socket
        io.to(getReceiverSocketId(game.invitedBy)).emit("gameInviteDeclined", {
            gameId: game._id,
            declinedBy: userId
        });

        return res.status(200).json({ message: "Game invite declined" });
    } catch (error) {
        return sendInternalError(error, res, "declineGameInvite");
    }
};

export const getGameInvites = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const invites = await Game.find({ 
            players: userId,
            status: 'invited',
            invitedBy: { $ne: userId } // Only get invites from other players
        })
            .populate('invitedBy', 'userName')
            .sort({ createdAt: -1 });

        return res.status(200).json(invites);
    } catch (error) {
        return sendInternalError(error, res, "getGameInvites");
    }
};
