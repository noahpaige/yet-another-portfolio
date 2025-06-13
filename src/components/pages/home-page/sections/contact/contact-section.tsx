import { Tilt } from "@/components/ui/tilt";
import { MailIcon, Github, Linkedin } from "lucide-react";

const iconClasses = "h-full w-full p-4";

const contactButtons = [
  {
    name: "Email",
    href: "mailto:noah@noahpaige.com",
    icon: <MailIcon className={iconClasses} />,
  },
  {
    name: "Github",
    href: "https://github.com/noahpaige",
    icon: <Github className={iconClasses} />,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/noah-paige/",
    icon: <Linkedin className={iconClasses} />,
  },
];

export const ContactSection = () => {
  return (
    <section className="flex h-screen items-center justify-center">
      <div className="flex gap-4">
        {contactButtons.map((button) => (
          <Tilt key={button.name} rotationFactor={16}>
            <a
              href={button.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center size-30 justify-center glass-layer-hoverable text-neutral-400 hover:text-white transition-all"
            >
              {button.icon}
            </a>
          </Tilt>
        ))}
      </div>
    </section>
  );
};
