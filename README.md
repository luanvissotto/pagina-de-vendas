# BoostSell

BoostSell é uma plataforma moderna e responsiva de vendas para produtos digitais. 

## 🚀 Funcionalidades

- **Página de Vendas (Landing Page)**: Design atraente e de alta conversão, focado em dispositivos móveis (Mobile-first).
- **Dashboard**: Painel de administração e de cliente para gerenciamento de produtos e vendas.
- **Autenticação**: Sistema seguro de login (E-mail e Senha) com níveis de acesso.

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js com Express
- **Banco de Dados**: SQLite
- **Autenticação**: bcryptjs (Criptografia de Senhas), express-session

## 📦 Como Instalar e Rodar Localmente

1. Clone o repositório:
   ```bash
   git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor:
   ```bash
   npm start
   ```
   *Acesse `http://localhost:3000` (ou a porta configurada) em seu navegador.*

## 🔒 Segurança

Neste projeto, arquivos sensíveis (como variáveis de ambiente) e bancos de dados locais (`.sqlite`) são ignorados pelo controle de versão utilizando o arquivo `.gitignore`, garantindo que credenciais e dados de usuários não sejam expostos publicamente.
