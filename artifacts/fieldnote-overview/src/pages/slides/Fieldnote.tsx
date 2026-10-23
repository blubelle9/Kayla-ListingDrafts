const base = import.meta.env.BASE_URL;

export default function Fieldnote() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-primary">
      <img
        src={`${base}fieldnote-home.jpg`}
        crossOrigin="anonymous"
        alt="A welcoming craftsman home framed by leafy landscaping"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#183a2b]/95 via-[#183a2b]/72 to-[#183a2b]/10" />
      <div className="absolute inset-y-0 left-0 w-[56vw] bg-primary/25" />
      <div className="absolute left-[7vw] top-[22vh] z-10 max-w-[48vw]">
        <div className="mb-[4vh] h-[0.8vh] w-[7vw] bg-accent" />
        <h1 className="font-display text-[7vw] font-extrabold leading-[0.96] tracking-[-0.065em] text-bg">
          Fieldnote
        </h1>
        <p className="mt-[4vh] max-w-[39vw] font-body text-[2.35vw] font-medium leading-[1.35] text-bg/90">
          A calmer way to build a real-estate listing, one saved step at a time.
        </p>
      </div>
    </div>
  );
}
