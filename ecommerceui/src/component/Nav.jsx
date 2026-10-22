export default function Navbar({ page, bagCount }) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <a className="navbar-brand" href="#home">Ecommerce</a>
        <nav>
          <a className={page === 'home' ? 'active' : ''} href="#home">Home</a>
          <a className={page === 'products' ? 'active' : ''} href="#products">Products</a>
        </nav>
        <a className="navbar-cart" href="#products">Cart ({bagCount})</a>
      </div>
    </header>
  )
}