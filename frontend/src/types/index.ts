export type BaseResponse<T> = {
    data: T
    errors: string[]
}

export enum Model {
    THEONEMARKET = 'theonemarket',
    THEONEMARKETMAX = 'theonemarketmax',
}

