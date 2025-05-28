"use client";

export default function AboutSection() {
  return (
    <div className="flex h-full w-full items-center justify-center px-6">
      <div className=" w-7/10 max-w-7xl h-7/10 flex flex-col gap-8">
        <div className="flex flex-row gap-4 items-center">
          <h2 className="text-white shrink-0 text-8xl font-space-mono">I AM</h2>
          <div className="flex flex-col gap-2">
            <p className="text-2xl text-slate-350 font-extralight">
              a web developer with experience
            </p>
            <p className="text-2xl text-slate-350 font-extralight">
              in game design and 3D graphics.
            </p>
          </div>
        </div>
        <div className="flex flex-row gap-4 items-center">
          <h2 className="text-white shrink-0 text-8xl font-space-mono">
            I WORK
          </h2>
          <div className="flex flex-col gap-2">
            <p className="text-2xl text-slate-350 font-extralight">
              on web and 3D displays for US
            </p>
            <p className="text-2xl text-slate-350 font-extralight">
              government rocket launches at CACI.
            </p>
          </div>
        </div>
        <div className="flex flex-row gap-4 items-center">
          <h2 className="text-white shrink-0 text-8xl font-space-mono">
            I ESCAPE
          </h2>
          <div className="flex flex-col gap-2">
            <p className="text-2xl text-slate-350 font-extralight">
              to the surf
            </p>
            <p className="text-2xl text-slate-350 font-extralight">
              and the snow!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
