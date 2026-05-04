import { z } from 'zod';

export const emptyableString = z.string().optional().or(z.literal(''));

export const emptyableNumber = emptyableString.refine(
  (v) => !v || !isNaN(parseFloat(v)),
  { message: 'Must be a valid number' },
);

export const numericString = (opts: {
  required?: boolean;
  min?: number;
  positive?: boolean;
  message?: string;
} = {}) => {
  const { required = true, min, positive, message } = opts;

  let schema = z.string();
  if (required) schema = schema.min(1, message || 'Required');

  return schema.refine(
    (v) => {
      if (!required && !v) return true;
      const num = parseFloat(v);
      if (isNaN(num)) return false;
      if (min !== undefined && num < min) return false;
      if (positive && num <= 0) return false;
      return true;
    },
    { message: message || 'Must be a valid number' },
  );
};

export const requiredNumber = numericString();
export const nonNegativeNumber = numericString({ min: 0 });
export const positiveNumber = numericString({ positive: true });
export const optionalNumber = numericString({ required: false });
export const optionalNonNegativeNumber = numericString({ required: false, min: 0 });
export const optionalNumberWithNegative = numericString({ required: false });
