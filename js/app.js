document.addEventListener('DOMContentLoaded', () => {
  loadState(); renderNav(); updateCartUI(); showPage('page-home'); loadProducts();
});

function renderNav() {
  const links = document.getElementById('navLinks');
  const cartBtn = `<button onclick="toggleCart()" style="background:none;border:none;cursor:pointer;color:white;font-size:22px;padding:6px;position:relative;">🛒<span class="cart-count" id="cartCount">0</span></button>`;
  if (state.user) {
    links.innerHTML = cartBtn +
      `<a onclick="showPage('page-orders');loadOrders()" style="cursor:pointer;color:white;padding:8px">My Orders</a>` +
      (state.user.role === 'admin' ? `<a onclick="showPage('page-admin');loadAdmin()" style="cursor:pointer;color:white;padding:8px">Admin</a>` : '') +
      `<button onclick="handleLogout()" style="background:white;color:#1A3FD8;border:none;padding:8px 16px;border-radius:8px;font-weight:600;cursor:pointer">Logout (${state.user.name.split(' ')[0]})</button>`;
  } else {
    links.innerHTML = cartBtn +
      `<button onclick="openModal('loginModal')" style="background:none;border:none;color:white;cursor:pointer;padding:8px">Login</button>` +
      `<button onclick="openModal('registerModal')" style="background:white;color:#1A3FD8;border:none;padding:8px 16px;border-radius:8px;font-weight:600;cursor:pointer">Sign Up</button>`;
  }
}

function handleLogout() { logout(); renderNav(); showPage('page-home'); toast('Logged out'); }

function updateCartUI() {
  document.querySelectorAll('#cartCount').forEach(el => el.textContent = cartCount());
  renderCartItems();
}

function toggleCart() {
  document.getElementById('cartOverlay').classList.toggle('open');
  document.getElementById('cartSidebar').classList.toggle('open');
}

function closeCart() {
  document.getElementById('cartOverlay').classList.remove('open');
  document.getElementById('cartSidebar').classList.remove('open');
}

function renderCartItems() {
  const el = document.getElementById('cartItemsList');
  const footer = document.getElementById('cartFooter');
  if (!el) return;
  if (!state.cart.length) {
    el.innerHTML = `<div style="text-align:center;padding:40px;color:#94a3b8"><div style="font-size:48px">🛒</div><p>Your cart is empty</p></div>`;
    footer.style.display = 'none'; return;
  }
  footer.style.display = 'block';
  el.innerHTML = state.cart.map(i => `
    <div style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid #f1f5f9;align-items:center">
      <div style="font-size:36px">${categoryEmoji(i.category)}</div>
      <div style="flex:1">
        <div style="font-weight:600;font-size:14px">${i.name}</div>
        <div style="color:#1A3FD8;font-weight:600">₹${(i.price * i.quantity).toFixed(2)}</div>
        <div style="display:flex;align-items:center;gap:8px;margin-top:6px">
          <button onclick="updateCartQty('${i._id}',${i.quantity - 1});updateCartUI()" style="width:26px;height:26px;border:1px solid #e2e8f0;background:#f8fafc;border-radius:6px;cursor:pointer">−</button>
          <span style="font-weight:600">${i.quantity}</span>
          <button onclick="updateCartQty('${i._id}',${i.quantity + 1});updateCartUI()" style="width:26px;height:26px;border:1px solid #e2e8f0;background:#f8fafc;border-radius:6px;cursor:pointer">+</button>
        </div>
      </div>
      <button onclick="removeFromCart('${i._id}');updateCartUI()" style="background:none;border:none;color:#dc2626;cursor:pointer;font-size:20px">✕</button>
    </div>`).join('');
  document.getElementById('cartTotal').innerHTML = `
    <div style="display:flex;justify-content:space-between;font-size:13px;color:#475569;margin-bottom:8px"><span>Shipping</span><span style="color:#16a34a">${cartTotal() > 500 ? 'FREE' : '₹50'}</span></div>
    <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:700;margin-bottom:16px"><span>Total</span><span>₹${(cartTotal() + (cartTotal() > 500 ? 0 : 50)).toFixed(2)}</span></div>
    <button onclick="goCheckout()" style="width:100%;padding:14px;background:#1A3FD8;color:white;border:none;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer">Proceed to Checkout</button>`;
}

let allProducts = [];

async function loadProducts() {
  const grid = document.getElementById('productsGrid');
  grid.innerHTML = `<div style="text-align:center;padding:60px;grid-column:1/-1"><div style="width:36px;height:36px;border:3px solid #e2e8f0;border-top-color:#1A3FD8;border-radius:50%;animation:spin 0.7s linear infinite;margin:0 auto"></div></div>`;
  try {
    const data = await api('GET', '/products');
    allProducts = data.products;
    renderProducts(allProducts);
  } catch (e) {
    allProducts = getDemoProducts();
    renderProducts(allProducts);
  }
}

function getDemoProducts() {
  return [
    { _id: 'd1', name: 'Wireless Headphones', category: 'Electronics', price: 1299, stock: 15, rating: 4.5, numReviews: 28 },
    { _id: 'd2', name: 'Running Shoes', category: 'Sports', price: 2499, stock: 8, rating: 4.3, numReviews: 14 },
    { _id: 'd3', name: 'JavaScript Book', category: 'Books', price: 499, stock: 50, rating: 4.8, numReviews: 62 },
    { _id: 'd4', name: 'Smart Watch', category: 'Electronics', price: 3999, stock: 3, rating: 4.2, numReviews: 19 },
    { _id: 'd5', name: 'Yoga Mat', category: 'Sports', price: 699, stock: 25, rating: 4.6, numReviews: 33 },
    { _id: 'd6', name: 'Cotton T-Shirt', category: 'Clothing', price: 349, stock: 40, rating: 4.0, numReviews: 10 },
    { _id: 'd7', name: 'Coffee Maker', category: 'Home', price: 1899, stock: 12, rating: 4.4, numReviews: 22 },
    { _id: 'd8', name: 'Face Serum', category: 'Beauty', price: 899, stock: 0, rating: 4.7, numReviews: 45 }
  ];
}

function renderProducts(products) {
  const grid = document.getElementById('productsGrid');
  if (!products.length) { grid.innerHTML = `<p style="color:#94a3b8;text-align:center;grid-column:1/-1;padding:40px">No products found.</p>`; return; }
  grid.innerHTML = products.map(p => `
    <div class="product-card">
      <div class="product-img">${categoryEmoji(p.category)}</div>
      <div class="product-body">
        <div class="product-category">${p.category}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-price">₹${p.price.toFixed(2)}</div>
        <div class="product-rating">${'★'.repeat(Math.round(p.rating))}${'☆'.repeat(5 - Math.round(p.rating))} (${p.numReviews})</div>
        <div class="product-stock ${p.stock > 5 ? 'in-stock' : p.stock > 0 ? 'low-stock' : 'out-stock'}">
          ${p.stock > 5 ? '✓ In Stock' : p.stock > 0 ? '⚠ Only ' + p.stock + ' left' : '✕ Out of Stock'}
        </div>
        <button class="btn btn-blue w-full" onclick='handleAddToCart(${JSON.stringify(p)})' ${p.stock === 0 ? 'disabled style="opacity:0.5"' : ''}>Add to Cart</button>
      </div>
    </div>`).join('');
}

function handleAddToCart(p) { addToCart(p); updateCartUI(); toast(p.name + ' added to cart! 🛒', 'success'); }

function filterProducts() {
  const kw = document.getElementById('searchInput').value.toLowerCase();
  const cat = document.getElementById('catFilter').value;
  renderProducts(allProducts.filter(p => (!kw || p.name.toLowerCase().includes(kw)) && (!cat || p.category === cat)));
}

function goCheckout() {
  if (!state.user) { openModal('loginModal'); toast('Please login first', 'error'); return; }
  if (!state.cart.length) { toast('Cart is empty', 'error'); return; }
  closeCart(); renderCheckoutSummary(); showPage('page-checkout');
}

function renderCheckoutSummary() {
  document.getElementById('checkoutItems').innerHTML = state.cart.map(i =>
    `<div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:10px"><span>${i.name} × ${i.quantity}</span><span>₹${(i.price * i.quantity).toFixed(2)}</span></div>`
  ).join('') + `<hr style="margin:14px 0"><div style="display:flex;justify-content:space-between;font-size:18px;font-weight:700"><span>Total</span><span>₹${cartTotal().toFixed(2)}</span></div>`;
}

async function placeOrder() {
  const fullName = document.getElementById('fullName').value.trim();
  const address = document.getElementById('address').value.trim();
  const city = document.getElementById('city').value.trim();
  const postalCode = document.getElementById('postalCode').value.trim();
  const country = document.getElementById('country').value.trim();
  if (!fullName || !address || !city || !postalCode || !country) { toast('Fill all fields', 'error'); return; }
  try {
    await api('POST', '/orders', {
      items: state.cart.map(i => ({ product: i._id, quantity: i.quantity })),
      shippingAddress: { fullName, address, city, postalCode, country },
      paymentMethod: document.getElementById('paymentMethod').value
    });
    state.cart = []; saveCart(); updateCartUI();
    toast('Order placed! 🎉', 'success'); showPage('page-orders'); loadOrders();
  } catch (e) {
    toast('Order placed! (demo mode) 🎉', 'success');
    state.cart = []; saveCart(); updateCartUI(); showPage('page-home');
  }
}

async function loadOrders() {
  if (!state.user) return;
  const el = document.getElementById('ordersList');
  el.innerHTML = '<div style="text-align:center;padding:40px">Loading...</div>';
  try {
    const data = await api('GET', '/orders/my');
    if (!data.orders.length) { el.innerHTML = '<p style="text-align:center;color:#94a3b8;padding:40px">No orders yet.</p>'; return; }
    el.innerHTML = data.orders.map(o => `
      <div class="order-card">
        <div class="order-header">
          <div><div style="font-size:13px;color:#94a3b8">Order #${o._id.slice(-8).toUpperCase()}</div>
          <div style="font-size:13px;color:#94a3b8">${new Date(o.createdAt).toLocaleDateString()}</div></div>
          <span class="status-badge status-${o.orderStatus}">${o.orderStatus}</span>
        </div>
        <div style="font-size:13px;color:#475569;margin-bottom:12px">${o.items.map(i => i.name + ' × ' + i.quantity).join(', ')}</div>
        <div style="font-size:16px;font-weight:700">₹${o.totalPrice.toFixed(2)}</div>
      </div>`).join('');
  } catch (e) { el.innerHTML = '<p style="text-align:center;color:#94a3b8;padding:40px">Could not load orders.</p>'; }
}

async function loadAdmin() {
  const el = document.getElementById('adminProductsTable');
  el.innerHTML = 'Loading...';
  try {
    const data = await api('GET', '/products');
    el.innerHTML = `<div class="table-container"><table><thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Action</th></tr></thead><tbody>` +
      data.products.map(p => `<tr><td><strong>${p.name}</strong></td><td>${p.category}</td><td>₹${p.price}</td><td>${p.stock}</td><td><button class="btn btn-sm btn-red" onclick="deleteProduct('${p._id}')">Delete</button></td></tr>`).join('') +
      `</tbody></table></div>`;
  } catch (e) { el.innerHTML = '<p style="color:#94a3b8;text-align:center;padding:40px">Could not load.</p>'; }
}

async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  try { await api('DELETE', '/products/' + id); toast('Deleted', 'success'); loadAdmin(); } catch (e) { toast(e.message, 'error'); }
}

async function addProduct(e) {
  e.preventDefault();
  try {
    await api('POST', '/products', {
      name: document.getElementById('p-name').value,
      description: document.getElementById('p-desc').value,
      price: Number(document.getElementById('p-price').value),
      category: document.getElementById('p-category').value,
      stock: Number(document.getElementById('p-stock').value)
    });
    toast('Product added!', 'success'); e.target.reset(); loadAdmin();
  } catch (er) { toast(er.message, 'error'); }
}

async function handleLogin(e) {
  e.preventDefault();
  try {
    await login(document.getElementById('loginEmail').value, document.getElementById('loginPassword').value);
    closeModal('loginModal'); renderNav(); toast('Welcome back ' + state.user.name + '!', 'success');
  } catch (err) { toast(err.message, 'error'); }
}

async function handleRegister(e) {
  e.preventDefault();
  try {
    await register(document.getElementById('regName').value, document.getElementById('regEmail').value, document.getElementById('regPassword').value);
    closeModal('registerModal'); renderNav(); toast('Welcome ' + state.user.name + '!', 'success');
  } catch (err) { toast(err.message, 'error'); }
}

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
function categoryEmoji(cat) {
  return { Electronics: '💻', Clothing: '👕', Books: '📚', Home: '🏠', Sports: '⚽', Beauty: '💄', Toys: '🧸', Other: '📦' }[cat] || '📦';
}