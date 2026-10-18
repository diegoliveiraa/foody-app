import { get, type FieldErrors, type FieldValues, type Path } from "react-hook-form";

export function firstInvalidField<TValues extends FieldValues, TField extends Path<TValues>>(
  errors: FieldErrors<TValues>,
  fields: readonly TField[],
): TField | undefined {
  return fields.find((field: TField): boolean => get(errors, field) !== undefined);
}
