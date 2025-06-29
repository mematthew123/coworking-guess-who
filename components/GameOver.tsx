interface GameOverProps {
    game: {
        status?: 'completed' | 'abandoned' | string;
        startedAt?: string | number | Date;
        endedAt?: string | number | Date;
    };
    isWinner: boolean;
    opponentName: string;
    router: { push: (path: string) => void };
}

export const GameOver = ({
    game,
    isWinner,
    opponentName,
    router,
}: GameOverProps) => {
    return (
        <div className='min-h-screen bg-cream relative overflow-hidden'>
            {/* Geometric Background */}
            <div className='absolute inset-0 overflow-hidden pointer-events-none'>
                <div className='absolute top-20 left-10 w-64 h-64 bg-yellow border-8 border-black rotate-12' />
                <div className='absolute bottom-10 right-20 w-48 h-48 bg-pink border-8 border-black -rotate-6' />
                <div className='absolute top-1/3 right-1/4 w-32 h-96 bg-blue border-8 border-black rotate-45' />
            </div>

            <div className='relative z-10 container mx-auto p-4 flex items-center justify-center min-h-screen'>
                <div className='max-w-2xl w-full'>
                    <div className='bg-white border-8 border-black p-12 shadow-brutal-xl'>
                        <h1 className='text-6xl font-black uppercase text-center mb-8'>
                            {game.status === 'completed' ? (
                                <span className='inline-block bg-black text-yellow px-6 py-3 shadow-brutal-lg transform -rotate-2'>
                                    GAME OVER!
                                </span>
                            ) : (
                                <span className='inline-block bg-red text-white px-6 py-3 shadow-brutal-lg transform rotate-1'>
                                    GAME ENDED!
                                </span>
                            )}
                        </h1>

                        {game.status === 'completed' && (
                            <>
                                {isWinner ? (
                                    <div className='mb-8 text-center'>
                                        <div className='text-8xl mb-6'>🎉</div>
                                        <h2 className='text-4xl font-black uppercase bg-green text-white px-6 py-3 inline-block shadow-brutal-md transform -rotate-1'>
                                            YOU WIN!
                                        </h2>
                                        <p className='text-xl font-bold uppercase mt-6'>
                                            YOU BEAT {opponentName}!
                                        </p>
                                    </div>
                                ) : (
                                    <div className='mb-8 text-center'>
                                        <div className='text-8xl mb-6'>💀</div>
                                        <h2 className='text-4xl font-black uppercase bg-red text-white px-6 py-3 inline-block shadow-brutal-md transform rotate-1'>
                                            WOMP WOMP!
                                        </h2>
                                        <p className='text-xl font-bold uppercase mt-6'>
                                            {opponentName} DESTROYED YOU!
                                        </p>
                                    </div>
                                )}
                            </>
                        )}

                        {game.status === 'abandoned' && (
                            <div className='mb-8 text-center'>
                                <div className='text-8xl mb-6'>🚪</div>
                                <p className='text-2xl font-black uppercase bg-yellow px-6 py-3 inline-block shadow-brutal-md'>
                                    SOMEONE QUIT!
                                </p>
                            </div>
                        )}

                        <div className='bg-black text-yellow border-4 border-yellow p-6 mb-8'>
                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <span className='font-bold uppercase'>
                                        Started:
                                    </span>
                                    <p className='text-xl font-black'>
                                        {game.startedAt
                                            ? new Date(
                                                  game.startedAt,
                                              ).toLocaleString()
                                            : 'UNKNOWN'}
                                    </p>
                                </div>
                                <div>
                                    <span className='font-bold uppercase'>
                                        Ended:
                                    </span>
                                    <p className='text-xl font-black'>
                                        {game.endedAt
                                            ? new Date(
                                                  game.endedAt,
                                              ).toLocaleString()
                                            : 'JUST NOW'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className='flex gap-6 justify-center'>
                            <button
                                onClick={() => router.push('/games')}
                                className='bg-pink text-white font-black uppercase px-8 py-4 border-6 border-black shadow-brutal-md hover:shadow-brutal-xl hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all duration-100 text-xl'
                            >
                                FIND NEW OPPONENT
                            </button>
                            <button
                                onClick={() => router.push('/')}
                                className='bg-white text-black font-black uppercase px-8 py-4 border-6 border-black shadow-brutal-md hover:shadow-brutal-xl hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all duration-100 text-xl'
                            >
                                HOME
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
