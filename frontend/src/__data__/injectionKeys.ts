import { ComputedRef, InjectionKey } from "vue";

export const TOGGLE_AGENT_SIDEBAR_KEY = Symbol('toggleAgentSidebar') as InjectionKey<() => void>
export const VALIDATE_DIAGRAM_KEY = Symbol('validateDiagram') as InjectionKey<any>
export const VALIDATE_DIAGRAM_LOADING_KEY = Symbol('validateDiagramLoading') as InjectionKey<ComputedRef<boolean>>
