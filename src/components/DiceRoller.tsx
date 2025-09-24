'use client';

import { useState, useEffect } from 'react';
import { diceIcons } from './GameInterface';
import { SwapDialog } from './SwapDialog';

interface DiceRollerProps {
    isRolling: boolean;
    result: {
        diceResult: number;
        isWinner: boolean;
        betId: number;
        betAmount?: string;
        userChoice?: number;
    } | null;
    onPlayAgain: () => void;
}

export function DiceRoller({ isRolling, result, onPlayAgain }: DiceRollerProps) {
    const [currentDice, setCurrentDice] = useState(1);
    const [showResult, setShowResult] = useState(false);
    const [showSwapDialog, setShowSwapDialog] = useState(false);

    // Animate dice during rolling
    useEffect(() => {
        if (isRolling) {
            setShowResult(false);
            const interval = setInterval(() => {
                setCurrentDice(prev => (prev % 6) + 1);
            }, 100);

            return () => clearInterval(interval);
        } else if (result) {
            setCurrentDice(result.diceResult);
            setShowResult(true);
        } else {
            // Reset to initial state when no result
            setCurrentDice(1);
            setShowResult(false);
            setShowSwapDialog(false);
        }
    }, [isRolling, result]);

    const getDiceIcon = (number: number) => {
        const IconComponent = diceIcons[number as keyof typeof diceIcons];
        return IconComponent;
    };

    const getResultColor = () => {
        if (!result) return '';
        return result.isWinner ? 'text-green-400' : 'text-red-400';
    };

    const getResultMessage = () => {
        if (!result) return '';
        return result.isWinner ? '🎉 You Won!' : '😔 You Lost';
    };

    return (
        <>
            <div className="flex flex-col items-center space-y-6">
                {/* Dice Display */}
                <div className="relative">
                    <div className={`
            w-32 h-32 rounded-lg border-4 border-white/20 bg-white/10 
            flex items-center justify-center transition-all duration-500
            ${isRolling ? 'animate-spin' : ''}
            ${showResult ? 'border-purple-500 bg-purple-500/20' : ''}
          `}>
                        {(() => {
                            const IconComponent = getDiceIcon(currentDice);
                            return (
                                <IconComponent
                                    className={`
                    w-16 h-16 transition-all duration-300
                    ${isRolling ? 'text-white animate-pulse' : 'text-white'}
                    ${showResult ? (result?.isWinner ? 'text-green-400' : 'text-red-400') : ''}
                  `}
                                />
                            );
                        })()}
                    </div>

                    {/* Rolling indicator */}
                    {isRolling && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>

                {/* Status Text */}
                <div className="text-center">
                    {isRolling ? (
                        <div className="space-y-2">
                            <p className="text-white text-lg font-semibold">Rolling Dice...</p>
                            <p className="text-gray-300 text-sm">Please wait for the result</p>
                        </div>
                    ) : showResult && result ? (
                        <div className="space-y-4">
                            <div className="text-center">
                                <p className={`text-2xl font-bold ${getResultColor()}`}>
                                    {getResultMessage()}
                                </p>
                                <p className="text-white text-lg mt-2">
                                    Dice rolled: <span className="font-bold">{result.diceResult}</span>
                                </p>
                            </div>

                            {/* Result Details */}
                            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-300">Your Choice:</span>
                                        <span className="text-white font-semibold ml-2">{result.userChoice || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-300">Dice Result:</span>
                                        <span className="text-white font-semibold ml-2">{result.diceResult}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-300">Bet ID:</span>
                                        <span className="text-white font-semibold ml-2">#{result.betId}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-300">Result:</span>
                                        <span className={`font-semibold ml-2 ${result.isWinner ? 'text-green-400' : 'text-red-400'}`}>
                                            {result.isWinner ? 'WIN' : 'LOSS'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                {result.isWinner && (
                                    <button
                                        onClick={() => setShowSwapDialog(true)}
                                        className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                                    >
                                        Swap to USDC
                                    </button>
                                )}

                                <button
                                    onClick={onPlayAgain}
                                    className="flex-1 bg-gradient-to-r bg-[#6e54ff] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                                >
                                    Play Again
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-gray-300 text-lg">Ready to Roll</p>
                            <p className="text-gray-400 text-sm">Select a number and place your bet</p>
                        </div>
                    )}
                </div>

                {/* Animation Effects */}
                {isRolling && (
                    <div className="flex space-x-1">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                                style={{ animationDelay: `${i * 0.1}s` }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Swap Dialog */}
            {result && (
                <SwapDialog
                    isOpen={showSwapDialog}
                    onClose={() => setShowSwapDialog(false)}
                    winningAmount={result.isWinner ? (parseFloat(result.betAmount || '0') * 2).toFixed(4) : '0'}
                    onSwapComplete={() => {
                        setShowSwapDialog(false);
                        onPlayAgain();
                    }}
                />
            )}
        </>
    );
}
