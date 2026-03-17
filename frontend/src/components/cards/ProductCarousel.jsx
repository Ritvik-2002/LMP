import ProductCard from './ProductCard';

const ProductCarousel = ({ products, onProductTap }) => (
  <div className="rich-carousel">
    <div className="rich-carousel-track">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onTap={onProductTap} />
      ))}
    </div>
  </div>
);

export default ProductCarousel;
