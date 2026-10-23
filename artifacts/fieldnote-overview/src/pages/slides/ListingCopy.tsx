export default function ListingCopy() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-bg px-[7vw] py-[8vh]">
      <div className="absolute bottom-0 left-0 h-[23vh] w-full bg-sage" />
      <div className="relative z-10">
        <div className="mb-[3vh] h-[0.65vh] w-[5vw] bg-accent" />
        <h1 className="max-w-[78vw] font-display text-[4.4vw] font-bold leading-[1.04] tracking-[-0.055em] text-text">
          Turn property facts into listing copy
        </h1>
        <div className="mt-[8vh] grid grid-cols-[1.05fr_0.95fr] gap-[5vw]">
          <div className="flex flex-col gap-[3vh]">
            <p className="max-w-[44vw] font-body text-[2.05vw] font-medium leading-[1.28] text-text">
              Write a specific listing headline
            </p>
            <p className="max-w-[44vw] font-body text-[2.05vw] font-medium leading-[1.28] text-text">
              Describe what makes the property distinct
            </p>
            <p className="max-w-[44vw] font-body text-[2.05vw] font-medium leading-[1.28] text-text">
              Review the location, price, property type, and key measurements
            </p>
            <p className="max-w-[44vw] font-body text-[2.05vw] font-medium leading-[1.28] text-text">
              Check the draft before marking it ready
            </p>
          </div>
          <div className="min-h-[55vh] bg-[#fcfbf7] px-[3vw] py-[3.5vh] shadow-[0_1.4vh_3vw_rgba(32,60,49,0.08)]">
            <div className="mb-[5vh] border-b border-primary/20 pb-[3vh]">
              <p className="font-display text-[2.3vw] font-semibold tracking-[-0.03em] text-primary">
                Listing headline
              </p>
              <div className="mt-[2.3vh] h-[0.75vh] w-[84%] bg-sage" />
              <div className="mt-[1.6vh] h-[0.75vh] w-[61%] bg-sage" />
            </div>
            <div>
              <p className="font-display text-[2.3vw] font-semibold tracking-[-0.03em] text-primary">
                Listing description
              </p>
              <div className="mt-[2.3vh] h-[0.75vh] w-[92%] bg-sage" />
              <div className="mt-[1.6vh] h-[0.75vh] w-[88%] bg-sage" />
              <div className="mt-[1.6vh] h-[0.75vh] w-[74%] bg-sage" />
              <div className="mt-[1.6vh] h-[0.75vh] w-[82%] bg-sage" />
              <div className="mt-[1.6vh] h-[0.75vh] w-[53%] bg-sage" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
