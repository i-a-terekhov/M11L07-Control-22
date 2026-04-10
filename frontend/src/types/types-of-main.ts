export type SidebarMenuHrefs = {
    main: string,
    operations: string,
    incomes: string,
    expenses: string,
}

export type ArrayOfRoutsSettings = Array<RouteSettings>

export type RouteSettings = {
    route: string,
    filePathTemplate?: string,
    sidebarHTML?: string,
    sidebarMenu?: SideBarSettings,
    title?: string,
    styles?: string[],
    scripts?: string[]
    load?: Function,
    unload?: Function
}

export type SideBarSettings = {
    isTreeviewOpen: boolean,
    highlightOption: string
}