# 🍳 Receitas App - Mobile

Aplicativo mobile desenvolvido em React Native com Expo para gerenciar receitas pessoais, consumindo a API RESTful desenvolvida em AdonisJS.

## 🚀 Tecnologias

- **Frontend**: React Native com Expo
- **Navegação**: React Navigation (Stack + Bottom Tabs)
- **Estado**: Context API + AsyncStorage
- **HTTP Client**: Axios
- **TypeScript**: Suporte completo
- **UI**: Componentes nativos com design moderno

## 📋 Funcionalidades Implementadas

### ✅ Funcionalidades Obrigatórias

- [x] **Cadastro e login de usuários** com JWT
- [x] **Tela de perfil** (edição de dados e foto)
- [x] **CRUD completo de receitas** (entidade principal)
- [x] **Listagem e visualização detalhada** de receitas
- [x] **Busca e filtros** por título, descrição, categoria e dificuldade
- [x] **Sistema de favoritos** (adicionar/remover/verificar)
- [x] **Dois tipos de usuário**: comum e admin
- [x] **API organizada em rotas RESTful**

### 🔧 Funcionalidades Extras

- [x] **Interface moderna e responsiva**
- [x] **Navegação intuitiva** com tabs
- [x] **Persistência de dados** com AsyncStorage
- [x] **Validação de formulários**
- [x] **Loading states** e tratamento de erros
- [x] **Pull-to-refresh** nas listagens
- [x] **Paginação infinita**
- [x] **Modais para edição**

## 📱 Telas Implementadas

### 🔐 Autenticação
- **LoginScreen**: Tela de login com validação
- **RegisterScreen**: Tela de registro de novos usuários

### 🏠 Principal
- **HomeScreen**: Lista de receitas com busca e filtros
- **RecipeDetailScreen**: Detalhes completos da receita
- **ProfileScreen**: Perfil do usuário com edição

### 📖 Funcionalidades
- **Sistema de favoritos** integrado
- **Busca e filtros** avançados
- **Edição de perfil** com modais
- **Alteração de senha** segura

## 🗂️ Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   └── RecipeCard.tsx   # Card de receita
├── contexts/           # Contextos React
│   └── AuthContext.tsx # Contexto de autenticação
├── navigation/         # Navegação
│   └── AppNavigator.tsx # Navegador principal
├── screens/           # Telas do app
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   ├── HomeScreen.tsx
│   ├── RecipeDetailScreen.tsx
│   └── ProfileScreen.tsx
├── services/          # Serviços de API
│   └── api.ts         # Cliente HTTP e serviços
├── types/             # Tipos TypeScript
│   └── index.ts       # Interfaces e tipos
└── utils/             # Utilitários
```

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- Expo CLI
- Backend rodando (ver README do backend)

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd ReceitasApp
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure a API
Edite o arquivo `src/services/api.ts` e altere a URL da API:

```typescript
const API_BASE_URL = 'http://localhost:3333/api/v1';
```

Para dispositivos físicos, use o IP da sua máquina:
```typescript
const API_BASE_URL = 'http://192.168.1.100:3333/api/v1';
```

### 4. Execute o app
```bash
npm start
```

### 5. Escaneie o QR Code
- **Android**: Use o app Expo Go
- **iOS**: Use a câmera do iPhone
- **Web**: Pressione 'w' no terminal

## 📱 Como Usar

### 🔐 Login
1. Abra o app
2. Use as credenciais de teste:
   - **Email**: joao@receitas.com
   - **Senha**: 12345678
3. Ou crie uma nova conta

### 🍳 Navegação
- **Tab Receitas**: Visualize e busque receitas
- **Tab Perfil**: Gerencie seu perfil e dados

### 🔍 Busca e Filtros
- Use a barra de busca para encontrar receitas
- Filtre por categoria (Sobremesas, Principais, etc.)
- Filtre por dificuldade (Fácil, Médio, Difícil)

### ❤️ Favoritos
- Toque no coração para favoritar/desfavoritar
- Acesse seus favoritos no perfil

### ✏️ Edição
- Toque em uma receita para ver detalhes
- Se for o dono da receita, pode editar/excluir
- Edite seu perfil no menu do perfil

## 🎨 Design System

### Cores
- **Primária**: #007AFF (Azul iOS)
- **Sucesso**: #4CAF50 (Verde)
- **Aviso**: #FF9800 (Laranja)
- **Erro**: #F44336 (Vermelho)
- **Neutro**: #666, #999, #CCC

### Tipografia
- **Títulos**: 24-28px, Bold
- **Subtítulos**: 20px, Bold
- **Corpo**: 16px, Regular
- **Legendas**: 14px, Regular

### Componentes
- **Cards**: Bordas arredondadas, sombras suaves
- **Botões**: Bordas arredondadas, estados visuais
- **Inputs**: Background claro, bordas sutis
- **Modais**: Overlay escuro, conteúdo centralizado

## 🔧 Configurações Avançadas

### Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
API_BASE_URL=http://localhost:3333/api/v1
```

### Debug
Para debug no dispositivo:
1. Conecte o dispositivo
2. Execute `npm start`
3. Pressione 'd' para abrir o DevTools

### Build
Para gerar APK/IPA:
```bash
expo build:android
expo build:ios
```

## 🧪 Testes

### Usuários de Teste
- **Admin**: admin@receitas.com / admin123
- **Comum**: joao@receitas.com / 12345678
- **Comum**: maria@receitas.com / 12345678

### Funcionalidades de Teste
1. **Login/Registro**: Teste autenticação
2. **Busca**: Teste filtros e busca
3. **Favoritos**: Teste sistema de favoritos
4. **CRUD**: Teste criação, edição e exclusão
5. **Perfil**: Teste edição de dados

## 📊 Performance

### Otimizações Implementadas
- **FlatList**: Para listas grandes
- **Pull-to-refresh**: Atualização manual
- **Paginação**: Carregamento sob demanda
- **Cache**: Dados persistidos localmente
- **Lazy Loading**: Componentes carregados quando necessário

### Monitoramento
- **Expo Analytics**: Métricas de uso
- **Error Tracking**: Captura de erros
- **Performance**: Tempo de carregamento

## 🛡️ Segurança

- **JWT**: Tokens de autenticação
- **HTTPS**: Comunicação segura
- **Validação**: Dados validados no cliente
- **Sanitização**: Inputs tratados
- **Storage**: Dados sensíveis criptografados

## 📈 Próximos Passos

- [ ] **Upload de imagens** com Expo Image Picker
- [ ] **Notificações push** com Expo Notifications
- [ ] **Modo offline** com cache local
- [ ] **Compartilhamento** de receitas
- [ ] **Avaliações** e comentários
- [ ] **Temas** claro/escuro
- [ ] **Animações** fluidas
- [ ] **Testes automatizados**

## 🐛 Troubleshooting

### Problemas Comuns

**App não conecta com a API:**
- Verifique se o backend está rodando
- Confirme a URL da API no `api.ts`
- Use IP local para dispositivos físicos

**Erro de autenticação:**
- Limpe o cache: `expo r -c`
- Reinstale o app
- Verifique as credenciais

**Performance lenta:**
- Reduza o número de itens por página
- Otimize as imagens
- Use o modo de desenvolvimento

## 📄 Licença

Este projeto está sob a licença MIT.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

---

**Desenvolvido com ❤️ usando React Native e Expo** 