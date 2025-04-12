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
            <img :src="image" :alt="product.name">
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
            <span v-if="product.discount" class="discount-badge">
              {{ product.discount }}%
            </span>
          </div>
          <div v-if="product.original_price" class="original-price">
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
      return this.product.images[this.currentImageIndex]
    }
  },

  methods: {
    async fetchProduct() {
      try {
        this.loading = true
        this.error = false
        this.product = null
        const response = await axios.get(`/client/products/${this.$route.params.slug}`)
        
        // API response to match data structure
        const productData = response.data.data
        this.product = {
          name: productData.name,
          description: productData.description,
          price: productData.price.discounted,
          original_price: productData.price.full,
          discount: productData.discount.amount,
          images: productData.images
        }
      } catch (error) {
        console.error('Error details:', {
          status: error.response?.status,
          data: error.response?.data,
          config: error.config,
          message: error.message
        })
        
        if (error.response?.status === 404 || error.response?.status === 4040) {
          this.error = true
        }
      } finally {
        this.loading = false
      }
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

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.product-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Image Gallery */
.image-gallery {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.main-image {
  border-radius: 1rem;
  overflow: hidden;
  background-color: #fff7ed;
  aspect-ratio: 1;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.thumbnail {
  border: 2px solid transparent;
  border-radius: 0.5rem;
  overflow: hidden;
  padding: 0;
  cursor: pointer;
  aspect-ratio: 1;
  background: none;
}

.thumbnail.active {
  border-color: #ff7d1a;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Product Info */
.product-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
}

.product-info h1 {
  font-size: 2.5rem;
  font-weight: bold;
  color: #1d2025;
}

.description {
  color: #68707d;
  line-height: 1.6;
}

.price-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.price-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.current-price {
  font-size: 1.875rem;
  font-weight: bold;
  color: #1d2025;
}

.discount-badge {
  background-color: #ffeee2;
  color: #ff7d1a;
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-weight: bold;
}

.original-price {
  color: #b6bcc8;
  text-decoration: line-through;
}

/* Controls */
.controls {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.quantity-controls {
  display: flex;
  align-items: center;
  background-color: #f7f8fd;
  border-radius: 0.5rem;
}

.quantity-btn {
  padding: 0.75rem 1.25rem;
  border: none;
  background: none;
  color: #ff7d1a;
  font-weight: bold;
  font-size: 1.25rem;
  cursor: pointer;
}

.quantity-btn:hover {
  color: #ffab6a;
}

.quantity {
  padding: 0.75rem;
  min-width: 3rem;
  text-align: center;
  font-weight: bold;
}

.add-to-cart {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background-color: #ff7d1a;
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-to-cart:hover {
  background-color: #ffab6a;
}

.cart-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Loading State */
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.spinner {
  width: 4rem;
  height: 4rem;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ff7d1a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error Page */
.error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f7f8fd;
}

.error-content {
  text-align: center;
}

.error-content h1 {
  font-size: 4rem;
  font-weight: bold;
  color: #1d2025;
  margin-bottom: 1rem;
}

.error-content p {
  color: #68707d;
  margin-bottom: 2rem;
}

.btn {
  display: inline-block;
  background-color: #ff7d1a;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.2s;
}

.btn:hover {
  background-color: #ffab6a;
}

.loading-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #68707d;
}
</style>