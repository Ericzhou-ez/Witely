"use client";

import { useMediaQuery } from "usehooks-ts";

const BREAKPOINT_SM = 540;
const BREAKPOINT_MD = 768;
const BREAKPOINT_LG = 1024;

export function useScreenSize() {
  const isSmUp = useMediaQuery(`(min-width: ${BREAKPOINT_SM}px)`);
  const isMdUp = useMediaQuery(`(min-width: ${BREAKPOINT_MD}px)`);
  const isLgUp = useMediaQuery(`(min-width: ${BREAKPOINT_LG}px)`);
  return { isSmUp, isMdUp, isLgUp };
}
