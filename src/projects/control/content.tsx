import React from "react";

export default function ControlContent() {
  return (
    <div className="text-zinc-100 p-6 mx-auto space-y-6 font-sans tracking-tight">
      <h1 className="text-4xl font-extrabold text-red-500 uppercase">
        Control
      </h1>

      <p className="text-lg leading-relaxed text-zinc-300">
        The walls move when you&apos;re not looking. The building breathes. In
        *Control*, you don&apos;t just explore the unknown — you become it. The
        Oldest House is a monument to secrecy, and Jesse Faden is the key.
      </p>

      <p className="text-lg text-zinc-400 italic">
        &ldquo;You don&apos;t run the Bureau. The Bureau runs you.&rdquo;
      </p>

      <p className="text-md text-zinc-500 border-t border-zinc-700 pt-4">
        Armed with the Service Weapon and haunted by shifting truths, Jesse
        navigates a web of psychic resonance, bureaucratic horror, and
        impossible geometry. There are no answers here — only deeper questions.
      </p>

      <div className="flex justify-end">
        <span className="text-sm text-zinc-600">
          ✦ Objects of Power don&apos;t obey the laws of reality. Neither should
          you.
        </span>
      </div>
    </div>
  );
}
