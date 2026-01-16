export type Result<T, E> = { value: T; error?: never } | { error: E }
