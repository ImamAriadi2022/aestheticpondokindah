import { type ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router";

type Props = {
  children: ReactNode;
};

export default function RouteTransition({ children }: Props) {
  const location = useLocation();
  const [stage, setStage] = useState<"enter" | "idle">("enter");

  useEffect(() => {
    setStage("enter");
    const id = window.setTimeout(() => setStage("idle"), 30);
    return () => window.clearTimeout(id);
  }, [location.pathname]);

  return (
    <div
      className={
        "transition-opacity lg:transition-[opacity,transform] duration-300 ease-out will-change-opacity lg:will-change-[opacity,transform] " +
        (stage === "enter" ? "opacity-0 lg:translate-y-1" : "opacity-100 lg:translate-y-0")
      }
    >
      {children}
    </div>
  );
}
