export default function Stages() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-bg px-[7vw] py-[8vh]">
      <div className="absolute right-0 top-0 h-[38vh] w-[28vw] bg-sage" />
      <div className="relative z-10">
        <div className="mb-[3vh] h-[0.65vh] w-[5vw] bg-accent" />
        <h1 className="max-w-[73vw] font-display text-[4.6vw] font-bold leading-[1.04] tracking-[-0.055em] text-text">
          A listing takes shape in stages
        </h1>
        <div className="mt-[10vh] grid grid-cols-2 gap-x-[7vw] gap-y-[6vh]">
          <div className="flex min-h-[15vh] items-start gap-[1.5vw] border-b border-primary/20 pb-[2.5vh]">
            <span className="mt-[0.6vh] h-[1.1vw] w-[1.1vw] shrink-0 rounded-full bg-primary" />
            <p className="max-w-[34vw] font-body text-[2.35vw] font-medium leading-[1.28] text-text">
              Start with property facts
            </p>
          </div>
          <div className="flex min-h-[15vh] items-start gap-[1.5vw] border-b border-primary/20 pb-[2.5vh]">
            <span className="mt-[0.6vh] h-[1.1vw] w-[1.1vw] shrink-0 rounded-full bg-accent" />
            <p className="max-w-[34vw] font-body text-[2.35vw] font-medium leading-[1.28] text-text">
              Add the details and features
            </p>
          </div>
          <div className="flex min-h-[15vh] items-start gap-[1.5vw] border-b border-primary/20 pb-[2.5vh]">
            <span className="mt-[0.6vh] h-[1.1vw] w-[1.1vw] shrink-0 rounded-full bg-accent" />
            <p className="max-w-[34vw] font-body text-[2.35vw] font-medium leading-[1.28] text-text">
              Write the listing description
            </p>
          </div>
          <div className="flex min-h-[15vh] items-start gap-[1.5vw] border-b border-primary/20 pb-[2.5vh]">
            <span className="mt-[0.6vh] h-[1.1vw] w-[1.1vw] shrink-0 rounded-full bg-primary" />
            <p className="max-w-[34vw] font-body text-[2.35vw] font-medium leading-[1.28] text-text">
              Review the draft when it is ready
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
