
const MOCK_API = "https://jsonplaceholder.typicode.com/posts";
let selectedAddons = [];

// --- 1. GEOLOCATION ---
document.getElementById('find-me').addEventListener('click', () => {
    const display = document.getElementById('location-display');
    
    if (!navigator.geolocation) {
        display.innerText = "Geolocation not supported";
        return;
    }

    display.innerText = "Locating...";
    
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const lat = pos.coords.latitude.toFixed(2);
            const lng = pos.coords.longitude.toFixed(2);
            display.innerText = `Store found near: ${lat}, ${lng}`;
        }, 
        () => {
            display.innerText = "Unable to retrieve location";
        },
        { timeout: 10000 }
    );
});

// --- 2. DRAG AND DROP LOGIC ---
const draggables = document.querySelectorAll('.draggable-addon');
const dropZone = document.getElementById('drop-zone');
const appliedContainer = document.getElementById('applied-addons');

draggables.forEach(item => {
    item.addEventListener('dragstart', (e) => {
        const addonData = {
            name: item.dataset.name,
            price: item.dataset.price
        };
        e.dataTransfer.setData('text/plain', JSON.stringify(addonData));
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
    
    try {
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        selectedAddons.push(data);
        renderAddons();
        updateSummary();
    } catch (err) {
        console.error("Drop failed:", err);
    }
});

function renderAddons() {
    if (selectedAddons.length === 0) {
        appliedContainer.innerHTML = '<span class="placeholder-text">Drop Add-ons Here</span>';
        return;
    }
    appliedContainer.innerHTML = selectedAddons.map((addon, i) => `
        <span class="badge-addon">
            ${addon.name} 
            <span style="margin-left:8px; cursor:pointer" onclick="removeAddon(${i})">&times;</span>
        </span>
    `).join('');
}

window.removeAddon = (index) => {
    selectedAddons.splice(index, 1);
    renderAddons();
    updateSummary();
};

// --- 3. DYNAMIC MENU ---
async function loadMenu() {
    const drinks = [
        { name: "Espresso", price: 290, iconClass: "fas fa-coffee" },
        { name: "Latte", price: 395, iconClass: "fas fa-mug-hot" },
        { name: "Mocha", price: 420, iconClass: "fas fa-glass-whiskey" }
    ];
    
    const menu = document.getElementById('drink-menu');
    menu.innerHTML = drinks.map(d => `
        <div class="drink-item">
            <label class="drink-card-wrap">
                <input type="radio" name="drink" value="${d.name}" data-price="${d.price}" onchange="updateSummary()">
                <div class="card-inner">
                    <div style="font-size: 28px; margin-bottom: 10px;"><i class="${d.iconClass}"></i></div>
                    <div style="font-weight: bold;">${d.name}</div>
                    <div style="color: #c8813a; margin-top: 5px;">₹${d.price}</div>
                </div>
            </label>
        </div>
    `).join('');
}

// --- 4. SUMMARY & API POST ---
function updateSummary() {
    const drinkEl = document.querySelector('input[name="drink"]:checked');
    if (!drinkEl) return;

    const qty = parseInt(document.getElementById('qty-input').value) || 1;
    const basePrice = parseFloat(drinkEl.dataset.price);
    const addonPrice = selectedAddons.reduce((sum, a) => sum + parseFloat(a.price), 0);
    
    const subtotal = (basePrice + addonPrice) * qty;

    document.getElementById('summary-content').innerHTML = `
        <div style="display:flex; justify-content: space-between;">
            <span>${drinkEl.value} x${qty}</span>
            <span>₹${(basePrice * qty).toFixed(2)}</span>
        </div>
        <small style="color: #aaa; display:block; margin-top:5px;">
            Add-ons: ${selectedAddons.map(a => a.name).join(', ') || 'None'}
        </small>
    `;
    
    document.getElementById('subtotal').innerText = `₹${subtotal.toFixed(2)}`;
    document.getElementById('grand-total').innerText = `₹${subtotal.toFixed(2)}`;
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
        total: document.getElementById('grand-total').innerText,
        timestamp: new Date().toISOString()
    };

    try {
        const response = await fetch(MOCK_API, {
            method: 'POST',
            body: JSON.stringify(order),
            headers: { 'Content-type': 'application/json' }
        });

        if (response.ok) {
            alert("Order placed successfully!");
        } else {
            throw new Error("Server error");
        }
    } catch (e) {
        alert("Order failed! Please try again.");
    } finally {
        btn.disabled = false;
        btn.innerText = "Place Order";
    }
});

// Initialize on Load
loadMenu();
document.getElementById('qty-input').addEventListener('input', updateSummary);