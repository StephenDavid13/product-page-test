<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'slug' => 'required|string|max:255|unique:products,slug,' . $this->product?->id,
            'price' => 'required|integer|min:0',
            'active' => 'boolean',
            'images' => 'array',
            'images.*' => 'string',
            'discount' => 'array',
            'discount.type' => 'required_with:discount|in:percent,amount',
            'discount.amount' => 'required_with:discount|integer|min:0'
        ];
    }

    /**
     * Get messages for validation errors.
     *
     * @return array
     */
    public function messages()
    {
        return [
            'name.required' => 'The product name is required.',
            'description.required' => 'The product description is required.',
            'slug.required' => 'The product slug is required.',
            'slug.unique' => 'This slug is already in use.',
            'price.required' => 'The product price is required.',
            'price.min' => 'The price must be a positive number.',
            'discount.type.in' => 'The discount type must be either percent or amount.',
            'discount.amount.min' => 'The discount amount must be a positive number.'
        ];
    }
}
