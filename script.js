const SACIDB = {
    getChamados: function() {
        const chamados = localStorage.getItem('saci_chamados');
        return chamados ? JSON.parse(chamados) : [];
    },

    salvarChamados: function(chamados) {
        localStorage.setItem('saci_chamados', JSON.stringify(chamados));
        UI.atualizarBadges();
        UI.renderizarLista();
    },

    adicionar: function(chamado) {
        const chamados = this.getChamados();
        chamados.push(chamado);
        this.salvarChamados(chamados);
    },

    atualizar: function(id, dadosAtualizados) {
        const chamados = this.getChamados();
        const index = chamados.findIndex(c => c.id.toString() === id.toString());
        if (index !== -1) {
            chamados[index] = { ...chamados[index], ...dadosAtualizados };
            this.salvarChamados(chamados);
        }
    },

    excluir: function(id) {
        const chamados = this.getChamados().filter(c => c.id.toString() !== id.toString());
        this.salvarChamados(chamados);
    }
};


const Modais = {
    abrir: function(modalId) {
        document.getElementById(modalId).classList.add('active');
    },

    fechar: function(modalId) {
        document.getElementById(modalId).classList.remove('active');
    },

    fecharTodos: function() {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    },

    alerta: function(titulo, mensagem) {
        document.getElementById('alerta-titulo').innerText = titulo;
        document.getElementById('alerta-mensagem').innerText = mensagem;
        this.abrir('modal-alerta');
    }
};



const UI = {
    statusAtual: 'aberto',

    atualizarBadges: function() {
        const chamados = SACIDB.getChamados();
        document.getElementById('badge-aberto').innerText = chamados.filter(c => c.status === 'aberto').length;
        document.getElementById('badge-atendimento').innerText = chamados.filter(c => c.status === 'atendimento').length;
        document.getElementById('badge-encerrado').innerText = chamados.filter(c => c.status === 'encerrado').length;
    },

    formatarDataBR: function(dataISO) {
        if (!dataISO) return '';
        const data = new Date(dataISO);
        return isNaN(data.getTime()) ? dataISO : data.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
    },

    renderizarLista: function(chamadosFiltradosDaBusca = null) {
        const listaContainer = document.getElementById('lista-chamados');
        const chamados = chamadosFiltradosDaBusca || SACIDB.getChamados().filter(c => c.status === this.statusAtual);
        
        listaContainer.innerHTML = '';

        if (chamados.length === 0) {
            listaContainer.innerHTML = `<p style="text-align:center; padding: 2rem; color: #777;">Nenhum chamado encontrado.</p>`;
            return;
        }

        chamados.forEach(c => {
            const card = document.createElement('article');
            card.className = `card ${c.status}`;
            
            let areaFornecedorHTML = '';
            const acoesHTML = `
                <button class="btn-secondary btn-small btn-editar-chamado" data-id="${c.id}">Editar Dados Internos</button>
                <button class="btn-danger btn-small btn-excluir-chamado" data-id="${c.id}" style="background-color: #e53e3e; margin-left: 0.5rem;">Excluir Chamado</button>
            `;

            if (c.status !== 'encerrado') {
                areaFornecedorHTML = `
                    <div class="fornecedor-section">
                        <h4>Dados do Fornecedor Terceirizado</h4>
                        <form class="form-fornecedor" data-id="${c.id}">
                            <div class="grid-2">
                                <div class="form-group">
                                    <label>Data Abertura Fornecedor:</label>
                                    <input type="date" name="dataFornecedor" value="${c.dataFornecedor || ''}">
                                </div>
                                <div class="form-group">
                                    <label>Nº de Série da Impressora:</label>
                                    <input type="text" name="numSerie" value="${c.numSerie || ''}">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Localização (Setor/Sala):</label>
                                <input type="text" name="localizacao" value="${c.localizacao || ''}">
                            </div>
                            <div class="form-group">
                                <label>Número do Ticket Terceirizado ${c.status === 'aberto' ? '(Obrigatório para Atendimento)' : '*'}:</label>
                                <input type="text" name="ticketFornecedor" value="${c.ticketFornecedor || ''}">
                            </div>
                            <div class="form-group row">
                                <input type="checkbox" name="precisaPeca" id="peca-${c.id}" ${c.precisaPeca ? 'checked' : ''} class="chk-peca">
                                <label for="peca-${c.id}">Necessita de troca de peça</label>
                            </div>
                            <div class="form-group campo-peca-detalhe" style="display: ${c.precisaPeca ? 'block' : 'none'}">
                                <label>Peça Solicitada:</label>
                                <input type="text" name="nomePeca" value="${c.nomePeca || ''}">
                                <div class="warning-box">⚠️ O técnico retornará para efetuar a troca desta peça.</div>
                            </div>
                            <div class="card-actions">
                                <button type="submit" class="btn-primary btn-small">Salvar Dados Fornecedor</button>
                                ${c.status === 'aberto' 
                                    ? `<button type="button" class="btn-primary btn-small btn-vincular" data-id="${c.id}" style="background-color: var(--warning)">Vincular Técnico (Atendimento)</button>`
                                    : `<button type="button" class="btn-danger btn-small btn-chama-fechamento" data-id="${c.id}">Marcar como Resolvido</button>`
                                }
                            </div>
                        </form>
                    </div>`;
            } else {
                areaFornecedorHTML = `
                    <div class="fornecedor-section" style="background-color: #f8fafc;">
                        <h4>Histórico de Encerramento</h4>
                        <p><strong>Ticket Fornecedor:</strong> ${c.ticketFornecedor || 'N/A'}</p>
                        <p><strong>Relato Técnico:</strong> ${c.relatoTecnico || ''}</p>
                        <p><strong>Houve troca de peças:</strong> ${c.houveTrocaPeca ? 'Sim' : 'Não'}</p>
                        ${c.houveTrocaPeca ? `<p><strong>Peças Substituídas:</strong> ${c.pecasTrocadasDetalhe || 'Não especificado'}</p>` : ''}
                    </div>`;
            }

            card.innerHTML = `
                <div class="card-header">
                    <span><strong>ID Chamado:</strong> #${c.id}</span>
                    <span>${this.formatarDataBR(c.dataHora)}</span>
                </div>
                <div class="card-body">
                    <p><strong>Colaborador:</strong> ${c.colaborador}</p>
                    <p><strong>Defeito:</strong> ${c.descricao}</p>
                    ${areaFornecedorHTML}
                    <div class="card-actions">
                        ${acoesHTML}
                    </div>
                </div>`;
            
            listaContainer.appendChild(card);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    UI.atualizarBadges();
    UI.renderizarLista();

    document.querySelectorAll('.tab-button').forEach(botao => {
        botao.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
            const target = e.currentTarget;
            target.classList.add('active');
            UI.statusAtual = target.dataset.status;
            UI.renderizarLista();
        });
    });

    document.getElementById('btn-novo-chamado').addEventListener('click', () => {
        document.getElementById('form-cadastro').reset();
        document.getElementById('editando-id').value = '';
        document.getElementById('modal-cadastro-titulo').innerText = 'Novo Chamado Interno';
        
        const campoId = document.getElementById('chamado-id');
        campoId.value = '';
        campoId.readOnly = false; 
        
        const agora = new Date();
        const tzoffset = agora.getTimezoneOffset() * 60000;
        document.getElementById('data-abertura').value = (new Date(agora - tzoffset)).toISOString().slice(0, 16);
        
        Modais.abrir('modal-cadastro');
    });

    document.getElementById('form-cadastro').addEventListener('submit', (e) => {
        e.preventDefault();
        const editandoId = document.getElementById('editando-id').value;
        const idDigitado = document.getElementById('chamado-id').value.trim();
        
        const dados = {
            colaborador: document.getElementById('colaborador').value,
            descricao: document.getElementById('descricao').value,
            dataHora: document.getElementById('data-abertura').value
        };

        if (editandoId) {
            SACIDB.atualizar(editandoId, dados);
            Modais.fechar('modal-cadastro');
            Modais.alerta('Sucesso', 'Chamado interno atualizado com sucesso.');
        } else {
            if (SACIDB.getChamados().some(c => c.id.toString().toLowerCase() === idDigitado.toLowerCase())) {
                Modais.alerta('Erro de Duplicidade', `O chamado nº ${idDigitado} já está cadastrado.`);
                return;
            }

            SACIDB.adicionar({ id: idDigitado, status: 'aberto', ...dados });
            Modais.fechar('modal-cadastro');
            Modais.alerta('Sucesso', `Chamado #${idDigitado} aberto com sucesso.`);
        }
    });

    document.getElementById('lista-chamados').addEventListener('click', (e) => {
        const target = e.target;

        if (target.classList.contains('btn-editar-chamado')) {
            const chamado = SACIDB.getChamados().find(c => c.id.toString() === target.dataset.id.toString());
            
            document.getElementById('editando-id').value = chamado.id;
            document.getElementById('modal-cadastro-titulo').innerText = `Editar Chamado #${chamado.id}`;
            
            const campoId = document.getElementById('chamado-id');
            campoId.value = chamado.id;
            campoId.readOnly = true; 
            
            document.getElementById('data-abertura').value = chamado.dataHora;
            document.getElementById('colaborador').value = chamado.colaborador;
            document.getElementById('descricao').value = chamado.descricao;
            
            Modais.abrir('modal-cadastro');
        }

        if (target.classList.contains('btn-excluir-chamado')) {
            document.getElementById('excluir-id').value = target.dataset.id;
            Modais.abrir('modal-confirmacao-exclusao');
        }

        if (target.classList.contains('btn-vincular')) {
            const id = target.dataset.id;
            const form = target.closest('form');
            const ticket = form.elements['ticketFornecedor'].value.trim();

            if (!ticket) {
                Modais.alerta('Validação', 'Preencha o Número do Ticket fornecido pela terceirizada.');
                return;
            }

            salvarDadosFornecedorForm(form, id);
            SACIDB.atualizar(id, { status: 'atendimento' });
            Modais.alerta('Status Atualizado', `Chamado #${id} movido para Em Atendimento.`);
        }

        if (target.classList.contains('btn-chama-fechamento')) {
            document.getElementById('form-encerramento').reset();
            document.getElementById('encerrar-id').value = target.dataset.id;
            document.getElementById('campo-peca-encerramento-detalhe').style.display = 'none';
            document.getElementById('peca-encerramento-descricao').required = false;
            Modais.abrir('modal-encerramento');
        }
    });

    document.getElementById('btn-confirmar-exclusao-definitiva').addEventListener('click', () => {
        const id = document.getElementById('excluir-id').value;
        SACIDB.excluir(id);
        Modais.fechar('modal-confirmacao-exclusao');
        Modais.alerta('Excluído', `O chamado #${id} foi removido permanentemente.`);
    });

    document.getElementById('lista-chamados').addEventListener('change', (e) => {
        if (e.target.classList.contains('chk-peca')) {
            const form = e.target.closest('form');
            form.querySelector('.campo-peca-detalhe').style.display = e.target.checked ? 'block' : 'none';
        }
    });

    document.getElementById('houve-troca-peca').addEventListener('change', (e) => {
        const campoDetalhe = document.getElementById('campo-peca-encerramento-detalhe');
        const inputDetalhe = document.getElementById('peca-encerramento-descricao');
        
        campoDetalhe.style.display = e.target.checked ? 'block' : 'none';
        inputDetalhe.required = e.target.checked;
    });

    document.getElementById('lista-chamados').addEventListener('submit', (e) => {
        if (e.target.classList.contains('form-fornecedor')) {
            e.preventDefault();
            const form = e.target;
            salvarDadosFornecedorForm(form, form.dataset.id);
            Modais.alerta('Salvo', 'Informações técnicas salvas.');
        }
    });

    document.getElementById('form-encerramento').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('encerrar-id').value;
        
        SACIDB.atualizar(id, {
            status: 'encerrado',
            relatoTecnico: document.getElementById('relato-tecnico').value,
            houveTrocaPeca: document.getElementById('houve-troca-peca').checked,
            pecasTrocadasDetalhe: document.getElementById('peca-encerramento-descricao').value.trim()
        });
        Modais.fechar('modal-encerramento');
        Modais.alerta('Ticket Finalizado', `O chamado #${id} foi movido para o histórico.`);
    });

    function salvarDadosFornecedorForm(form, id) {
        SACIDB.atualizar(id, {
            dataFornecedor: form.elements['dataFornecedor'].value,
            numSerie: form.elements['numSerie'].value,
            localizacao: form.elements['localizacao'].value,
            ticketFornecedor: form.elements['ticketFornecedor'].value,
            precisaPeca: form.elements['precisaPeca'].checked,
            nomePeca: form.elements['nomePeca'].value
        });
    }

    document.querySelectorAll('.id-fechar-modal').forEach(btn => btn.addEventListener('click', Modais.fecharTodos));
    document.querySelector('.id-fechar-alerta').addEventListener('click', () => Modais.fechar('modal-alerta'));
});



document.addEventListener('DOMContentLoaded', () => {
    const inputBusca = document.getElementById('input-busca');

    if (inputBusca) {
        inputBusca.addEventListener('input', (e) => {
            const termo = e.target.value.toLowerCase().trim();
            
            if (termo === '') {
                UI.renderizarLista();
                return;
            }

            const chamadosFiltrados = SACIDB.getChamados()
                .filter(c => c.status === UI.statusAtual)
                .filter(c => 
                    (c.id || '').toString().toLowerCase().includes(termo) || 
                    (c.ticketFornecedor || '').toString().toLowerCase().includes(termo) || 
                    (c.numSerie || '').toString().toLowerCase().includes(termo)
                );

            UI.renderizarLista(chamadosFiltrados);
        });
    }

    document.querySelectorAll('.tab-button').forEach(botao => {
        botao.addEventListener('click', () => {
            if (inputBusca) inputBusca.value = '';
        });
    });
});
