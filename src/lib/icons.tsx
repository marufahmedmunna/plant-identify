import type { SVGProps } from "react";

export function LeafIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M11 20A7 7 0 0 1 4 13V8a5 5 0 0 1 5-5h1" />
      <path d="M11 20v-1a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1" />
      <path d="M11 20a7 7 0 0 0 10-7h-1" />
    </svg>
  );
}
