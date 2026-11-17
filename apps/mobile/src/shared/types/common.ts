export type LoadStatus = "idle" | "loading" | "ready" | "error";

export type Brand<T, Name extends string> = T & { readonly __brand: Name };

export type Nullable<T> = T | null;
