"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import ProjectCard from "@/components/pages/home-page/sections/projects/project-card";

const projects = [
  // {
  //   title: "",
  //   image: "",
  //   imageAltText: "",
  //   content: (
  //     <div>
  //     </div>
  //   ),
  // },
  {
    title: "Deliver Packages",
    image: "/death_stranding.png",
    imageAltText: "Troy Baker babysitting.",
    content: (
      <div>
        <p>
          <span className="font-bold">The Death Stranding</span> is a survival
          horror game set in a post-apocalyptic world. The player controls a
          character who must navigate a dangerous world filled with dangerous
          creatures.
        </p>
      </div>
    ),
  },

  {
    title: "Defend Tsushima",
    image: "/ghost_of_tsushima.png",
    imageAltText: "Jin Sakai sheathes his sword.",
    content: (
      <div>
        <p>
          <span className="font-bold">Ghost of Tsushima</span> is an open-world
          action game set in feudal Japan.
          <br />
          Some more text here.
          <br />
          Some more text here.
          <br />
          Some more text here.
          <br />
          Some more text here.
          <br />
          Some more text here.
          <br />
          Some more text here.
          <br />
          Some more text here.
          <br />
          Some more text here.
          <br />
          Some more text here.
          <br />
          Some more text here.
          <br />
          Some more text here.
          <br />
          Some more text here.
          <br />
          Some more text here.
          <br />
          Some more text here.
          <br />
          Some more text here.
          <br />
          Some more text here.
        </p>
      </div>
    ),
  },
  {
    title: "For my Choom",
    image: "/choom.png",
    imageAltText: "My Number 1 Choom",
    content: (
      <div className=" text-white p-6  mx-auto space-y-6 font-sans">
        <h1 className="text-4xl font-extrabold text-yellow-400 tracking-wide">
          For My Choom, Jackie Welles
        </h1>

        <p className="text-lg leading-relaxed text-zinc-300">
          He was more than muscle, more than chrome — Jackie was heart. In a
          world where loyalty is rare and trust even rarer, he gave both freely.
          He didn’t just ride shotgun — he had your back, every edgerun, every
          firefight, every fragging second.
        </p>

        <p className="text-lg leading-relaxed text-zinc-400 italic">
          “You gotta live life to the fullest. From now on... I only live for
          the chooms who got my back.”
        </p>

        <p className="text-md text-zinc-500 border-t border-zinc-700 pt-4">
          Cyberpsycho or Corpo rat, it didn’t matter. Jackie faced it all
          head-on with a grin and a gun. And when the chips were down, he still
          cracked a joke — that’s the kinda legend Night City remembers.
        </p>

        <div className="flex justify-end">
          <span className="text-sm text-zinc-600">✦ Siempre, mi hermano.</span>
        </div>
      </div>
    ),
  },
  {
    title: "Turn 34",
    image: "/clair_obscure.png",
    imageAltText: "It's harder than you think!",
    content: (
      <div className="text-slate-100 p-6 mx-auto space-y-6 font-serif">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-purple-300 drop-shadow-sm">
          Clair Obscur: Expedition 33
        </h1>

        <p className="text-lg leading-relaxed text-slate-300">
          A world painted in despair and beauty — where brushstrokes shape fate
          and dreams are as fragile as canvas. *Expedition 33* is more than a
          battle for survival... it’s an elegy whispered through oil and shadow.
        </p>

        <p className="text-lg text-slate-400 italic">
          “She chooses a number. They vanish. We march to unmake her memory.”
        </p>

        <p className="text-md text-slate-400 border-t border-slate-600 pt-4">
          Each expedition is a requiem, each spell a verse. You are not just a
          soldier — you are a story fighting to stay written. Through shifting
          skies and painted beasts, the expedition trudges on, one number closer
          to the end.
        </p>

        <div className="flex justify-end">
          <span className="text-sm text-slate-500">
            ✦ When she speaks your name, resist the fade.
          </span>
        </div>
      </div>
    ),
  },
  {
    title: "Pick up the phone",
    image: "control.jpg",
    imageAltText: "How does the director even get over there?",
    content: (
      <div className=" text-zinc-100 p-6 mx-auto space-y-6 font-sans tracking-tight">
        <h1 className="text-4xl font-extrabold text-red-500 uppercase">
          Control
        </h1>

        <p className="text-lg leading-relaxed text-zinc-300">
          The walls move when you’re not looking. The building breathes. In
          *Control*, you don’t just explore the unknown — you become it. The
          Oldest House is a monument to secrecy, and Jesse Faden is the key.
        </p>

        <p className="text-lg text-zinc-400 italic">
          “You don’t run the Bureau. The Bureau runs you.”
        </p>

        <p className="text-md text-zinc-500 border-t border-zinc-700 pt-4">
          Armed with the Service Weapon and haunted by shifting truths, Jesse
          navigates a web of psychic resonance, bureaucratic horror, and
          impossible geometry. There are no answers here — only deeper
          questions.
        </p>

        <div className="flex justify-end">
          <span className="text-sm text-zinc-600">
            ✦ Objects of Power don’t obey the laws of reality. Neither should
            you.
          </span>
        </div>
      </div>
    ),
  },
  {
    title: "Find the Great Circle",
    image: "./indiana_jones.png",
    imageAltText: "Gotcha!",
    content: (
      <div className="text-stone-100 p-6 mx-auto space-y-6 font-serif">
        <h1 className="text-4xl md:text-5xl font-bold tracking-wide text-yellow-100 drop-shadow">
          Indiana Jones: The Great Circle
        </h1>

        <p className="text-lg leading-relaxed text-stone-200">
          Dust off the fedora. Grab the whip. *The Great Circle* sends Indy
          across the globe once again — decoding ancient myths, dodging modern
          threats, and uncovering the lost secrets of a mysterious, sacred
          geometry.
        </p>

        <p className="text-lg italic text-stone-200">
          “The circle connects what time tried to scatter.”
        </p>

        <p className="text-md text-stone-200 border-t border-stone-300 pt-4">
          From dusty tombs to icy peaks, Indy must piece together a puzzle
          hidden in plain sight — a map older than civilization itself. It’s not
          just about treasure. It’s about truth. And no one chases it like Dr.
          Jones.
        </p>

        <div className="flex justify-end">
          <span className="text-sm text-stone-400">
            ✦ Fortune and glory, kid.
          </span>
        </div>
      </div>
    ),
  },
];

export default function ProjectsSection() {
  const [show, setShow] = useState(false);

  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });

  useEffect(() => {
    setShow(isInView);
  }, [isInView]);

  return (
    <div className="h-full w-full flex items-center justify-center">
      <div
        ref={ref}
        className={`grid auto-rows-auto grid-cols-1 sm:grid-cols-3 gap-2 p-6`}
        style={{ width: "calc(min(100%, 1536px))" }}
      >
        {projects.map((project, projectIndex) => {
          return (
            <div
              key={projectIndex}
              className={`row-span-1 ${
                projectIndex === 0 || projectIndex === 3 || projectIndex === 4
                  ? "sm:col-span-2"
                  : "col-span-1"
              }`}
            >
              <ProjectCard
                show={show}
                title={project.title}
                imageSrc={project.image}
                imageAltText={project.imageAltText || ""}
                content={project.content}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
