import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import api from '../axios'; 

const fetchProductById = async (id) => {
  const { data } = await api.get(`/products/${id}`);
  return data.product || data; 
};

export default function ProductPag() {
  const { id } = useParams();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id),
    enabled: !!id,
  });

  if (isLoading) return <div className="text-center py-20 text-xl font-semibold">Loading item details...</div>;
  if (error) return <div className="text-center py-20 text-red-500">Item could not be loaded.</div>;

  if (!product) return <div className="text-center py-20">Product data is missing.</div>;

  return (
    <div className="bg-white min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <div className="flex justify-center items-center bg-gray-50 rounded-2xl border border-gray-100 p-6">
          <img 
            src={product.image } 
            alt={product.title} 
            className="max-h-[450px] object-contain rounded-lg mix-blend-multiply"
          />
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <nav className="text-sm text-gray-500 mb-2">Marketplace &gt; {product.category}</nav>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{product.title}</h1>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <span className="text-sm text-gray-500 block">Price:</span>
              <span className="text-3xl font-extrabold text-gray-900">\RWF{product.price}</span>
              <span className="text-green-600 block text-xs font-semibold mt-1"> In Stock / Ready to buy</span>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900">Description</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{product.description || 'No description available.'}</p>
            </div>
          </div>

          
          <div className="mt-8 space-y-3">
            <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition-colors">
              Buy It Now
            </button>
            <button className="w-full py-3 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-xl transition-colors">
              Add to Cart
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
