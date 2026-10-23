export default function Essentials() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-bg px-[7vw] py-[8vh]">
      <div className="absolute bottom-0 right-0 h-[100vh] w-[37vw] bg-primary" />
      <div className="absolute bottom-[9vh] right-[4vw] z-10 h-[64vh] w-[30vw]">
        <svg
          viewBox="0 0 460 520"
          role="img"
          aria-label="A simple architectural outline of a home"
          className="h-full w-full"
          fill="none"
        >
          <path
            d="M48 225 229 77l183 148v225H48V225Z"
            stroke="#F7F5EF"
            strokeWidth="5"
          />
          <path d="M28 235 229 66l202 169" stroke="#D49A5D" strokeWidth="6" />
          <path
            d="M98 450V287h105v163M265 288h80v78h-80zM265 391h80v59h-80z"
            stroke="#E8EEE5"
            strokeWidth="4"
          />
          <path d="M48 450h364" stroke="#D49A5D" strokeWidth="4" />
        </svg>
      </div>
      <div className="relative z-20 max-w-[56vw]">
        <div className="mb-[3vh] h-[0.65vh] w-[5vw] bg-accent" />
        <h1 className="max-w-[50vw] font-display text-[4.7vw] font-bold leading-[1.02] tracking-[-0.055em] text-text">
          Start with the essentials
        </h1>
        <div className="mt-[7vh] grid max-w-[52vw] grid-cols-1 gap-y-[3.4vh]">
          <p className="border-l-[0.35vw] border-primary pl-[1.5vw] font-body text-[2.05vw] font-medium leading-[1.3] text-text">
            Enter the street address, city, state, and ZIP code
          </p>
          <p className="border-l-[0.35vw] border-accent pl-[1.5vw] font-body text-[2.05vw] font-medium leading-[1.3] text-text">
            Choose sale or rent and a property type
          </p>
          <p className="border-l-[0.35vw] border-primary pl-[1.5vw] font-body text-[2.05vw] font-medium leading-[1.3] text-text">
            Add the asking price
          </p>
          <p className="border-l-[0.35vw] border-accent pl-[1.5vw] font-body text-[2.05vw] font-medium leading-[1.3] text-text">
            Keep moving when the required basics are complete
          </p>
        </div>
      </div>
    </div>
  );
}
