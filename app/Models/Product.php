<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'slug',
        'price',
        'active'
    ];

    protected $appends = ['formatted_price', 'formatted_discount', 'formatted_images'];

    /**
     * Get all of the images for the product.
     */
    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    /**
     * Get the discount associated with the product.
     */
    public function discount()
    {
        return $this->hasOne(ProductDiscount::class);
    }

    /**
     * Get the formatted price with discount.
     */
    public function getFormattedPriceAttribute()
    {
        $fullPrice = $this->price;
        $discountedPrice = $fullPrice;

        if ($this->discount) {
            if ($this->discount->type === 'percent') {
                $discountedPrice = $fullPrice - ($fullPrice * ($this->discount->discount / 100));
            } else {
                $discountedPrice = $fullPrice - $this->discount->discount;
            }
        }

        return [
            'full' => $fullPrice,
            'discounted' => $discountedPrice
        ];
    }

    /**
     * Get the formatted discount.
     */
    public function getFormattedDiscountAttribute()
    {
        if (!$this->discount) {
            return null;
        }

        return [
            'type' => $this->discount->type,
            'amount' => $this->discount->discount
        ];
    }

    /**
     * Get the formatted images array.
     */
    public function getFormattedImagesAttribute()
    {
        return $this->images->pluck('path')->toArray();
    }

    /**
     * Override the toArray method to include attributes.
     */
    public function toArray()
    {
        $array = parent::toArray();
        
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'slug' => $this->slug,
            'price' => $this->formatted_price,
            'discount' => $this->formatted_discount,
            'images' => $this->formatted_images
        ];
    }
}
