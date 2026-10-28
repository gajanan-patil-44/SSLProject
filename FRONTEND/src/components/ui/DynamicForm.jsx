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

  // Precompute defaultValues from field definitions
  const computedDefaultValues = React.useMemo(() => {
    const flatFields = fields.some(f => f.section)
      ? fields.reduce((acc, curr) => [...acc, ...curr.fields], [])
      : fields;
    const initial = {};
    flatFields.forEach(f => {
      if (f.defaultValue !== undefined) {
        initial[f.key] = f.defaultValue;
      }
    });
    return { ...initial, ...(defaultValues || {}) };
  }, [fields, defaultValues]);

  // 1. Programmatically build a Zod validation schema if not supplied
  const validationSchema = schema || useFormSchema(fields);

  // 2. Initialize React Hook Form
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: computedDefaultValues
  });

  React.useEffect(() => {
    reset(computedDefaultValues);
  }, [computedDefaultValues, reset]);

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
            <Controller
              name={field.key}
              control={control}
              render={({ field: { value, onChange, ref, ...rest } }) => {
                const normalizedValue = (value !== undefined && value !== null) ? String(value) : '';
                return (
                  <Select
                    ref={ref}
                    placeholder={field.placeholder || `Select ${field.label || 'option'}`}
                    options={field.options}
                    disabled={field.disabled}
                    error={!!errorMsg}
                    value={normalizedValue}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || val === undefined || val === null) {
                        onChange('');
                      } else {
                        onChange(isNaN(Number(val)) ? val : Number(val));
                      }
                    }}
                    {...rest}
                  />
                );
              }}
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

      case 'toggle':
      case 'switch': {
        const isInverted = Boolean(field.invertToggle || field.key === 'CanBeReportingManager');
        return (
          <div key={field.key} className={`flex flex-col justify-center pt-2 ${field.gridSpan || "col-span-1"}`}>
            <Controller
              name={field.key}
              control={control}
              render={({ field: { value, onChange } }) => {
                const actualValue = value !== undefined ? Boolean(value) : (field.defaultValue !== undefined ? Boolean(field.defaultValue) : true);
                const isChecked = isInverted ? !actualValue : actualValue;
                return (
                  <Switch
                    label={field.label}
                    checked={isChecked}
                    onChange={(e) => {
                      const nextVal = isInverted ? !e.target.checked : e.target.checked;
                      onChange(nextVal);
                    }}
                    disabled={field.disabled}
                  />
                );
              }}
            />
            {field.helpText && <span className="text-xs text-slate-400 mt-1">{field.helpText}</span>}
          </div>
        );
      }

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

      const keyLower = String(field.key || '').toLowerCase();
      const isEmail = field.type === 'email' || keyLower.includes('email');
      const isPhone = field.type === 'tel' || keyLower.includes('phone') || keyLower.includes('mobile');
      const isCode = keyLower.endsWith('code') || keyLower.includes('code');
      const isPersonName = keyLower.includes('firstname') || keyLower.includes('lastname') || keyLower.includes('contactperson');

      if (isEmail) {
        if (field.required) {
          validator = z.preprocess(
            val => (val === undefined || val === null) ? '' : String(val).trim(),
            z.string()
              .min(1, { message: `${field.label || 'Email'} is required` })
              .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, { message: "Enter a valid email address (e.g. user@domain.com)" })
          );
        } else {
          validator = z.preprocess(
            val => (val === undefined || val === null) ? '' : String(val).trim(),
            z.string()
              .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, { message: "Enter a valid email address" })
              .optional()
              .or(z.literal(''))
          );
        }
      } else if (isPhone) {
        if (field.required) {
          validator = z.preprocess(
            val => (val === undefined || val === null) ? '' : String(val).trim().replace(/[\s\-()+]/g, ''),
            z.string()
              .min(1, { message: `${field.label || 'Phone number'} is required` })
              .regex(/^[6-9]\d{9}$/, { message: "Must be a valid 10-digit phone number starting with 6-9" })
          );
        } else {
          validator = z.preprocess(
            val => (val === undefined || val === null) ? '' : String(val).trim().replace(/[\s\-()+]/g, ''),
            z.string()
              .regex(/^[6-9]\d{9}$/, { message: "Must be a valid 10-digit phone number" })
              .optional()
              .or(z.literal(''))
          );
        }
      } else if (isCode) {
        if (field.required) {
          validator = z.preprocess(
            val => (val === undefined || val === null) ? '' : String(val).trim(),
            z.string()
              .min(2, { message: `${field.label || 'Code'} must be at least 2 characters` })
              .max(50, { message: `${field.label || 'Code'} cannot exceed 50 characters` })
              .regex(/^[A-Za-z0-9_-]+$/, { message: `${field.label || 'Code'} must be alphanumeric (letters, numbers, '-', '_')` })
          );
        } else {
          validator = z.preprocess(
            val => (val === undefined || val === null) ? '' : String(val).trim(),
            z.string()
              .regex(/^[A-Za-z0-9_-]+$/, { message: "Must be alphanumeric (letters, numbers, '-', '_')" })
              .optional()
              .or(z.literal(''))
          );
        }
      } else if (isPersonName) {
        if (field.required) {
          validator = z.preprocess(
            val => (val === undefined || val === null) ? '' : String(val).trim(),
            z.string()
              .min(2, { message: `${field.label || 'Name'} must be at least 2 characters` })
              .max(100, { message: `${field.label || 'Name'} cannot exceed 100 characters` })
              .regex(/^[a-zA-Z\s.'-]+$/, { message: `${field.label || 'Name'} must contain only letters and spaces` })
          );
        } else {
          validator = z.preprocess(
            val => (val === undefined || val === null) ? '' : String(val).trim(),
            z.string()
              .regex(/^[a-zA-Z\s.'-]+$/, { message: "Must contain only letters and spaces" })
              .optional()
              .or(z.literal(''))
          );
        }
      } else if (field.type === 'number') {
        if (field.required) {
          validator = z.preprocess(
            val => (val === '' || val === undefined || val === null) ? undefined : Number(val),
            z.number({ required_error: `${field.label || 'Field'} is required`, invalid_type_error: "Must be a number" })
          );
        } else {
          validator = z.preprocess(
            val => (val === '' || val === undefined || val === null) ? null : Number(val),
            z.number({ invalid_type_error: "Must be a number" }).optional().nullable()
          );
        }
      } else if (field.type === 'checkbox' || field.type === 'switch' || field.type === 'toggle') {
        if (field.required && field.type === 'checkbox') {
          validator = z.preprocess(val => Boolean(val), z.boolean().refine(val => val === true, { message: "Must check this box" }));
        } else {
          validator = z.preprocess(
            val => (val === undefined || val === null) ? (field.defaultValue !== undefined ? Boolean(field.defaultValue) : false) : Boolean(val),
            z.boolean().optional()
          );
        }
      } else if (field.type === 'select') {
        if (field.required) {
          validator = z.preprocess(
            val => (val === undefined || val === null || String(val).trim() === '' || String(val) === 'undefined' || String(val) === 'null') ? '' : (isNaN(Number(val)) ? String(val) : Number(val)),
            z.union([
              z.string().min(1, { message: `${field.label || 'Field'} is required` }),
              z.number({ required_error: `${field.label || 'Field'} is required` })
            ])
          );
        } else {
          validator = z.preprocess(
            val => (val === undefined || val === null || String(val).trim() === '' || String(val) === 'undefined' || String(val) === 'null') ? '' : (isNaN(Number(val)) ? String(val) : Number(val)),
            z.union([z.string(), z.number()]).optional().nullable().or(z.literal(''))
          );
        }
      } else {
        // text, textarea, and general inputs
        if (field.required) {
          validator = z.preprocess(
            val => (val === undefined || val === null) ? '' : String(val).trim(),
            z.string().min(1, { message: `${field.label || 'Field'} is required` })
          );
        } else {
          validator = z.preprocess(
            val => (val === undefined || val === null) ? '' : String(val).trim(),
            z.string().optional().nullable().or(z.literal(''))
          );
        }
      }

      shape[field.key] = validator;
    });

    return z.object(shape);
  }, [fields]);
}
