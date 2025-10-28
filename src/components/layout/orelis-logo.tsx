'use client';
import { Stethoscope } from 'lucide-react';
import { useRef, useEffect } from 'react';

export function OrelisLogo() {
  return (
    <>
      <button
        className="relative px-0 py-0 bg-transparent border-none outline-none cursor-pointer font-headline uppercase tracking-[0.1em] flex items-center gap-2"
        style={{ fontSize: '20px', letterSpacing: '1px' }}
      >
        <Stethoscope className="h-8 w-8 text-primary" />
        <span className="relative">
          <span className="actual-text text-transparent text-stroke select-none">
            &nbsp;Orelis&nbsp;
          </span>
          <span
            aria-hidden="true"
            className="hover-text pointer-events-none absolute inset-0 w-0 overflow-hidden border-r-[3px] animate-wipe"
            style={{
              color: '#10b981',
              borderColor: '#10b981',
            }}
          >
            <span className="text-stroke-anim-green text-transparent select-none">&nbsp;Orelis&nbsp;</span>
          </span>
        </span>
        <div className="particles absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="particle particle-1 absolute bg-white rounded-full" style={{ width: '1px', height: '1px', left: '20%', top: '30%' }}></div>
          <div className="particle particle-2 absolute bg-white rounded-full" style={{ width: '1px', height: '1px', left: '50%', top: '60%' }}></div>
          <div className="particle particle-3 absolute bg-white rounded-full" style={{ width: '1px', height: '1px', left: '70%', top: '40%' }}></div>
          <div className="particle particle-4 absolute bg-white rounded-full" style={{ width: '1.5px', height: '1.5px', left: '30%', top: '70%' }}></div>
          <div className="particle particle-5 absolute bg-white rounded-full" style={{ width: '0.5px', height: '0.5px', left: '80%', top: '20%' }}></div>
        </div>
      </button>
      <style jsx>{`
        .particles {
          z-index: -10;
        }
        .particle {
          opacity: 0;
        }
        .particle-1 {
          animation: particleMove1 1.5s ease-out forwards;
          animation-delay: 0.2s;
        }
        .particle-2 {
          animation: particleMove2 1.5s ease-out forwards;
          animation-delay: 0.5s;
        }
        .particle-3 {
          animation: particleMove3 1.5s ease-out forwards;
          animation-delay: 0.8s;
        }
        .particle-4 {
          animation: particleMove4 1.5s ease-out forwards;
          animation-delay: 1.0s;
        }
        .particle-5 {
          animation: particleMove5 1.5s ease-out forwards;
          animation-delay: 1.2s;
        }
        @keyframes particleMove1 {
          0% {
            transform: translate(0, 0) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
            transform: scale(1);
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translate(15px, -8px) scale(0.5);
            opacity: 0;
          }
        }
        @keyframes particleMove2 {
          0% {
            transform: translate(0, 0) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
            transform: scale(1);
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translate(-20px, 12px) scale(0.5);
            opacity: 0;
          }
        }
        @keyframes particleMove3 {
          0% {
            transform: translate(0, 0) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
            transform: scale(1);
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translate(10px, 18px) scale(0.5);
            opacity: 0;
          }
        }
        @keyframes particleMove4 {
          0% {
            transform: translate(0, 0) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
            transform: scale(1);
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translate(-12px, -15px) scale(0.5);
            opacity: 0;
          }
        }
        @keyframes particleMove5 {
          0% {
            transform: translate(0, 0) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
            transform: scale(1);
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translate(25px, 5px) scale(0.5);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}