"use client";

import {
  useState,
  useEffect,
  ReactNode,
  useContext,
  createContext,
} from "react";
import { useAnimation } from "./animation-provider";

type ThreeContextType = {
  isWebGLSupported: boolean;
  isLowEndDevice: boolean;
  shouldUseThree: boolean;
  interactionIntensity: number;
  setInteractionIntensity: (value: number) => void;
};

const ThreeContext = createContext<ThreeContextType>({
  isWebGLSupported: true,
  isLowEndDevice: false,
  shouldUseThree: true,
  interactionIntensity: 0.5,
  setInteractionIntensity: () => {},
});

export const useThree = () => useContext(ThreeContext);

export function ThreeProvider({ children }: { children: ReactNode }) {
  const { prefersReducedMotion } = useAnimation();
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);
  const [interactionIntensity, setInteractionIntensity] = useState(0.5);

  useEffect(() => {
    const checkWebGLSupport = () => {
      try {
        const canvas = document.createElement("canvas");
        const gl =
          canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        setIsWebGLSupported(!!gl);
      } catch {
        setIsWebGLSupported(false);
      }
    };

    const checkDeviceCapabilities = () => {
      const hasLowCPU =
        typeof navigator !== "undefined" &&
        navigator.hardwareConcurrency !== undefined &&
        navigator.hardwareConcurrency <= 4;

      const isMobile =
        typeof navigator !== "undefined" &&
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );

      const navigatorWithMemory = navigator as Navigator & {
        deviceMemory?: number;
      };
      const hasLowMemory =
        typeof navigatorWithMemory.deviceMemory !== "undefined" &&
        navigatorWithMemory.deviceMemory < 4;

      setIsLowEndDevice(
        (hasLowCPU && isMobile) || hasLowMemory || prefersReducedMotion
      );
    };

    if (typeof window !== "undefined") {
      checkWebGLSupport();
      checkDeviceCapabilities();
    }
  }, [prefersReducedMotion]);

  const shouldUseThree = isWebGLSupported && !isLowEndDevice;

  return (
    <ThreeContext.Provider
      value={{
        isWebGLSupported,
        isLowEndDevice,
        shouldUseThree,
        interactionIntensity,
        setInteractionIntensity,
      }}
    >
      {children}
    </ThreeContext.Provider>
  );
}
