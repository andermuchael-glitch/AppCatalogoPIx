// Configuração da API
const API_URL = (window.APP_API_URL || 'https://app-catalogo-pix.vercel.app/api').replace(/\/$/, '');

let produtos = [];
let clientes = [];
let pedidos = [];
let carrinho = [];

document.addEventListener('DOMContentLoaded', carregarProdutos);

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
    document.querySelectorAll('header nav button').forEach(btn => btn.classList.remove('active'));
    const mapa = { produtos: 0, clientes: 1, pedidos: 2 };
    document.querySelectorAll('header nav button')[mapa[secao]]?.classList.add('active');
}

async function apiFetch(url, options = {}) {
    const response = await fetch(url, options);
    const text = await response.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = { error: text || 'Resposta inválida do servidor' }; }
    if (!response.ok) throw new Error(data?.error || `Erro HTTP ${response.status}`);
    return data;
}

async function carregarProdutos() {
    const container = document.getElementById('lista-produtos');
    container.innerHTML = '<div class="loading">Carregando produtos...</div>';
    try { produtos = await apiFetch(`${API_URL}/produtos`); renderizarProdutos(); }
    catch (error) { console.error(error); container.innerHTML = `<div style="text-align:center;padding:40px;color:#666"><p>⚠️ Erro ao carregar produtos</p><p style="font-size:12px">${escapeHtml(error.message)}</p><button onclick="carregarProdutos()" class="btn-primary">Tentar novamente</button></div>`; }
}
function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function produtoId(prod) { return String(prod.id || prod._id || ''); }
function renderizarProdutos() {
    const container = document.getElementById('lista-produtos');
    if (!produtos.length) { container.innerHTML = '<div style="text-align:center;padding:40px;color:#999;grid-column:1/-1"><p>📦 Nenhum produto cadastrado</p><button onclick="abrirFormProduto()" class="btn-primary">Adicionar primeiro produto</button></div>'; return; }
    container.innerHTML = produtos.map(prod => {
        const preco = Number(prod.preco ?? prod.price ?? 0);
        const id = produtoId(prod);
        return `<div class="card-produto"><h3>${escapeHtml(prod.nome || prod.name || 'Produto')}</h3><div class="preco">R$ ${preco.toFixed(2).replace('.', ',')}</div><div class="descricao">${escapeHtml(prod.descricao || prod.description || 'Sem descrição')}</div><div class="actions"><button onclick="comprarProduto('${escapeHtml(id)}')" class="btn-secondary">🛒 Comprar</button><button onclick="excluirProduto('${escapeHtml(id)}')" class="btn-danger">🗑️</button></div></div>`;
    }).join('');
}
function abrirFormProduto() {
    document.getElementById('modal-body').innerHTML = `<h2 style="margin-bottom:20px">Novo Produto</h2><form id="form-produto" onsubmit="salvarProduto(event)"><div class="form-group"><label>Nome do Produto</label><input type="text" id="produto-nome" required></div><div class="form-group"><label>Descrição</label><textarea id="produto-descricao" rows="3"></textarea></div><div class="form-group"><label>Preço (R$)</label><input type="number" id="produto-preco" step="0.01" min="0" required></div><div class="form-group"><label>Categoria</label><select id="produto-categoria"><option>Eletrônicos</option><option>Roupas</option><option>Casa</option><option>Outros</option></select></div><button type="submit" class="btn-success">Salvar Produto</button></form>`;
    document.getElementById('modal').style.display = 'block';
}
async function salvarProduto(event) {
    event.preventDefault();
    try {
        await apiFetch(`${API_URL}/produtos`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ nome:document.getElementById('produto-nome').value.trim(), descricao:document.getElementById('produto-descricao').value.trim(), preco:Number(document.getElementById('produto-preco').value), categoria:document.getElementById('produto-categoria').value }) });
        fecharModal(); await carregarProdutos(); alert('✅ Produto cadastrado com sucesso!');
    } catch(error) { alert(`❌ ${error.message}`); }
}
async function excluirProduto(id) {
    if (!id || !confirm('Tem certeza que deseja excluir este produto?')) return;
    try { await apiFetch(`${API_URL}/produtos?id=${encodeURIComponent(id)}`, { method:'DELETE' }); await carregarProdutos(); alert('✅ Produto excluído!'); }
    catch(error) { alert(`❌ ${error.message}`); }
}
function comprarProduto(id) {
    const produto = produtos.find(p => produtoId(p) === String(id));
    if (!produto) return;
    carrinho.push(produto);
    alert(`🛒 ${produto.nome || produto.name} adicionado ao carrinho!`);
}

async function carregarClientes() {
    const container = document.getElementById('lista-clientes'); container.innerHTML = '<div class="loading">Carregando clientes...</div>';
    try { clientes = await apiFetch(`${API_URL}/clientes`); renderizarClientes(); }
    catch(error) { console.error(error); container.innerHTML = `<div style="text-align:center;padding:40px;color:#666"><p>⚠️ Erro ao carregar clientes</p><p>${escapeHtml(error.message)}</p><button onclick="carregarClientes()" class="btn-primary">Tentar novamente</button></div>`; }
}
function renderizarClientes() {
    const container = document.getElementById('lista-clientes');
    if (!clientes.length) { container.innerHTML = '<div style="text-align:center;padding:40px;color:#999;grid-column:1/-1"><p>👤 Nenhum cliente cadastrado</p><button onclick="abrirFormCliente()" class="btn-primary">Cadastrar primeiro cliente</button></div>'; return; }
    container.innerHTML = clientes.map(cli => `<div class="card-cliente"><h3>${escapeHtml(cli.nome || cli.name || 'Cliente')}</h3><div class="email">📧 ${escapeHtml(cli.email || 'Sem email')}</div><div>📱 ${escapeHtml(cli.telefone || 'Sem telefone')}</div><div class="cpf">🆔 ${escapeHtml(cli.cpf || 'Sem CPF')}</div><div class="pix-key">💳 Chave Pix: ${escapeHtml(cli.pixKey || 'N/A')}</div></div>`).join('');
}
function abrirFormCliente() {
    document.getElementById('modal-body').innerHTML = `<h2 style="margin-bottom:20px">Novo Cliente</h2><form onsubmit="salvarCliente(event)"><div class="form-group"><label>Nome Completo</label><input type="text" id="cliente-nome" required></div><div class="form-group"><label>E-mail</label><input type="email" id="cliente-email" required></div><div class="form-group"><label>Telefone</label><input type="text" id="cliente-telefone"></div><div class="form-group"><label>CPF</label><input type="text" id="cliente-cpf" required maxlength="11" inputmode="numeric"></div><button type="submit" class="btn-success">Cadastrar Cliente</button></form>`;
    document.getElementById('modal').style.display = 'block';
}
async function salvarCliente(event) {
    event.preventDefault();
    try {
        await apiFetch(`${API_URL}/clientes`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({nome:document.getElementById('cliente-nome').value.trim(),email:document.getElementById('cliente-email').value.trim(),telefone:document.getElementById('cliente-telefone').value.trim(),cpf:document.getElementById('cliente-cpf').value.replace(/\D/g,'')}) });
        fecharModal(); await carregarClientes(); alert('✅ Cliente cadastrado com sucesso!');
    } catch(error) { alert(`❌ ${error.message}`); }
}

async function carregarPedidos() {
    const container = document.getElementById('lista-pedidos'); container.innerHTML = '<div class="loading">Carregando pedidos...</div>';
    try { pedidos = await apiFetch(`${API_URL}/pedidos`); renderizarPedidos(); }
    catch(error) { console.error(error); container.innerHTML = `<div style="text-align:center;padding:40px;color:#666"><p>⚠️ Erro ao carregar pedidos</p><p>${escapeHtml(error.message)}</p><button onclick="carregarPedidos()" class="btn-primary">Tentar novamente</button></div>`; }
}
function renderizarPedidos() {
    const container = document.getElementById('lista-pedidos');
    if (!pedidos.length) { container.innerHTML = '<div style="text-align:center;padding:40px;color:#999;grid-column:1/-1"><p>📋 Nenhum pedido realizado</p><button onclick="mostrarProdutos()" class="btn-primary">Comprar produtos</button></div>'; return; }
    container.innerHTML = pedidos.map(ped => `<div class="card-cliente"><h3>Pedido #${escapeHtml(ped.id || ped._id)}</h3><div style="margin:10px 0"><strong>Total:</strong> R$ ${Number(ped.total || 0).toFixed(2).replace('.', ',')}</div><div style="margin:10px 0"><strong>Status:</strong> <span class="${ped.status === 'PENDING' ? 'status-pending' : 'status-paid'}">${ped.status === 'PENDING' ? '⏳ Aguardando pagamento' : '✅ Pago'}</span></div><div style="font-size:13px;color:#999;margin-top:10px">${ped.createdAt ? new Date(ped.createdAt).toLocaleString('pt-BR') : ''}</div></div>`).join('');
}

function fecharModal() { document.getElementById('modal').style.display = 'none'; }
function fecharModalPix() { document.getElementById('modal-pix').style.display = 'none'; }
window.onclick = function(event) { if (event.target === document.getElementById('modal')) fecharModal(); if (event.target === document.getElementById('modal-pix')) fecharModalPix(); };

function gerarPagamentoPix(total) {
    const modal = document.getElementById('modal-pix');
    document.getElementById('modal-pix-body').innerHTML = `<h2>💳 Pagamento Pix</h2><div style="text-align:center;padding:20px"><p style="font-size:24px;font-weight:bold">R$ ${Number(total).toFixed(2).replace('.', ',')}</p><p>⚠️ O Pix ainda está em modo de teste. Nenhuma cobrança bancária real é gerada.</p><button onclick="fecharModalPix()" class="btn-secondary">Fechar</button></div>`;
    modal.style.display = 'block';
}
function simularPagamento() { alert('ℹ️ Simulação de pagamento disponível apenas para testes.'); }
