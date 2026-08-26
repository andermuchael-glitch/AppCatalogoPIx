import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
let client = null;

async function getClient() {
  if (!uri) throw new Error('MONGODB_URI não configurada');
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client;
}

function normalizarProduto(doc) {
  return {
    ...doc,
    id: doc._id?.toString?.() || doc.id,
    _id: doc._id?.toString?.() || doc._id
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const mongo = await getClient();
    const collection = mongo.db('catalogo').collection('produtos');
    const id = req.query?.id;

    if (req.method === 'GET') {
      const produtos = await collection.find({}).sort({ createdAt: -1 }).toArray();
      return res.status(200).json(produtos.map(normalizarProduto));
    }

    if (req.method === 'POST') {
      const { nome, descricao = '', preco, categoria = 'Outros' } = req.body || {};
      const valor = Number(preco);
      if (!nome || !Number.isFinite(valor) || valor < 0) {
        return res.status(400).json({ error: 'Nome e preço válido são obrigatórios' });
      }
      const produto = { nome: String(nome).trim(), descricao: String(descricao), preco: valor, categoria: String(categoria), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      const result = await collection.insertOne(produto);
      return res.status(201).json(normalizarProduto({ ...produto, _id: result.insertedId }));
    }

    if (req.method === 'PUT') {
      if (!id || !ObjectId.isValid(id)) return res.status(400).json({ error: 'ID inválido' });
      const { nome, descricao = '', preco, categoria = 'Outros' } = req.body || {};
      const valor = Number(preco);
      if (!nome || !Number.isFinite(valor) || valor < 0) return res.status(400).json({ error: 'Dados inválidos' });
      const result = await collection.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: { nome: String(nome).trim(), descricao: String(descricao), preco: valor, categoria: String(categoria), updatedAt: new Date().toISOString() } }, { returnDocument: 'after' });
      if (!result.value) return res.status(404).json({ error: 'Produto não encontrado' });
      return res.status(200).json(normalizarProduto(result.value));
    }

    if (req.method === 'DELETE') {
      if (!id || !ObjectId.isValid(id)) return res.status(400).json({ error: 'ID inválido' });
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      if (!result.deletedCount) return res.status(404).json({ error: 'Produto não encontrado' });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
