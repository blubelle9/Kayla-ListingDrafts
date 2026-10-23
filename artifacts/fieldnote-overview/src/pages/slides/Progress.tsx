export default function Progress() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-bg px-[7vw] py-[8vh]">
      <div className="absolute bottom-0 left-0 h-[28vh] w-[48vw] bg-primary" />
      <div className="absolute bottom-[7vh] left-[7vw] h-[0.8vh] w-[30vw] bg-accent" />
      <div className="relative z-10">
        <div className="mb-[3vh] h-[0.65vh] w-[5vw] bg-accent" />
        <h1 className="max-w-[70vw] font-display text-[4.8vw] font-bold leading-[1.02] tracking-[-0.06em] text-text">
          Progress saves itself
        </h1>
        <div className="mt-[9vh] grid grid-cols-2 gap-x-[6vw] gap-y-[5vh]">
          <p className="max-w-[35vw] font-body text-[2.15vw] font-medium leading-[1.3] text-text">
            See a completion percentage for each saved draft
          </p>
          <p className="max-w-[35vw] font-body text-[2.15vw] font-medium leading-[1.3] text-text">
            Get a clear indication when changes are saved
          </p>
          <p className="max-w-[35vw] font-body text-[2.15vw] font-medium leading-[1.3] text-text">
            Leave the editor and resume the listing later
          </p>
          <p className="max-w-[35vw] font-body text-[2.15vw] font-medium leading-[1.3] text-text">
            Drafts are stored in this browser on this device
          </p>
        </div>
      </div>
    </div>
  );
}
