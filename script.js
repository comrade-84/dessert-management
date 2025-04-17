const itemContainer = document.querySelector('.left');
const cartFirst = document.querySelector('.first');
const cartContainer = document.querySelector('.right');
const totalCart = document.querySelector('.carttotal');

let dataArray = [];
let cart = [];

async function getData() {
    try {
        const response = await fetch('/data.json');
        if (!response.ok) throw new Error('Failed to fetch data');
        dataArray = await response.json();
        console.log('Fetched data:', dataArray);

        dataArray.forEach(data => {
            const cardItem = document.createElement('div');
            cardItem.classList.add('card');
            cardItem.innerHTML = `
                <img class="product-img" src="${data.image.desktop}" alt="${data.name}">
                <button class="addbtn"><img src="/assets/images/icon-add-to-cart.svg" alt="Add to cart"> Add to Cart</button>
                <button class="hoverbtn hidden">
                    <span class="decre"><img src="/assets/images/icon-decrement-quantity.svg" alt="Decrement"></span>
                    <span class="quantity">1</span>
                    <span class="incre"><img src="/assets/images/icon-increment-quantity.svg" alt="Increment"></span>
                </button>
                <p class="category">${data.category}</p>
                <p class="name">${data.name}</p>
                <p class="price">$${data.price.toFixed(2)}</p>
            `;
            itemContainer.appendChild(cardItem);

            // Select elements
            const addButton = cardItem.querySelector('.addbtn');
            const hoverButton = cardItem.querySelector('.hoverbtn');
            const img = cardItem.querySelector('.product-img');
            const incrementBtn = cardItem.querySelector('.incre');
            const decrementBtn = cardItem.querySelector('.decre');
            const quantityDisplay = cardItem.querySelector('.quantity');

            // Add to cart
            addButton.addEventListener('click', () => {
                hoverButton.classList.remove('hidden');
                img.classList.add('border');
                const itemInCart = cart.find(item => item.name === data.name);
                if (!itemInCart) {
                    const cartItem = {
                        name: data.name,
                        price: data.price,
                        category: data.category,
                        quantity: 1
                    };
                    cart.push(cartItem);
                }
                updateCart();
                console.log('Cart:', cart);
            });

            // Increment quantity
            incrementBtn.addEventListener('click', () => {
                const itemInCart = cart.find(item => item.name === data.name);
                if (itemInCart) {
                    itemInCart.quantity++;
                    quantityDisplay.textContent = itemInCart.quantity;
                    console.log(`Increased ${itemInCart.name} to ${itemInCart.quantity}`);
                    updateCart();
                }
            });

            // Decrement quantity
            decrementBtn.addEventListener('click', () => {
                const itemInCart = cart.find(item => item.name === data.name);
                if (itemInCart && itemInCart.quantity > 0) {
                    itemInCart.quantity--;
                    quantityDisplay.textContent = itemInCart.quantity;
                    console.log(`Decreased ${itemInCart.name} to ${itemInCart.quantity}`);
                    if (itemInCart.quantity === 0) {
                        cart = cart.filter(item => item.name !== data.name);
                        hoverButton.classList.add('hidden');
                        img.classList.remove('border');
                    }
                    updateCart();
                }
            });
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        itemContainer.innerHTML = '<p>Failed to load products. Please try again later.</p>';
    }
}

const updateCart = function () {
    cartContainer.innerHTML = `
        <h3 id="cart">Your Cart ( <span id="cartnum">0</span> )</h3>
    `;

    const cartLength = document.getElementById('cartnum');
    cartLength.innerHTML = `${cart.length}`;

    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <h3 id="cart">Your Cart ( <span id="cartnum">0</span> )</h3>
            <div class="first">
                <img id="cartimg" src="/assets/images/illustration-empty-cart.svg" alt="">
                <p id="message">Your added item will appear here</p>
            </div>
        `;
        cartFirst.innerHTML = `<h2>Your Cart (0)</h2>`;
        return;
    }

    cart.forEach(item => {
        const line = document.createElement('div');
        line.classList.add('cart-item');
        line.innerHTML = `
            <div class="cart">
                <div class="prod">
                    <h4>${item.name}</h4>
                    <p id="num"><span id="times">${item.quantity}x</span> $${item.price.toFixed(2)} = $${(item.quantity * item.price).toFixed(2)}</p>
                </div>
                <div class="delbtn">
                    <img id="delBtn" src="/assets/images/icon-remove-item.svg" alt="Remove Item">
                </div>
            </div>
        `;
        const delBtn = line.querySelector('.delbtn');
        delBtn.addEventListener('click', function () {
            removeCartItem(item.name);
        });
        cartContainer.appendChild(line);
    });

    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalLine = document.createElement('div');
    totalLine.classList.add('cart-total');
    totalLine.innerHTML = `
        <div class="total">
            <p class="order-p">Order Total</p>
            <h2 class="t_price">$${totalPrice.toFixed(2)}</h2>
        </div>
    `;
    cartContainer.appendChild(totalLine);

    const orderType = document.createElement('div');
    orderType.classList.add('ordertype');
    orderType.innerHTML = `
        <img src="/assets/images/icon-carbon-neutral.svg" alt="">
        <p id="p-order">This is a <strong>carbon-neutral</strong> delivery</p>
    `;
    cartContainer.appendChild(orderType);

   const confirmBtn = document.createElement('button');
    confirmBtn.classList.add('orderbtn');
    confirmBtn.textContent = 'Confirm Order';
    cartContainer.appendChild(confirmBtn);

    confirmBtn.addEventListener('click', showModal);
};

const removeCartItem = function (itemName) {
    cart = cart.filter(cartItem => cartItem.name !== itemName);
    const productCards = document.querySelectorAll('.card');
    productCards.forEach(card => {
        const productName = card.querySelector('.name').textContent;
        if (productName === itemName) {
            const addButton = card.querySelector('.addbtn');
            const hoverButton = card.querySelector('.hoverbtn');
            const img = card.querySelector('.product-img');
            addButton.classList.remove('hidden');
            hoverButton.classList.add('hidden');
            img.classList.remove('border');
        }
    });
    updateCart();
};

const showModal = function () {
    const confirmModal = document.createElement('div');
    confirmModal.classList.add('confirmModal');
    confirmModal.innerHTML = `
        <div class="confirm-order">
            <p class="header">Confirm Your Order</p>
            <p class="question">Are you sure you want to place this order?</p>
            <div class="order-items">
                ${cart.map(item => {
                        const data = dataArray.find(d => d.name === item.name);
                        console.log(item);
                        
                        return `
                            <div class="order-item">
                                <img src="${data?.image.desktop}" alt="${item.name}" class="item-img">
                                <div class="item-details">
                                    <h4>${item.name}</h4>
                                    <p><span class="quantity">${item.quantity}x</span> @ $${item.price.toFixed(2)} = $${(item.quantity * item.price).toFixed(2)}</p>
                                </div>
                            </div>
                        `;
                    })
                    .join('')}
            </div>
            <div class="btns">
                <button class="cancel">Cancel</button>
                <button class="confirm">Confirm Order</button>
            </div>
        </div>
    `;
    document.querySelector('body').appendChild(confirmModal);

    // Add event listeners for buttons
    const cancelBtn = confirmModal.querySelector('.cancel');
    const confirmBtn = confirmModal.querySelector('.confirm');

    cancelBtn.addEventListener('click', () => {
        confirmModal.remove(); // Close the modal
    });

    confirmBtn.addEventListener('click', () => {
        confirmModal.remove(); // Close the confirmation modal
        showOrderConfirmedModal(); // Show the order confirmed modal
    });
};

const showOrderConfirmedModal = function () {
    const orderModal = document.createElement('div');
    orderModal.classList.add('orderConfirmedModal');
    orderModal.innerHTML = `
        <div class="order-confirmed">
            <img src="/assets/images/icon-order-confirmed.svg" alt="Order Confirmed" class="confirm-icon">
            <h2>Order Confirmed</h2>
            <p class="subtitle">We hope you enjoy your food!</p>
            <div class="order-items">
                ${cart.map(item => {
                        const data = dataArray.find(d => d.name === item.name);
                        console.log(item);
                        
                        return `
                            <div class="order-item">
                                <img src="${data?.image.desktop}" alt="${item.name}" class="item-img">
                                <div class="item-details">
                                    <h4>${item.name}</h4>
                                    <p><span class="quantity">${item.quantity}x</span> @ $${item.price.toFixed(2)} = $${(item.quantity * item.price).toFixed(2)}</p>
                                </div>
                            </div>
                        `;
                    })
                    .join('')}
            </div>
            <div class="order-total">
                <p>Order Total</p>
                <h3>$${cart.reduce((sum, item) => sum + item.quantity * item.price, 0).toFixed(2)}</h3>
            </div>
            <button class="start-new-order">Start New Order</button>
        </div>
    `;
    document.querySelector('body').appendChild(orderModal);

    // Add event listener for the "Start New Order" button
    const startNewOrderBtn = orderModal.querySelector('.start-new-order');
    startNewOrderBtn.addEventListener('click', () => {
        cart = [];
        // Reset all product cards
        document.querySelectorAll('.card').forEach(card => {
            card.querySelector('.hoverbtn').classList.add('hidden');
            card.querySelector('.addbtn').classList.remove('hidden');
            card.querySelector('.product-img').classList.remove('border');
            card.querySelector('.quantity').textContent = '1';
        });

        updateCart();

        orderModal.remove();
    });
};

getData();