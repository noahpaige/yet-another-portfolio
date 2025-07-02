import { MagneticButton } from "@/components/ui/magnetic-button";
import { MailIcon, Github, Linkedin, FileText } from "lucide-react";
import { useClampCSS } from "@/hooks/useClampCSS";

const iconClasses = "h-6 w-6 flex-shrink-0";

const contactButtons = [
  {
    name: "Email",
    href: "mailto:noah@noahpaige.com",
    hoverText: "email me",
    icon: <MailIcon className={iconClasses} />,
  },
  {
    name: "Github",
    href: "https://github.com/noahpaige",
    hoverText: "code with me",
    icon: <Github className={iconClasses} />,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/noah-paige/",
    hoverText: "grindset with me",
    icon: <Linkedin className={iconClasses} />,
  },
  {
    name: "Resume",
    href: "TODO",
    hoverText: "view my resume",
    icon: <FileText className={iconClasses} />,
  },
];

export const ContactSection = () => {
  // Responsive text scaling
  const h1FontSize = useClampCSS(48, 128, 320, 1200, 375, 1920);
  const pFontSize = useClampCSS(16, 32, 320, 1200, 375, 1920);

  return (
    <section className="flex h-screen items-center justify-center px-12">
      <div className="flex flex-col gap-20 h-screen items-center justify-center px-12 ">
        <div className="flex flex-col justify-start w-full gap-3">
          <h1 className="font-bold z-10" style={{ fontSize: h1FontSize }}>
            Get in touch!
          </h1>
          <div className="flex flex-col gap-1 pl-4">
            <p className="z-10" style={{ fontSize: pFontSize }}>
              I&apos;m open to new opportunities.
            </p>
          </div>
        </div>

        <div className="grid auto-rows-auto grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {contactButtons.map((button) => (
            <MagneticButton
              key={button.name}
              href={button.href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-14"
            >
              {button.icon}
              <span className="whitespace-nowrap text-2xl flex-1 text-left">
                {button.name}
              </span>
            </MagneticButton>
          ))}
        </div>
      </div>
    </section>
  );
};
