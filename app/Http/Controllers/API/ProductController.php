<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductRequest;
use App\Models\Product;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    /**
     * Display a listing of the products.
     */
    public function index(): JsonResponse
    {
        $products = Product::with(['images', 'discount'])->get();
        return response()->json($products);
    }

    /**
     * Store a newly created product in storage.
     */
    public function store(ProductRequest $request): JsonResponse
    {
        $product = Product::create($request->validated());

        // Create images if provided
        if ($request->has('images')) {
            foreach ($request->images as $imagePath) {
                $product->images()->create(['path' => $imagePath]);
            }
        }

        // Create discount if provided
        if ($request->has('discount')) {
            $product->discount()->create($request->discount);
        }

        return response()->json($product->load(['images', 'discount']), 201);
    }

    /**
     * Display the specified product.
     */
    public function show(Product $product): JsonResponse
    {
        return response()->json($product->load(['images', 'discount']));
    }

    /**
     * Update the specified product in storage.
     */
    public function update(ProductRequest $request, Product $product): JsonResponse
    {
        $product->update($request->validated());

        // Update images if provided
        if ($request->has('images')) {
            $product->images()->delete();
            foreach ($request->images as $imagePath) {
                $product->images()->create(['path' => $imagePath]);
            }
        }

        // Update discount if provided
        if ($request->has('discount')) {
            if ($product->discount) {
                $product->discount()->update($request->discount);
            } else {
                $product->discount()->create($request->discount);
            }
        }

        return response()->json($product->load(['images', 'discount']));
    }

    /**
     * Remove the specified product from storage.
     */
    public function destroy(Product $product): JsonResponse
    {
        $product->delete();
        return response()->json(null, 204);
    }
}
