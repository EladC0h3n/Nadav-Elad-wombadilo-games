import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
    players: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    currentPosition: {
        type: String,
        default: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' // Initial FEN position
    },
    status: {
        type: String,
        enum: ['invited', 'pending', 'active', 'completed', 'drawn', 'resigned'],
        default: 'invited'
    },
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    turn: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    drawOffer: {
        by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        offeredAt: Date
    },
    result: {
        type: String,
        enum: ['checkmate', 'draw', 'resignation'],
    },
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

const Game = mongoose.model("Game", gameSchema); 
export default Game;