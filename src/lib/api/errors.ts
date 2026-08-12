export interface SpringValidationError {
  field: string
  message: string
}

export interface SpringErrorResponse {
  message: string
  errors: SpringValidationError[] | null
}

export interface ApiError {
  status: number
  message: string
  errors: SpringValidationError[]
}

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError }
