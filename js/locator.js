/**
 * GRILLISTA - Real-Time Store Locator & Geolocation Engine
 * Integrates browser Geolocation, OpenStreetMap Nominatim Search, and Haversine distance sorting
 */

import { OUTLETS } from './data.js';
import { ApiService } from './api.js';
import { Security } from './security.js';

export const StoreLocator = {
  userLocation: null,
  currentQuery: '',
  selectedCityFilter: 'all',

  /**
   * Calculate distance between two coordinates in Kilometers using Haversine formula
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  },

  /**
   * Request user's live device location
   */
  async getUserCoordinates() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          this.userLocation = coords;
          const locality = await ApiService.reverseGeocode(coords.lat, coords.lng);
          coords.locality = locality;
          resolve(coords);
        },
        (error) => {
          let msg = 'Unable to retrieve your location.';
          if (error.code === error.PERMISSION_DENIED) {
            msg = 'Location access was denied. You can still search by city or pincode.';
          }
          reject(new Error(msg));
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    });
  },

  /**
   * Search and filter outlets based on search query, city filter, or live coordinates
   */
  async findOutlets(query = '', cityFilter = 'all') {
    this.currentQuery = query.trim();
    this.selectedCityFilter = cityFilter;

    let targetCoords = this.userLocation;

    // If a search query is provided, check with real-time Nominatim API
    if (this.currentQuery.length >= 3) {
      const geoResults = await ApiService.searchLocation(this.currentQuery);
      if (geoResults && geoResults.length > 0) {
        targetCoords = {
          lat: geoResults[0].lat,
          lng: geoResults[0].lng,
          resolvedName: geoResults[0].displayName
        };
      }
    }

    let results = OUTLETS.map(outlet => {
      let distance = null;
      if (targetCoords) {
        distance = this.calculateDistance(targetCoords.lat, targetCoords.lng, outlet.lat, outlet.lng);
      }
      return {
        ...outlet,
        distance
      };
    });

    // Filter by city if selected
    if (this.selectedCityFilter !== 'all') {
      results = results.filter(o => o.city.toLowerCase().includes(this.selectedCityFilter.toLowerCase()));
    }

    // Filter by text search match if no geocoded match or as secondary filter
    if (this.currentQuery) {
      const q = this.currentQuery.toLowerCase();
      results = results.filter(o =>
        o.name.toLowerCase().includes(q) ||
        o.address.toLowerCase().includes(q) ||
        o.city.toLowerCase().includes(q) ||
        (targetCoords && o.distance !== null && o.distance < 45) // Within 45km of searched region
      );
    }

    // Sort by proximity if coordinates are available, otherwise by rating
    if (targetCoords) {
      results.sort((a, b) => (a.distance || 9999) - (b.distance || 9999));
    } else {
      results.sort((a, b) => b.rating - a.rating);
    }

    return {
      outlets: results,
      searchCoords: targetCoords
    };
  }
};
