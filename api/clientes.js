import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
let client = null;

async function getClient() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client;
}

// Função para validar CPF (simplificada)
function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]/g, '');
  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;
  return true;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const client = await getClient();
    const db = client.db('catalogo');
    const collection = db.collection('clientes');

    if (req.method === 'POST') {
      const { nome, email, telefone, cpf } = req.body;

      // Validar CPF
      if (!validarCPF(cpf)) {
        return res.status(400).json({ error: 'CPF inválido' });
      }

      // Verificar se já existe
      const existe = await collection.findOne({ cpf });
      if (existe) {
        return res.status(409).json({ error: 'CPF já cadastrado' });
      }

      const cliente = {
        nome,
        email,
        telefone,
        cpf,
        pixKey: `pix-${Date.now()}`,
        createdAt: new Date().toISOString()
      };

      const result = await collection.insertOne(cliente);
      return res.status(201).json({ ...cliente, id: result.insertedId });
    }

    if (req.method === 'GET') {
      const clientes = await collection.find({}).toArray();
      return res.status(200).json(clientes);
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
