let products = [];

let editIndex = null;



async function loadProducts(){


let saved =
localStorage.getItem(
"anak_proyek_products"
);



if(saved){

products =
JSON.parse(saved);

}

else{


const response =
await fetch(
"../data/products.json"
);


products =
await response.json();


}



displayProducts();


}



function saveProduct(){


const product={


id:
Date.now(),


name:
document.getElementById("name").value,


category:
document.getElementById("category").value,


image:
document.getElementById("image").value,


price:
document.getElementById("price").value,


link:
document.getElementById("link").value,


description:
document.getElementById("description").value


};



if(editIndex !== null){

products[editIndex]=product;

editIndex=null;

}

else{

products.push(product);

}



localStorage.setItem(

"anak_proyek_products",

JSON.stringify(products)

);



clearForm();

displayProducts();


}




function displayProducts(){


const box =
document.getElementById(
"product-list"
);



box.innerHTML="";



products.forEach(

(product,index)=>{


box.innerHTML += `


<div class="card">


<img src="../${product.image}">


<h3>
${product.name}
</h3>


<p>
${product.price}
</p>


<button onclick="editProduct(${index})">

Edit

</button>


<button 
class="delete"
onclick="deleteProduct(${index})">

Hapus

</button>


</div>


`;


}


);


}





function editProduct(index){


const p =
products[index];


document.getElementById("name").value=p.name;

document.getElementById("category").value=p.category;

document.getElementById("image").value=p.image;

document.getElementById("price").value=p.price;

document.getElementById("link").value=p.link;

document.getElementById("description").value=p.description;


editIndex=index;


}




function deleteProduct(index){


products.splice(
index,
1
);


localStorage.setItem(

"anak_proyek_products",

JSON.stringify(products)

);


displayProducts();


}





function clearForm(){


document
.querySelectorAll(
"input,textarea"
)
.forEach(
e=>e.value=""
);


}




function exportJSON(){


const blob =
new Blob(

[
JSON.stringify(
products,
null,
2
)
],

{
type:
"application/json"
}

);



const url =
URL.createObjectURL(blob);



const a =
document.createElement("a");


a.href=url;


a.download=
"products.json";


a.click();


}



loadProducts();