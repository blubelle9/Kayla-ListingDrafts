export default function Ready() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-primary px-[7vw] py-[8vh] text-bg">
      <div className="absolute right-0 top-0 h-[46vh] w-[34vw] bg-accent/20" />
      <div className="absolute bottom-0 right-0 h-[27vh] w-[34vw] bg-accent/30" />
      <div className="relative z-10">
        <div className="mb-[3vh] h-[0.65vh] w-[5vw] bg-accent" />
        <h1 className="max-w-[83vw] font-display text-[4.25vw] font-bold leading-[1.05] tracking-[-0.05em] text-bg">
          Ready is a checkpoint, not a publish button
        </h1>
        <div className="mt-[9vh] grid grid-cols-2 gap-x-[7vw] gap-y-[5vh]">
          <p className="max-w-[36vw] border-t border-bg/30 pt-[2.5vh] font-body text-[2.1vw] font-medium leading-[1.3] text-bg">
            Mark a completed draft ready for the agent’s next step
          </p>
          <p className="max-w-[36vw] border-t border-bg/30 pt-[2.5vh] font-body text-[2.1vw] font-medium leading-[1.3] text-bg">
            The listing is not sent to an MLS or real-estate website
          </p>
          <p className="max-w-[36vw] border-t border-bg/30 pt-[2.5vh] font-body text-[2.1vw] font-medium leading-[1.3] text-bg">
            Current drafts do not sync to other devices
          </p>
          <p className="max-w-[36vw] border-t border-accent pt-[2.5vh] font-body text-[2.1vw] font-semibold leading-[1.3] text-bg">
            Future options: cloud sync, property photos, and a publishing connection
          </p>
        </div>
      </div>
    </div>
  );
}
