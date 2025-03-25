import React from "react"
import { createContext, PropsWithChildren, useContext, useState } from "react"
import { INavigationContext, NavigationProviderProps } from "./types"

const NavigationContext = createContext<INavigationContext>({
    navigationVisible: true,
    toggleNavigation: () => {},
    hideNavigation: () => {},
})

export function NavigationProvider({
    initialNavigationState = true,
    children,
}: PropsWithChildren<NavigationProviderProps>) {
    const [navigationVisible, setShowNavigation] = useState(
        initialNavigationState
    )

    function toggleNavigation() {
        setShowNavigation(!navigationVisible)
    }

    function hideNavigation() {
        setShowNavigation(false)
    }

    return (
        <NavigationContext.Provider
            value={{ navigationVisible, toggleNavigation, hideNavigation }}
        >
            {children}
        </NavigationContext.Provider>
    )
}

export function useNavigation() {
    return useContext(NavigationContext)
}
