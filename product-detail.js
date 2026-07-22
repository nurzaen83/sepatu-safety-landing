document.addEventListener(
"DOMContentLoaded",
()=>{


const container =
document.getElementById(
"detail-container"
);



const params =
new URLSearchParams(
window.location.search
);


const productId =
params.get(
"id"
);



async function loadDetail(){


const response =
await fetch(
"products.json"
);



const products =
await response.json();



const product =
products.find(
item =>
item.id == productId
);



if(!product){

container.innerHTML =
`
<h2>
Produk tidak ditemukan
</h2>
`;

return;

}



container.innerHTML =

`

<div class="product-card">


<img 
src="${product.image}"
alt="${product.name}"
>



<div class="product-content">


<h1>
${product.name}
</h1>


<p>
${product.description}
</p>


<h2 class="price">

${product.price}

</h2>



<a 
class="btn-primary"
href="${product.link}"
target="_blank">

🛒 Beli di Shopee

</a>


<br><br>


<a 
class="btn-primary"
href="https://wa.me/6285710867483?text=Halo%20ANAK-PROYEK,%20saya%20tertarik%20${product.name}">

💬 Tanya WhatsApp

</a>


</div>


</div>

`;



}



loadDetail();



});