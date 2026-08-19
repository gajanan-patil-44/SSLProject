// src/components/ui/DynamicForm.jsx
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, FormField, Input, Textarea, Select, Checkbox, Radio, Switch } from './index';

export const DynamicForm = ({
  fields = [],
  schema, // Optional pre-defined Zod schema
  onSubmit,
  onCancel,
  defaultValues = {},
  submitText = "Save",
  cancelText = "Cancel",
  loading = false,
  gridCols = 2 // Number of columns for form layout
}) => {
  
  // 1. Programmatically build a Zod validation schema if not supplied
  const validationSchema = schema || useFormSchema(fields);

  // 2. Initialize React Hook Form
  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues
  });

  // Render a single form field control
  const renderField = (field) => {
    const errorMsg = errors[field.key]?.message;

    switch (field.type) {
      case 'textarea':
        return (
          <FormField
            key={field.key}
            label={field.label}
            error={errorMsg}
            helpText={field.helpText}
            className={field.gridSpan || "col-span-2"}
          >
            <Textarea
              placeholder={field.placeholder}
              disabled={field.disabled}
              error={!!errorMsg}
              {...register(field.key)}
            />
          </FormField>
        );

      case 'select':
        return (
          <FormField
            key={field.key}
            label={field.label}
            error={errorMsg}
            helpText={field.helpText}
            className={field.gridSpan || "col-span-1"}
          >
            <Select
              options={field.options}
              disabled={field.disabled}
              error={!!errorMsg}
              {...register(field.key)}
            />
          </FormField>
        );

      case 'checkbox':
        return (
          <div key={field.key} className={`flex items-center pt-5 ${field.gridSpan || "col-span-1"}`}>
            <Controller
              name={field.key}
              control={control}
              render={({ field: { value, onChange } }) => (
                <Checkbox
                  label={field.label}
                  checked={!!value}
                  onChange={(e) => onChange(e.target.checked)}
                  disabled={field.disabled}
                />
              )}
            />
          </div>
        );

      case 'switch':
        return (
          <div key={field.key} className={`flex items-center pt-5 ${field.gridSpan || "col-span-1"}`}>
            <Controller
              name={field.key}
              control={control}
              render={({ field: { value, onChange } }) => (
                <Switch
                  label={field.label}
                  checked={!!value}
                  onChange={(e) => onChange(e.target.checked)}
                  disabled={field.disabled}
                />
              )}
            />
          </div>
        );

      case 'radio':
        return (
          <FormField
            key={field.key}
            label={field.label}
            error={errorMsg}
            helpText={field.helpText}
            className={field.gridSpan || "col-span-2"}
          >
            <div className="flex gap-4 mt-1">
              {field.options?.map((opt) => (
                <label key={opt.value} className="inline-flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-400 cursor-pointer">
                  <input
                    type="radio"
                    value={opt.value}
                    disabled={field.disabled}
                    className="w-4 h-4 border-slate-300 dark:border-slate-800 text-secondary focus:ring-secondary cursor-pointer"
                    {...register(field.key)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </FormField>
        );

      default: // text, email, password, number, date, datetime-local
        return (
          <FormField
            key={field.key}
            label={field.label}
            error={errorMsg}
            helpText={field.helpText}
            className={field.gridSpan || "col-span-1"}
          >
            <Input
              type={field.type || 'text'}
              placeholder={field.placeholder}
              disabled={field.disabled}
              error={!!errorMsg}
              {...register(field.key, {
                valueAsNumber: field.type === 'number'
              })}
            />
          </FormField>
        );
    }
  };

  // Group fields if sections are defined, otherwise render in a single grid
  const hasSections = fields.some(f => f.section);

  const columnStyles = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-4',
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {hasSections ? (
        <div className="space-y-6">
          {fields.map((section, sIdx) => (
            <div key={sIdx} className="border-b border-slate-100 dark:border-slate-800 pb-6 last:border-b-0 last:pb-0">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-50 mb-3 uppercase tracking-wider">
                {section.section}
              </h4>
              <div className={`grid gap-4 ${columnStyles[section.gridCols || gridCols]}`}>
                {section.fields.map(renderField)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`grid gap-4 ${columnStyles[gridCols]}`}>
          {fields.map(renderField)}
        </div>
      )}

      {/* Form Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        {onCancel && (
          <Button variant="outline" type="button" onClick={onCancel} disabled={loading}>
            {cancelText}
          </Button>
        )}
        <Button variant="secondary" type="submit" disabled={loading}>
          {loading ? "Saving..." : submitText}
        </Button>
      </div>
    </form>
  );
};

// Helper hook to dynamically construct a Zod schema from field definitions
function useFormSchema(fields) {
  return React.useMemo(() => {
    const shape = {};
    
    // Flatten fields if nested in sections
    const flatFields = fields.some(f => f.section)
      ? fields.reduce((acc, curr) => [...acc, ...curr.fields], [])
      : fields;

    flatFields.forEach(field => {
      let validator = z.any();

      if (field.type === 'email') {
        validator = z.string().email({ message: "Invalid email address" });
      } else if (field.type === 'number') {
        validator = z.number({ invalid_type_error: "Must be a number" });
      } else if (field.type === 'checkbox' || field.type === 'switch') {
        validator = z.boolean();
      } else {
        validator = z.string();
      }

      if (field.required) {
        if (field.type === 'number') {
          validator = validator.refine(val => val !== undefined && val !== null, { message: "Required field" });
        } else if (field.type === 'checkbox' || field.type === 'switch') {
          validator = validator.refine(val => val === true, { message: "Must check this box" });
        } else {
          validator = validator.min(1, { message: `${field.label || 'Field'} is required` });
        }
      } else {
        // Optional handling
        if (field.type === 'email') {
          validator = validator.optional().or(z.literal(''));
        } else if (field.type === 'number') {
          validator = validator.optional().nullable();
        } else {
          validator = validator.optional();
        }
      }

      shape[field.key] = validator;
    });

    return z.object(shape);
  }, [fields]);
}
