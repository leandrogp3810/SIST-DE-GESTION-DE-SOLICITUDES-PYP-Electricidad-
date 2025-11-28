// ==================== DATA MODELS ====================

const PRODUCTS = [
    { id: 1, name: 'Cable eléctrico', stock: 100, price: 5000 },
    { id: 2, name: 'Interruptor', stock: 50, price: 1500 },
    { id: 3, name: 'Tomacorriente', stock: 75, price: 1200 },
    { id: 4, name: 'Lámpara LED', stock: 30, price: 3500 },
    { id: 5, name: 'Cinta aislante', stock: 200, price: 500 }
];

// ==================== STATE MANAGEMENT ====================

class AppState {
    constructor() {
        this.currentUser = null;
        this.users = this.loadUsers();
        this.solicitudes = this.loadSolicitudes();
        this.reclamos = this.loadReclamos();
    }

    loadUsers() {
        const users = localStorage.getItem('users');
        if (!users) {
            const defaultUsers = [
                { username: 'admin', password: 'admin', role: 'admin', name: 'Administrador' }
            ];
            localStorage.setItem('users', JSON.stringify(defaultUsers));
            return defaultUsers;
        }
        return JSON.parse(users);
    }

    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    loadSolicitudes() {
        const solicitudes = localStorage.getItem('solicitudes');
        return solicitudes ? JSON.parse(solicitudes) : [];
    }

    saveSolicitudes() {
        localStorage.setItem('solicitudes', JSON.stringify(this.solicitudes));
    }

    loadReclamos() {
        const reclamos = localStorage.getItem('reclamos');
        return reclamos ? JSON.parse(reclamos) : [];
    }

    saveReclamos() {
        localStorage.setItem('reclamos', JSON.stringify(this.reclamos));
    }

    login(username, password) {
        const user = this.users.find(u => u.username === username && u.password === password);
        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            return true;
        }
        return false;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    }

    getCurrentUser() {
        if (!this.currentUser) {
            const stored = localStorage.getItem('currentUser');
            if (stored) {
                this.currentUser = JSON.parse(stored);
            }
        }
        return this.currentUser;
    }

    createUser(userData) {
        const exists = this.users.find(u => u.username === userData.username);
        if (exists) {
            return { success: false, message: 'El usuario ya existe' };
        }

        const newUser = {
            ...userData,
            role: 'client',
            createdAt: new Date().toISOString()
        };

        this.users.push(newUser);
        this.saveUsers();
        return { success: true, message: 'Usuario creado exitosamente' };
    }

    createSolicitud(solicitudData) {
        const solicitud = {
            id: Date.now().toString(),
            ...solicitudData,
            status: 'pending',
            createdAt: new Date().toISOString(),
            createdBy: this.currentUser.username
        };

        this.solicitudes.push(solicitud);
        this.saveSolicitudes();
        return solicitud;
    }

    updateSolicitudStatus(id, status) {
        const solicitud = this.solicitudes.find(s => s.id === id);
        if (solicitud) {
            solicitud.status = status;
            solicitud.updatedAt = new Date().toISOString();
            this.saveSolicitudes();
            return true;
        }
        return false;
    }

    createReclamo(reclamoData) {
        const reclamo = {
            id: Date.now().toString(),
            ...reclamoData,
            status: 'pending',
            createdAt: new Date().toISOString(),
            createdBy: this.currentUser.username
        };

        this.reclamos.push(reclamo);
        this.saveReclamos();
        return reclamo;
    }

    getSolicitudesByUser(username) {
        return this.solicitudes.filter(s => s.createdBy === username);
    }

    getReclamosByUser(username) {
        return this.reclamos.filter(r => r.createdBy === username);
    }

    getStats() {
        return {
            pending: this.solicitudes.filter(s => s.status === 'pending').length,
            approved: this.solicitudes.filter(s => s.status === 'approved').length,
            rejected: this.solicitudes.filter(s => s.status === 'rejected').length,
            reclamos: this.reclamos.filter(r => r.status === 'pending').length
        };
    }
}

const appState = new AppState();

// ==================== UI MANAGEMENT ====================

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

function showView(viewId) {
    const isAdmin = appState.getCurrentUser()?.role === 'admin';
    const viewClass = isAdmin ? '.view' : '.view';

    document.querySelectorAll(viewClass).forEach(view => view.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
}

function showMessage(elementId, message, type = 'success') {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = type === 'success' ? 'success-message show' : 'error-message show';

    setTimeout(() => {
        element.classList.remove('show');
    }, 5000);
}

function showMessageBox(elementId, message, type = 'success') {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = `message-box ${type} show`;

    setTimeout(() => {
        element.classList.remove('show');
    }, 5000);
}

// ==================== LOGIN ====================

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (appState.login(username, password)) {
        const user = appState.getCurrentUser();

        if (user.role === 'admin') {
            showPage('adminPage');
            renderAdminDashboard();
        } else {
            showPage('clientPage');
            document.getElementById('clientSessionInfo').textContent = `Sesión activa (${user.name})`;
            renderClientDashboard();
        }

        document.getElementById('loginForm').reset();
    } else {
        showMessage('loginError', 'Usuario o contraseña incorrectos', 'error');
    }
});

// ==================== LOGOUT ====================

document.getElementById('logoutBtnAdmin').addEventListener('click', () => {
    appState.logout();
    showPage('loginPage');
});

document.getElementById('logoutBtnClient').addEventListener('click', () => {
    appState.logout();
    showPage('loginPage');
});

// ==================== ADMIN NAVIGATION ====================

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();

        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        const view = link.getAttribute('data-view');
        showView(view + 'View');

        if (view === 'solicitudes') {
            renderSolicitudes();
        } else if (view === 'despachos') {
            renderDespachos();
        } else if (view === 'reclamos') {
            renderReclamosAdmin();
        } else if (view === 'reportes') {
            renderReportes();
        } else if (view === 'usuarios') {
            renderUsuarios();
        }
    });
});

// ==================== CLIENT NAVIGATION ====================

document.querySelectorAll('.nav-link-client').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();

        document.querySelectorAll('.nav-link-client').forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        const view = link.getAttribute('data-view');
        showView(view + 'View');

        if (view === 'nuevaSolicitud') {
            initNuevaSolicitudForm();
        } else if (view === 'misSolicitudes') {
            renderMisSolicitudes();
        } else if (view === 'misReclamos') {
            renderMisReclamos();
        }
    });
});

// ==================== ADMIN DASHBOARD ====================

function renderAdminDashboard() {
    renderSolicitudes();
}

function renderSolicitudes() {
    const container = document.getElementById('solicitudesList');
    const pendingSolicitudes = appState.solicitudes.filter(s => s.status === 'pending');

    if (pendingSolicitudes.length === 0) {
        container.innerHTML = '<div class="empty-state"><h3>No hay solicitudes pendientes</h3></div>';
        return;
    }

    container.innerHTML = pendingSolicitudes.map(solicitud => {
        const totalAmount = solicitud.productos.reduce((sum, p) => {
            const product = PRODUCTS.find(prod => prod.id === p.productId);
            return sum + (product.price * p.quantity);
        }, 0);

        const hasStockIssues = solicitud.productos.some(p => {
            const product = PRODUCTS.find(prod => prod.id === p.productId);
            return p.quantity > product.stock;
        });

        return `
            <div class="solicitud-card">
                <div class="solicitud-header">
                    <div>
                        <h3>Solicitud #${solicitud.id}</h3>
                        <p style="color: var(--gray-600); margin-top: 0.25rem;">
                            ${new Date(solicitud.createdAt).toLocaleString('es-AR')}
                        </p>
                    </div>
                    <span class="badge badge-pending">Pendiente</span>
                </div>
                
                <div class="solicitud-info">
                    <p><strong>Cliente:</strong> ${solicitud.clientName}</p>
                    <p><strong>Teléfono:</strong> ${solicitud.clientPhone}</p>
                    <p><strong>Email:</strong> ${solicitud.clientEmail}</p>
                </div>
                
                <h4>Productos:</h4>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Stock Disponible</th>
                            <th>Precio Unit.</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${solicitud.productos.map(p => {
            const product = PRODUCTS.find(prod => prod.id === p.productId);
            const stockIssue = p.quantity > product.stock;
            return `
                                <tr style="${stockIssue ? 'background: #fef3c7;' : ''}">
                                    <td>${product.name}</td>
                                    <td>${p.quantity}</td>
                                    <td>${product.stock}</td>
                                    <td>$${product.price.toLocaleString('es-AR')}</td>
                                    <td>$${(product.price * p.quantity).toLocaleString('es-AR')}</td>
                                </tr>
                            `;
        }).join('')}
                    </tbody>
                </table>
                
                ${hasStockIssues ? `
                    <div class="stock-warning">
                        Stock insuficiente para uno o más productos
                    </div>
                ` : ''}
                
                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 2px solid var(--gray-200);">
                    <p style="font-size: 1.25rem; font-weight: 700;">
                        Total: $${totalAmount.toLocaleString('es-AR')}
                    </p>
                </div>
                
                <div class="solicitud-actions">
                    <button class="btn btn-danger" onclick="rechazarSolicitud('${solicitud.id}')">
                        Rechazar
                    </button>
                    <button class="btn btn-success" onclick="aprobarSolicitud('${solicitud.id}')">
                        Confirmar
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function aprobarSolicitud(id) {
    appState.updateSolicitudStatus(id, 'approved');
    renderSolicitudes();
    renderDespachos();
}

function rechazarSolicitud(id) {
    appState.updateSolicitudStatus(id, 'rejected');
    renderSolicitudes();
}

function renderDespachos() {
    const container = document.getElementById('despachosList');
    const approvedSolicitudes = appState.solicitudes.filter(s => s.status === 'approved');

    if (approvedSolicitudes.length === 0) {
        container.innerHTML = '<div class="empty-state"><h3>No hay despachos pendientes</h3></div>';
        return;
    }

    container.innerHTML = approvedSolicitudes.map(solicitud => {
        const totalAmount = solicitud.productos.reduce((sum, p) => {
            const product = PRODUCTS.find(prod => prod.id === p.productId);
            return sum + (product.price * p.quantity);
        }, 0);

        return `
            <div class="solicitud-card">
                <div class="solicitud-header">
                    <div>
                        <h3>Pedido #${solicitud.id}</h3>
                        <p style="color: var(--gray-600); margin-top: 0.25rem;">
                            Aprobado: ${new Date(solicitud.updatedAt).toLocaleString('es-AR')}
                        </p>
                    </div>
                    <span class="badge badge-approved">Aprobado</span>
                </div>
                
                <div class="solicitud-info">
                    <p><strong>Cliente:</strong> ${solicitud.clientName}</p>
                    <p><strong>Teléfono:</strong> ${solicitud.clientPhone}</p>
                    <p><strong>Email:</strong> ${solicitud.clientEmail}</p>
                </div>
                
                <h4>Productos:</h4>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${solicitud.productos.map(p => {
            const product = PRODUCTS.find(prod => prod.id === p.productId);
            return `
                                <tr>
                                    <td>${product.name}</td>
                                    <td>${p.quantity}</td>
                                    <td>$${(product.price * p.quantity).toLocaleString('es-AR')}</td>
                                </tr>
                            `;
        }).join('')}
                    </tbody>
                </table>
                
                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 2px solid var(--gray-200);">
                    <p style="font-size: 1.25rem; font-weight: 700;">
                        Total: $${totalAmount.toLocaleString('es-AR')}
                    </p>
                </div>
                
                <div class="solicitud-actions">
                    <button class="btn btn-primary" onclick="enviarALogistica('${solicitud.id}')">
                        Enviar a Logística
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function enviarALogistica(id) {
    appState.updateSolicitudStatus(id, 'distribution');
    document.getElementById('statAprobadas').textContent = stats.approved;
    document.getElementById('statRechazadas').textContent = stats.rejected;
    document.getElementById('statReclamos').textContent = stats.reclamos;
}

function renderUsuarios() {
    const clientUsers = appState.users.filter(u => u.role === 'client');
    const container = document.getElementById('usersList');

    if (clientUsers.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No hay usuarios clientes registrados</p></div>';
        return;
    }

    container.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>Usuario</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Fecha de Creación</th>
                </tr>
            </thead>
            <tbody>
                ${clientUsers.map(user => `
                    <tr>
                        <td>${user.username}</td>
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                        <td>${user.phone}</td>
                        <td>${new Date(user.createdAt).toLocaleDateString('es-AR')}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// ==================== CREATE USER ====================

document.getElementById('createUserForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const userData = {
        username: document.getElementById('newUsername').value,
        password: document.getElementById('newPassword').value,
        name: document.getElementById('newUserName').value,
        email: document.getElementById('newUserEmail').value,
        phone: document.getElementById('newUserPhone').value
    };

    const result = appState.createUser(userData);

    if (result.success) {
        showMessage('createUserMessage', result.message, 'success');
        document.getElementById('createUserForm').reset();
        renderUsuarios();
    } else {
        showMessage('createUserMessage', result.message, 'error');
    }
});

// ==================== CLIENT DASHBOARD ====================

function renderClientDashboard() {
    initNuevaSolicitudForm();
}

function initNuevaSolicitudForm() {
    const user = appState.getCurrentUser();

    // Pre-fill user data if available
    if (user.name) document.getElementById('clientName').value = user.name;
    if (user.phone) document.getElementById('clientPhone').value = user.phone;
    if (user.email) document.getElementById('clientEmail').value = user.email;

    // Populate product selects
    updateProductSelects();
}

function updateProductSelects() {
    const selects = document.querySelectorAll('.producto-select');
    selects.forEach(select => {
        select.innerHTML = '<option value="">Seleccione un producto...</option>' +
            PRODUCTS.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    });
}

// Handle product selection
document.addEventListener('change', (e) => {
    if (e.target.classList.contains('producto-select')) {
        const productItem = e.target.closest('.producto-item');
        const stockDisplay = productItem.querySelector('.stock-display');
        const productId = parseInt(e.target.value);

        if (productId) {
            const product = PRODUCTS.find(p => p.id === productId);
            stockDisplay.value = product.stock;
        } else {
            stockDisplay.value = '';
        }

        // Reset verification
        document.getElementById('confirmarSolicitudBtn').disabled = true;
    }
});

// Add product button
document.getElementById('addProductBtn').addEventListener('click', () => {
    const container = document.getElementById('productosContainer');
    const newItem = document.createElement('div');
    newItem.className = 'producto-item';
    newItem.innerHTML = `
        <div class="form-row">
            <div class="form-group" style="flex: 2;">
                <label>Producto</label>
                <select class="producto-select" required>
                    <option value="">Seleccione un producto...</option>
                    ${PRODUCTS.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Cantidad</label>
                <input type="number" class="cantidad-input" min="1" required>
            </div>
            <div class="form-group">
                <label>Stock Disponible</label>
                <input type="text" class="stock-display" readonly>
            </div>
        </div>
        <div class="stock-warning" style="display: none;"></div>
    `;
    container.appendChild(newItem);
});

// Verify stock
document.getElementById('verificarStockBtn').addEventListener('click', () => {
    const productItems = document.querySelectorAll('.producto-item');
    let allValid = true;

    productItems.forEach(item => {
        const select = item.querySelector('.producto-select');
        const quantityInput = item.querySelector('.cantidad-input');
        const warning = item.querySelector('.stock-warning');

        const productId = parseInt(select.value);
        const quantity = parseInt(quantityInput.value);

        if (productId && quantity) {
            const product = PRODUCTS.find(p => p.id === productId);

            if (quantity > product.stock) {
                warning.textContent = `Stock insuficiente para el producto: ${product.name}. Disponible: ${product.stock}`;
                warning.style.display = 'flex';
                allValid = false;
            } else {
                warning.style.display = 'none';
            }
        }
    });

    if (allValid) {
        showMessageBox('solicitudMessage', 'Stock disponible. Solicitud validada.', 'success');
        document.getElementById('confirmarSolicitudBtn').disabled = false;
    } else {
        showMessageBox('solicitudMessage', 'Hay problemas de stock. Por favor revise.', 'error');
        document.getElementById('confirmarSolicitudBtn').disabled = true;
    }
});

// Submit solicitud
document.getElementById('nuevaSolicitudForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const productItems = document.querySelectorAll('.producto-item');
    const productos = [];

    productItems.forEach(item => {
        const select = item.querySelector('.producto-select');
        const quantityInput = item.querySelector('.cantidad-input');

        const productId = parseInt(select.value);
        const quantity = parseInt(quantityInput.value);

        if (productId && quantity) {
            productos.push({ productId, quantity });
        }
    });

    if (productos.length === 0) {
        showMessageBox('solicitudMessage', 'Debe agregar al menos un producto', 'error');
        return;
    }

    const solicitudData = {
        clientName: document.getElementById('clientName').value,
        clientPhone: document.getElementById('clientPhone').value,
        clientEmail: document.getElementById('clientEmail').value,
        productos
    };

    const solicitud = appState.createSolicitud(solicitudData);

    showMessageBox('solicitudMessage', `Solicitud #${solicitud.id} creada exitosamente`, 'success');
    document.getElementById('nuevaSolicitudForm').reset();
    document.getElementById('confirmarSolicitudBtn').disabled = true;

    // Reset product container
    document.getElementById('productosContainer').innerHTML = `
        <div class="producto-item">
            <div class="form-row">
                <div class="form-group" style="flex: 2;">
                    <label>Producto</label>
                    <select class="producto-select" required>
                        <option value="">Seleccione un producto...</option>
                        ${PRODUCTS.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Cantidad</label>
                    <input type="number" class="cantidad-input" min="1" required>
                </div>
                <div class="form-group">
                    <label>Stock Disponible</label>
                    <input type="text" class="stock-display" readonly>
                </div>
            </div>
            <div class="stock-warning" style="display: none;"></div>
        </div>
    `;
});

// Render mis solicitudes
function renderMisSolicitudes() {
    const container = document.getElementById('misSolicitudesList');
    const user = appState.getCurrentUser();
    const solicitudes = appState.getSolicitudesByUser(user.username);

    if (solicitudes.length === 0) {
        container.innerHTML = '<div class="empty-state"><h3>No tiene solicitudes registradas</h3></div>';
        return;
    }

    container.innerHTML = solicitudes.map(solicitud => {
        const totalAmount = solicitud.productos.reduce((sum, p) => {
            const product = PRODUCTS.find(prod => prod.id === p.productId);
            return sum + (product.price * p.quantity);
        }, 0);

        const statusText = {
            pending: 'Pendiente',
            approved: 'Aprobado',
            rejected: 'Rechazado',
            distribution: 'En distribución'
        };

        const statusBadge = {
            pending: 'badge-pending',
            approved: 'badge-approved',
            rejected: 'badge-rejected',
            distribution: 'badge-distribution'
        };

        return `
            <div class="solicitud-card">
                <div class="solicitud-header">
                    <div>
                        <h3>Pedido #${solicitud.id}</h3>
                        <p style="color: var(--gray-600); margin-top: 0.25rem;">
                            ${new Date(solicitud.createdAt).toLocaleString('es-AR')}
                        </p>
                    </div>
                    <span class="badge ${statusBadge[solicitud.status]}">
                        ${statusText[solicitud.status]}
                    </span>
                </div>
                
                <table class="table">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${solicitud.productos.map(p => {
            const product = PRODUCTS.find(prod => prod.id === p.productId);
            return `
                                <tr>
                                    <td>${product.name}</td>
                                    <td>${p.quantity}</td>
                                    <td>$${(product.price * p.quantity).toLocaleString('es-AR')}</td>
                                </tr>
                            `;
        }).join('')}
                    </tbody>
                </table>
                
                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 2px solid var(--gray-200);">
                    <p style="font-size: 1.25rem; font-weight: 700;">
                        Total: $${totalAmount.toLocaleString('es-AR')}
                    </p>
                </div>
                
                ${solicitud.status === 'approved' || solicitud.status === 'distribution' ? `
                    <div class="solicitud-actions">
                        <button class="btn btn-secondary" onclick="registrarReclamoDesde('${solicitud.id}')">
                            Registrar Reclamo
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

function registrarReclamoDesde(orderId) {
    // Switch to reclamo view and pre-fill order number
    document.querySelectorAll('.nav-link-client').forEach(l => l.classList.remove('active'));
    document.querySelector('[data-view="nuevoReclamo"]').classList.add('active');
    showView('nuevoReclamoView');
    document.getElementById('reclamoNumPedido').value = orderId;
}

// Submit reclamo
document.getElementById('nuevoReclamoForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const user = appState.getCurrentUser();

    // Collect all form data
    const reclamoData = {
        // Client information
        clientName: document.getElementById('reclamoClientName').value,
        clientPhone: document.getElementById('reclamoClientPhone').value,
        clientEmail: document.getElementById('reclamoClientEmail').value,

        // Complaint information
        orderNumber: document.getElementById('reclamoNumPedido').value,
        orderDate: document.getElementById('reclamoFechaPedido').value,
        tipo: document.getElementById('reclamoTipo').value,
        prioridad: document.getElementById('reclamoPrioridad').value,
        productoAfectado: document.getElementById('reclamoProductoAfectado').value,
        description: document.getElementById('reclamoDescripcion').value,
        solucionEsperada: document.getElementById('reclamoSolucionEsperada').value,

        // Contact preferences
        contactoPreferido: document.getElementById('reclamoContactoPreferido').value,
        horarioContacto: document.getElementById('reclamoHorarioContacto').value,

        // File attachments (store file names)
        archivos: Array.from(document.getElementById('reclamoArchivos').files).map(f => f.name)
    };

    const reclamo = appState.createReclamo(reclamoData);

    showMessageBox('reclamoMessage', `Reclamo #${reclamo.id} registrado exitosamente. Nos pondremos en contacto pronto.`, 'success');
    document.getElementById('nuevoReclamoForm').reset();

    // Scroll to top to see the message
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Pre-fill client data when form loads
document.addEventListener('DOMContentLoaded', () => {
    const user = appState.getCurrentUser();
    if (user && user.role === 'client') {
        // Pre-fill client info in reclamo form
        if (user.name) document.getElementById('reclamoClientName').value = user.name;
        if (user.phone) document.getElementById('reclamoClientPhone').value = user.phone;
        if (user.email) document.getElementById('reclamoClientEmail').value = user.email;
    }
});

// Render mis reclamos
function renderMisReclamos() {
    const container = document.getElementById('misReclamosList');
    const user = appState.getCurrentUser();
    const reclamos = appState.getReclamosByUser(user.username);

    if (reclamos.length === 0) {
        container.innerHTML = '<div class="empty-state"><h3>No tiene reclamos registrados</h3></div>';
        return;
    }

    container.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Número de Pedido</th>
                    <th>Descripción</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
                ${reclamos.map(reclamo => `
                    <tr>
                        <td>#${reclamo.id}</td>
                        <td>${reclamo.orderNumber}</td>
                        <td>${reclamo.description}</td>
                        <td>${new Date(reclamo.createdAt).toLocaleDateString('es-AR')}</td>
                        <td>
                            <span class="badge badge-${reclamo.status === 'pending' ? 'pending' : 'approved'}">
                                ${reclamo.status === 'pending' ? 'Pendiente' : 'Resuelto'}
                            </span>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// ==================== INITIALIZATION ====================

// Check if user is already logged in
const currentUser = appState.getCurrentUser();
if (currentUser) {
    if (currentUser.role === 'admin') {
        showPage('adminPage');
        renderAdminDashboard();
    } else {
        showPage('clientPage');
        document.getElementById('clientSessionInfo').textContent = `Sesión activa (${currentUser.name})`;
        renderClientDashboard();
    }
}
