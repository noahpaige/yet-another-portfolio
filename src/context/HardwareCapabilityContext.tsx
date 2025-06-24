"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { getGPUTier } from "detect-gpu";

export type HardwareCapability = {
  gpuTier: number | null;
  ram: number;
  cores: number;
  loading: boolean;
};

const HardwareCapabilityContext = createContext<HardwareCapability>({
  gpuTier: null,
  ram: 2,
  cores: 2,
  loading: true,
});

export const HardwareCapabilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [capability, setCapability] = useState<HardwareCapability>({
    gpuTier: null,
    ram: 2,
    cores: 2,
    loading: true,
  });

  useEffect(() => {
    async function detect() {
      const tierInfo = await getGPUTier();
      setCapability({
        gpuTier: tierInfo.tier,
        // @ts-expect-error: deviceMemory is not in the TS DOM typings yet
        ram: navigator.deviceMemory || 2,
        cores: navigator.hardwareConcurrency || 2,
        loading: false,
      });
    }
    detect();
  }, []);

  return (
    <HardwareCapabilityContext.Provider value={capability}>
      {children}
    </HardwareCapabilityContext.Provider>
  );
};

export function useHardwareCapability() {
  return useContext(HardwareCapabilityContext);
} 