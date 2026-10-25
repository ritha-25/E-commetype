import {useQuery,useMutation,useQueryClient} from '@tanstack/react-query';
import api from '../axios';

export default function CartPage(){
    const queryClient = useQueryClient();

    const {data: cartData,isLoading,error } = useQuery({
        query:['cart'],
        queryFn: async () => {
            const result = await api.get('/cart');
            return result.data;

        }

    });
    const deletemutation = useMutation({
        mutationFn: async (productId) => {
            return await api.delete('/cart/remove/${productId}');

        },
        onSuccess : () =>{
            queryClient.invalidateQueries({
                queryKey:['cart']});
            }
            });

            if(isLoading)
                return 
                <div> loading  cart items.</div>;
                if(error) return <div>cant get cart items.</div>;

                const items = cartData?.items || [];
                const priceTotla= items.reduce((sum,item) => sum + (item.price * item.quantity),0)

                return (
                    <div className='page-cart'>
                        <h2>Cart</h2>

                        {items.length===0 ?(
                            <p>the cart is empty ,add products</p>
                        ) : (<div className ='cart-layout'>
                            <div className="cart-list">
                            {items.map((item) => (
              <div key={item.productId} className="item-row">
                <h4>{item.title}</h4>
                <p>Qty: {item.quantity}</p>
                <p>{item.price} RWF</p>
                <button type="button" onClick={() => deletemutation.mutate(item.productId)}>
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary-box">
            <h3>Order Summary</h3>
            <p>Total: <strong>{priceTotla} RWF</strong></p>
            <button type="button" className="checkout-btn">
              Go to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}