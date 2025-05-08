'use client'
import { useState, useRef } from 'react';

export default function Page() {
  const [hovered, setHovered] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const timeoutRef = useRef();

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowLogo(true);
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    timeoutRef.current = setTimeout(() => {
      setShowLogo(false);
    }, 600); // match CSS transition duration
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e9e4d7] via-[#f5f1ea] to-[#d9cebc] py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-8">
        <div className="bg-white/90 rounded-3xl shadow-2xl p-10 border border-[#e5dcc7] backdrop-blur-md">
          <div className="text-center mb-10">
            <div
              className="relative mx-auto mb-6 w-36 h-36 coin-flip-group drop-shadow-xl"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className={`coin-flip${hovered ? ' flipped' : ''}`}>
                <img
                  src="/profilepic.jpeg"
                  alt="Mckinsley Apollon"
                  className="coin-face coin-front w-36 h-36 rounded-full object-cover absolute top-0 left-0 border-4 border-[#e5dcc7] shadow-lg"
                />
                {showLogo && (
                  <img
                    src="/logo.png"
                    alt="Sangha Rides Logo"
                    className="coin-face coin-back w-36 h-36 rounded-full object-cover absolute top-0 left-0 border-4 border-[#e5dcc7] shadow-lg"
                  />
                )}
              </div>
            </div>
            <h1 className="text-4xl font-extrabold text-[#3d2c1e] mb-1 tracking-tight drop-shadow-sm">
              Mckinsley Apollon
            </h1>
            <p className="text-lg text-[#7c6f57] font-medium">
              Creator – Sangha Rides
            </p>
          </div>

          <div className="prose max-w-none prose-neutral prose-lg">
            <p className="text-[#6b5e46] mb-8 leading-relaxed">
              I'm passionate about creating technology that serves the Isha community. This platform was developed to help practitioners connect and share rides to various Isha centers, making spiritual journeys more accessible and environmentally conscious. <br></br>
              At this time, support for Isha Yoga Centers in India is not available due to current limitations with our payment provider, Stripe. I am actively monitoring this situation and plan to expand support to India as soon as it becomes possible. Thank you for your understanding and patience as I work to make Sangha Rides accessible to more practitioners worldwide.
            </p>

            <div className="border-t border-[#e5dcc7] pt-8 mt-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#3d2c1e] tracking-tight">
                Contact Information
              </h2>
              <ul className="space-y-2 text-[#7c6f57] text-lg">
                <li>
                  Email:{" "}
                  <a
                    href="mailto:help@sangharides.com"
                    className="text-[#b48a4a] underline hover:text-[#a06c2b] transition-colors duration-150 font-semibold"
                  >
                    help@sangharides.com
                  </a>
                </li>
                <li>
                  Address: <span className="font-medium">Montreal, QC, Canada</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .coin-flip-group {
          perspective: 1200px;
        }
        .coin-flip {
          width: 9rem;
          height: 9rem;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.7s cubic-bezier(0.4,0.2,0.2,1);
        }
        .coin-face {
          backface-visibility: hidden;
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }
        .coin-back {
          transform: rotateY(180deg);
        }
        .coin-flip.flipped {
          transform: rotateY(180deg) scale(1.08);
        }
      `}</style>
    </div>
  )
}
