export type INavigationContext = {
    navigationVisible: boolean
    toggleNavigation: () => void
    hideNavigation: () => void
}

export type NavigationProviderProps = {
    initialNavigationState: boolean
}
