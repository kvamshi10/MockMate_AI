import React, { useState } from 'react'
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Controller, FieldValues, Path, Control } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";

interface FormFieldProps<T extends FieldValues> {
    control: Control<T>;
    name: Path<T>;
    label: string;
    placeholder?: string;
    type?: 'text' | 'email' | 'password' | 'file';
}

function FormField<T extends FieldValues>({ control, name, label, placeholder, type ="text" }: FormFieldProps<T>) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <Controller
            control={control}
        name={name}
        render={({ field, fieldState }) => (
            <Field>
                <FieldLabel htmlFor={name} className="label">{label}</FieldLabel>
                <div className="relative">
                    <Input
                        id={name}
                        className="input pr-10"
                        placeholder={placeholder}
                        type={type === 'password' && showPassword ? 'text' : type}
                        {...field}
                    />
                    {type === 'password' && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-400 transition-colors cursor-pointer"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    )}
                </div>
                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
            </Field>
        )}
    />
    );
}

export default FormField;