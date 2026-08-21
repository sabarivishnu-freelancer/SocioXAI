import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };
function Icon({ size = 18, children, ...props }: IconProps & { children: React.ReactNode }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{children}</svg>;
}
const glyph = (mark: string) => (props: IconProps) => <Icon {...props}><text x="12" y="16" textAnchor="middle" fontSize="12" fill="currentColor" stroke="none">{mark}</text></Icon>;
export const ArrowRight = (props: IconProps) => <Icon {...props}><path d="M4 12h15M13 6l6 6-6 6" /></Icon>;
export const Check = (props: IconProps) => <Icon {...props}><path d="m5 12 4 4L19 6" /></Icon>;
export const ChevronDown = (props: IconProps) => <Icon {...props}><path d="m6 9 6 6 6-6" /></Icon>;
export const LocateFixed = (props: IconProps) => <Icon {...props}><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></Icon>;
export const ShieldCheck = (props: IconProps) => <Icon {...props}><path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></Icon>;
export const Camera = glyph("+");
export const Bell = glyph("•");
export const CircleHelp = glyph("?");
export const FileText = glyph("≡");
export const Home = glyph("⌂");
export const Map = glyph("+");
export const Menu = glyph("≡");
export const Search = glyph("⌕");
export const Sparkles = glyph("✦");
export const UserRound = glyph("○");
export const X = glyph("×");