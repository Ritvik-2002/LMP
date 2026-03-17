// Product Storage Utility
// Handles saving, loading, and merging products using localStorage and JSON export

const STORAGE_KEY = 'merchant_uploaded_products';

/**
 * Load all uploaded products from localStorage
 * @returns {Array} Array of uploaded products
 */
export const loadUploadedProducts = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return data.uploadedProducts || [];
    }
  } catch (error) {
    console.error('Error loading products from localStorage:', error);
  }
  return [];
};

/**
 * Save uploaded products to localStorage
 * @param {Array} products - Array of products to save
 */
export const saveUploadedProducts = (products) => {
  try {
    const data = {
      uploadedProducts: products,
      lastUpdated: new Date().toISOString(),
      version: '1.0'
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving products to localStorage:', error);
    return false;
  }
};

/**
 * Add a new product or update existing one
 * Merge logic: If product with same name exists, update it. Otherwise add new.
 * @param {Object} newProduct - Product to add or update
 * @returns {Object} { success: boolean, message: string, products: Array }
 */
export const addOrUpdateProduct = (newProduct) => {
  try {
    const existingProducts = loadUploadedProducts();
    
    // Check if product with same name exists (case-insensitive)
    const existingIndex = existingProducts.findIndex(
      p => p.name.toLowerCase().trim() === newProduct.name.toLowerCase().trim()
    );
    
    let updatedProducts;
    let message;
    
    if (existingIndex >= 0) {
      // Update existing product
      updatedProducts = [...existingProducts];
      updatedProducts[existingIndex] = {
        ...updatedProducts[existingIndex],
        ...newProduct,
        id: updatedProducts[existingIndex].id, // Keep original ID
        updatedAt: new Date().toISOString(),
      };
      message = `Updated existing product: ${newProduct.name}`;
    } else {
      // Add new product
      updatedProducts = [newProduct, ...existingProducts];
      message = `Added new product: ${newProduct.name}`;
    }
    
    const success = saveUploadedProducts(updatedProducts);
    return { success, message, products: updatedProducts };
  } catch (error) {
    console.error('Error adding/updating product:', error);
    return { success: false, message: error.message, products: [] };
  }
};

/**
 * Delete a product by ID
 * @param {number} productId - ID of product to delete
 * @returns {Object} { success: boolean, products: Array }
 */
export const deleteProduct = (productId) => {
  try {
    const existingProducts = loadUploadedProducts();
    const updatedProducts = existingProducts.filter(p => p.id !== productId);
    const success = saveUploadedProducts(updatedProducts);
    return { success, products: updatedProducts };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { success: false, products: [] };
  }
};

/**
 * Export products to JSON file for download
 * @param {Array} products - Products to export (optional, defaults to all uploaded)
 */
export const exportProductsToJSON = (products = null) => {
  const productsToExport = products || loadUploadedProducts();
  const data = {
    uploadedProducts: productsToExport,
    exportedAt: new Date().toISOString(),
    version: '1.0'
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `products_export_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Import products from JSON file
 * @param {File} file - JSON file to import
 * @param {boolean} merge - If true, merge with existing. If false, replace all.
 * @returns {Promise<Object>} { success: boolean, message: string, products: Array }
 */
export const importProductsFromJSON = (file, merge = true) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        const importedProducts = data.uploadedProducts || [];
        
        if (!Array.isArray(importedProducts)) {
          throw new Error('Invalid JSON format: uploadedProducts must be an array');
        }
        
        let finalProducts;
        let message;
        
        if (merge) {
          // Merge with existing - update duplicates, add new ones
          const existingProducts = loadUploadedProducts();
          const existingMap = new Map(
            existingProducts.map(p => [p.name.toLowerCase().trim(), p])
          );
          
          let addedCount = 0;
          let updatedCount = 0;
          
          importedProducts.forEach(imported => {
            const key = imported.name.toLowerCase().trim();
            if (existingMap.has(key)) {
              // Update existing
              const existing = existingMap.get(key);
              existingMap.set(key, {
                ...existing,
                ...imported,
                id: existing.id,
                updatedAt: new Date().toISOString(),
              });
              updatedCount++;
            } else {
              // Add new
              existingMap.set(key, {
                ...imported,
                id: Date.now() + Math.random(),
                uploadedAt: new Date().toISOString(),
              });
              addedCount++;
            }
          });
          
          finalProducts = Array.from(existingMap.values());
          message = `Import complete: ${addedCount} added, ${updatedCount} updated`;
        } else {
          // Replace all
          finalProducts = importedProducts.map(p => ({
            ...p,
            id: p.id || Date.now() + Math.random(),
            uploadedAt: p.uploadedAt || new Date().toISOString(),
          }));
          message = `Import complete: ${finalProducts.length} products loaded`;
        }
        
        const success = saveUploadedProducts(finalProducts);
        resolve({ success, message, products: finalProducts });
      } catch (error) {
        console.error('Error importing products:', error);
        resolve({ success: false, message: error.message, products: [] });
      }
    };
    
    reader.onerror = () => {
      resolve({ success: false, message: 'Failed to read file', products: [] });
    };
    
    reader.readAsText(file);
  });
};

/**
 * Clear all uploaded products
 */
export const clearAllProducts = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing products:', error);
    return false;
  }
};

/**
 * Get combined inventory (existing catalogue + uploaded products)
 * @param {Array} existingCatalogue - The existing product catalogue
 * @returns {Array} Combined array of all products
 */
export const getCombinedInventory = (existingCatalogue = []) => {
  const uploadedProducts = loadUploadedProducts();
  
  // Convert catalogue format to match uploaded product format
  const formattedCatalogue = existingCatalogue.map(product => ({
    id: product.id || product.device_code,
    name: `${product.brand} ${product.model}`,
    price: product.price,
    category: product.category || 'Smartphones',
    description: product.highlights?.join(', ') || '',
    images: [], // Catalogue products don't have images in the same format
    status: product.stock > 0 ? 'active' : 'out-of-stock',
    stock: product.stock || 0,
    isFromCatalogue: true,
    brand: product.brand,
    model: product.model,
    originalData: product,
  }));
  
  return [...uploadedProducts, ...formattedCatalogue];
};

/**
 * Search products by name or category
 * @param {string} query - Search query
 * @returns {Array} Filtered products
 */
export const searchProducts = (query) => {
  const products = loadUploadedProducts();
  const lowerQuery = query.toLowerCase();
  return products.filter(p => 
    p.name.toLowerCase().includes(lowerQuery) ||
    p.category.toLowerCase().includes(lowerQuery) ||
    (p.description && p.description.toLowerCase().includes(lowerQuery))
  );
};

/**
 * Get product statistics
 * @returns {Object} Statistics object
 */
export const getProductStats = () => {
  const products = loadUploadedProducts();
  const total = products.length;
  const active = products.filter(p => p.status === 'active').length;
  const inactive = products.filter(p => p.status === 'inactive').length;
  const categories = [...new Set(products.map(p => p.category))];
  const totalValue = products.reduce((sum, p) => sum + (p.price || 0), 0);
  
  return {
    total,
    active,
    inactive,
    categories: categories.length,
    totalValue,
    lastUpdated: total > 0 ? 
      new Date(Math.max(...products.map(p => new Date(p.uploadedAt || 0)))).toLocaleString() : 
      'Never'
  };
};