import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { flushPromises } from '@vue/test-utils'
import Product from './Product.vue'
import axios from 'axios'

// Mock axios globally
jest.mock('axios')

// Sample product data for tests
const mockProduct = {
  data: {
    id: 1,
    name: 'Fall Limited Edition Sneakers',
    description: 'These low-profile sneakers are your perfect casual wear companion.',
    price: {
      full: 250.00,
      discounted: 125.00
    },
    images: [
      '/images/image-product-1.jpg',
      '/images/image-product-2.jpg',
      '/images/image-product-3.jpg',
      '/images/image-product-4.jpg'
    ],
    discount: {
      type: 'percent',
      amount: 50
    }
  }
}

// Create router instance for testing
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: { template: '<div>Home</div>' }
    },
    {
      path: '/shop/product/:slug',
      name: 'product',
      component: Product
    }
  ]
})

describe('Product.vue', () => {
  let wrapper

  beforeEach(async () => {
    jest.clearAllMocks()
    axios.get.mockResolvedValue({ data: mockProduct })
    
    // Wait for router to be ready before mounting
    await router.push('/shop/product/fall-limited-edition-sneakers')
    await router.isReady()
    
    wrapper = mount(Product, {
      global: {
        plugins: [router],
        mocks: {
          axios
        }
      }
    })
    
    await wrapper.vm.$nextTick()
  })

  describe('Loading State', () => {
    it('shows loading spinner initially', async () => {
      // Create a new wrapper with pending promise
      const pendingPromise = new Promise(() => {})
      axios.get.mockImplementationOnce(() => pendingPromise)
      
      const newWrapper = mount(Product, {
        global: {
          plugins: [router],
          mocks: { axios }
        }
      })
      
      await newWrapper.vm.$nextTick()
      expect(newWrapper.find('.spinner').exists()).toBe(true)
      expect(newWrapper.find('.loading').exists()).toBe(true)
    })
  })

  describe('Error State', () => {
    it('shows 404 page when product is not found', async () => {
      // Mock axios before mounting component
      axios.get.mockRejectedValueOnce({ response: { status: 404 } })

      const wrapper = mount(Product, {
        global: {
          plugins: [router],
          mocks: { axios }
        }
      })

      // Wait for created hook and error to be processed
      await flushPromises()

      // Verify error state
      expect(wrapper.vm.loading).toBe(false)
      expect(wrapper.vm.error).toBe(true)
      expect(wrapper.find('.error').exists()).toBe(true)
      expect(wrapper.find('.error-content h1').text()).toBe('404')
      expect(wrapper.find('.error-content p').text()).toBe('Product Not Found')
    })
  })

  describe('Product Display', () => {
    beforeEach(async () => {
      // Ensure product data is loaded
      await wrapper.vm.fetchProduct()
      await wrapper.vm.$nextTick()
    })

    it('displays product name correctly', async () => {
      expect(wrapper.find('.product-info h1').text()).toBe(mockProduct.data.name)
    })

    it('displays product description', () => {
      expect(wrapper.find('.description').text()).toBe(mockProduct.data.description)
    })

    it('displays current price correctly', () => {
      expect(wrapper.find('.current-price').text()).toBe(`$${mockProduct.data.price.discounted.toFixed(2)}`)
    })

    it('displays original price with strikethrough', () => {
      expect(wrapper.find('.original-price').text()).toBe(`$${mockProduct.data.price.full.toFixed(2)}`)
    })

    it('displays discount badge', () => {
      const discountBadge = wrapper.find('.discount-badge')
      expect(discountBadge.exists()).toBe(true)
      expect(discountBadge.text()).toBe(`${mockProduct.data.discount.amount}%`)
    })

    it('displays all product images as thumbnails', () => {
      const thumbnails = wrapper.findAll('.thumbnail')
      expect(thumbnails).toHaveLength(4)
      thumbnails.forEach((thumbnail, index) => {
        expect(thumbnail.find('img').attributes('src')).toBe(mockProduct.data.images[index])
      })
    })
  })

  describe('Image Gallery', () => {
    it('displays first image as main image by default', () => {
      const mainImage = wrapper.find('.main-image img')
      expect(mainImage.attributes('src')).toBe(mockProduct.data.images[0])
    })

    it('changes main image when thumbnail is clicked', async () => {
      const thumbnails = wrapper.findAll('.thumbnail')
      await thumbnails[1].trigger('click')
      
      const mainImage = wrapper.find('.main-image img')
      expect(mainImage.attributes('src')).toBe(mockProduct.data.images[1])
    })

    it('adds active class to selected thumbnail', async () => {
      const thumbnails = wrapper.findAll('.thumbnail')
      await thumbnails[1].trigger('click')
      
      expect(thumbnails[1].classes()).toContain('active')
    })
  })

  describe('Quantity Controls', () => {
    it('starts with quantity of 1', () => {
      expect(wrapper.find('.quantity').text()).toBe('1')
    })

    it('increments quantity when plus button is clicked', async () => {
      await wrapper.find('.quantity-btn:last-child').trigger('click')
      expect(wrapper.find('.quantity').text()).toBe('2')
    })

    it('decrements quantity when minus button is clicked', async () => {
      // First increment to 2
      await wrapper.find('.quantity-btn:last-child').trigger('click')
      // Then decrement back to 1
      await wrapper.find('.quantity-btn:first-child').trigger('click')
      expect(wrapper.find('.quantity').text()).toBe('1')
    })

    it('does not decrement quantity below 1', async () => {
      await wrapper.find('.quantity-btn:first-child').trigger('click')
      expect(wrapper.find('.quantity').text()).toBe('1')
    })
  })

  describe('Add to Cart', () => {
    it('logs cart data when add to cart is clicked', async () => {
      const consoleSpy = jest.spyOn(console, 'log')
      await wrapper.find('.add-to-cart').trigger('click')
      
      expect(consoleSpy).toHaveBeenCalledWith('Adding to cart:', {
        product: expect.any(Object),
        quantity: 1
      })
    })
  })

  describe('API Integration', () => {
    it('calls API with correct slug', async () => {
      axios.get.mockResolvedValueOnce({ data: mockProduct })
      await wrapper.vm.$nextTick()
      
      expect(axios.get).toHaveBeenCalledWith(
        '/client/products/fall-limited-edition-sneakers'
      )
    })

    it('transforms API data correctly', async () => {
      expect(wrapper.vm.product).toEqual({
        name: mockProduct.data.name,
        description: mockProduct.data.description,
        price: mockProduct.data.price.discounted,
        original_price: mockProduct.data.price.full,
        discount: mockProduct.data.discount.amount,
        images: mockProduct.data.images.map(path => ({
          url: path,
          alt: mockProduct.data.name
        }))
      })
    })

    it('refetches data when route slug changes', async () => {
      axios.get.mockResolvedValueOnce({ data: mockProduct })
      await wrapper.vm.$nextTick()
      
      axios.get.mockClear()
      await router.push('/shop/product/another-product')
      
      expect(axios.get).toHaveBeenCalledWith(
        '/client/products/another-product'
      )
    })
  })

  describe('Price and Discount Display', () => {
    it('displays original price when no discount is active', async () => {
      const productWithoutDiscount = {
        data: {
          ...mockProduct.data,
          price: {
            full: 250.00,
            discounted: 250.00
          },
          discount: null
        }
      }
      
      // Override the global axios mock for this test
      axios.get.mockReset()
      axios.get.mockResolvedValueOnce({ data: productWithoutDiscount })
      
      const newWrapper = mount(Product, {
        global: {
          plugins: [router],
          mocks: { axios }
        }
      })
      
      // Wait for the component to mount and data to be processed
      await flushPromises()

      expect(newWrapper.find('.original-price').exists()).toBe(false)
      expect(newWrapper.find('.discount-badge').exists()).toBe(false)
    })

    it('calculates discounted price correctly', async () => {
      expect(wrapper.vm.discountedPrice).toBe(mockProduct.data.price.discounted)
    })
  })
}) 