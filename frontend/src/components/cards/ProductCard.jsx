const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(price);

const ProductCard = ({ product, onTap }) => {
  const discount = product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  return (
    <div className="rich-product-card" onClick={() => onTap?.(product)}>
      <div className="rpc-image" style={{ background: 'linear-gradient(135deg, #f0f0f0, #e0e0e0)' }}>
        <span className="rpc-brand">{product.brand}</span>
      </div>
      <div className="rpc-body">
        <h4 className="rpc-name">{product.brand} {product.model}</h4>
        <div className="rpc-pricing">
          <span className="rpc-price">{formatPrice(product.price)}</span>
          {product.mrp > product.price && (
            <>
              <span className="rpc-mrp">{formatPrice(product.mrp)}</span>
              <span className="rpc-discount">{discount}% off</span>
            </>
          )}
        </div>
        <div className="rpc-highlights">
          {(product.highlights || []).slice(0, 3).map((h, i) => (
            <span key={i} className="rpc-highlight-tag">{h}</span>
          ))}
        </div>
        <div className="rpc-colors">
          {(product.colors || []).slice(0, 4).map((c, i) => (
            <span key={i} className="rpc-color-dot" title={c}></span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
