import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../axios';
import laptopImage from '../imagez/laptop.jpg';
import sofaImage from '../imagez/sofa.jpg';

const fetchProducts = async () => {
  const { data } = await api.get('/products');
  return data.products;
};

export default function Home() {
  const { data: products = [], isLoading, error, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  return (
    <main className="home-page">
      <header className="home-header">
        <Link className="home-brand" to="/home">etry<span>.</span></Link>
        <nav className="home-nav" aria-label="Main navigation">
          <a href="#products">Shop</a>
          <Link to="/login">Sign in</Link>
          <Link className="home-signup-link" to="/signup">Join Etry</Link>
        </nav>
      </header>

      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="home-kicker">Your Online market made for good finds</p>
          <h1>What<span>you’ll love.</span></h1>
          <p className="home-hero-description">
            Discover everyday favorites and unexpected finds from etry.
          </p>
          <a className="home-primary-link" href="#products">Explore products</a>
        </div>
        <div className="home-hero-visual">
          <div className="home-image-backdrop" />
          <img className="home-hero-sofa" src={sofaImage} alt="A comfortable sofa " />
          <img className="home-hero-laptop" src={laptopImage} alt="A laptop for work and everyday use" />
        </div>
      </section>

      <section className="home-products-section" id="products">
        <div className="home-section-heading">
          <div>
            <p className="home-kicker">A little something for everyone</p>
            <h2>Explore the etry</h2>
          </div>
          {!isLoading && !error && <p className="home-result-count">{products.length} finds</p>}
        </div>

        {isLoading && <p className="home-message">Loading products...</p>}
        {error && (
          <div className="home-message" role="alert">
            <p>We couldn’t load the products. Check your connection and try again.</p>
            <button className="home-primary-link" type="button" onClick={() => refetch()}>Try again</button>
          </div>
        )}
        {!isLoading && !error && products.length === 0 && (
          <p className="home-message">There are no products to show yet. Check back soon.</p>
        )}

        {!isLoading && !error && products.length > 0 && (
          <div className="home-product-grid">
            {products.map((product) => (
              <Link className="home-product-card" key={product._id} to={`/product/${product._id}`}>
                <div className="home-product-image">
                  {product.images?.[0]?.url
                    ? <img src={product.images[0].url} alt={product.name} loading="lazy" />
                    : <span>Image coming soon</span>}
                </div>
                <div className="home-product-details">
                  <p className="home-product-category">{product.category}</p>
                  <h3>{product.name}</h3>
                  <p className="home-product-price">RWF{Number(product.price).toLocaleString()}</p>
                  <span className="home-product-action">View details</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <footer className="home-footer">
        <Link className="home-brand" to="/home">etry<span>.</span></Link>
        <p>Yours Always.</p>
        <span>© {new Date().getFullYear()} Etry</span>
      </footer>
    </main>
  );
}
