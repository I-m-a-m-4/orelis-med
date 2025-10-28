
'use client';

export function LoadingAnimation() {
  return (
    <div className="flex justify-center items-center h-screen bg-black overflow-hidden">
      <style jsx>{`
        #loadingWave {
            display: flex;
            gap: 16px;
            perspective: 80px;
            transform-style: preserve-3d;
        }
        
        .shape {
            width: 32px;
            height: 32px;
            position: relative;
            display: inline-block;
            animation: shapeWave 2.4s ease infinite;
            transform-origin: 50% 50%;
            transform-style: preserve-3d;
        }
        
        .square {
            background: #10b981;
            border-radius: 4px;
        }
        
        .triangle {
            width: 0;
            height: 0;
            border-left: 16px solid transparent;
            border-right: 16px solid transparent;
            border-bottom: 28px solid #10b981;
            background: transparent;
        }
        
        .diamond {
            background: #10b981;
            transform: rotate(45deg);
            width: 24px;
            height: 24px;
            margin: 4px;
        }
        
        .circle {
            background: #10b981;
            border-radius: 50%;
        }
        
        .shape:nth-child(1) { animation-delay: 0s; }
        .shape:nth-child(2) { animation-delay: 0.1s; }
        .shape:nth-child(3) { animation-delay: 0.2s; }
        .shape:nth-child(4) { animation-delay: 0.3s; }
        .shape:nth-child(5) { animation-delay: 0.4s; }
        .shape:nth-child(6) { animation-delay: 0.5s; }
        .shape:nth-child(7) { animation-delay: 0.6s; }
        .shape:nth-child(8) { animation-delay: 0.7s; }
        
        @keyframes shapeWave {
            0% {
                transform: translate3D(0,0,0) scale(1) rotateY(0);
                background-color: #10b981;
                box-shadow: 0 0 15px rgba(16, 185, 129, 0.3);
            }
            12% {
                transform: translate3D(4px,-8px,4px) scale(1.3) rotateY(15deg);
                background-color: #34d399;
                box-shadow: 0 0 25px rgba(52, 211, 153, 0.8), 0 0 50px rgba(52, 211, 153, 0.4);
            }
            24% {
                transform: translate3D(0,0,0) scale(1) rotateY(0);
                background-color: #6ee7b7;
                box-shadow: 0 0 25px rgba(110, 231, 183, 0.7), 0 0 50px rgba(110, 231, 183, 0.3);
            }
            36% {
                background-color: #3b82f6; /* Blue color */
                box-shadow: 0 0 20px rgba(59, 130, 246, 0.6), 0 0 40px rgba(59, 130, 246, 0.2);
            }
            100% {
                transform: scale(1);
                background-color: #10b981;
                box-shadow: 0 0 8px rgba(16, 185, 129, 0.2);
            }
        }
        
        .triangle {
            animation: triangleWave 2.4s ease infinite;
        }
        
        @keyframes triangleWave {
            0% {
                transform: translate3D(0,0,0) scale(1) rotateY(0);
                border-bottom-color: #10b981;
                filter: drop-shadow(0 0 15px rgba(16, 185, 129, 0.3));
            }
            12% {
                transform: translate3D(4px,-8px,4px) scale(1.3) rotateY(15deg);
                border-bottom-color: #34d399;
                filter: drop-shadow(0 0 25px rgba(52, 211, 153, 0.8));
            }
             24% {
                transform: translate3D(0,0,0) scale(1) rotateY(0);
                border-bottom-color: #6ee7b7;
                filter: drop-shadow(0 0 25px rgba(110, 231, 183, 0.7));
            }
            36% {
                border-bottom-color: #3b82f6; /* Blue color */
                filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.6));
            }
            100% {
                transform: scale(1);
                border-bottom-color: #10b981;
                filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.2));
            }
        }
        
        @media (max-width: 768px) {
            .shape {
                width: 24px;
                height: 24px;
            }
            .triangle {
                border-left-width: 12px;
                border-right-width: 12px;
                border-bottom-width: 21px;
            }
            .diamond {
                width: 18px;
                height: 18px;
                margin: 3px;
            }
            #loadingWave {
                gap: 12px;
            }
        }
      `}</style>
      <div id="loadingWave">
        <div className="shape square"></div>
        <div className="shape triangle"></div>
        <div className="shape diamond"></div>
        <div className="shape circle"></div>
        <div className="shape square"></div>
        <div className="shape triangle"></div>
        <div className="shape diamond"></div>
        <div className="shape circle"></div>
      </div>
    </div>
  );
}
