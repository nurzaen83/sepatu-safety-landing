let products = [];

let editIndex = null;
let pendingImageUrl = "";

function getImageSrc(image) {

if (!image) {

return "";

}

if (image.startsWith("data:") || image.startsWith("http") || image.startsWith("/")) {

return image;

}

return `../${image}`;

}

function getServerBaseUrl() {
  const host = window.location.hostname || "localhost";
  return `http://${host}:3000`;
}

async function uploadImage(file) {
  if (!file) {
    return "";
  }

const formData = new FormData();

formData.append("image", file);

try {

const response = await fetch(`${getServerBaseUrl()}/upload`, {

method: "POST",

body: formData

});

const data = await response.json();

return data.url || "";

} catch (error) {

console.error("Upload gagal", error);

return "";

}

}

async function saveProductsToServer() {
  const response = await fetch(`${getServerBaseUrl()}/save-products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(products)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Gagal menyimpan produk ke server (${response.status})`);
  }
}

async function loadProducts(){


try {

const response = await fetch(`${getServerBaseUrl()}/products.json`);

if (!response.ok) {

throw new Error("Produk tidak dapat dimuat.");

}

products = await response.json();

} catch (error) {

const saved = localStorage.getItem("anak_proyek_products");

if (saved) {

products = JSON.parse(saved);

} else {

console.error("Gagal memuat products.json:", error);

products = [];

}

}


displayProducts();


}



async function saveProduct(){


const imageInput = document.getElementById("image");

let imageValue = pendingImageUrl || imageInput.dataset.currentValue || "";

if (imageInput.files && imageInput.files[0] && !pendingImageUrl) {

imageValue = await uploadImage(imageInput.files[0]);
pendingImageUrl = imageValue;

}

const product={


id:
editIndex !== null ? products[editIndex].id : Date.now(),


name:
document.getElementById("name").value,


category:
document.getElementById("category").value,


image:imageValue,


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

  try {
    await saveProductsToServer();
    localStorage.setItem(
      "anak_proyek_products",
      JSON.stringify(products)
    );
  } catch (error) {
    console.error("Gagal menyimpan ke server:", error);
    localStorage.setItem(
      "anak_proyek_products",
      JSON.stringify(products)
    );
  }


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


<img src="${getImageSrc(product.image)}">


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





window.attachImageAutoUpload = function attachImageAutoUpload() {

const imageInput = document.getElementById("image");

imageInput.addEventListener("change", async () => {

if (!imageInput.files || !imageInput.files[0]) return;

const file = imageInput.files[0];

const preview = document.getElementById("image-preview");

if (preview) {

preview.src = URL.createObjectURL(file);
preview.style.display = "block";

}

const uploadStatus = document.createElement("p");
uploadStatus.textContent = "Mengunggah foto...";
uploadStatus.id = "upload-status";
imageInput.parentNode.insertBefore(uploadStatus, imageInput.nextSibling);

const uploadedUrl = await uploadImage(file);
pendingImageUrl = uploadedUrl;

const statusEl = document.getElementById("upload-status");
if (statusEl) {

statusEl.textContent = uploadedUrl ? "Foto berhasil diunggah" : "Upload gagal";

}

});

}

function editProduct(index){


const p =
products[index];


document.getElementById("name").value=p.name;

document.getElementById("category").value=p.category;

const imageInput = document.getElementById("image");
imageInput.dataset.currentValue = p.image || "";
imageInput.value = "";

const preview = document.getElementById("image-preview");
if (preview) {

preview.src = p.image ? getImageSrc(p.image) : "";
preview.style.display = p.image ? "block" : "none";

}

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

const imageInput = document.getElementById("image");
const preview = document.getElementById("image-preview");


document
.querySelectorAll(
"input,textarea"
)
.forEach(
e=>e.value=""
);

imageInput.value = "";
pendingImageUrl = "";
imageInput.dataset.currentValue = "";

if (preview) {

preview.src = "";
preview.style.display = "none";

}

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
