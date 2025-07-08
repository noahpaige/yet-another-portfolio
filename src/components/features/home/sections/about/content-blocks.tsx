import HoverText from "@/components/features/home/sections/about/hover-text";

const blocks = [
  {
    header: "I AM",
    body: [
      "a ",
      <HoverText
        key="web developer"
        text={<p className="text-nowrap font-normal">web developer</p>}
        cardContent={
          <>
            <p className="text-2xl ">Web Dev Projects</p>
            <div className="w-full flex flex-col justify-center">
              <div>project 1</div>
              <div>project 2</div>
            </div>
          </>
        }
      />,
      " with experience in ",
      <HoverText
        key="game design"
        text={<p className="text-nowrap font-normal">game design</p>}
        cardContent={
          <>
            <p className="text-2xl ">Game Dev Projects</p>
            <div className="w-full flex flex-col justify-center">
              <div>project 1</div>
              <div>project 2</div>
            </div>
          </>
        }
      />,
      " and 3D graphics.",
    ],
  },
  {
    header: "I WORK",
    body: [
      "on web and 3D displays for US government ",
      <span key="rocket launches" className="text-nowrap">
        <HoverText
          text={<p className="text-nowrap font-normal">rocket launches</p>}
          cardContent={
            <>
              <p className="text-2xl ">Launches I&apos;ve supported:</p>
              <ul>
                <li>NROL-174</li>
                <li>NROL-69</li>
              </ul>
            </>
          }
        />
        .
      </span>,
    ],
  },
  {
    header: "I ESCAPE",
    body: [
      "to the ",
      <HoverText
        key="surf"
        imageSrc="/surf.jpeg"
        imageAlt="Surfing"
        text={<p className="text-nowrap font-normal">surf</p>}
      />,

      ,
      " and the",
      <span key="snow" className="text-nowrap">
        <HoverText
          imageSrc="/noah snow.jpg"
          imageAlt="Snow"
          text={<p className="text-nowrap font-normal">snow</p>}
        />
        !
      </span>,
    ],
  },
];

export { blocks };
