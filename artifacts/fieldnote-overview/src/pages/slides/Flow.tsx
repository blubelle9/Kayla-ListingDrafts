export default function Flow() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-primary px-[6vw] py-[8vh]">
      <div className="absolute -right-[4vw] -top-[7vh] h-[35vh] w-[28vw] rotate-12 bg-accent/20" />
      <div className="relative z-10">
        <div className="mb-[3vh] h-[0.65vh] w-[5vw] bg-accent" />
        <h1 className="max-w-[78vw] font-display text-[4.4vw] font-bold leading-[1.04] tracking-[-0.055em] text-bg">
          Four steps, from basics to review
        </h1>
        <div className="mt-[10vh] grid grid-cols-4 gap-[1.25vw]">
          <div className="min-h-[43vh] border-t-[0.5vh] border-accent bg-bg px-[1.8vw] py-[4.5vh]">
            <p className="font-display text-[4.7vw] font-bold leading-none tracking-[-0.06em] text-primary">
              01
            </p>
            <p className="mt-[6vh] font-body text-[2.1vw] font-semibold leading-[1.22] text-text">
              Property basics — address, listing type, property type, and price
            </p>
          </div>
          <div className="min-h-[43vh] border-t-[0.5vh] border-accent bg-bg px-[1.8vw] py-[4.5vh]">
            <p className="font-display text-[4.7vw] font-bold leading-none tracking-[-0.06em] text-primary">
              02
            </p>
            <p className="mt-[6vh] font-body text-[2.1vw] font-semibold leading-[1.22] text-text">
              Property details — bedrooms, bathrooms, area, lot size, and year built
            </p>
          </div>
          <div className="min-h-[43vh] border-t-[0.5vh] border-accent bg-bg px-[1.8vw] py-[4.5vh]">
            <p className="font-display text-[4.7vw] font-bold leading-none tracking-[-0.06em] text-primary">
              03
            </p>
            <p className="mt-[6vh] font-body text-[2.1vw] font-semibold leading-[1.22] text-text">
              Features — amenities and parking
            </p>
          </div>
          <div className="min-h-[43vh] border-t-[0.5vh] border-accent bg-bg px-[1.8vw] py-[4.5vh]">
            <p className="font-display text-[4.7vw] font-bold leading-none tracking-[-0.06em] text-primary">
              04
            </p>
            <p className="mt-[6vh] font-body text-[2.1vw] font-semibold leading-[1.22] text-text">
              Description — headline, listing copy, and review
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
