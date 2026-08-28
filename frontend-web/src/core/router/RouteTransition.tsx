import { type ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router";

type Props = {
  children: ReactNode;
  className?: string;
  transitionKey?: string;
};

/**
 * Lightweight Page Transition wrapper that provides smooth, lightweight entry animations
 * without heavy layout shifts or performance overhead.
 */
export function PageTransition({ children, className = "", transitionKey }: Props) {
  const [stage, setStage] = useState<"enter" | "idle">("enter");

  useEffect(() => {
    setStage("enter");
    const frameId = requestAnimationFrame(() => {
      setStage("idle");
    });
    return () => cancelAnimationFrame(frameId);
  }, [transitionKey]);

  return (
    <div
      className={`transition-opacity duration-200 ease-out ${
        stage === "enter" ? "opacity-0" : "opacity-100"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default function RouteTransition({ children, className = "" }: Props) {
  const location = useLocation();
  const [stage, setStage] = useState<"enter" | "idle">("enter");

  const currentRouteKey = location.pathname + location.search;

  useEffect(() => {
    setStage("enter");
    const frameId = requestAnimationFrame(() => {
      setStage("idle");
    });
    return () => cancelAnimationFrame(frameId);
  }, [currentRouteKey]);

  return (
    <div
      className={`transition-opacity duration-200 ease-out ${
        stage === "enter" ? "opacity-0" : "opacity-100"
      } ${className}`}
    >
      {children}
    </div>
  );
}

