import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import api from '../axios'; 
import AddcartButton from './Addcart'; 

const fetchProductById = async (id) => {
  const { data } = await api.get(`/products/${id}`);
  return data.product || data; 
};

export default function ProductPag() {
  const { id } = useParams();
  const queryClient = useQueryClient();


  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id),
  });
  const addToCartMut= useMutation({
    mutationFn: async() =>{
      return await api.post('/cart/add',{productId: id,quantity:1});
        },
    onSuccess: () => {
      alert("Added to cart successfully!");
      queryClient.invalidateQueries({ queryKey: ['cart'] }); 
    },
    onError: () => {
      alert("Failed to add item to cart. Please try again.");
    
    }
  });

  if (isLoading) 
    return 
    <div className="Loading">Loading item details...</div>;
  if (error) 
    return <div className="error">Item could not be loaded.</div>;

  if (!product)
     return <div className="product">Product data is missing.</div>;
  const placeholderImage="imagez/laptop.jpg";
  const displayImage=product.image || placeholderImage;

  return (
    <div className ="product-details" >
      <div className="image-title">
      <h1>Products</h1>
      <img 
       src={displayImage}
       alt={product.title}/>
       <h3>{product.title}</h3>
       <h2> {product.description}</h2>
       <p><span> {product.category}</span></p>
       <p><span> {product.price}RWF</span></p>
      </div>
      <div className="buttons-box">
        <label htmlFor='quantity'>quantity</label>
        <input type="text" placeholder='quantity to buy'/>
        <button type="button"> Add to cart</button>
        <button type="button"> Buy it now</button>
        <button type="button"> Add to watchlist</button>
      </div>

    </div>
  );
}