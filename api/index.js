export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    message: 'API do Catálogo Pix funcionando!',
    endpoints: {
      produtos: '/api/produtos',
      clientes: '/api/clientes',
      pedidos: '/api/pedidos'
    }
  });
}
