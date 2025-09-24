'use client';

import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { GameInterface } from '@/components/GameInterface';
import { Dice1Icon, Zap } from 'lucide-react';

export default function Home() {
  const { isConnected } = useAccount();
  const [showGame, setShowGame] = useState(false);

  const handleConnectAndPlay = () => {
    if (isConnected) {
      setShowGame(true);
    }
  };

  if (showGame && isConnected) {
    return <GameInterface onBack={() => setShowGame(false)} />;
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-16 px-10">
          <div className="flex items-center space-x-2">
            <Dice1Icon className="w-6 h-6 text-white" />
            <h1 className="text-xl font-bold text-white">Dice Bet</h1>
          </div>
          {/* <div className="">
            <p className='text-lg font-semibold'>build for monad</p>
          </div> */}
          <ConnectButton />
        </header>

        {/* Main Content */}
        <main className="flex flex-col items-center justify-center min-h-[70vh] text-center">
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="mb-12">
              <h2 className="text-6xl font-bold tracking-tight text-white mb-6">
                Roll the Dice
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto tracking-tight">
                Experience the thrill of dice betting on the Monad blockchain.
                Choose your number, place your bet, and watch the dice roll!
              </p>
            </div>

            {/* Game Features */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-3xl mb-4">🎲</div>
                <h3 className="text-xl font-semibold text-white mb-2">Fair Play</h3>
                <p className="text-gray-300">
                  On-chain verifiable randomness ensures every roll is fair and transparent.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-3xl mb-4">⚡</div>
                <h3 className="text-xl font-semibold text-white mb-2">Fast & Secure</h3>
                <p className="text-gray-300">
                  Built on Monad testnet with 10,000 TPS and 400ms block time.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-3xl mb-4">💰</div>
                <h3 className="text-xl font-semibold text-white mb-2">Win Big</h3>
                <p className="text-gray-300">
                  Double your bet if you guess correctly! Choose your bet amount from 0.001 to 1.0 ETH.
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mb-12 flex justify-center">
              {isConnected ? (
                <button
                  onClick={handleConnectAndPlay}
                  className="bg-gradient-to-r bg-[#6e54ff] text-white font-bold py-2 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
                >
                  <span><Zap className='w-5 h-5' /></span> <span> Start Playing</span>
                </button>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-300 mb-4">
                    Connect your wallet to start playing
                  </p>
                  <ConnectButton.Custom>
                    {({
                      account,
                      chain,
                      openChainModal,
                      openConnectModal,
                      authenticationStatus,
                      mounted,
                    }) => {
                      const ready = mounted && authenticationStatus !== 'loading';
                      const connected =
                        ready &&
                        account &&
                        chain &&
                        (!authenticationStatus ||
                          authenticationStatus === 'authenticated');

                      return (
                        <div
                          {...(!ready && {
                            'aria-hidden': true,
                            'style': {
                              opacity: 0,
                              pointerEvents: 'none',
                              userSelect: 'none',
                            },
                          })}
                        >
                          {(() => {
                            if (!connected) {
                              return (
                                <button
                                  onClick={openConnectModal}
                                  type="button"
                                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                                >
                                  Connect Wallet & Play
                                </button>
                              );
                            }

                            if (chain.unsupported) {
                              return (
                                <button
                                  onClick={openChainModal}
                                  type="button"
                                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300"
                                >
                                  Wrong network
                                </button>
                              );
                            }

                            return (
                              <button
                                onClick={handleConnectAndPlay}
                                className="bg-gradient-to-r bg-purple-400 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                              >
                                Start Playing
                              </button>
                            );
                          })()}
                        </div>
                      );
                    }}
                  </ConnectButton.Custom>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold text-white mb-4">How to Play</h3>
              <ol className="text-gray-300 space-y-2 text-left">
                <li>1. Connect your MetaMask wallet</li>
                <li>2. Get testnet tokens from the <a href="https://faucet.monad.xyz" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline">Monad faucet</a></li>
                <li>3. Choose a number between 1-6</li>
                <li>4. Enter your bet amount (0.001 - 1.0 ETH)</li>
                <li>5. Watch the dice roll and win double if you&apos;re right!</li>
              </ol>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center text-gray-400 mt-16">
          <p>Built on Monad Testnet • Powered by Web3</p>
        </footer>
      </div>
    </div>
  );
}
