document.addEventListener('DOMContentLoaded', function() {
    const burgers = [
        { id: 1, name: "Classic Heaven", description: "Lettuce, tomato, onion, special sauce.", price: 499, image: "classic.jpg" },
        { id: 2, name: "Cheese Paradise", description: "Double cheese, caramelized onions, pickles.", price: 599, image: "cheesparad.jpg" },
        { id: 3, name: "Bacon Delight", description: "Crispy bacon, cheddar, smoky BBQ sauce.", price: 649, image: "delight.png" },
        { id: 4, name: "Veggie Bliss", description: "Plant-based patty, avocado, vegan mayo.", price: 549, image: "viggie.jpg" },
        { id: 5, name: "Spicy Inferno", description: "Jalapeños, pepper jack, fiery sauce.", price: 599, image: "inferno.jpg" },
        { id: 6, name: "Mega Monster", description: "Double patty, triple cheese, all toppings.", price: 799, image: "megabold.jpg" }
    ];

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let address = {};

 
    const burgersContainer = document.getElementById('burgersContainer');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const emptyCartMessage = document.getElementById('emptyCartMessage');
    const orderNowBtn = document.getElementById('orderNowBtn');
    const addressForm = document.getElementById('addressForm');
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    const receiptModal = document.getElementById('receiptModal');
    const loadingModal = document.getElementById('loadingModal');
    const receiptDetails = document.getElementById('receiptDetails');
    const orderStatus = document.getElementById('orderStatus');
    const confirmOrderBtn = document.getElementById('confirmOrderBtn');
    const closeReceiptBtn = document.getElementById('closeReceiptBtn');
    const closeModal = document.querySelector('.close-modal');


    function renderBurgers() {
        burgersContainer.innerHTML = '';
        burgers.forEach(burger => {
            const burgerCard = document.createElement('div');
            burgerCard.className = 'burger-card';
            burgerCard.innerHTML = `
                <div class="burger-img" style="background-image: url('${burger.image}')"></div>
                <div class="burger-info">
                    <h3>${burger.name}</h3>
                    <p>${burger.description}</p>
                    <span class="price">₱${burger.price.toFixed(2)}</span>
                    <div class="quantity-control">
                        <button class="btn decrease" data-id="${burger.id}">-</button>
                        <span class="quantity" data-id="${burger.id}">${getCartQuantity(burger.id)}</span>
                        <button class="btn increase" data-id="${burger.id}">+</button>
                    </div>
                </div>
            `;
            burgersContainer.appendChild(burgerCard);
        });

        document.querySelectorAll('.increase').forEach(button => {
            button.addEventListener('click', increaseQuantity);
        });
        document.querySelectorAll('.decrease').forEach(button => {
            button.addEventListener('click', decreaseQuantity);
        });
    }

  
    function getCartQuantity(burgerId) {
        const cartItem = cart.find(item => item.id === burgerId);
        return cartItem ? cartItem.quantity : 0;
    }


    function increaseQuantity(e) {
        const burgerId = parseInt(e.target.getAttribute('data-id'));
        const quantitySpan = document.querySelector(`.quantity[data-id="${burgerId}"]`);
        let quantity = parseInt(quantitySpan.textContent);
        quantitySpan.textContent = ++quantity;
        updateCartItem(burgerId, quantity);
    }


    function decreaseQuantity(e) {
        const burgerId = parseInt(e.target.getAttribute('data-id'));
        const quantitySpan = document.querySelector(`.quantity[data-id="${burgerId}"]`);
        let quantity = parseInt(quantitySpan.textContent);
        if (quantity > 0) {
            quantitySpan.textContent = --quantity;
            updateCartItem(burgerId, quantity);
        }
    }


    function updateCartItem(burgerId, quantity) {
        const burger = burgers.find(b => b.id === burgerId);
        const cartItem = cart.find(item => item.id === burgerId);

        if (quantity === 0) {
            cart = cart.filter(item => item.id !== burgerId);
        } else if (cartItem) {
            cartItem.quantity = quantity;
        } else if (quantity > 0) {
            cart.push({ ...burger, quantity });
        }

        updateCart();
    }


    function updateCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        if (cart.length === 0) {
            emptyCartMessage.style.display = 'block';
            cartItems.innerHTML = '';
            cartTotal.textContent = 'Total: ₱0.00';
        } else {
            emptyCartMessage.style.display = 'none';
            let itemsHTML = '';
            let total = 0;
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                itemsHTML += `
                    <div class="cart-item">
                        <div>
                            <h4>${item.name} (x${item.quantity})</h4>
                            <p>₱${item.price.toFixed(2)} each</p>
                        </div>
                        <div class="quantity-control">
                            <button class="btn decrease-cart" data-id="${item.id}">-</button>
                            <span>${item.quantity}</span>
                            <button class="btn increase-cart" data-id="${item.id}">+</button>
                            <button class="btn remove-item" data-id="${item.id}">Remove</button>
                        </div>
                    </div>
                `;
            });
            cartItems.innerHTML = itemsHTML;
            cartTotal.textContent = `Total: ₱${total.toFixed(2)}`;

            document.querySelectorAll('.remove-item').forEach(button => {
                button.addEventListener('click', removeFromCart);
            });
            document.querySelectorAll('.increase-cart').forEach(button => {
                button.addEventListener('click', increaseQuantity);
            });
            document.querySelectorAll('.decrease-cart').forEach(button => {
                button.addEventListener('click', decreaseQuantity);
            });
        }
    }

    
    function removeFromCart(e) {
        const burgerId = parseInt(e.target.getAttribute('data-id'));
        cart = cart.filter(item => item.id !== burgerId);
        updateCart();
        const quantitySpan = document.querySelector(`.quantity[data-id="${burgerId}"]`);
        if (quantitySpan) quantitySpan.textContent = '0';
    }


    function validateAddressForm() {
        const inputs = addressForm.querySelectorAll('input[required]');
        let isValid = true;
        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.style.borderColor = '#ff6b00';
            } else {
                input.style.borderColor = '#ddd';
            }
        });
        const zipCode = document.getElementById('zipCode');
        if (!/^\d{4,5}$/.test(zipCode.value)) {
            isValid = false;
            zipCode.style.borderColor = '#ff6b00';
        }
        return isValid;
    }

  
    function handleAddressForm(e) {
        e.preventDefault();
        if (!validateAddressForm()) {
            alert('Please fill in all required fields correctly.');
            return;
        }
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        address = {
            fullName: document.getElementById('fullName').value,
            addressLine1: document.getElementById('addressLine1').value,
            addressLine2: document.getElementById('addressLine2').value || '',
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            zipCode: document.getElementById('zipCode').value
        };
        generateReceipt();
    }

    
    function generateReceipt() {
        let receiptHTML = '<h3>Order Details</h3><ul>';
        let total = 0;
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            receiptHTML += `<li>${item.name} (x${item.quantity}) - ₱${itemTotal.toFixed(2)}</li>`;
        });
        receiptHTML += `</ul><p><strong>Total: ₱${total.toFixed(2)}</strong></p>`;
        receiptHTML += '<h3>Delivery Address</h3><p>';
        receiptHTML += `${address.fullName}<br>${address.addressLine1}<br>${address.addressLine2}<br>${address.city}, ${address.state} ${address.zipCode}</p>`;
        receiptDetails.innerHTML = receiptHTML;
        orderStatus.textContent = 'Awaiting Confirmation...';
        receiptModal.style.display = 'flex';
    }
    function placeOrder() {
        loadingModal.style.display = 'flex';
        setTimeout(() => {
            loadingModal.style.display = 'none';
            orderStatus.textContent = 'Order Confirmed!';
            alert(`Your order has been successfully placed! Total: ₱${calculateTotal().toFixed(2)}\nThank you for choosing Burger Heaven! Order will be delivered to:\n${address.fullName}\n${address.addressLine1}\n${address.addressLine2}\n${address.city}, ${address.state} ${address.zipCode}\nExpected delivery: 02:34 PM PST, May 27, 2025.\nOrder Status: Confirmed`);
            cart = [];
            address = {};
            updateCart();
            receiptModal.style.display = 'none';
            document.getElementById('addressForm').reset();
        }, 2000);
    }


    function calculateTotal() {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }


    orderNowBtn.addEventListener('click', () => document.getElementById('menu').scrollIntoView({ behavior: 'smooth' }));
    addressForm.addEventListener('submit', handleAddressForm);
    confirmOrderBtn.addEventListener('click', placeOrder);
    closeModal.addEventListener('click', () => receiptModal.style.display = 'none');
    closeReceiptBtn.addEventListener('click', () => receiptModal.style.display = 'none');


    renderBurgers();
    updateCart();
});