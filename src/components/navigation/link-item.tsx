import { LucideIcon } from "lucide-react";
import { LinkContainer } from "./link-container";

interface LinkItemProps {
  icon: LucideIcon;
  title: string;
  href: string;
}

const LinkItem = ({ icon: Icon, title, href }: LinkItemProps) => {
  return (
    <LinkContainer href={href}>
      <Icon />
      <span>{title}</span>
    </LinkContainer>
  );
};

export default LinkItem;
