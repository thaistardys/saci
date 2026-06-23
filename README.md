# 🖨️ SACI - Sistema de Acompanhamento de Chamados de Impressoras

O **SACI** é um sistema web responsivo e de alta fidelidade focado no controle, gerenciamento e histórico de chamados técnicos de ativos de impressão abertos junto a empresas terceirizadas. Desenvolvido sob a metodologia **Mobile-First**, o projeto prioriza acessibilidade, separação rigorosa de responsabilidades e altíssima performance.

---

## 🚀 Funcionalidades Principais

- **📦 Gestão Baseada em Estados**: Ciclo de vida completo do chamado através de 3 fases (*Em Aberto*, *Em Atendimento* e *Encerrado*).
- **🔍 Busca Avançada em Tempo Real**: Filtros dinâmicos instantâneos por número do chamado interno, ticket técnico do fornecedor ou número de série do equipamento.
- **🛠️ Interface Reativa para Suprimentos**: Detalhamento dinâmico de logística e trocas efetivas de peças na triagem e no encerramento.
- **🔐 Persistência Segura e Sem Cookies**: Utilização exclusiva de uma camada isolada de armazenamento no `localStorage`.
- **🚨 Modais 100% Customizados**: Feedback visual nativo e acessível com total barramento de alertas e diálogos intrusivos do navegador (`alert`/`confirm`).

---

## 📐 Arquitetura do Software e Divisão de Escopo

O ecossistema JavaScript do SACI foi arquitetado de forma modular e desacoplada, dividindo-se estritamente em **5 partes lógicas** para mitigar complexidade e assegurar facilidade de manutenção:

```text
SACI/
├── index.html        # Estrutura semântica travada em max-width: 1024px.
├── style.css         # Estilização baseada em tons pastéis verdes e flexbox vertical.
├── db.js             # [PARTE 1] Camada isolada de persistência e mutação do LocalStorage.
├── script.js (divido em 5 partes):
   ├── modais         # [PARTE 2] Engine de controle de abertura, fechamento e alertas personalizados.
   ├── ui             # [PARTE 3] Renderizador dinâmico de cards, badges de contagem e datas locais (BR).
   ├── main           # [PARTE 4] Orquestrador principal de regras de negócio e delegação de eventos do DOM.
   └── busca          # [PARTE 5] Algoritmo reativo de pesquisa indexada por caracteres.

```

---

## 🎨 Design e Princípios de UI

- **Acessibilidade Crítica**: Paleta de cores inteiramente estruturada sobre variações pastéis da cor verde, reduzindo o cansaço visual de operadores e garantindo excelente contraste.
- **Design Líquido e Travado**: Componentes divididos em tags semânticas estruturais (`<header>`, `<main>`, `<footer>`), limitadas a um teto rígido de visualização de `1024px` e perfeitamente centralizadas.
- **Comportamento Flex-Sticky**: Layout fluido desenvolvido para manter o rodapé empalado cirurgicamente na base do navegador (`viewport`), mesmo se a fila de chamados estiver vazia.

---

## 🛠️ Tecnologias e Dependências

Este projeto foi construído utilizando **tecnologia puramente nativa** (Vanilla Architecture), sem a necessidade de compiladores, pré-processadores ou frameworks pesados:

- **HTML5 Semântico**
- **CSS3 Estrutural (Flexbox Avançado)**
- **JavaScript (ES6+)**
- **Navegadores Modernos (API LocalStorage)**

---

## 📥 Como Rodar o Projeto

Por se tratar de uma aplicação nativa executada no lado do cliente (*Client-Side Rendering*), o SACI não necessita de instaladores de pacotes ou servidores locais (como Node.js).

1. Clone o repositório para sua máquina local:
   ```bash
   git clone https://github.com
   ```
2. Navegue até a pasta do projeto.
3. Clique duas vezes no arquivo `index.html` ou abra-o utilizando a extensão *Live Server* do seu editor de códigos.

---

## 🔒 Regras de Negócio Implementadas

1. **Validação Antiduplicidade**: O sistema recusa o salvamento de novos chamados cujo identificador de entrada manual já exista na base de dados histórica.
2. **Imutabilidade de Chaves Primárias**: Durante o processo de modificação de dados internos, o campo do número do chamado é congelado (`readonly`) para prevenir corrupção de referências.
3. **Bloqueio de Transição por Ticket**: O avanço de estado do fluxo de *Em Aberto* para *Em Atendimento* exige obrigatoriamente o preenchimento prévio do número do ticket externo fornecido pela empresa técnica responsável.
