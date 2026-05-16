/**
 * Clinical Validation Composable
 */

import { reactive } from "vue";

export const useClinicalValidation = () => {
  interface ValidationState {
    [key: string]: "valid" | "invalid" | "none";
  }

  const validationStates = reactive<ValidationState>({});

  const getFieldKey = (
    toothId: string | number,
    surface: string,
    field: string,
    site: number,
  ): string => `${toothId}-${surface}-${field}-${site}`;

  const getFieldValidation = (
    toothId: string | number,
    surface: string,
    field: string,
    site: number,
  ): "valid" | "invalid" | "none" => {
    return validationStates[getFieldKey(toothId, surface, field, site)] || "none";
  };

  const setFieldValidation = (
    toothId: string | number,
    surface: string,
    field: string,
    site: number,
    state: "valid" | "invalid" | "none",
  ) => {
    validationStates[getFieldKey(toothId, surface, field, site)] = state;
  };

  return {
    getFieldValidation,
    setFieldValidation,
  };
};
