require('dotenv').config();
const express = require('express');
const axios   = require('axios');
const http    = require('http');
const { WebSocketServer } = require('ws');
const path    = require('path');

const app    = express();
const server = http.createServer(app);
const wss    = new WebSocketServer({ server });

app.use(express.json());
app.use(express.static(path.join(__dirname)));

/* ════════════════════════════════════════════
   CONFIG Z-API
════════════════════════════════════════════ */
const INSTANCE      = process.env.ZAPI_INSTANCE;
const TOKEN         = process.env.ZAPI_TOKEN;
const CLIENT_TOKEN  = process.env.ZAPI_CLIENT_TOKEN || '';
const CHAVE_PIX     = process.env.CHAVE_PIX || '(81) 99219-4757';
const ZAPI_BASE     = `https://api.z-api.io/instances/${INSTANCE}/token/${TOKEN}`;

async function enviar(phone, message) {
  try {
    const headers = CLIENT_TOKEN ? { 'Client-Token': CLIENT_TOKEN } : {};
    await axios.post(`${ZAPI_BASE}/send-text`, { phone, message }, { headers });
    console.log(`✉️  [${phone}] → "${message.slice(0, 60).replace(/\n/g,' ')}…"`);
  } catch (e) {
    console.error(`❌ Erro ao enviar para ${phone}:`, e.response?.data || e.message);
  }
}

/* ════════════════════════════════════════════
   WEBSOCKET — atualiza dashboard em tempo real
════════════════════════════════════════════ */
const wsClients = new Set();

wss.on('connection', ws => {
  wsClients.add(ws);
  ws.send(JSON.stringify({ tipo: 'pedidos_atuais', pedidos }));
  ws.on('close', () => wsClients.delete(ws));
});

function broadcast(msg) {
  const raw = JSON.stringify(msg);
  wsClients.forEach(ws => ws.readyState === 1 && ws.send(raw));
}

/* ════════════════════════════════════════════
   DADOS
════════════════════════════════════════════ */
const CARDAPIO = {
  churrasco: [
    { id:'c1',  nome:'Mistão (Toscana/Galeto)',  preco:128.00, desc:'Acomp: feijão tropeiro ou caseiro, arroz, batata', ic:'🥩' },
    { id:'c2',  nome:'Picanha Argentina',         preco:170.00, desc:'Acomp: feijão tropeiro ou caseiro, arroz, batata', ic:'🥩' },
    { id:'c3',  nome:'Picanha de Cordeiro',       preco:165.00, desc:'Acomp: feijão tropeiro ou caseiro, arroz, batata', ic:'🥩' },
    { id:'c4',  nome:'Cupim',                     preco:105.00, desc:'Acomp: feijão tropeiro ou caseiro, arroz, batata', ic:'🥩' },
    { id:'c5',  nome:'Maminha',                   preco:141.00, desc:'Acomp: feijão tropeiro ou caseiro, arroz, batata', ic:'🥩' },
    { id:'c6',  nome:'Churrasco de Filé',         preco:130.00, desc:'Acomp: feijão tropeiro ou caseiro, arroz, batata', ic:'🥩' },
    { id:'c7',  nome:'Carne de Sol do Cordeiro',  preco:127.00, desc:'Acomp: feijão tropeiro ou caseiro, arroz, batata', ic:'🥩' },
    { id:'c8',  nome:'Costela Bovina',            preco:102.00, desc:'Acomp: feijão tropeiro ou caseiro, arroz, batata', ic:'🥩' },
    { id:'c9',  nome:'Carne de Sol',              preco:105.00, desc:'Acomp: feijão tropeiro ou caseiro, arroz, batata', ic:'🥩' },
    { id:'c10', nome:'Churrasco Gaúcho',          preco:105.00, desc:'Acomp: feijão tropeiro ou caseiro, arroz, batata', ic:'🥩' },
    { id:'c11', nome:'Costela de Bode',           preco:100.00, desc:'Acomp: feijão tropeiro ou caseiro, arroz, batata', ic:'🥩' },
    { id:'c12', nome:'Picanha Suína',             preco:95.00,  desc:'Acomp: feijão tropeiro ou caseiro, arroz, batata', ic:'🥩' },
  ],
  aves: [
    { id:'a1', nome:'Frango à Moda da Casa',  preco:80.00, desc:'Arroz, feijão, vinagrete e maionese',      ic:'🍗' },
    { id:'a2', nome:'Galeto',                 preco:75.00, desc:'Arroz, feijão, batata, vinagrete e maionese', ic:'🍗' },
    { id:'a3', nome:'Galeto Simples',         preco:52.00, desc:'Batata, vinagrete e farofa',               ic:'🍗' },
    { id:'a4', nome:'1/2 Galeto Simples',     preco:41.00, desc:'Batata, vinagrete e farofa',               ic:'🍗' },
  ],
  file: [
    { id:'f1', nome:'Filé à Moda da Casa',    preco:130.00, desc:'Feijão tropeiro ou caseiro, arroz, batata', ic:'🍽️' },
    { id:'f2', nome:'Filé à Parmegiana',      preco:125.00, desc:'Feijão tropeiro ou caseiro, arroz, batata', ic:'🍽️' },
    { id:'f3', nome:'Filé à Parmegiana 1/2',  preco:120.00, desc:'Feijão tropeiro ou caseiro, arroz, batata', ic:'🍽️' },
  ],
  entradas: [
    { id:'e1', nome:'Frango à Passarinho',       preco:45.00, desc:'Porção de frango à passarinho',         ic:'🍗' },
    { id:'e2', nome:'Salaminho c/ Queijo',        preco:30.00, desc:'Prato ou mussarela',                   ic:'🧀' },
    { id:'e3', nome:'Porção de Fritas',           preco:17.00, desc:'Batata frita crocante',                ic:'🍟' },
    { id:'e4', nome:'Toscana de Bode (unid.)',    preco:8.00,  desc:'Unidade de toscana de bode',           ic:'🌭' },
    { id:'e5', nome:'Toscana Frango/Porco (unid)',preco:5.00,  desc:'Unidade de toscana de frango ou porco',ic:'🌭' },
  ],
  almoco: [
    { id:'al1', nome:'Comercial Picanha c/ fritas', preco:54.00, desc:'Feijão tropeiro ou caseiro, arroz, batata', ic:'🍱' },
    { id:'al2', nome:'Comercial Picanha',            preco:52.00, desc:'Feijão tropeiro ou caseiro, arroz, batata', ic:'🍱' },
    { id:'al3', nome:'Comercial Maminha',            preco:46.00, desc:'Feijão tropeiro ou caseiro, arroz, batata', ic:'🍱' },
    { id:'al4', nome:'Comercial de Carne',           preco:44.00, desc:'Feijão tropeiro ou caseiro, arroz, batata', ic:'🍱' },
    { id:'al5', nome:'Comercial Carne simples',      preco:33.00, desc:'Feijão tropeiro ou caseiro, arroz, batata', ic:'🍱' },
    { id:'al6', nome:'Comercial Picanha simples',    preco:29.00, desc:'Feijão tropeiro ou caseiro, arroz, batata', ic:'🍱' },
    { id:'al7', nome:'Comercial Galeto',             preco:29.00, desc:'Feijão tropeiro ou caseiro, arroz, batata', ic:'🍱' },
    { id:'al8', nome:'Comercial Toscana',            preco:29.00, desc:'Feijão tropeiro ou caseiro, arroz, batata', ic:'🍱' },
  ],
};

const BAIRROS = [
  { nome:'Cohab',          taxa:7.00, tempo:'30–50 min' },
  { nome:'São Francisco',  taxa:7.00, tempo:'30–50 min' },
  { nome:'Vila Social',    taxa:7.00, tempo:'30–50 min' },
  { nome:'Garapu',         taxa:7.00, tempo:'30–50 min' },
  { nome:'Outro bairro',   taxa:7.00, tempo:'30–50 min' },
];

const fmt = v => v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});

let pedidos     = [];
let pedidoIdSeq = 1000;

/* ════════════════════════════════════════════
   ESTADO DAS CONVERSAS (por número de telefone)
════════════════════════════════════════════ */
const sessoes = new Map();

function novaSessao() {
  return {
    etapa: 'menu_principal',
    nome: '', entrega: '', bairro: null,
    endereco: '', carrinho: [],
    catAtual: null, pgto: '', troco: '',
  };
}

/* ════════════════════════════════════════════
   HELPERS DE MENSAGEM
════════════════════════════════════════════ */
async function enviarMenu(phone) {
  const s = sessoes.get(phone) || novaSessao();
  s.etapa = 'menu_principal';
  sessoes.set(phone, s);
  await enviar(phone,
    '🔥 *Delícias na Brasa*\n\n' +
    'Como posso te ajudar? Responda com o número:\n\n' +
    '1️⃣ 🛒 Fazer um pedido\n' +
    '2️⃣ 📋 Ver cardápio e preços\n' +
    '3️⃣ 🕐 Horário de funcionamento\n' +
    '4️⃣ 📍 Endereço / Contato'
  );
}

async function enviarBairros(phone) {
  const lista = BAIRROS.map((b,i)=>`${i+1}️⃣ *${b.nome}* — taxa ${fmt(b.taxa)} (${b.tempo})`).join('\n');
  await enviar(phone, `📍 *Qual é o seu bairro?*\n\n${lista}`);
}

async function enviarCategorias(phone) {
  await enviar(phone,
    'O que você vai querer hoje? 😋\n\n' +
    '1️⃣ 🥩 Churrascos\n' +
    '2️⃣ 🍗 Aves\n' +
    '3️⃣ 🍽️ Filé\n' +
    '4️⃣ 🍟 Entradas\n' +
    '5️⃣ 🍱 Almoços (por pessoa)'
  );
}

async function enviarItens(phone, cat) {
  const nomes = { churrasco:'🥩 CHURRASCOS', aves:'🍗 AVES', file:'🍽️ FILÉ', entradas:'🍟 ENTRADAS', almoco:'🍱 ALMOÇOS' };
  const itens = CARDAPIO[cat];
  const lista = itens.map((it,i)=>`${i+1}️⃣ *${it.nome}* — ${fmt(it.preco)}\n   ${it.desc}`).join('\n\n');
  await enviar(phone, `*${nomes[cat]}*\n\n${lista}\n\n${itens.length+1}️⃣ ⬅️ Outras categorias`);
}

async function enviarPagamentos(phone) {
  await enviar(phone,
    'Qual vai ser a *forma de pagamento*? 💳\n\n' +
    '1️⃣ ⚡ PIX\n' +
    '2️⃣ 💵 Dinheiro\n' +
    '3️⃣ 💳 Cartão Débito\n' +
    '4️⃣ 💳 Cartão Crédito'
  );
}

async function enviarResumo(phone, s) {
  const subtotal = s.carrinho.reduce((t,i)=>t+i.preco,0);
  const taxa     = s.bairro?.taxa ?? 0;
  const total    = subtotal + taxa;
  const lista    = s.carrinho.map(i=>`• ${i.ic} ${i.nome} — ${fmt(i.preco)}`).join('\n');
  const entInfo  = s.entrega === 'Delivery'
    ? `🛵 Delivery — *${s.bairro?.nome}*\n📌 ${s.endereco}\n💰 Taxa: *${fmt(taxa)}*`
    : '🏃 Retirada no local';
  const trocoInfo = s.troco ? `\n🔄 Troco para R$ ${s.troco}` : '';

  await enviar(phone,
    `📋 *RESUMO DO PEDIDO*\n\n` +
    `*Cliente:* ${s.nome}\n\n` +
    `*Itens:*\n${lista}\n\n` +
    `*Subtotal:* ${fmt(subtotal)}\n` +
    `${entInfo}\n\n` +
    `*💳 Pagamento:* ${s.pgto}${trocoInfo}\n\n` +
    `🏷 *TOTAL: ${fmt(total)}*\n\n` +
    `*Confirma o pedido?*\n\n1️⃣ ✅ SIM, confirmar!\n2️⃣ ❌ Cancelar`
  );
}

async function confirmarPedido(phone, s) {
  const subtotal = s.carrinho.reduce((t,i)=>t+i.preco,0);
  const taxa     = s.bairro?.taxa ?? 0;
  const total    = subtotal + taxa;
  const id       = ++pedidoIdSeq;

  const pedido = {
    id,
    phone,
    cliente: s.nome,
    itens:   s.carrinho.map(i=>i.nome),
    total,
    status:  'aguardando',
    hora:    new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),
    tipo:    s.carrinho.some(i=>i.id.startsWith('p')) ? 'pizza' : 'churrasco',
    entrega: s.entrega,
    bairro:  s.bairro?.nome || '',
    pgto:    s.pgto,
  };

  pedidos.unshift(pedido);
  broadcast({ tipo:'novo_pedido', pedido });

  const pixInfo = s.pgto === 'PIX'
    ? `\n\n⚡ *Chave PIX:* ${CHAVE_PIX}\nApós o pagamento envie o comprovante aqui. ✅`
    : '';

  await enviar(phone,
    `🎉 *Pedido confirmado, ${s.nome}!*\n\n` +
    `*Número:* #${String(id).padStart(4,'0')}\n` +
    `⏰ *Tempo estimado:* ${s.bairro?.tempo || '30–45 min'}` +
    `${pixInfo}\n\n` +
    `Em breve entraremos em contato! 🔥🍕🥩\n` +
    `Obrigado pela preferência! 😊`
  );

  sessoes.set(phone, novaSessao());
}

/* ════════════════════════════════════════════
   MÁQUINA DE ESTADOS
════════════════════════════════════════════ */
async function processarMensagem(phone, texto) {
  const msg = texto.trim().toLowerCase();

  if (!sessoes.has(phone)) sessoes.set(phone, novaSessao());
  const s = sessoes.get(phone);

  // Palavra-chave para reiniciar em qualquer etapa
  if (['oi','olá','ola','opa','bom dia','boa tarde','boa noite','menu','início','inicio'].includes(msg)) {
    sessoes.set(phone, novaSessao());
    await enviarMenu(phone);
    return;
  }

  console.log(`📱 [${phone}] etapa=${s.etapa} msg="${texto}"`);

  switch (s.etapa) {

    /* ── Menu principal ── */
    case 'menu_principal':
      if (msg==='1') {
        s.etapa = 'escolher_categoria';
        await enviar(phone,'Ótimo! 😄 Vamos montar seu pedido!\n\nEscolha uma categoria:');
        await enviarCategorias(phone);
      } else if (msg==='2') {
        const lin = cat => CARDAPIO[cat].map(i=>`${i.ic} *${i.nome}* — ${fmt(i.preco)}\n   ${i.desc}`).join('\n');
        await enviar(phone,
          `📋 *Cardápio Completo*\n\n` +
          `*🥩 CHURRASCOS*\n${lin('churrasco')}\n\n` +
          `*🍗 AVES*\n${lin('aves')}\n\n` +
          `*🍽️ FILÉ*\n${lin('file')}\n\n` +
          `*🍟 ENTRADAS*\n${lin('entradas')}\n\n` +
          `*🍱 ALMOÇOS*\n${lin('almoco')}`
        );
        await enviarMenu(phone);
      } else if (msg==='3') {
        await enviar(phone,'⏰ *Horário de Funcionamento*\n\nSeg – Sex: 11h às 23h\nSáb e Dom: 11h à meia-noite\n\nEstamos abertos todos os dias! 🎉');
        await enviarMenu(phone);
      } else if (msg==='4') {
        await enviar(phone,'📍 *Onde nos encontrar*\n\nCabo de Santo Agostinho — PE\n📞 (81) 99219-4757\n\n🛵 Fazemos delivery em Cohab, São Francisco, Vila Social, Garapu e região!');
        await enviarMenu(phone);
      } else {
        await enviarMenu(phone);
      }
      break;

    /* ── Categoria ── */
    case 'escolher_categoria':
      if      (msg==='1') { s.catAtual='churrasco'; s.etapa='escolher_item'; await enviarItens(phone,'churrasco'); }
      else if (msg==='2') { s.catAtual='aves';      s.etapa='escolher_item'; await enviarItens(phone,'aves'); }
      else if (msg==='3') { s.catAtual='file';      s.etapa='escolher_item'; await enviarItens(phone,'file'); }
      else if (msg==='4') { s.catAtual='entradas';  s.etapa='escolher_item'; await enviarItens(phone,'entradas'); }
      else if (msg==='5') { s.catAtual='almoco';    s.etapa='escolher_item'; await enviarItens(phone,'almoco'); }
      else { await enviar(phone,'❓ Digite um número de 1 a 5.'); await enviarCategorias(phone); }
      break;

    /* ── Item ── */
    case 'escolher_item': {
      const itens = CARDAPIO[s.catAtual];
      const idx   = parseInt(msg) - 1;
      if (msg === String(itens.length + 1)) {
        s.etapa = 'escolher_categoria';
        await enviarCategorias(phone);
      } else if (idx >= 0 && idx < itens.length) {
        s.carrinho.push(itens[idx]);
        s.etapa = 'adicionar_mais';
        const sub  = s.carrinho.reduce((t,i)=>t+i.preco,0);
        const lista= s.carrinho.map(i=>`• ${i.ic} ${i.nome} — ${fmt(i.preco)}`).join('\n');
        await enviar(phone,
          `✅ *${itens[idx].nome}* adicionado!\n\n` +
          `🛒 *Carrinho:*\n${lista}\n\n` +
          `*Subtotal: ${fmt(sub)}*\n\n` +
          `Deseja mais algum item?\n\n` +
          `1️⃣ 🥩 Churrascos\n` +
          `2️⃣ 🍗 Aves\n` +
          `3️⃣ 🍽️ Filé\n` +
          `4️⃣ 🍟 Entradas\n` +
          `5️⃣ 🍱 Almoços\n` +
          `6️⃣ ✅ Finalizar pedido`
        );
      } else {
        await enviar(phone,'❓ Número inválido. Escolha um item da lista.');
        await enviarItens(phone, s.catAtual);
      }
      break;
    }

    /* ── Adicionar mais ── */
    case 'adicionar_mais':
      if      (msg==='1') { s.catAtual='churrasco'; s.etapa='escolher_item'; await enviarItens(phone,'churrasco'); }
      else if (msg==='2') { s.catAtual='aves';      s.etapa='escolher_item'; await enviarItens(phone,'aves'); }
      else if (msg==='3') { s.catAtual='file';      s.etapa='escolher_item'; await enviarItens(phone,'file'); }
      else if (msg==='4') { s.catAtual='entradas';  s.etapa='escolher_item'; await enviarItens(phone,'entradas'); }
      else if (msg==='5') { s.catAtual='almoco';    s.etapa='escolher_item'; await enviarItens(phone,'almoco'); }
      else if (msg==='6') {
        s.etapa = 'aguardando_nome';
        await enviar(phone,'Ótimo! 😄\n\nAgora me diz: qual é o seu *nome completo*?');
      }
      else { await enviar(phone,'❓ Digite um número de 1 a 6.'); }
      break;

    /* ── Nome ── */
    case 'aguardando_nome':
      if (texto.length < 3) { await enviar(phone,'Por favor, informe seu nome completo.'); break; }
      s.nome  = texto;
      s.etapa = 'tipo_entrega';
      await enviar(phone,
        `Perfeito, *${texto}*! 👍\n\n` +
        `Como prefere receber seu pedido?\n\n` +
        `1️⃣ 🛵 Delivery (entrega em casa)\n` +
        `2️⃣ 🏃 Retirada no local`
      );
      break;

    /* ── Tipo de entrega ── */
    case 'tipo_entrega':
      if (msg==='1') {
        s.entrega = 'Delivery';
        s.etapa   = 'escolher_bairro';
        await enviarBairros(phone);
      } else if (msg==='2') {
        s.entrega = 'Retirada';
        s.etapa   = 'escolher_pgto';
        await enviarPagamentos(phone);
      } else {
        await enviar(phone,'❓ Digite *1* para Delivery ou *2* para Retirada.');
      }
      break;

    /* ── Bairro ── */
    case 'escolher_bairro': {
      const idx = parseInt(msg) - 1;
      if (idx >= 0 && idx < BAIRROS.length) {
        s.bairro = BAIRROS[idx];
        s.etapa  = 'aguardando_endereco';
        await enviar(phone,
          `✅ *${s.bairro.nome}* selecionado!\n` +
          `💰 Taxa de entrega: *${fmt(s.bairro.taxa)}*\n` +
          `⏰ Tempo estimado: *${s.bairro.tempo}*\n\n` +
          `Agora me informe o *endereço completo*\n(rua, número, complemento e ponto de referência):`
        );
      } else {
        await enviar(phone,'❓ Escolha um número válido da lista.');
        await enviarBairros(phone);
      }
      break;
    }

    /* ── Endereço ── */
    case 'aguardando_endereco':
      if (texto.length < 5) { await enviar(phone,'Por favor, informe o endereço completo (rua, número, complemento).'); break; }
      s.endereco = texto;
      s.etapa    = 'escolher_pgto';
      await enviar(phone,`📌 Endereço registrado:\n_${texto}_`);
      await enviarPagamentos(phone);
      break;

    /* ── Pagamento ── */
    case 'escolher_pgto': {
      const pgtos = ['PIX','Dinheiro','Cartão Débito','Cartão Crédito'];
      const idx   = parseInt(msg) - 1;
      if (idx >= 0 && idx < pgtos.length) {
        s.pgto = pgtos[idx];
        if (msg === '2') {
          s.etapa = 'aguardando_troco';
          await enviar(phone,'💵 Vai precisar de *troco*?\n\nSe sim, para quanto? (ex: 100,00)\nSe não precisar, responda *não*');
        } else {
          s.etapa = 'confirmar';
          await enviarResumo(phone, s);
        }
      } else {
        await enviar(phone,'❓ Escolha uma opção válida.'); await enviarPagamentos(phone);
      }
      break;
    }

    /* ── Troco ── */
    case 'aguardando_troco':
      s.troco = (['nao','não','n','nope'].includes(msg)) ? '' : texto;
      s.etapa = 'confirmar';
      await enviarResumo(phone, s);
      break;

    /* ── Confirmar ── */
    case 'confirmar':
      if (msg==='1') {
        await confirmarPedido(phone, s);
      } else if (msg==='2') {
        sessoes.set(phone, novaSessao());
        await enviar(phone,'❌ Pedido cancelado.\n\nSe precisar de algo, é só chamar! 😊');
        await enviarMenu(phone);
      } else {
        await enviar(phone,'❓ Digite *1* para confirmar ou *2* para cancelar.');
      }
      break;

    default:
      await enviarMenu(phone);
  }
}

/* ════════════════════════════════════════════
   ROTAS
════════════════════════════════════════════ */

// Webhook Z-API — recebe mensagens dos clientes
app.post('/webhook', async (req, res) => {
  res.sendStatus(200); // responde rápido para o Z-API não retentar

  const b = req.body;
  if (b.fromMe || b.fromApi)          return; // ignora mensagens próprias
  if (b.isGroup || b.isGroupMsg)      return; // ignora grupos
  if (b.type !== 'ReceivedCallback' && b.type !== 'text') return;

  const phone = b.phone;
  const texto = b.text?.message || b.body || '';
  if (!phone || !texto) return;

  // Inicia com menu se sessão nova
  if (!sessoes.has(phone)) {
    sessoes.set(phone, novaSessao());
    await enviarMenu(phone);
    return;
  }

  await processarMensagem(phone, texto);
});

// Atualizar status de pedido (chamado pelo dashboard)
app.post('/api/pedido/:id/status', async (req, res) => {
  const id     = parseInt(req.params.id);
  const status = req.body.status;
  const pedido = pedidos.find(p => p.id === id);
  if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado' });

  pedido.status = status;
  broadcast({ tipo: 'status_atualizado', id, status });

  // Notifica o cliente no WhatsApp
  const notif = {
    preparo:  `👨‍🍳 *${pedido.cliente}*, seu pedido está sendo preparado agora! 🔥`,
    pronto:   pedido.entrega === 'Delivery'
                ? `🛵 *${pedido.cliente}*, seu pedido saiu para entrega! Chegará em instantes! ✅`
                : `✅ *${pedido.cliente}*, seu pedido está pronto para retirada! Pode vir buscar! 🏃`,
    entregue: `🎉 Obrigado, *${pedido.cliente}*! Pedido entregue com sucesso. Até a próxima! 😊`,
  };

  if (notif[status] && pedido.phone) {
    await enviar(pedido.phone, notif[status]);
  }

  res.json({ ok: true });
});

// Retorna todos os pedidos (para sincronizar dashboard ao abrir)
app.get('/api/pedidos', (req, res) => res.json(pedidos));

// Serve o dashboard
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'restaurante.html')));

/* ════════════════════════════════════════════
   START
════════════════════════════════════════════ */
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('');
  console.log('🔥 ═══════════════════════════════════════');
  console.log('   Delícias na Brasa — Bot');
  console.log('═══════════════════════════════════════ 🔥');
  console.log(`\n✅ Servidor rodando em http://localhost:${PORT}`);
  console.log(`📋 Dashboard:  http://localhost:${PORT}/`);
  console.log(`🔗 Webhook:    http://SEU_IP:${PORT}/webhook`);
  console.log(`\n📦 Z-API Instance: ${INSTANCE || '⚠️  NÃO CONFIGURADO'}`);
  console.log(`🔑 Z-API Token:    ${TOKEN ? TOKEN.slice(0,6)+'…' : '⚠️  NÃO CONFIGURADO'}`);
  console.log(`🔒 Client-Token:   ${CLIENT_TOKEN ? CLIENT_TOKEN.slice(0,6)+'…' : '(não configurado)'}`);
  console.log(`\n💡 Configure o webhook no painel Z-API!`);
  console.log('');
});
