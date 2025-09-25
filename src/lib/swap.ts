// 0x Swap API integration for Monad testnet
import { ethers } from 'ethers';

// Token configuration for Monad testnet
export const TOKENS = {
    MON: {
        address: '0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701',
        symbol: 'MON',
        name: 'Monad',
        decimals: 18,
        logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png'
    },
    USDC: {
        // address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86a33E6441c8C06DDD1233aD8c0b3e4F7c1D9/logo.png'
    }
};

// 0x API configuration
const ZEROX_API_BASE = 'https://api.0x.org';
const ZEROX_API_KEY = process.env.NEXT_PUBLIC_ZEROX_API_KEY || 'demo-key';

export interface SwapQuote {
    sellAmount: string;
    buyAmount: string;
    price: string;
    estimatedGas: string;
    allowanceTarget: string;
    to: string;
    data: string;
    value: string;
}

export interface SwapPrice {
    price: string;
    buyAmount: string;
    sellAmount: string;
}

export class SwapService {
    private apiKey: string;

    constructor(apiKey: string = ZEROX_API_KEY) {
        this.apiKey = apiKey;
    }

    /**
     * Get indicative price for a token swap
     */
    async getPrice(
        sellToken: string,
        buyToken: string,
        sellAmount: string,
        chainId: number = 10143
    ): Promise<SwapPrice> {
        try {
            const params = new URLSearchParams({
                sellToken,
                buyToken,
                sellAmount,
                chainId: chainId.toString(),
            });

            const response = await fetch(`${ZEROX_API_BASE}/swap/v1/price?${params}`, {
                headers: {
                    '0x-api-key': this.apiKey,
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch price: ${response.statusText}`);
            }

            const data = await response.json();
            return {
                price: data.price,
                buyAmount: data.buyAmount,
                sellAmount: data.sellAmount,
            };
        } catch (error) {
            console.error('Error fetching swap price:', error);
            throw error;
        }
    }

    /**
     * Get firm quote for a token swap
     */
    async getQuote(
        sellToken: string,
        buyToken: string,
        sellAmount: string,
        takerAddress: string,
        chainId: number = 10143
    ): Promise<SwapQuote> {
        try {
            const params = new URLSearchParams({
                sellToken,
                buyToken,
                sellAmount,
                takerAddress,
                chainId: chainId.toString(),
            });

            const response = await fetch(`${ZEROX_API_BASE}/swap/v1/quote?${params}`, {
                headers: {
                    '0x-api-key': this.apiKey,
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch quote: ${response.statusText}`);
            }

            const data = await response.json();
            return {
                sellAmount: data.sellAmount,
                buyAmount: data.buyAmount,
                price: data.price,
                estimatedGas: data.estimatedGas,
                allowanceTarget: data.allowanceTarget,
                to: data.to,
                data: data.data,
                value: data.value,
            };
        } catch (error) {
            console.error('Error fetching swap quote:', error);
            throw error;
        }
    }

    /**
     * Format token amount for display
     */
    formatTokenAmount(amount: string, decimals: number): string {
        const formatted = ethers.formatUnits(amount, decimals);
        return parseFloat(formatted).toFixed(decimals === 6 ? 2 : 4);
    }

    /**
     * Parse token amount to wei
     */
    parseTokenAmount(amount: string, decimals: number): string {
        return ethers.parseUnits(amount, decimals).toString();
    }
}

// Create singleton instance
export const swapService = new SwapService();
