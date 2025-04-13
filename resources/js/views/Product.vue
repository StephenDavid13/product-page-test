<template>
  <div v-if="loading" class="loading">
    <div class="spinner"></div>
  </div>

  <div v-else-if="error" class="error">
    <div class="error-content">
      <h1>404</h1>
      <p>Product Not Found</p>
      <router-link to="/" class="btn">Return Home</router-link>
    </div>
  </div>

  <div v-else-if="product" class="container">
    <div class="product-grid">
      <!-- Product Images Section -->
      <div class="image-gallery">
        <div class="main-image">
          <img 
            v-if="currentImage" 
            :src="currentImage" 
            :alt="product.name"
          >
          <div v-else class="loading-placeholder">
            Loading image...
          </div>
        </div>
        <div class="thumbnail-grid">
          <button 
            v-for="(image, index) in (product.images || [])" 
            :key="index"
            @click="currentImageIndex = index"
            :class="['thumbnail', { active: currentImageIndex === index }]"
          >
            <img :src="image.url" :alt="product.name">
          </button>
        </div>
      </div>

      <!-- Product Info Section -->
      <div class="product-info">
        <h1>{{ product.name }}</h1>
        <p class="description">{{ product.description }}</p>

        <div class="price-section">
          <div class="price-row">
            <span class="current-price">${{ formatPrice(product.price) }}</span>
            <span v-if="product.discount > 0" class="discount-badge">
              {{ product.discount }}%
            </span>
          </div>
          <div v-if="product.original_price !== null" class="original-price">
            ${{ formatPrice(product.original_price) }}
          </div>
        </div>

        <div class="controls">
          <div class="quantity-controls">
            <button @click="decrementQuantity" class="quantity-btn">-</button>
            <span class="quantity">{{ quantity }}</span>
            <button @click="incrementQuantity" class="quantity-btn">+</button>
          </div>
          <button @click="addToCart" class="add-to-cart">
            <svg class="cart-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
            Add to cart
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      product: null,
      loading: true,
      error: false,
      quantity: 1,
      currentImageIndex: 0
    }
  },

  computed: {
    currentImage() {
      if (!this.product?.images?.length) {
        return null
      }
      return this.product.images[this.currentImageIndex].url
    },

    discountedPrice() {
      if (!this.product) return null
      return this.product.price
    }
  },

  methods: {
    async fetchProduct() {
      try {
        this.loading = true
        this.error = false
        this.product = null

        const response = await axios.get(`/client/products/${this.$route.params.slug}`)
        
        // Transform API response to match component data structure
        const productData = response.data.data
        
        this.product = {
          name: productData.name,
          description: productData.description,
          price: productData.price.discounted,
          original_price: productData.price.full,
          discount: productData.discount.amount,
          images: productData.images.map(path => ({
            url: this.getImageUrl(path),
            alt: productData.name
          }))
        }
      } catch (error) {
        console.error('Error details:', {
          status: error.response?.status,
          data: error.response?.data,
          config: error.config,
          message: error.message
        })
        
        this.product = null
        this.error = error.response?.status === 404
      } finally {
        this.loading = false
      }
    },

    getImageUrl(path) {
      // Remove leading slash if present
      const cleanPath = path.startsWith('/') ? path.substring(1) : path
      return `/${cleanPath}`
    },

    formatPrice(price) {
      return Number(price).toFixed(2)
    },

    incrementQuantity() {
      this.quantity++
    },

    decrementQuantity() {
      if (this.quantity > 1) {
        this.quantity--
      }
    },

    addToCart() {
      // TODO: Implement cart
      console.log('Adding to cart:', {
        product: this.product,
        quantity: this.quantity
      })
    }
  },

  created() {
    this.fetchProduct()
  },

  watch: {
    '$route.params.slug': {
      handler() {
        this.fetchProduct()
      }
    }
  }
}
</script>

<style lang="scss">
// The styles are now in app.scss
</style>