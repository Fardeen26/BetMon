'use client';

import { useState, useEffect } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ArrowLeft, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';
import { DiceRoller } from './DiceRoller';
import { BetForm } from './BetForm';
import { TransactionStatus } from './TransactionStatus';
import { useDiceBet } from '@/hooks/useDiceBet';
import { GAME_CONFIG } from '@/lib/config';
import toast from 'react-hot-toast';

interface GameInterfaceProps {
    onBack: () => void;
}

export function GameInterface({ onBack }: GameInterfaceProps) {
    const { address, isConnected } = useAccount();
    const { data: balance } = useBalance({ address });
    const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
    const [betAmount, setBetAmount] = useState(GAME_CONFIG.defaultBetAmount);
    const [minBetAmount, setMinBetAmount] = useState(GAME_CONFIG.minBetAmount);
    const [maxBetAmount, setMaxBetAmount] = useState(GAME_CONFIG.maxBetAmount);
    const [isRolling, setIsRolling] = useState(false);
    const [gameResult, setGameResult] = useState<{
        diceResult: number;
        isWinner: boolean;
        betId: number;
    } | null>(null);

    const {
        contract,
        isLoading: isPlacingBet,
        pendingBetId,
        lastBet,
        placeBet,
        getMinBetAmount,
        getMaxBetAmount,
        isConnected: contractConnected,
    } = useDiceBet();

    // Load min and max bet amounts from contract
    useEffect(() => {
        const loadBetLimits = async () => {
            if (contract) {
                try {
                    const [minAmount, maxAmount] = await Promise.all([
                        getMinBetAmount(),
                        getMaxBetAmount()
                    ]);
                    setMinBetAmount(minAmount);
                    setMaxBetAmount(maxAmount);
                } catch (error) {
                    console.error('Error loading bet limits:', error);
                }
            }
        };

        loadBetLimits();
    }, [contract, getMinBetAmount, getMaxBetAmount]);

    // Update game result when last bet changes
    useEffect(() => {
        if (lastBet && lastBet.isResolved) {
            setGameResult({
                diceResult: lastBet.diceResult,
                isWinner: lastBet.isWinner,
                betId: Math.floor(Math.random() * 1000) + 1, // Mock bet ID since we don't have it in the bet object
            });
            setIsRolling(false);
        }
    }, [lastBet]);

    const handleNumberSelect = (number: number) => {
        setSelectedNumber(number);
        setGameResult(null);
    };

    const handlePlaceBet = async () => {
        if (!selectedNumber) {
            toast.error('Please select a number');
            return;
        }

        if (!betAmount || parseFloat(betAmount) < parseFloat(minBetAmount) || parseFloat(betAmount) > parseFloat(maxBetAmount)) {
            toast.error(`Please enter a valid bet amount between ${minBetAmount} and ${maxBetAmount} ETH`);
            return;
        }

        if (!balance || parseFloat(balance.formatted) < parseFloat(betAmount)) {
            toast.error(`Insufficient balance. You need at least ${betAmount} ETH`);
            return;
        }

        if (pendingBetId) {
            toast.error('You already have a pending bet');
            return;
        }

        // Start dice rolling animation
        setIsRolling(true);

        // Place bet using the hook
        const success = await placeBet(selectedNumber, betAmount);

        if (!success) {
            setIsRolling(false);
            return;
        }

        // The dice rolling animation will continue until the contract event is received
        // The useDiceBet hook will handle the result and update the UI
    };

    const handlePlayAgain = () => {
        setSelectedNumber(null);
        setGameResult(null);
        setIsRolling(false);
    };

    const handleBetAmountChange = (amount: string) => {
        setBetAmount(amount);
    };

    if (!isConnected || !contractConnected) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Wallet Not Connected</h2>
                    <ConnectButton />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <header className="flex justify-between items-center mb-8">
                    <button
                        onClick={onBack}
                        className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back to Home</span>
                    </button>
                    <div className="flex items-center space-x-4">
                        <div className="text-white">
                            Balance: {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : 'Loading...'}
                        </div>
                        <ConnectButton />
                    </div>
                </header>

                {/* Game Content */}
                <main className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-white mb-4">Dice Bet Game</h1>
                        <p className="text-gray-300">
                            Choose a number between 1-6 and enter your bet amount
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Left Side - Bet Form */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                            <h2 className="text-2xl font-semibold text-white mb-6">Place Your Bet</h2>

                            <BetForm
                                selectedNumber={selectedNumber}
                                betAmount={betAmount}
                                onNumberSelect={handleNumberSelect}
                                onBetAmountChange={handleBetAmountChange}
                                onPlaceBet={handlePlaceBet}
                                isPlacingBet={isPlacingBet}
                                isRolling={isRolling}
                                disabled={isRolling || !!gameResult || !!pendingBetId}
                                minBetAmount={minBetAmount}
                                maxBetAmount={maxBetAmount}
                            />
                        </div>

                        {/* Right Side - Dice Roller */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                            <h2 className="text-2xl font-semibold text-white mb-6">Dice Roll</h2>

                            <DiceRoller
                                isRolling={isRolling}
                                result={gameResult}
                                onPlayAgain={handlePlayAgain}
                            />
                        </div>
                    </div>

                    {/* Transaction Status */}
                    {(isPlacingBet || isRolling) && (
                        <div className="mt-8">
                            <TransactionStatus
                                isPlacingBet={isPlacingBet}
                                isRolling={isRolling}
                                selectedNumber={selectedNumber}
                            />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

// Dice number icons mapping
export const diceIcons = {
    1: Dice1,
    2: Dice2,
    3: Dice3,
    4: Dice4,
    5: Dice5,
    6: Dice6,
};
