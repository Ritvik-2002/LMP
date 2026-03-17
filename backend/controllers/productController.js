const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, '../data/products.json');

function readProductsFile() {
  try {
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading products file:', error);
    return { uploadedProducts: [], lastUpdated: new Date().toISOString(), version: '1.0' };
  }
}

function writeProductsFile(data) {
  try {
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing products file:', error);
    return false;
  }
}

exports.getAllProducts = (req, res) => {
  const data = readProductsFile();
  res.json({
    success: true,
    products: data.uploadedProducts,
    lastUpdated: data.lastUpdated,
    total: data.uploadedProducts.length
  });
};

exports.getProductById = (req, res) => {
  const { id } = req.params;
  const data = readProductsFile();
  const product = data.uploadedProducts.find(p => p.id === parseInt(id) || p.id === id);
  
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  
  res.json({ success: true, product });
};

exports.addProduct = (req, res) => {
  const { name, price, category, description, images, stock = 0 } = req.body;
  
  if (!name || !price || !category) {
    return res.status(400).json({ 
      success: false, 
      message: 'Name, price, and category are required' 
    });
  }
  
  const data = readProductsFile();
  
  const existingIndex = data.uploadedProducts.findIndex(
    p => p.name.toLowerCase().trim() === name.toLowerCase().trim()
  );
  
  const productData = {
    id: Date.now(),
    name,
    price: parseFloat(price),
    category,
    description: description || '',
    images: images || [],
    stock: parseInt(stock) || 0,
    status: 'active',
    uploadedAt: new Date().toISOString()
  };
  
  let message;
  if (existingIndex >= 0) {
    productData.id = data.uploadedProducts[existingIndex].id;
    productData.updatedAt = new Date().toISOString();
    data.uploadedProducts[existingIndex] = productData;
    message = `Updated existing product: ${name}`;
  } else {
    data.uploadedProducts.unshift(productData);
    message = `Added new product: ${name}`;
  }
  
  if (writeProductsFile(data)) {
    res.json({
      success: true,
      message,
      product: productData,
      total: data.uploadedProducts.length
    });
  } else {
    res.status(500).json({ success: false, message: 'Failed to save product' });
  }
};

exports.updateProduct = (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const data = readProductsFile();
  const index = data.uploadedProducts.findIndex(p => p.id === parseInt(id) || p.id === id);
  
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  
  data.uploadedProducts[index] = {
    ...data.uploadedProducts[index],
    ...updates,
    id: data.uploadedProducts[index].id,
    updatedAt: new Date().toISOString()
  };
  
  if (writeProductsFile(data)) {
    res.json({
      success: true,
      message: 'Product updated successfully',
      product: data.uploadedProducts[index]
    });
  } else {
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
};

exports.deleteProduct = (req, res) => {
  const { id } = req.params;
  
  const data = readProductsFile();
  const initialLength = data.uploadedProducts.length;
  data.uploadedProducts = data.uploadedProducts.filter(
    p => p.id !== parseInt(id) && p.id !== id
  );
  
  if (data.uploadedProducts.length === initialLength) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  
  if (writeProductsFile(data)) {
    res.json({
      success: true,
      message: 'Product deleted successfully',
      total: data.uploadedProducts.length
    });
  } else {
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
};

exports.importProducts = (req, res) => {
  const { products, merge = true } = req.body;
  
  if (!Array.isArray(products)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Products must be an array' 
    });
  }
  
  const data = readProductsFile();
  let addedCount = 0;
  let updatedCount = 0;
  
  if (merge) {
    const existingMap = new Map(
      data.uploadedProducts.map(p => [p.name.toLowerCase().trim(), p])
    );
    
    products.forEach(imported => {
      const key = imported.name.toLowerCase().trim();
      const productData = {
        ...imported,
        id: existingMap.has(key) ? existingMap.get(key).id : (Date.now() + Math.random()),
        uploadedAt: imported.uploadedAt || new Date().toISOString()
      };
      
      if (existingMap.has(key)) {
        productData.updatedAt = new Date().toISOString();
        existingMap.set(key, productData);
        updatedCount++;
      } else {
        existingMap.set(key, productData);
        addedCount++;
      }
    });
    
    data.uploadedProducts = Array.from(existingMap.values());
  } else {
    data.uploadedProducts = products.map(p => ({
      ...p,
      id: p.id || Date.now() + Math.random(),
      uploadedAt: p.uploadedAt || new Date().toISOString()
    }));
    addedCount = data.uploadedProducts.length;
  }
  
  if (writeProductsFile(data)) {
    res.json({
      success: true,
      message: `Import complete: ${addedCount} added, ${updatedCount} updated`,
      total: data.uploadedProducts.length
    });
  } else {
    res.status(500).json({ success: false, message: 'Failed to import products' });
  }
};

exports.exportProducts = (req, res) => {
  const data = readProductsFile();
  res.json({
    success: true,
    exportedAt: new Date().toISOString(),
    version: '1.0',
    uploadedProducts: data.uploadedProducts
  });
};

exports.getStats = (req, res) => {
  const data = readProductsFile();
  const products = data.uploadedProducts;
  
  const total = products.length;
  const active = products.filter(p => p.status === 'active').length;
  const inactive = products.filter(p => p.status === 'inactive').length;
  const categories = [...new Set(products.map(p => p.category))];
  const totalValue = products.reduce((sum, p) => sum + (p.price || 0), 0);
  
  res.json({
    success: true,
    stats: {
      total,
      active,
      inactive,
      categories: categories.length,
      totalValue,
      lastUpdated: data.lastUpdated
    }
  });
};

exports.clearAll = (req, res) => {
  const data = { uploadedProducts: [], lastUpdated: new Date().toISOString(), version: '1.0' };
  
  if (writeProductsFile(data)) {
    res.json({ success: true, message: 'All products cleared' });
  } else {
    res.status(500).json({ success: false, message: 'Failed to clear products' });
  }
};