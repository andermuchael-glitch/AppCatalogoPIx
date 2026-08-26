// Configuração da API
const API_URL = 'https://app-catalogo-pix.vercel.app/api';

// Estado do app
let produtos = [];
let clientes = [];
let pedidos = [];
let carrinho = [];

// ============ INICIALIZAÇÃO ============
document.addEventListener('DOMContentLoaded', function() {
    carregarProdutos();
});

// ============ NAVEGAÇÃO ============
function mostrarProdutos() {
    document.getElementById('section-produtos').style.display = 'block';
    document.getElementById('section-clientes').style.display = 'none';
    document.getElementById('section-pedidos').style.display = 'none';
    atualizarNav('produtos');
    carregarProdutos();
}

function mostrarClientes() {
    document.getElementById('section-produtos').style.display = 'none';
    document.getElementById('section-clientes').style.display = 'block';
    document.getElementById('section-pedidos').style.display = 'none';
    atualizarNav('clientes');
    carregarClientes();
}

function mostrarPedidos() {
    document.getElementById('section-produtos').style.display = 'none';
    document.getElementById('section-clientes').style.display = 'none';
    document.getElementById('section-pedidos').style.display = 'block';
    atualizarNav('pedidos');
    carregarPedidos();
}

function atualizarNav(secao) {
    const botoes = document.querySelectorAll('header nav button');
    botoes.forEach(btn => btn.classList.remove('active'));
    if (secao === 'produtos') botoes[0].classList.add('active');
    else if (secao === 'clientes') botoes[1].classList.add('active');
    else if (secao === 'pedidos') botoes[2].classList.add('active');
}

// ============ PRODUTOS ============
async function carregarProdutos() {
    const container = document.getElementById('lista-produtos');
    container.innerHTML = '<div class="loading">Carregando produtos</div>';
    
    try {
        const response = await fetch(`${API_URL}/produtos`);
        produtos = await response.json();
        renderizarProdutos();
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        container.innerHTML = `
            <div style="text-align:center;padding:40px;color:#666;">
                <p>⚠️ Erro ao carregar produtos</p>
                <p style="font-size:12px;margin-top:10px;">${error.message}</p>
                <button onclick="carregarProdutos()" class="btn-primary" style="margin-top:15px;">Tentar novamente</button>
            </div>
        `;
    }
}

function renderizarProdutos() {
    const container = document.getElementById('lista-produtos');
    
    if (produtos.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:40px;color:#999;grid-column:1/-1;">
                <p>📦 Nenhum produto cadastrado</p>
                <button onclick="abrirFormProduto()" class="btn-primary" style="margin-top:15px;">Adicionar primeiro produto</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = produtos.map(prod => `
        <div class="card-produto">
            <h3>${prod.nome || prod.name || 'Produto'}</h3>
            <div class="preco">R$ ${(prod.preco || prod.price || 0).toFixed(2)}</div>
            <div class="descricao">${prod.descricao || prod.description || 'Sem descrição'}</div>
            <div class="actions">
                <button onclick="comprarProduto('${prod._id || prod.id}')" class="btn-secondary">🛒 Comprar</button>
                <button onclick="excluirProduto('${prod._id || prod.id}')" class="btn-danger">🗑️</button>
            </div>
        </div>
    `).join('');
}

function abrirFormProduto() {
    const modal = document.getElementById('modal');
    const body = document.getElementById('modal-body');
    
    body.innerHTML = `
        <h2 style="margin-bottom:20px;">Novo Produto</h2>
        <form id="form-produto" onsubmit="salvarProduto(event)">
            <div class="form-group">
                <label>Nome do Produto</label>
                <input type="text" id="produto-nome" required placeholder="Ex: Smartphone X">
            </div>
            <div class="form-group">
                <label>Descrição</label>
                <textarea id="produto-descricao" rows="3" placeholder="Descrição do produto"></textarea>
            </div>
            <div class="form-group">
                <label>Preço (R$)</label>
                <input type="number" id="produto-preco" step="0.01" required placeholder="0.00">
            </div>
            <div class="form-group">
                <label>Categoria</label>
                <select id="produto-categoria">
                    <option value="Eletrônicos">Eletrônicos</option>
                    <option value="Roupas">Roupas</option>
                    <option value="Casa">Casa</option>
                    <option value="Outros">Outros</option>
                </select>
            </div>
            <button type="submit" class="btn-success">Salvar Produto</button>
        </form>
    `;
    
    modal.style.display = 'block';
}

async function salvarProduto(event) {
    event.preventDefault();
    
    const produto = {
        nome: document.getElementById('produto-nome').value,
        descricao: document.getElementById('produto-descricao').value,
        preco: parseFloat(document.getElementById('produto-preco').value),
        categoria: document.getElementById('produto-categoria').value
    };
    
    try {
        const response = await fetch(`${API_URL}/produtos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(produto)
        });
        
        if (response.ok) {
            fecharModal();
            carregarProdutos();
            alert('✅ Produto cadastrado com sucesso!');
        } else {
            alert('❌ Erro ao cadastrar produto');
        }
    } catch (error) {
        alert('❌ Erro ao conectar com o servidor');
        console.error(error);
    }
}

async function excluirProduto(id) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    
    try {
        const response = await fetch(`${API_URL}/produtos/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            carregarProdutos();
            alert('✅ Produto excluído!');
        }
    } catch (error) {
        alert('❌ Erro ao excluir produto');
    }
}

function comprarProduto(id) {
    const produto = produtos.find(p => (p._id || p.id) === id);
    if (!produto) return;
    
    // Adicionar ao carrinho
    carrinho.push(produto);
    alert(`🛒 ${produto.nome || produto.name} adicionado ao carrinho!`);
}

// ============ CLIENTES ============
async function carregarClientes() {
    const container = document.getElementById('lista-clientes');
    container.innerHTML = '<div class="loading">Carregando clientes</div>';
    
    try {
        const response = await fetch(`${API_URL}/clientes`);
        clientes = await response.json();
        renderizarClientes();
    } catch (error) {
        console.error('Erro ao carregar clientes:', error);
        container.innerHTML = `
            <div style="text-align:center;padding:40px;color:#666;">
                <p>⚠️ Erro ao carregar clientes</p>
                <button onclick="carregarClientes()" class="btn-primary" style="margin-top:15px;">Tentar novamente</button>
            </div>
        `;
    }
}

function renderizarClientes() {
    const container = document.getElementById('lista-clientes');
    
    if (clientes.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:40px;color:#999;grid-column:1/-1;">
                <p>👤 Nenhum cliente cadastrado</p>
                <button onclick="abrirFormCliente()" class="btn-primary" style="margin-top:15px;">Cadastrar primeiro cliente</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = clientes.map(cli => `
        <div class="card-cliente">
            <h3>${cli.nome || cli.name || 'Cliente'}</h3>
            <div class="email">📧 ${cli.email || 'Sem email'}</div>
            <div class="cpf">🆔 ${cli.cpf || 'Sem CPF'}</div>
            <div class="pix-key">💳 Chave Pix: ${cli.pixKey || 'N/A'}</div>
        </div>
    `).join('');
}

function abrirFormCliente() {
    const modal = document.getElementById('modal');
    const body = document.getElementById('modal-body');
    
    body.innerHTML = `
        <h2 style="margin-bottom:20px;">Novo Cliente</h2>
        <form id="form-cliente" onsubmit="salvarCliente(event)">
            <div class="form-group">
                <label>Nome Completo</label>
                <input type="text" id="cliente-nome" required placeholder="Ex: João Silva">
            </div>
            <div class="form-group">
                <label>E-mail</label>
                <input type="email" id="cliente-email" required placeholder="joao@email.com">
            </div>
            <div class="form-group">
                <label>Telefone</label>
                <input type="text" id="cliente-telefone" placeholder="(11) 99999-9999">
            </div>
            <div class="form-group">
                <label>CPF (Apenas números)</label>
                <input type="text" id="cliente-cpf" required placeholder="12345678900" maxlength="11">
            </div>
            <button type="submit" class="btn-success">Cadastrar Cliente</button>
        </form>
    `;
    
    modal.style.display = 'block';
}

async function salvarCliente(event) {
    event.preventDefault();
    
    const cliente = {
        nome: document.getElementById('cliente-nome').value,
        email: document.getElementById('cliente-email').value,
        telefone: document.getElementById('cliente-telefone').value,
        cpf: document.getElementById('cliente-cpf').value
    };
    
    try {
        const response = await fetch(`${API_URL}/clientes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cliente)
        });
        
        if (response.ok) {
            fecharModal();
            carregarClientes();
            alert('✅ Cliente cadastrado com sucesso!');
        } else {
            const erro = await response.json();
            alert('❌ ' + (erro.error || 'Erro ao cadastrar cliente'));
        }
    } catch (error) {
        alert('❌ Erro ao conectar com o servidor');
        console.error(error);
    }
}

// ============ PEDIDOS ============
async function carregarPedidos() {
    const container = document.getElementById('lista-pedidos');
    container.innerHTML = '<div class="loading">Carregando pedidos</div>';
    
    try {
        const response = await fetch(`${API_URL}/pedidos`);
        pedidos = await response.json();
        renderizarPedidos();
    } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
        container.innerHTML = `
            <div style="text-align:center;padding:40px;color:#666;">
                <p>⚠️ Erro ao carregar pedidos</p>
                <button onclick="carregarPedidos()" class="btn-primary" style="margin-top:15px;">Tentar novamente</button>
            </div>
        `;
    }
}

function renderizarPedidos() {
    const container = document.getElementById('lista-pedidos');
    
    if (pedidos.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:40px;color:#999;grid-column:1/-1;">
                <p>📋 Nenhum pedido realizado</p>
                <button onclick="mostrarProdutos()" class="btn-primary" style="margin-top:15px;">Comprar produtos</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = pedidos.map(ped => `
        <div class="card-cliente">
            <h3>Pedido #${ped.id || ped._id}</h3>
            <div style="margin:10px 0;">
                <strong>Total:</strong> R$ ${(ped.total || 0).toFixed(2)}
            </div>
            <div style="margin:10px 0;">
                <strong>Status:</strong>
                <span class="${ped.status === 'PENDING' ? 'status-pending' : 'status-paid'}">
                    ${ped.status === 'PENDING' ? '⏳ Aguardando pagamento' : '✅ Pago'}
                </span>
            </div>
            <div style="font-size:13px;color:#999;margin-top:10px;">
                ${new Date(ped.createdAt).toLocaleDateString()}
            </div>
        </div>
    `).join('');
}

// ============ MODAIS ============
function fecharModal() {
    document.getElementById('modal').style.display = 'none';
}

function fecharModalPix() {
    document.getElementById('modal-pix').style.display = 'none';
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    const modalPix = document.getElementById('modal-pix');
    if (event.target === modal) fecharModal();
    if (event.target === modalPix) fecharModalPix();
}

// ============ FUNÇÕES DE PAGAMENTO PIX ============
async function gerarPagamentoPix(total) {
    const modal = document.getElementById('modal-pix');
    const body = document.getElementById('modal-pix-body');
    
    body.innerHTML = `
        <h2 style="margin-bottom:20px;">💳 Pagamento com Pix</h2>
        <div style="text-align:center;padding:10px;">
            <p style="font-size:24px;font-weight:bold;color:#4CAF50;">
                R$ ${total.toFixed(2)}
            </p>
            <div class="qr-container">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${Date.now()}" alt="QR Code Pix">
                <p style="color:#666;font-size:14px;">Escaneie o QR Code com seu banco</p>
            </div>
            <div style="background:#f5f5f5;padding:10px;border-radius:5px;margin:10px 0;">
                <p style="font-size:12px;color:#999;">Chave Pix: chave-pix-simulada@email.com</p>
            </div>
            <div class="status-pending" style="margin:10px 0;">
                ⏳ Aguardando pagamento...
            </div>
            <button onclick="simularPagamento()" class="btn-success" style="margin-top:10px;">
                ✅ Simular Pagamento (Teste)
            </button>
            <button onclick="fecharModalPix()" class="btn-secondary" style="margin-top:10px;width:100%;">
                Fechar
            </button>
        </div>
    `;
    
    modal.style.display = 'block';
}

function simularPagamento() {
    const statusDiv = document.querySelector('.status-pending');
    const botao = document.querySelector('.btn-success');
    
    if (statusDiv) {
        statusDiv.className = 'status-paid';
        statusDiv.innerHTML = '✅ Pagamento confirmado!';
    }
    
    if (botao) {
        botao.textContent = '🎉 Pedido Confirmado!';
        botao.style.background = '#2E7D32';
    }
}

// ============ CARRINHO (Função simples) ============
function verCarrinho() {
    if (carrinho.length === 0) {
        alert('🛒 Carrinho vazio!');
        return;
    }
    
    const total = carrinho.reduce((sum, p) => sum + (p.preco || p.price || 0), 0);
    const msg = carrinho.map(p => `- ${p.nome || p.name}: R$ ${(p.preco || p.price || 0).toFixed(2)}`).join('\n');
    
    if (confirm(`🛒 Seu carrinho:\n\n${msg}\n\nTotal: R$ ${total.toFixed(2)}\n\nDeseja finalizar a compra?`)) {
        gerarPagamentoPix(total);
    }
}

// ============ INICIAR COM PRODUTOS ============
mostrarProdutos();

// Adicionar atalho para o carrinho
console.log('🛒 Catálogo Pix carregado!');
console.log('📱 Use as funções:');
console.log('  - mostrarProdutos()');
console.log('  - mostrarClientes()');
console.log('  - verCarrinho()');
