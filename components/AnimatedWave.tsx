import React from 'react';

function AnimatedWave() {
    return (
        <div className='absolute bottom-0 left-0 w-full'>
            <svg
                className='w-full h-32'
                viewBox='0 0 1440 120'
                preserveAspectRatio='none'
            >
                <defs>
                    <linearGradient
                        id='wave-gradient'
                        x1='0%'
                        y1='0%'
                        x2='100%'
                        y2='0%'
                    >
                        <stop
                            offset='0%'
                            stopColor='#60A5FA'
                            stopOpacity='0.1'
                        />
                        <stop
                            offset='50%'
                            stopColor='#818CF8'
                            stopOpacity='0.1'
                        />
                        <stop
                            offset='100%'
                            stopColor='#F472B6'
                            stopOpacity='0.1'
                        />
                    </linearGradient>
                </defs>
                <path
                    d='M0,60 C360,10 720,110 1440,60 L1440,120 L0,120 Z'
                    fill='url(#wave-gradient)'
                >
                    <animate
                        attributeName='d'
                        values='M0,60 C360,10 720,110 1440,60 L1440,120 L0,120 Z;
                                    M0,80 C360,30 720,90 1440,80 L1440,120 L0,120 Z;
                                    M0,60 C360,10 720,110 1440,60 L1440,120 L0,120 Z'
                        dur='10s'
                        repeatCount='indefinite'
                    />
                </path>
                <path
                    d='M0,80 C360,30 720,90 1440,80 L1440,120 L0,120 Z'
                    fill='white'
                />
            </svg>
        </div>
    );
}

export default AnimatedWave;
