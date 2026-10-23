import {useQuery} from '@tanstack/react-query';
import {Link} from 'react-router-dom';
import api from '../axios';

const fetchProducts = async() =>{
  const {data} = await api.get('/products');
  return data.products;
};

export default function homeP(){
  const {data: products,isLoading,error}= useQuery({queryKey:['products'],queryFn:fetchProducts,});

  if(isLoading) return 
  <div className="text-center font-semibold">Loading products</div>;
  if(error) return <div className ="text-center text-red-500">Error loading</div>;

  return (
    <div className="bg-orange-50 min-h-screen">
      <div className="bg-chocolate-600 text-white text-center shadow-md mb-8">
        <h1 className="font-bold ">Explore your wish</h1>
        <p className="text-blue-100">Electronics,Furniture ,and fast ordering.</p>
      </div>

      <div className="mx-auto px-4 ">
        <h2 className="text-bold text-navy-100 "> Trending Items</h2>
       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products?.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
              <img 
                src={product.image} 
                alt={product.title} 
                className="w-full h-48 object-cover bg-gray-100"
              />
              <div className="p-4">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">{product.category}</span>
                <h3 className="text-sm font-medium text-gray-900 mt-1 line-clamp-2 h-10">{product.title}</h3>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-lg font-bold text-gray-900">\${product.price}</span>
                  <Link 
                    to={`/product/${product.id}`} 
                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors">
                    View Item
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
