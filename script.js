const MOCK_API = "https://jsonplaceholder.typicode.com/posts";
let selectedAddons = [];

// --- 1. GEOLOCATION ---
document.getElementById('find-me').addEventListener('click', () => {
    const display = document.getElementById('location-display');
    if (!navigator.geolocation) {
        display.innerText = "Geolocation not supported";
    } else {
        display.innerText = "Locating...";
        navigator.geolocation.getCurrentPosition((pos) => {
            // In a real app, you'd send these coords to a maps API
            display.innerText = `Store found near: ${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`;
        }, () => {
            display.innerText = "Unable to retrieve location";
        });
    }
});

// --- 2. DRAG AND DROP LOGIC ---
const draggables = document.querySelectorAll('.draggable-addon');
const dropZone = document.getElementById('drop-zone');
const appliedContainer = document.getElementById('applied-addons');

draggables.forEach(item => {
    item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({
            name: item.dataset.name,
            price: item.dataset.price
        }));
    });
});

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    
    selectedAddons.push(data);
    renderAddons();
    updateSummary();
});

function renderAddons() {
    appliedContainer.innerHTML = selectedAddons.map((a, i) => 
        `<span class="badge-addon">${a.name} <span style="cursor:pointer" onclick="removeAddon(${i})">×</span></span>`
    ).join('');
}

window.removeAddon = (index) => {
    selectedAddons.splice(index, 1);
    renderAddons();
    updateSummary();
};

// --- 3. DYNAMIC MENU ---
async function loadMenu() {
    const drinks = [
        { name: "Espresso", price: 290, icon: "☕" },
        { name: "Latte", price: 395, icon: "🥛" },
        { name: "Mocha", price: 420, icon: "🍫" }
    ];
    
    const menu = document.getElementById('drink-menu');
    menu.innerHTML = drinks.map(d => `
        <div class="col-md-4">
            <label class="drink-card-wrap d-block">
                <input type="radio" name="drink" value="${d.name}" data-price="${d.price}" onchange="updateSummary()">
                <div class="card-inner">
                    <div class="fs-2">${d.icon}</div>
                    <div class="fw-bold">${d.name}</div>
                    <div class="text-warning">₹${d.price}</div>
                </div>
            </label>
        </div>
    `).join('');
}

// --- 4. SUMMARY & API POST ---
function updateSummary() {
    const drinkEl = document.querySelector('input[name="drink"]:checked');
    if (!drinkEl) return;

    const qty = document.getElementById('qty-input').value;
    const basePrice = parseInt(drinkEl.dataset.price);
    const addonPrice = selectedAddons.reduce((sum, a) => sum + parseInt(a.price), 0);
    
    const total = (basePrice + addonPrice) * qty;

    document.getElementById('summary-content').innerHTML = `
        <div class="d-flex justify-content-between">
            <span>${drinkEl.value} x${qty}</span>
            <span>₹${basePrice * qty}</span>
        </div>
        <small class="text-secondary">Add-ons: ${selectedAddons.map(a => a.name).join(', ') || 'None'}</small>
    `;
    
    document.getElementById('subtotal').innerText = `₹${total}`;
    document.getElementById('grand-total').innerText = `₹${total}`;
}

document.getElementById('place-order-btn').addEventListener('click', async () => {
    const drinkEl = document.querySelector('input[name="drink"]:checked');
    if (!drinkEl) return alert("Select a drink first!");

    const btn = document.getElementById('place-order-btn');
    btn.disabled = true;
    btn.innerText = "Processing...";

    const order = {
        item: drinkEl.value,
        addons: selectedAddons,
        total: document.getElementById('grand-total').innerText
    };

    try {
        await fetch(MOCK_API, {
            method: 'POST',
            body: JSON.stringify(order),
            headers: { 'Content-type': 'application/json' }
        });
        alert("Order placed successfully!");
    } catch (e) {
        alert("Order failed!");
    } finally {
        btn.disabled = false;
        btn.innerText = "Place Order";
    }
});

// Start
loadMenu();
document.getElementById('qty-input').addEventListener('input', updateSummary);