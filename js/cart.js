/**
 * GRILLISTA - Cart & Commerce Engine
 * Handles items, modifiers, coupons, dynamic bill calculations, and LocalStorage persistence
 */

import { CONFIG } from './config.js';
import { COUPONS } from './data.js';
import { Security } from './security.js';

class CartEngine {
  constructor() {
    this.items = Security.storage.get(CONFIG.STORAGE_KEYS.CART, []);
    this.appliedCoupon = null;
    this.subscribers = [];
  }

  /**
   * Subscribe to cart changes for UI reactivity
   */
  subscribe(callback) {
    if (typeof callback === 'function') {
      this.subscribers.push(callback);
    }
  }

  notify() {
    this.persist();
    const summary = this.getSummary();
    this.subscribers.forEach(cb => cb(this.items, summary));
  }

  persist() {
    Security.storage.set(CONFIG.STORAGE_KEYS.CART, this.items);
  }

  /**
   * Generate a unique cart key taking modifiers into account
   */
  _generateItemKey(productId, modifiers = []) {
    const sortedModNames = [...modifiers].map(m => m.name).sort().join('|');
    return `${productId}::${sortedModNames}`;
  }

  /**
   * Add item to cart with optional modifiers
   */
  addItem(product, modifiers = [], quantity = 1) {
    const key = this._generateItemKey(product.id, modifiers);
    const existingIndex = this.items.findIndex(item => item.cartKey === key);

    const modTotal = modifiers.reduce((acc, m) => acc + (m.price || 0), 0);
    const unitPrice = product.price + modTotal;

    if (existingIndex > -1) {
      this.items[existingIndex].quantity += quantity;
    } else {
      this.items.push({
        cartKey: key,
        id: product.id,
        name: product.name,
        isVeg: product.isVeg,
        basePrice: product.price,
        unitPrice: unitPrice,
        image: product.image,
        modifiers: modifiers,
        quantity: quantity
      });
    }

    this.notify();
    return true;
  }

  /**
   * Update item quantity in cart
   */
  updateQuantity(cartKey, newQty) {
    const index = this.items.findIndex(item => item.cartKey === cartKey);
    if (index === -1) return;

    if (newQty <= 0) {
      this.items.splice(index, 1);
    } else {
      this.items[index].quantity = Math.min(newQty, 20); // Cap at 20 max per item
    }

    this.notify();
  }

  /**
   * Remove item completely
   */
  removeItem(cartKey) {
    this.items = this.items.filter(item => item.cartKey !== cartKey);
    this.notify();
  }

  /**
   * Clear the entire cart
   */
  clear() {
    this.items = [];
    this.appliedCoupon = null;
    this.notify();
  }

  /**
   * Apply coupon code
   */
  applyCoupon(code) {
    if (!code || typeof code !== 'string') {
      return { success: false, message: 'Please enter a valid coupon code.' };
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = COUPONS[cleanCode];

    if (!coupon) {
      return { success: false, message: 'Invalid coupon code. Try GRILLISTA50 or DESI20!' };
    }

    const subtotal = this.getSubtotal();
    if (coupon.minOrder && subtotal < coupon.minOrder) {
      return {
        success: false,
        message: `Add items worth ₹${coupon.minOrder - subtotal} more to apply ${cleanCode}.`
      };
    }

    this.appliedCoupon = coupon;
    this.notify();
    return {
      success: true,
      message: `🎉 Promo ${cleanCode} applied successfully!`,
      coupon
    };
  }

  /**
   * Remove applied coupon
   */
  removeCoupon() {
    this.appliedCoupon = null;
    this.notify();
  }

  /**
   * Calculate subtotal of food items
   */
  getSubtotal() {
    return this.items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  }

  /**
   * Total item count
   */
  getTotalCount() {
    return this.items.reduce((acc, item) => acc + item.quantity, 0);
  }

  /**
   * Get full bill summary
   */
  getSummary() {
    const subtotal = this.getSubtotal();
    const itemCount = this.getTotalCount();

    let discount = 0;
    let isFreeDelivery = subtotal >= CONFIG.COMMERCE.FREE_DELIVERY_THRESHOLD;

    if (this.appliedCoupon) {
      if (this.appliedCoupon.discountPercent) {
        const calculatedDisc = (subtotal * this.appliedCoupon.discountPercent) / 100;
        discount = Math.min(calculatedDisc, this.appliedCoupon.maxDiscount || Infinity);
      } else if (this.appliedCoupon.flatDiscount) {
        discount = Math.min(this.appliedCoupon.flatDiscount, subtotal);
      } else if (this.appliedCoupon.isFreeDelivery) {
        isFreeDelivery = true;
      }
    }

    const discountedSubtotal = Math.max(0, subtotal - discount);
    const packagingFee = itemCount > 0 ? CONFIG.COMMERCE.PACKAGING_FEE : 0;
    const deliveryFee = (itemCount > 0 && !isFreeDelivery) ? CONFIG.COMMERCE.STANDARD_DELIVERY_FEE : 0;
    const gst = Math.round(discountedSubtotal * CONFIG.COMMERCE.GST_RATE);
    const grandTotal = itemCount > 0 ? (discountedSubtotal + packagingFee + deliveryFee + gst) : 0;

    return {
      itemCount,
      subtotal,
      discount: Math.round(discount),
      packagingFee,
      deliveryFee,
      isFreeDelivery,
      gst,
      grandTotal,
      appliedCoupon: this.appliedCoupon,
      currency: CONFIG.BRAND.currencySymbol
    };
  }
}

export const Cart = new CartEngine();
