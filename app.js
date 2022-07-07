// const client = contentful.createClient({
// space: "a97gogyktvkg"
// accessToken: "iU0GJcNKIuctilTvdv4L_urMdjuCVc2ltEgw0kpn_bk"

// })




//variables

const btnCarro = document.querySelector(".cart-btn");
const btnCerrarCarro = document.querySelector(".close-cart");
const btnVaciarCarro = document.querySelector(".clear-cart");
const carroDOM = document.querySelector(".cart");
const productosDOM = document.querySelector(".products-center");
const overlayCarro = document.querySelector(".cart-overlay");
const itemsCarro = document.querySelector(".cart-items");
const totalCarro = document.querySelector(".cart-total");
const contenidoCarro = document.querySelector(".cart-content");

//carrito
let carrito = [];

//botones
let botonesDOM = [];

//clase para obtener los productos y desestructurar el json
class Productos {
  async getProducts() {
    try {
      let result = await fetch("products.json");
      let data = await result.json();
      let products = data.items;
      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

//clase para mostrar los productos
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach((product) => {
      result += `<article class="product">
                <div class="img-container">
                    <img src=${product.image} alt="producto" class="product-img">
                    <button class="bag-btn" data-id=${product.id}>
                        <i class="fas fa-shopping-cart"></i>
                        agregar al carrito
                    </button> 
                </div>
                <h3>${product.title}</h3>
                <h4>$ ${product.price}</h4>
                </article>    
                `;
    });
    productosDOM.innerHTML = result;
  }

  botonesCarrito() {
    const botones = [...document.querySelectorAll(".bag-btn")];
    botonesDOM = botones;
    botones.forEach((button) => {
      let id = button.dataset.id;
      let enCarrito = carrito.find((item) => item.id === id);
      if (enCarrito) {
        button.innerText = "Ya Agregado";
        button.disabled = true;
      }
      button.addEventListener("click", (event) => {
        event.target.innerText = "Ya Agregado";
        event.target.disabled = true;
        // buscar el producto del localstorage
        let itemCarrito = { ...Almacenar.buscarProducto(id), cantidad: 1 };

        // agregar el producto al carrito
        carrito = [...carrito, itemCarrito];

        // actualizar el localstorage de carrito
        Almacenar.guardarCarrito(carrito);

        // calcular totales carrito
        this.actualizarValorCarro(carrito);

        // mostrar los items de carrito
        this.agregarItemCarro(itemCarrito);

        // activar solapa carrito
        this.solapaCarro();
      });
    });
  }
  actualizarValorCarro(carrito) {
    let totalTemp = 0;
    let totalItems = 0;
    carrito.map((item) => {
      totalTemp += item.price * item.cantidad;
      totalItems += item.cantidad;
    });
    totalCarro.innerText = parseFloat(totalTemp.toFixed(2));
    itemsCarro.innerText = totalItems;
  }

  agregarItemCarro(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `<img src=${item.image} alt="product">
                    <div>
                        <h4>${item.title}</h4>
                        <h5>$ ${item.price}</h5>
                        <span class="remove-item" data-id=${item.id}>Quitar</span>
                    </div>
                    <div>
                        <i class="fas fa-chevron-up" data-id=${item.id}></i>
                        <p class="item-amount"> ${item.cantidad} </p>
                        <i class="fas fa-chevron-down" data-id=${item.id}></i>
                    </div>`;

    contenidoCarro.appendChild(div);
  }

  solapaCarro() {
    overlayCarro.classList.add("transparentBcg");
    carroDOM.classList.add("showCart");
  }

  prepararAPP() {
    carrito = Almacenar.recuperarCarrito();
    this.actualizarValorCarro(carrito);
    this.poblarCarro(carrito);
    btnCarro.addEventListener("click", this.solapaCarro);
    btnCerrarCarro.addEventListener("click", this.ocultarCarro);
  }

  poblarCarro(carrito) {
    carrito.forEach((item) => this.agregarItemCarro(item));
  }

  ocultarCarro() {
    overlayCarro.classList.remove("transparentBcg");
    carroDOM.classList.remove("showCart");
  }

  logicaCarro(){
    //borrar todos items de carro
    btnVaciarCarro.addEventListener("click", ()=>{
        this.borrarCarro()
    })
    // funcionalidad de sumar y borrar de 1 item
    contenidoCarro.addEventListener("click", event =>{
        if(event.target.classList.contains("remove-item")){
            let quitarProd = event.target;
            let id = quitarProd.dataset.id;
            contenidoCarro.removeChild
            (quitarProd.parentElement.parentElement)
            this.quitarProducto(id)
        }
        //sumar cantidad item en carro
        else if(event.target.classList.contains("fa-chevron-up")){
            let sumarUnidad = event.target;
            let id = sumarUnidad.dataset.id
            let tempItem= carrito.find(item => item.id === id);
            tempItem.cantidad = tempItem.cantidad + 1;
            Almacenar.guardarCarrito(carrito)
            this.actualizarValorCarro(carrito)
            sumarUnidad.nextElementSibling.innerText = tempItem.cantidad
        }
        // restar cantidad item en carro
        else if(event.target.classList.contains("fa-chevron-down")){
            let restarUnidad = event.target;
            let id = restarUnidad.dataset.id;
            let tempItem= carrito.find(item => item.id === id);
            tempItem.cantidad = tempItem.cantidad -1
            if(tempItem.cantidad>0){
                Almacenar.guardarCarrito(carrito)
                this.actualizarValorCarro(carrito)
                restarUnidad.previousElementSibling.innerText = tempItem.cantidad;

            }
            else{
                contenidoCarro.removeChild(restarUnidad.parentElement.parentElement)
                this.quitarProducto(id)
            }
        } 

        })
    }

  

  borrarCarro(){
    let itemsCarro = carrito.map(item => item.id);
    itemsCarro.forEach(id => this.quitarProducto(id));
    console.log(contenidoCarro)

    while(contenidoCarro.children.length>0){
        contenidoCarro.removeChild(contenidoCarro.children[0])
    }
    this.ocultarCarro()
  }

  quitarProducto(id){
    carrito = carrito.filter(item => item.id !== id);
    this.actualizarValorCarro(carrito);
    Almacenar.guardarCarrito(carrito);
    let boton = this.botonIndividual(id)
    boton.disabled = false;
    boton.innerHTML = `<i class"fas fa-shopping-cart"></i> agregar al carrito`;
  }

  botonIndividual(id){
    return botonesDOM.find(boton => boton.dataset.id === id)
  }

}

//local storage
class Almacenar {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static buscarProducto(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }
  static guardarCarrito(carrito) {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }
  static recuperarCarrito() {
    return localStorage.getItem("carrito")
      ? JSON.parse(localStorage.getItem("carrito"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const productos = new Productos();
  // preparar api
  ui.prepararAPP();

  // requerir todos los productos
  productos
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Almacenar.saveProducts(products);
    })
    .then(() => {
      ui.botonesCarrito();
      ui.logicaCarro()
    });
});
