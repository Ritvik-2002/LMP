import { useState, useRef, useEffect } from 'react';
import { Upload, Mic, MicOff, Image, X, Loader2, CheckCircle, Volume2, Trash2, Package, Eye, Download, FileJson, RefreshCw } from 'lucide-react';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { loadUploadedProducts, addOrUpdateProduct, deleteProduct, exportProductsToJSON, importProductsFromJSON, getProductStats } from '../utils/productStorage';
import './ProductUpload.css';

const ProductUpload = () => {
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [description, setDescription] = useState('');
  const [uploadedProducts, setUploadedProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stats, setStats] = useState(null);
  const fileInputRef = useRef(null);
  const jsonImportRef = useRef(null);
  
  const {
    isRecording,
    transcript,
    isSupported,
    startRecording,
    stopRecording,
    clearTranscript,
  } = useVoiceRecorder();

  useEffect(() => {
    const products = loadUploadedProducts();
    setUploadedProducts(products);
    setStats(getProductStats());
  }, []);

  const refreshStats = () => {
    setStats(getProductStats());
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const appendTranscriptToDescription = () => {
    if (transcript) {
      setDescription((prev) => {
        const separator = prev && !prev.endsWith(' ') ? ' ' : '';
        return prev + separator + transcript;
      });
      clearTranscript();
    }
  };

  const categories = [
    'Smartphones',
    'Laptops',
    'Tablets',
    'Audio',
    'Smartwatches',
    'Gaming Consoles',
    'Smart Home',
    'Accessories',
    'TVs',
    'Cameras',
  ];

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    files.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} is too large. Max size is 10MB`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [...prev, { file, preview: reader.result, id: Date.now() + Math.random() }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!productName.trim()) {
      alert('Please enter product name');
      return;
    }
    if (!productPrice.trim()) {
      alert('Please enter product price');
      return;
    }
    if (!productCategory) {
      alert('Please select a category');
      return;
    }
    if (images.length === 0) {
      alert('Please upload at least one image');
      return;
    }

    setUploading(true);
    
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const newProduct = {
      id: Date.now(),
      name: productName,
      price: parseFloat(productPrice),
      category: productCategory,
      description: description,
      images: images.map(img => img.preview),
      status: 'active',
      uploadedAt: new Date().toISOString(),
    };
    
    const result = addOrUpdateProduct(newProduct);
    
    if (result.success) {
      setUploadedProducts(result.products);
      setUploadMessage(result.message);
      refreshStats();
    }
    
    setUploading(false);
    setUploadSuccess(true);
    
    setTimeout(() => {
      setProductName('');
      setProductPrice('');
      setProductCategory('');
      setImages([]);
      setDescription('');
      clearTranscript();
      setUploadSuccess(false);
      setUploadMessage('');
    }, 2000);
  };

  const handleDeleteProduct = (productId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this product?')) {
      const result = deleteProduct(productId);
      if (result.success) {
        setUploadedProducts(result.products);
        refreshStats();
      }
    }
  };

  const handleExportJSON = () => {
    exportProductsToJSON(uploadedProducts);
  };

  const handleImportClick = () => {
    jsonImportRef.current?.click();
  };

  const handleImportJSON = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const result = await importProductsFromJSON(file, true);
    if (result.success) {
      setUploadedProducts(result.products);
      refreshStats();
      alert(result.message);
    } else {
      alert('Import failed: ' + result.message);
    }
    e.target.value = '';
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      clearTranscript();
      startRecording();
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (hours < 1) return 'Just now';
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  return (
    <>
      <div className="section-card full-width">
        <div className="section-header">
          <h3 className="section-title">
            <Upload size={20} color="#12DAA8" />
            Upload New Product
          </h3>
          <div className="header-actions">
            {uploadedProducts.length > 0 && (
              <span className="product-count">{uploadedProducts.length} products uploaded</span>
            )}
          </div>
        </div>

        {uploadSuccess ? (
          <div className="upload-success">
            <CheckCircle size={48} color="#22c55e" />
            <h3>Product Uploaded Successfully!</h3>
            <p>{uploadMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="product-upload-form">
            <div className="form-group">
              <label className="form-label">
                Product Images <span className="required">*</span>
                <span className="form-hint">Upload up to 5 images (max 10MB each)</span>
              </label>
              
              <div className="image-upload-area">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                />
                
                {images.length > 0 && (
                  <div className="image-preview-grid">
                    {images.map((img, index) => (
                      <div key={img.id} className="image-preview-item">
                        <img src={img.preview} alt={`Preview ${index + 1}`} />
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={() => removeImage(img.id)}
                        >
                          <X size={16} />
                        </button>
                        {index === 0 && <span className="primary-badge">Primary</span>}
                      </div>
                    ))}
                    {images.length < 5 && (
                      <button
                        type="button"
                        className="add-more-images"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Image size={24} />
                        <span>Add More</span>
                      </button>
                    )}
                  </div>
                )}

                {images.length === 0 && (
                  <button
                    type="button"
                    className="image-upload-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Image size={32} color="#64748b" />
                    <span>Click to upload images</span>
                    <span className="upload-hint">or drag and drop</span>
                  </button>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Product Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Enter product name (e.g., iPhone 15 Pro)"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Price (₹) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  placeholder="Enter price in INR"
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Category <span className="required">*</span>
              </label>
              <select
                className="form-select"
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value)}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Volume2 size={16} style={{ marginRight: '6px' }} />
                Product Description
                <span className="form-hint">Type directly or use voice input below</span>
              </label>
              
              <textarea
                className="form-textarea"
                value={description}
                onChange={handleDescriptionChange}
                placeholder="Enter product description here... You can type directly or use the voice input feature below to speak your description."
                rows={5}
              />
              
              <div className={`voice-description-area ${isRecording ? 'recording' : ''}`}>
                <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '8px' }}>
                  <Mic size={14} style={{ marginRight: '6px' }} />
                  Voice Input
                </label>
                
                <textarea
                  className="form-textarea voice-transcript-preview"
                  value={transcript}
                  onChange={(e) => {}}
                  placeholder={isRecording ? 'Listening... Speak now' : 'Voice transcript will appear here. Click Start Voice Input to begin speaking.'}
                  rows={2}
                  readOnly
                />
                
                <div className="voice-controls">
                  <button
                    type="button"
                    className={`voice-record-btn ${isRecording ? 'recording' : ''}`}
                    onClick={toggleRecording}
                    disabled={!isSupported}
                  >
                    {isRecording ? (
                      <>
                        <MicOff size={20} />
                        <span>Stop Recording</span>
                      </>
                    ) : (
                      <>
                        <Mic size={20} />
                        <span>Start Voice Input</span>
                      </>
                    )}
                  </button>
                  
                  {transcript && (
                    <>
                      <button
                        type="button"
                        className="append-text-btn"
                        onClick={appendTranscriptToDescription}
                      >
                        <CheckCircle size={16} />
                        Add to Description
                      </button>
                      <button
                        type="button"
                        className="clear-text-btn"
                        onClick={clearTranscript}
                      >
                        <Trash2 size={16} />
                        Clear
                      </button>
                    </>
                  )}
                </div>

                {isRecording && (
                  <div className="recording-indicator">
                    <span className="recording-dot"></span>
                    Recording... Speak now
                  </div>
                )}

                {!isSupported && (
                  <div className="voice-error">
                    Voice input is not supported in your browser. Please use Chrome or Edge.
                  </div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="section-action secondary"
                onClick={() => {
                  setProductName('');
                  setProductPrice('');
                  setProductCategory('');
                  setImages([]);
                  setDescription('');
                  clearTranscript();
                }}
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="section-action"
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Upload Product
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {stats && (
        <div className="section-card full-width stats-card">
          <div className="section-header">
            <h3 className="section-title">
              <Package size={20} color="#12DAA8" />
              Storage Stats
            </h3>
            <div className="storage-actions">
              <button 
                className="storage-btn"
                onClick={handleExportJSON}
                title="Export to JSON"
              >
                <Download size={16} />
                Export JSON
              </button>
              <button 
                className="storage-btn"
                onClick={handleImportClick}
                title="Import from JSON"
              >
                <FileJson size={16} />
                Import JSON
              </button>
              <input
                type="file"
                ref={jsonImportRef}
                onChange={handleImportJSON}
                accept=".json"
                style={{ display: 'none' }}
              />
            </div>
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total Products</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.active}</span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.categories}</span>
              <span className="stat-label">Categories</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{formatPrice(stats.totalValue)}</span>
              <span className="stat-label">Total Value</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.lastUpdated}</span>
              <span className="stat-label">Last Updated</span>
            </div>
          </div>
        </div>
      )}

      {uploadedProducts.length > 0 && (
        <div className="section-card full-width">
          <div className="section-header">
            <h3 className="section-title">
              <Package size={20} color="#12DAA8" />
              Uploaded Products ({uploadedProducts.length})
            </h3>
            <button 
              className="refresh-btn"
              onClick={() => {
                const products = loadUploadedProducts();
                setUploadedProducts(products);
                refreshStats();
              }}
              title="Refresh from storage"
            >
              <RefreshCw size={16} />
            </button>
          </div>
          <div className="uploaded-products-list">
            {uploadedProducts.map((product) => (
              <div key={product.id} className="uploaded-product-item">
                <div className="product-main-info">
                  <div className="product-image-thumbnail">
                    <img src={product.images[0]} alt={product.name} />
                    {product.images.length > 1 && (
                      <span className="image-count">+{product.images.length - 1}</span>
                    )}
                  </div>
                  <div className="product-details">
                    <h4 className="product-name">{product.name}</h4>
                    <span className="product-category">{product.category}</span>
                    <span className="product-price">{formatPrice(product.price)}</span>
                    {product.description && (
                      <p className="product-description-preview">
                        {product.description.length > 100 
                          ? product.description.substring(0, 100) + '...' 
                          : product.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="product-meta">
                  <span className="status-badge active">Active</span>
                  <span className="upload-time">{formatTime(product.uploadedAt)}</span>
                  <button 
                    className="view-details-btn"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button 
                    className="delete-product-btn"
                    onClick={(e) => handleDeleteProduct(product.id, e)}
                    title="Delete product"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedProduct && (
        <div className="product-modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="product-modal" onClick={(e) => e.stopPropagation()}>
            <div className="product-modal-header">
              <h3>Product Details</h3>
              <button className="modal-close-btn" onClick={() => setSelectedProduct(null)}>
                <X size={24} />
              </button>
            </div>
            <div className="product-modal-content">
              <div className="product-images-gallery">
                {selectedProduct.images.map((img, idx) => (
                  <div key={idx} className="gallery-image">
                    <img src={img} alt={`${selectedProduct.name} ${idx + 1}`} />
                  </div>
                ))}
              </div>
              <div className="product-info-full">
                <h2>{selectedProduct.name}</h2>
                <span className="product-category-tag">{selectedProduct.category}</span>
                <span className="product-price-large">{formatPrice(selectedProduct.price)}</span>
                {selectedProduct.description && (
                  <div className="product-description-full">
                    <h4>Description</h4>
                    <p>{selectedProduct.description}</p>
                  </div>
                )}
                <div className="product-meta-info">
                  <span>Uploaded: {new Date(selectedProduct.uploadedAt).toLocaleString()}</span>
                  {selectedProduct.updatedAt && (
                    <span>Updated: {new Date(selectedProduct.updatedAt).toLocaleString()}</span>
                  )}
                  <span className="status-badge active">Active</span>
                </div>
                <button 
                  className="delete-product-btn-large"
                  onClick={(e) => {
                    handleDeleteProduct(selectedProduct.id, e);
                    setSelectedProduct(null);
                  }}
                >
                  <Trash2 size={18} />
                  Delete Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductUpload;