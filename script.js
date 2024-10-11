// Initialize Firebase
const firebaseConfig = {
    apiKey: "YOUR_API_KEY", 
    authDomain: "farmer-f3b85.firebaseapp.com", 
    databaseURL: "https://farmer-f3b85-default-rtdb.firebaseio.com", 
    projectId: "farmer-f3b85", 
    storageBucket: "farmer-f3b85.appspot.com", 
    messagingSenderId: "YOUR_SENDER_ID", 
    appId: "YOUR_APP_ID" 
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore and Storage
const db = firebase.firestore();
const storage = firebase.storage();

async function addProduct(event) {
  event.preventDefault(); // Prevent form submission
  
  const productName = document.getElementById('productName').value;
  const price = document.getElementById('productPrice').value;
  const file = document.getElementById('productFile').files[0];

  console.log("Adding product:", { productName, price, file });

  if (file) {
    const storageRef = storage.ref(`/products/${file.name}`);
    
    try {
      // Upload the product image to Firebase Storage
      console.log("Uploading image to storage...");
      await storageRef.put(file);
      
      const imageUrl = await storageRef.getDownloadURL(); // Get image URL after upload
      console.log("Image uploaded, URL:", imageUrl);

      // Create a new product object
      const newProduct = {
        name: productName,
        price: price,
        imageUrl: imageUrl,
        timestamp: firebase.firestore.FieldValue.serverTimestamp() // Add timestamp
      };

      // Add the new product to the Firestore collection
      console.log("Adding product to Firestore...");
      await db.collection('products').add(newProduct);

      alert('Product added successfully!');
      document.querySelector('.add-product-form').reset(); // Reset the form
    } catch (error) {
      console.error('Error uploading product: ', error);
      alert('Error uploading product, check console for details.');
    }
  } else {
    alert('Please upload a product image.');
  }
}



/**
 * Load and Display Products from Firestore
 * This function is called on the Products page to dynamically load products from Firestore.
 */
 function loadProducts() {
  const productsGrid = document.querySelector('.product-grid');
  productsGrid.innerHTML = ''; // Clear current product list

  // Fetch products from Firestore
  db.collection('products').get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const product = doc.data();
      const productCard = document.createElement('div');
      productCard.classList.add('product-card');
      productCard.innerHTML = `
        <img src="${product.imageUrl}" alt="${product.name}">
        <h2>${product.name}</h2>
        <p>$${product.price}</p>
        <button onclick="addToCart('${doc.id}', '${product.name}', ${product.price})">Add to Cart</button>
      `;
      productsGrid.appendChild(productCard);
    });
  }).catch((error) => {
    console.error('Error loading products: ', error);
  });
}


/**
 * Add Product to Cart
 * This function is triggered when a user adds a product to their cart.
 */
 function addToCart(productId, productName, productPrice) {
  db.collection('cart').add({
    productId: productId,
    productName: productName,
    price: productPrice,
    quantity: 1
  }).then(() => {
    alert(`${productName} has been added to your cart!`);
  }).catch((error) => {
    console.error('Error adding to cart: ', error);
  });
}


/**
 * Load and Display Cart Items from Firestore
 * This function is called on the Cart page to dynamically load cart items from Firestore.
 */
 function loadCart() {
  const cartItemsContainer = document.querySelector('.cart-items');
  cartItemsContainer.innerHTML = ''; // Clear current cart items

  // Fetch cart items from Firestore
  db.collection('cart').get().then((querySnapshot) => {
    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        const cartItem = doc.data();
        const cartItemDiv = document.createElement('div');
        cartItemDiv.classList.add('cart-item');
        cartItemDiv.innerHTML = `
          <p>${cartItem.productName} - $${cartItem.price} x ${cartItem.quantity}</p>
          <button onclick="removeFromCart('${doc.id}')">Remove</button>
        `;
        cartItemsContainer.appendChild(cartItemDiv);
      });
    } else {
      cartItemsContainer.innerHTML = '<p>No items in cart yet.</p>';
    }
  }).catch((error) => {
    console.error('Error loading cart: ', error);
  });
}


/**
 * Remove Item from Cart
 * This function removes an item from the cart based on its Firestore document ID.
 */
 function removeFromCart(cartItemId) {
  db.collection('cart').doc(cartItemId).delete().then(() => {
    alert('Item removed from cart!');
    loadCart(); // Reload cart items
  }).catch((error) => {
    console.error('Error removing cart item: ', error);
  });
}


/**
 * This function resets and loads appropriate page contents when the page loads.
 */
 window.onload = function() {
  // Identify which page is being loaded
  if (document.querySelector('.product-grid')) {
    loadProducts(); // Load products if we are on the products page
  } else if (document.querySelector('.cart-items')) {
    loadCart(); // Load cart if we are on the cart page
  }
};


// Show modal on Checkout button click
document.querySelector('.checkout-btn').addEventListener('click', function () {
  document.getElementById('paymentModal').style.display = 'block';
});

// Hide modal when close button is clicked
document.querySelector('.close-btn').addEventListener('click', function () {
  document.getElementById('paymentModal').style.display = 'none';
});

// Show payment details if card payment is selected
document.getElementById('paymentMethod').addEventListener('change', function () {
  const selectedMethod = this.value;
  const cardDetails = document.getElementById('cardDetails');
  
  if (selectedMethod === 'card') {
    cardDetails.style.display = 'block';
  } else {
    cardDetails.style.display = 'none';
  }
});

// Handle form submission
document.getElementById('paymentForm').addEventListener('submit', function (event) {
  event.preventDefault(); // Prevent page refresh

  const paymentMethod = document.getElementById('paymentMethod').value;
  
  // Simulate payment process
  setTimeout(() => {
    alert('Payment completed. Your fresh veggies will be delivered soon!');
    document.getElementById('paymentModal').style.display = 'none'; // Hide the modal after payment
  }, 1000); // Simulate a delay for the "payment"
});
