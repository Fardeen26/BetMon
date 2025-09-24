'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { X, ArrowRightLeft, Loader2 } from 'lucide-react';
import { ethers } from 'ethers';
import { swapService, TOKENS } from '@/lib/swap';
import { SwapPrice } from '@/lib/swap';
import { useSwap } from '@/hooks/useSwap';
import toast from 'react-hot-toast';

interface SwapDialogProps {
    isOpen: boolean;
    onClose: () => void;
    winningAmount: string; // ETH amount won
    onSwapComplete: () => void;
}

export function SwapDialog({ isOpen, onClose, winningAmount, onSwapComplete }: SwapDialogProps) {
    const { address } = useAccount();
    const [swapPrice, setSwapPrice] = useState<SwapPrice | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { getSwapQuote, executeSwap, isLoading: isSwapLoading, isPending, isConfirming } = useSwap();

    // Fetch swap price when dialog opens
    useEffect(() => {
        if (isOpen && winningAmount && address) {
            fetchSwapPrice();
        }
    }, [isOpen, winningAmount, address]);

    const fetchSwapPrice = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Convert ETH to wei for the API call
            const sellAmountWei = ethers.parseEther(winningAmount).toString();

            const price = await swapService.getPrice(
                TOKENS.MON.address, // Sell MON/ETH
                TOKENS.USDC.address, // Buy USDC
                sellAmountWei,
                10143 // Monad testnet chain ID
            );

            setSwapPrice(price);
        } catch (error: any) {
            console.error('Error fetching swap price:', error);
            setError('Failed to fetch swap price. Please try again.');
            toast.error('Failed to fetch swap price');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSwap = async () => {
        if (!address || !swapPrice) return;

        try {
            // Get firm quote
            const quote = await getSwapQuote(winningAmount);
            if (!quote) return;

            // Execute the swap transaction
            await executeSwap(quote);

            // Handle success
            if (quote) {
                toast.success(`Successfully swapped ${winningAmount} MON to ${swapService.formatTokenAmount(quote.buyAmount, TOKENS.USDC.decimals)} USDC!`);
                onSwapComplete();
                onClose();
            }

        } catch (error: any) {
            console.error('Error executing swap:', error);
            toast.error('Failed to execute swap');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ArrowRightLeft className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">🎉 Congratulations!</h2>
                    <p className="text-gray-600">You won {winningAmount} MON! Convert to USDC?</p>
                </div>

                {/* Swap Details */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{winningAmount}</div>
                            <div className="text-sm text-gray-500">MON</div>
                        </div>

                        <div className="flex items-center justify-center">
                            <ArrowRightLeft className="w-5 h-5 text-gray-400" />
                        </div>

                        <div className="text-center">
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                                </div>
                            ) : swapPrice ? (
                                <>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {swapService.formatTokenAmount(swapPrice.buyAmount, TOKENS.USDC.decimals)}
                                    </div>
                                    <div className="text-sm text-gray-500">USDC</div>
                                </>
                            ) : (
                                <div className="text-2xl font-bold text-gray-400">--</div>
                            )}
                        </div>
                    </div>

                    {swapPrice && (
                        <div className="text-center text-sm text-gray-500">
                            Rate: 1 MON = {swapService.formatTokenAmount(swapPrice.price, TOKENS.USDC.decimals)} USDC
                        </div>
                    )}

                    {error && (
                        <div className="text-center text-sm text-red-500 mt-2">
                            {error}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Keep MON
                    </button>

                    <button
                        onClick={handleSwap}
                        disabled={isLoading || isSwapLoading || isPending || isConfirming || !swapPrice || !!error}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                        {isSwapLoading || isPending || isConfirming ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {isPending ? 'Confirming...' : isConfirming ? 'Processing...' : 'Swapping...'}
                            </>
                        ) : (
                            'Swap to USDC'
                        )}
                    </button>
                </div>

                {/* Info */}
                <div className="mt-4 text-xs text-gray-500 text-center">
                    Powered by 0x Protocol • Gas fees apply
                </div>
            </div>
        </div>
    );
}
