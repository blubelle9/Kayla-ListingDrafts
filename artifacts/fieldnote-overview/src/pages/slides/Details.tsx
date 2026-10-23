export default function Details() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-bg px-[7vw] py-[8vh]">
      <div className="absolute right-0 top-0 h-[100vh] w-[38vw] bg-sage" />
      <div className="relative z-10">
        <div className="mb-[3vh] h-[0.65vh] w-[5vw] bg-accent" />
        <h1 className="max-w-[77vw] font-display text-[4.5vw] font-bold leading-[1.04] tracking-[-0.055em] text-text">
          Give buyers the useful details
        </h1>
        <div className="mt-[8vh] grid grid-cols-[1.05fr_0.95fr] gap-[5vw]">
          <div className="flex flex-col gap-[3.4vh]">
            <p className="max-w-[47vw] font-body text-[2.05vw] font-medium leading-[1.28] text-text">
              Record bedrooms, bathrooms, interior area, lot size, and year built
            </p>
            <p className="max-w-[47vw] font-body text-[2.05vw] font-medium leading-[1.28] text-text">
              Select standout features such as a fireplace or outdoor space
            </p>
            <p className="max-w-[47vw] font-body text-[2.05vw] font-medium leading-[1.28] text-text">
              Add parking information
            </p>
            <p className="max-w-[47vw] font-body text-[2.05vw] font-medium leading-[1.28] text-text">
              See key facts together in the listing review
            </p>
          </div>
          <div className="relative mt-[1vh] min-h-[57vh] border-y border-primary/25 px-[3vw] py-[3vh]">
            <div className="absolute left-0 top-0 h-full w-[0.5vw] bg-primary" />
            <div className="grid h-full grid-cols-2 gap-x-[2vw] gap-y-[2.2vh]">
              <div className="flex flex-col justify-between border-b border-primary/20 pb-[1.8vh]">
                <span className="font-body text-[2vw] font-semibold text-muted">Bedrooms</span>
                <span className="mt-[1.8vh] h-[0.8vh] w-[4vw] bg-primary/35" />
              </div>
              <div className="flex flex-col justify-between border-b border-primary/20 pb-[1.8vh]">
                <span className="font-body text-[2vw] font-semibold text-muted">Bathrooms</span>
                <span className="mt-[1.8vh] h-[0.8vh] w-[4vw] bg-primary/35" />
              </div>
              <div className="flex flex-col justify-between border-b border-primary/20 pb-[1.8vh]">
                <span className="font-body text-[2vw] font-semibold text-muted">Interior area</span>
                <span className="mt-[1.8vh] h-[0.8vh] w-[7vw] bg-primary/35" />
              </div>
              <div className="flex flex-col justify-between border-b border-primary/20 pb-[1.8vh]">
                <span className="font-body text-[2vw] font-semibold text-muted">Lot size</span>
                <span className="mt-[1.8vh] h-[0.8vh] w-[6vw] bg-primary/35" />
              </div>
              <div className="flex flex-col justify-between border-b border-primary/20 pb-[1.8vh]">
                <span className="font-body text-[2vw] font-semibold text-muted">Year built</span>
                <span className="mt-[1.8vh] h-[0.8vh] w-[5vw] bg-primary/35" />
              </div>
              <div className="flex flex-col justify-between border-b border-primary/20 pb-[1.8vh]">
                <span className="font-body text-[2vw] font-semibold text-muted">Parking</span>
                <span className="mt-[1.8vh] h-[0.8vh] w-[6vw] bg-primary/35" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
