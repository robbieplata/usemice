export function createErrorClass<T extends string>(name: T) {
  return class extends Error {
    readonly name = name
    constructor(message: string) {
      super(message)
    }
  } as new (message: string) => Error & { readonly name: T }
}
