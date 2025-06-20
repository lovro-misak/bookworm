/*"use client"

import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={defaultSystem}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  )
}*/

"use client";

import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { ThemeProvider } from "next-themes";

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" enableSystem defaultTheme="system">
      <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>
    </ThemeProvider>
  );
}
