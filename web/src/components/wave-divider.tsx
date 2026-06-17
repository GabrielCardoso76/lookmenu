interface WaveDividerProps {
  flip?: boolean
  className?: string
}

export function WaveDivider({ flip = false, className = "" }: WaveDividerProps) {
  return (
    <div
      className={`pointer-events-none w-full overflow-hidden leading-[0] ${flip ? "rotate-180" : ""} ${className}`}
      aria-hidden="true"
    >
      <svg
        className="relative block h-[60px] w-full md:h-[80px]"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
      >
        <path
          d="M0,40 C240,90 480,0 720,50 C960,100 1200,10 1440,60 L1440,100 L0,100 Z"
          className="fill-background"
        />
      </svg>
    </div>
  )
}

export function WaveDividerAlt({ flip = false, className = "" }: WaveDividerProps) {
  return (
    <div
      className={`pointer-events-none w-full overflow-hidden leading-[0] ${flip ? "rotate-180" : ""} ${className}`}
      aria-hidden="true"
    >
      <svg
        className="relative block h-[50px] w-full md:h-[70px]"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
      >
        <path
          d="M0,30 C360,80 720,0 1080,50 C1260,75 1380,30 1440,40 L1440,100 L0,100 Z"
          className="fill-card/50"
        />
      </svg>
    </div>
  )
}
