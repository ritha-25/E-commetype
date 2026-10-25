import { useMutation,useQueryClient
 } from "@tanstack/react-query";
 
 import api from '../axios'
 import { useNavigate } from "react-router-dom";

 export default function AddcartButton({productId}){
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const {mutate,isPending} = useMutation({
    mutationFn: async () =>{
        return await api.post('/cart/add',{productId,quantity: 1 });
    },
    onSuccess: () => {
        alert("item added");
        queryClient.invalidateQueries({queryKey: ['cart']});
         navigate('/cart'); 
    },
    onError: ()=>{
        alert("could not add iteme");
    
         
    }
} );
return (<button onClick={()=> mutate()

}
disabled={isPending}
>
   {isPending ? "Adding..." : "Add to cart"}
    
</button>
);
}

