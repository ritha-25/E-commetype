import { useMutation,useQueryClient
 } from "@tanstack/react-query";
 
 import api from '../axios'

 export default function AddcartButton({productId}){
    const queryClient = useQueryClient();

    const {mutate,isPending} = useMutation({
    mutationFn: async () =>{
        return await api.post('/cart/add',{productId,quantity: 1 });
    },
    onSuccess: () => {
        alert("item added");
        queryClient.invalidateQueries({queryKey: ['cart']});
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

