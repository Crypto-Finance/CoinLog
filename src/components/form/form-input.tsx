import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Control, FieldValues, Path } from 'react-hook-form';
import { cn } from '@/lib/utils/utils';

interface FormInputProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  type?: string;
  step?: string;
}

export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = 'text',
  step,
}: FormInputProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="font-bold text-[#c3caac] text-sm">{label}</FormLabel>
          <FormControl>
            <Input 
              type={type} 
              step={step} 
              placeholder={placeholder} 
              {...field}
              className={cn(
                'rounded-[12px] bg-[#101c2d] border-[rgba(255,255,255,0.1)]',
                'text-[#d7e3fb] placeholder:text-[#c3caac]',
                'focus:border-[#BFFF00] focus:ring-[#BFFF00]'
              )}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
