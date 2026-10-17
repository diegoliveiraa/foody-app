import { useId, type ComponentProps, type JSX } from "react";
import {
  Controller,
  type ControllerFieldState,
  type ControllerRenderProps,
  type FormState,
} from "react-hook-form";
import type { Category } from "@/@types/catalog";
import { FormAlert } from "@/components/form-alert";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { CATALOG_STATUSES } from "@/constants/catalog";
import { LIST_CARDS_MEDIA_QUERY } from "@/constants/breakpoints";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { ProductFormInput } from "@/services/validation-schemas/product";
import { PRODUCTS_MESSAGES } from "../constants/messages";
import type { ProductForm, ProductFormModel } from "../types";

type SheetSide = ComponentProps<typeof SheetContent>["side"];

interface ProductFormSheetProps {
  model: ProductFormModel;
  categories: readonly Category[];
}

interface CategoryFieldProps {
  field: ControllerRenderProps<ProductFormInput, "categoryId">;
  fieldState: ControllerFieldState;
  categories: readonly Category[];
}

interface DescriptionFieldProps {
  form: ProductForm;
  error: string | undefined;
}

function categoryLabel(category: Category): string {
  return category.status === CATALOG_STATUSES.DISABLED
    ? PRODUCTS_MESSAGES.FORM.DISABLED_CATEGORY(category.name)
    : category.name;
}

function CategoryField({ field, fieldState, categories }: CategoryFieldProps): JSX.Element {
  const id: string = useId();
  const errorId: string = `${id}-error`;
  const invalid: boolean = fieldState.error !== undefined;

  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor={id}>{PRODUCTS_MESSAGES.FORM.CATEGORY}</FieldLabel>
      <Select name={field.name} value={field.value} onValueChange={field.onChange}>
        <SelectTrigger
          id={id}
          aria-invalid={invalid}
          aria-describedby={invalid ? errorId : undefined}
          className="w-full min-w-0"
        >
          <SelectValue placeholder={PRODUCTS_MESSAGES.FORM.CHOOSE_CATEGORY} />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category: Category): JSX.Element => (
            <SelectItem key={category.id} value={category.id}>
              {categoryLabel(category)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError id={errorId}>{fieldState.error?.message}</FieldError>
    </Field>
  );
}

function DescriptionField({ form, error }: DescriptionFieldProps): JSX.Element {
  const id: string = useId();
  const errorId: string = `${id}-error`;

  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{PRODUCTS_MESSAGES.FORM.DETAILS}</FieldLabel>
      <Textarea
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...form.register("description")}
      />
      <FieldError id={errorId}>{error}</FieldError>
    </Field>
  );
}

export function ProductFormSheet({ model, categories }: ProductFormSheetProps): JSX.Element {
  const showsCards: boolean = useMediaQuery(LIST_CARDS_MEDIA_QUERY);
  const side: SheetSide = showsCards ? "bottom" : "right";
  const { form } = model;
  const { errors, isSubmitting }: FormState<ProductFormInput> = form.formState;
  const editing: boolean = model.editing !== null;

  return (
    <Sheet
      open={model.open}
      onOpenChange={(next: boolean): void => {
        if (!next) {
          model.close();
        }
      }}
    >
      <SheetContent
        side={side}
        className="overflow-y-auto data-[side=bottom]:max-h-[92svh] data-[side=bottom]:rounded-t-[28px] data-[side=right]:w-full data-[side=right]:sm:max-w-md"
      >
        <form noValidate onSubmit={model.submit} className="flex min-h-full flex-col">
          <SheetHeader className="px-6 pt-6 pr-14">
            <SheetTitle className="text-xl font-bold">
              {model.editing === null
                ? PRODUCTS_MESSAGES.FORM.CREATE_TITLE
                : PRODUCTS_MESSAGES.FORM.EDIT_TITLE(model.editing.name)}
            </SheetTitle>
            <SheetDescription>{PRODUCTS_MESSAGES.FORM.DESCRIPTION}</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4 px-6 py-2">
            <FormAlert message={errors.root?.message} />
            <FormField
              label={PRODUCTS_MESSAGES.FORM.NAME}
              autoComplete="off"
              error={errors.name?.message}
              {...form.register("name")}
            />
            <DescriptionField form={form} error={errors.description?.message} />
            <FormField
              label={PRODUCTS_MESSAGES.FORM.PRICE}
              inputMode="decimal"
              autoComplete="off"
              placeholder={PRODUCTS_MESSAGES.FORM.PRICE_PLACEHOLDER}
              error={errors.price?.message}
              {...form.register("price")}
            />
            <Controller
              control={form.control}
              name="categoryId"
              render={({ field, fieldState }): JSX.Element => (
                <CategoryField field={field} fieldState={fieldState} categories={categories} />
              )}
            />
          </div>
          <SheetFooter className="gap-3 px-6 pt-4 pb-6 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={model.close}>
              {PRODUCTS_MESSAGES.FORM.CANCEL}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {editing ? PRODUCTS_MESSAGES.FORM.SAVE : PRODUCTS_MESSAGES.FORM.CREATE}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
