"use client";

import { useRouter } from "next/navigation";

type BackButtonProps = {
  className?: string;
  fallbackHref?: string;
  label: string;
};

export function BackButton({
  className,
  fallbackHref = "/",
  label,
}: BackButtonProps) {
  const router = useRouter();

  function handleClick() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  }

  return (
    <button type="button" className={className} onClick={handleClick}>
      {label}
    </button>
  );
}
