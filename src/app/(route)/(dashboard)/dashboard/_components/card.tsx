import { cn } from "@/lib/utils";
import { getDarkerTailwindColor } from "@/utils/tailwind-colors-utils";
import Link from "next/link";

interface CardProps {
  title: string;
  jumlah: number;
  className?: string;
  bgColor?: string;
  moreInfo?: string;
}
const Card = ({
  title,
  jumlah,
  className,
  bgColor,
  moreInfo = "#",
}: CardProps) => {
  const darkerBgColor = bgColor ? getDarkerTailwindColor(bgColor) : undefined;

  return (
    <div
      className={cn(
        "rounded-md h-32 w-1/2 sm:w-1/4 flex flex-col text-white",
        className,
        bgColor
      )}
    >
      <div className="flex-grow  p-2">
        <h1 className={cn("text-2xl font-bold")}>{jumlah}</h1>
        <h3>{title}</h3>
      </div>
      <div className={cn("mt-auto rounded-sm text-center", darkerBgColor)}>
        <Link href={moreInfo}>More info</Link>
      </div>
    </div>
  );
};

export default Card;
