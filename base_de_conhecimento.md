# Base de Conhecimento - Sistema de Gestão Documental 5º CPA

Este documento contém informações sobre a estrutura e arquitetura do Sistema de Gestão Documental do 5º Comando de Policiamento de Área (5CPA) da Polícia Militar do Rio de Janeiro. O objetivo é fornecer uma referência para futuras implementações sem quebrar o sistema existente.

## Tecnologias Utilizadas

- **Frontend**: React 18.3.1 com TypeScript 5.5.3
- **Bundler**: Vite 5.4.1
- **UI**: 
  - Tailwind CSS 3.4.11
  - Shadcn/UI (componentes customizáveis baseados em Radix UI)
- **Gerenciamento de Estado**: 
  - Context API (hooks personalizados)
  - React Query (configurado mas não totalmente implementado)
- **Roteamento**: React Router 6.26.2
- **Validação**: Zod 3.23.8
- **Notificações**: Sonner e Toast personalizado
- **Banco de Dados**: Supabase (configurado mas não implementado)
- **Formatação de Data**: date-fns com suporte para localização ptBR

## Estrutura de Diretórios

```
p3-painel/
├── public/                  # Arquivos estáticos
├── src/
│   ├── assets/              # Imagens e outros recursos
│   ├── components/          # Componentes reutilizáveis
│   │   ├── documents/       # Componentes relacionados a documentos
│   │   ├── layout/          # Componentes de layout (MainLayout, Header, Sidebar)
│   │   ├── missions/        # Componentes relacionados a missões diárias
│   │   ├── ui/              # Componentes de UI (Shadcn)
│   │   └── ProtectedRoute.tsx # Componente para rotas protegidas
│   ├── hooks/               # Hooks personalizados
│   │   ├── use-mobile.tsx   # Hook para detectar dispositivos móveis
│   │   ├── use-toast.ts     # Hook para notificações toast
│   │   ├── useAuth.tsx      # Hook para autenticação
│   │   ├── useDocuments.tsx # Hook para gerenciamento de documentos
│   │   ├── useUsers.tsx     # Hook para gerenciamento de usuários
│   │   └── useMissions.tsx  # Hook para gerenciamento de missões diárias
│   ├── lib/                 # Utilitários e configurações
│   ├── pages/               # Páginas da aplicação
│   │   ├── AdminCreateMission.tsx  # Criação de missões diárias (admin)
│   │   ├── AdminDocumentsList.tsx  # Lista de documentos (admin)
│   │   ├── AdminEditUser.tsx       # Edição de usuário (admin)
│   │   ├── AdminMissionDetail.tsx  # Detalhes de missão diária (admin)
│   │   ├── AdminMissionsList.tsx   # Lista de missões diárias (admin)
│   │   ├── AdminNewUser.tsx        # Criação de usuário (admin)
│   │   ├── AdminUsersList.tsx      # Lista de usuários (admin)
│   │   ├── DailyMissions.tsx       # Missões diárias (usuário)
│   │   ├── DocumentDetail.tsx       # Detalhes de documento
│   │   ├── DocumentUpload.tsx      # Upload de documento
│   │   ├── DocumentsList.tsx       # Lista de documentos
│   │   ├── Index.tsx               # Página inicial
│   │   ├── Login.tsx               # Página de login
│   │   └── NotFound.tsx            # Página 404
│   ├── App.css              # Estilos globais da aplicação
│   ├── App.tsx              # Componente principal com rotas
│   ├── index.css            # Estilos globais
│   ├── main.tsx             # Ponto de entrada da aplicação
│   └── vite-env.d.ts        # Tipos para o ambiente Vite
├── .gitignore
├── components.json          # Configuração do Shadcn/UI
├── eslint.config.js         # Configuração do ESLint
├── package.json             # Dependências e scripts
├── postcss.config.js        # Configuração do PostCSS
├── tailwind.config.ts       # Configuração do Tailwind CSS
├── tsconfig.app.json        # Configuração do TypeScript para a aplicação
├── tsconfig.json            # Configuração principal do TypeScript
├── tsconfig.node.json       # Configuração do TypeScript para o Node
└── vite.config.ts           # Configuração do Vite
```

## Arquitetura da Aplicação

### Autenticação (useAuth.tsx)

- **Contexto**: `AuthContext` fornece informações sobre o usuário autenticado.
- **Estado**: 
  - `user`: Informações do usuário logado
  - `isAuthenticated`: Boolean indicando se há um usuário autenticado
  - `isLoading`: Estado de carregamento
- **Funções**:
  - `login(email, password)`: Autentica o usuário
  - `logout()`: Encerra a sessão do usuário
- **Persistência**: Utiliza localStorage para manter a sessão entre recarregamentos
- **Tipos**:
  - `UserRole`: 'admin' | 'user'
  - `User`: { id, name, email, role, unit }
  - `Unit`: { id, name }

### Gestão de Documentos (useDocuments.tsx)

- **Contexto**: `DocumentsContext` fornece acesso aos documentos e funções para gerenciá-los.
- **Estado**:
  - `documents`: Lista de documentos
  - `loading`: Estado de carregamento
- **Funções**:
  - `addDocument()`: Adiciona um novo documento
  - `updateDocumentStatus()`: Atualiza o status de um documento
  - `addComment()`: Adiciona um comentário a um documento
  - `getUserDocuments()`: Obtém documentos de um usuário específico
  - `getUnitDocuments()`: Obtém documentos de uma unidade específica
  - `getAllDocuments()`: Obtém todos os documentos
- **Persistência**: Utiliza localStorage para armazenar documentos
- **Tipos**:
  - `DocumentStatus`: 'pending' | 'approved' | 'revision' | 'completed'
  - `Document`: { id, title, description, unitId, unitName, documentDate, submissionDate, status, fileUrl, fileName, fileType, fileSize, submittedBy, comments }

### Gestão de Usuários (useUsers.tsx)

- **Contexto**: `UsersContext` fornece acesso aos usuários e funções para gerenciá-los.
- **Estado**:
  - `users`: Lista de usuários
  - `loading`: Estado de carregamento
- **Funções**:
  - `addUser()`: Adiciona um novo usuário
  - `updateUser()`: Atualiza informações de um usuário
  - `deleteUser()`: Remove um usuário permanentemente
  - `toggleUserStatus()`: Ativa/desativa um usuário
  - `getUserById()`: Obtém um usuário pelo ID
  - `getUnits()`: Obtém todas as unidades
- **Persistência**: Utiliza localStorage para armazenar usuários
- **Tipos**:
  - `UserData`: { id, name, email, role, unit, createdAt, lastLogin, active }

### Gestão de Missões Diárias (useMissions.tsx)

- **Contexto**: `MissionsContext` fornece acesso às missões diárias e funções para gerenciá-las.
- **Estado**:
  - `missions`: Lista de missões
  - `loading`: Estado de carregamento
- **Funções**:
  - `addMission()`: Adiciona uma nova missão
  - `updateMission()`: Atualiza informações de uma missão
  - `deleteMission()`: Remove uma missão permanentemente
  - `getMissionById()`: Obtém uma missão pelo ID
  - `getUserMissions()`: Obtém missões de um usuário específico
  - `getUserMissionsByDay()`: Obtém missões de um usuário para um dia específico
  - `getUnitMissions()`: Obtém missões de uma unidade específica
  - `addSubmission()`: Adiciona um envio de relatório para uma missão
  - `updateSubmission()`: Atualiza informações de um envio
  - `deleteSubmission()`: Remove um envio permanentemente
  - `getSubmissionById()`: Obtém um envio pelo ID
- **Persistência**: Utiliza localStorage para armazenar missões
- **Tipos**:
  - `Mission`: { id, title, description, day, unitId, unitName, createdAt, dueDate, createdBy, submissions }
  - `MissionSubmission`: { id, userId, userName, fileName, fileUrl, fileType, fileSize, submissionDate, comments }

### Roteamento (App.tsx)

- **Biblioteca**: React Router Dom
- **Estrutura**:
  - Rotas públicas: `/login`
  - Rotas protegidas para todos os usuários: `/`, `/documents/upload`, `/documents`, `/documents/:id`, `/missions`
  - Rotas protegidas apenas para administradores: 
    - Documentos: `/admin/documents`
    - Usuários: `/admin/users`, `/admin/users/new`, `/admin/users/edit/:id`
    - Missões: `/admin/missions`, `/admin/missions/new`, `/admin/missions/:id`
  - Rota de fallback: `/404`
- **Proteção**: Componente `ProtectedRoute` verifica autenticação e permissões

### Interface do Usuário

- **Layout Principal**: `MainLayout.tsx` - Estrutura base com sidebar, header e footer
- **Navegação**: 
  - `AppSidebar.tsx` - Menu lateral com links de navegação
  - `Header.tsx` - Cabeçalho com notificações e menu do usuário
- **Componentes de Documento**: 
  - `DocumentCard.tsx` - Card para exibir informações resumidas de um documento
- **Componentes de Missão**:
  - `MissionUploadForm.tsx` - Formulário para upload de relatórios de missões
- **Páginas**:
  - `Login.tsx` - Página de login
  - `Index.tsx` - Dashboard principal
  - `DocumentsList.tsx` - Lista de documentos do usuário
  - `DocumentDetail.tsx` - Detalhes de um documento específico
  - `DocumentUpload.tsx` - Formulário para upload de documentos
  - `DailyMissions.tsx` - Missões diárias organizadas por dia da semana
  - `AdminDocumentsList.tsx` - Gestão de documentos (admin)
  - `AdminUsersList.tsx` - Gestão de usuários (admin)
  - `AdminNewUser.tsx` - Formulário para criar usuário (admin)
  - `AdminEditUser.tsx` - Formulário para editar usuário (admin)
  - `AdminMissionsList.tsx` - Gestão de missões diárias (admin)
  - `AdminCreateMission.tsx` - Criação de missões diárias (admin)
  - `AdminMissionDetail.tsx` - Detalhes de uma missão específica (admin)
  - `NotFound.tsx` - Página 404

## Fluxo de Dados

1. **Autenticação**:
   - O usuário faz login através da página `Login.tsx`
   - O hook `useAuth` autentica o usuário e armazena os dados no localStorage
   - O componente `ProtectedRoute` verifica a autenticação antes de renderizar rotas protegidas

2. **Gestão de Documentos**:
   - Documentos são carregados do localStorage pelo hook `useDocuments`
   - Usuários podem enviar documentos através da página `DocumentUpload.tsx`
   - Documentos podem ser visualizados em `DocumentsList.tsx` e `DocumentDetail.tsx`
   - Administradores podem gerenciar todos os documentos em `AdminDocumentsList.tsx`

3. **Gestão de Usuários**:
   - Usuários são carregados do localStorage pelo hook `useUsers`
   - Administradores podem gerenciar usuários em `AdminUsersList.tsx`
   - Novos usuários podem ser criados em `AdminNewUser.tsx`
   - Usuários existentes podem ser editados em `AdminEditUser.tsx`

4. **Gestão de Missões Diárias**:
   - Missões são carregadas do localStorage pelo hook `useMissions`
   - Usuários podem visualizar missões organizadas por dia da semana em `DailyMissions.tsx`
   - Usuários podem enviar, visualizar, editar e excluir relatórios para missões
   - Administradores podem criar missões em `AdminCreateMission.tsx`
   - Administradores podem listar todas as missões em `AdminMissionsList.tsx`
   - Administradores podem ver detalhes e gerenciar envios em `AdminMissionDetail.tsx`

## Dados Mockados

Atualmente, o sistema utiliza dados mockados armazenados no localStorage:

- **Usuários**: Definidos em `useUsers.tsx` (MOCK_USERS)
- **Unidades**: Definidas em `useUsers.tsx` (MOCK_UNITS)
- **Documentos**: Definidos em `useDocuments.tsx` (MOCK_DOCUMENTS)
- **Missões**: Definidas em `useMissions.tsx` (MOCK_MISSIONS)

## Pontos de Atenção para Futuras Implementações

1. **Integração com Backend**:
   - Os hooks `useAuth`, `useDocuments`, `useUsers` e `useMissions` precisarão ser modificados para fazer chamadas a uma API real
   - Implementar React Query para gerenciamento de estado assíncrono e cache

2. **Autenticação**:
   - Substituir a autenticação mockada por um sistema real (JWT, OAuth, etc.)
   - Implementar refresh token para manter a sessão ativa

3. **Armazenamento de Arquivos**:
   - Implementar upload real de arquivos (possivelmente usando Supabase Storage)
   - Adicionar validação de tipos de arquivo e tamanho

4. **Rotas**:
   - A rota `/admin/settings` é mencionada no sidebar mas não está implementada
   - A rota `/profile` é mencionada no header mas não está implementada
   - A rota `/notifications` é mencionada no header mas não está implementada
   - A rota `/admin/missions/edit/:id` é mencionada na interface mas não está implementada

5. **Componentes**:
   - Alguns componentes UI podem não estar totalmente implementados
   - Verificar se todos os componentes importados estão sendo utilizados

6. **Performance**:
   - Implementar paginação para listas grandes
   - Otimizar renderizações com useMemo e useCallback
   - Implementar lazy loading para componentes grandes

7. **Segurança**:
   - Implementar validação de formulários com Zod
   - Adicionar proteção contra CSRF
   - Sanitizar inputs do usuário

## Convenções de Código

- **Nomes de Arquivos**:
  - Componentes: PascalCase (ex: `DocumentCard.tsx`)
  - Hooks: camelCase com prefixo "use" (ex: `useAuth.tsx`)
  - Utilitários: kebab-case (ex: `use-toast.ts`)

- **Estilização**:
  - Tailwind CSS para estilos
  - Componentes Shadcn/UI para UI consistente
  - Cores personalizadas definidas no `tailwind.config.ts`

- **Tipagem**:
  - TypeScript para tipagem estática
  - Interfaces para definir tipos complexos
  - Enums para valores constantes

## Próximos Passos Recomendados

1. **Integração com Supabase**:
   - Implementar autenticação real
   - Configurar banco de dados para armazenar documentos e usuários
   - Configurar storage para armazenar arquivos

2. **Melhorias na UI/UX**:
   - Adicionar feedback visual para ações (loading states)
   - Implementar filtros avançados para busca de documentos
   - Melhorar responsividade para dispositivos móveis

3. **Testes**:
   - Adicionar testes unitários
   - Implementar testes de integração
   - Configurar CI/CD

4. **Documentação**:
   - Documentar APIs
   - Criar guia de estilo para componentes
   - Documentar processos de negócio

---

Este documento deve ser atualizado conforme o projeto evolui para garantir que todas as informações estejam atualizadas e precisas.

## Funcionalidades de Missões Diárias

### Para Usuários:
1. **Visualização de Missões**:
   - Missões organizadas por abas para cada dia da semana
   - Destaque para o dia atual
   - Suporte para missões específicas da unidade e missões para todas as unidades

2. **Envio de Relatórios**:
   - Formulário para upload de arquivos
   - Possibilidade de adicionar comentários ao envio

3. **Gerenciamento de Envios**:
   - Visualização de arquivos enviados
   - Edição do nome do arquivo
   - Exclusão de envios

### Para Administradores:
1. **Criação de Missões**:
   - Definição de título, descrição e dia da semana
   - Seleção de unidade específica ou todas as unidades
   - Definição de data de vencimento

2. **Gestão de Missões**:
   - Listagem de todas as missões com filtros por dia
   - Visualização detalhada com estatísticas de envios
   - Edição e exclusão de missões

3. **Gerenciamento de Envios**:
   - Visualização de todos os envios para cada missão
   - Edição e exclusão de envios de qualquer usuário

### Componentes Principais:
- `DailyMissions.tsx`: Interface principal para usuários
- `AdminMissionsList.tsx`: Lista de missões para administradores
- `AdminCreateMission.tsx`: Formulário de criação de missões
- `AdminMissionDetail.tsx`: Detalhes e gerenciamento de envios
- `MissionUploadForm.tsx`: Formulário de upload de relatórios
- `useMissions.tsx`: Hook para gerenciamento de estado

Última atualização: 09/05/2025
