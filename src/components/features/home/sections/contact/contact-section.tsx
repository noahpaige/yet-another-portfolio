import { Magnetic } from "@/components/ui/magnetic";
import { MailIcon, Github, Linkedin, FileText } from "lucide-react";

const iconClasses = "h-full w-full p-4";

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
  return (
    <section className="flex h-screen items-center justify-center">
      <div className="flex gap-4">
        {contactButtons.map((button) => (
          <Magnetic
            key={button.name}
            intensity={0.4}
            range={500}
            actionArea="self"
            springOptions={{ stiffness: 500, damping: 50 }}
          >
            <a
              href={button.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center size-30 justify-center glass-layer-hoverable text-neutral-400 hover:text-white"
            >
              {button.icon}
            </a>
          </Magnetic>
        ))}
      </div>
    </section>
  );
};
