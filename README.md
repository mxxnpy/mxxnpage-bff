# mxxn Dashboard Backend

Este é o backend do mxxn Dashboard, uma aplicação NestJS que fornece APIs para integração com serviços externos como GitHub, Spotify, Discord e serviços de clima.

## Funcionalidades

### API de Clima
- **GET /backend/weather**: Retorna as condições climáticas atuais em São Paulo
- Utiliza a API WeatherAPI.com para obter dados em tempo real

### API do GitHub
- **GET /backend/github/contributions**: Retorna as contribuições do usuário 'mxxnpy'
- **GET /backend/github/activity**: Retorna a atividade recente do usuário
- Utiliza a API do GitHub com autenticação via token

### API do Spotify
- **GET /backend/spotify/now-playing**: Retorna a música que está sendo reproduzida atualmente
- **GET /backend/spotify/top-artists**: Retorna os artistas mais ouvidos
- **GET /backend/spotify/top-tracks**: Retorna as músicas mais ouvidas
- **GET /backend/spotify/playlists**: Retorna as playlists do usuário
- **GET /backend/spotify/auth/login**: Inicia o fluxo de autenticação OAuth
- **GET /backend/spotify/auth/callback**: Callback para o fluxo de autenticação OAuth
- Utiliza a API do Spotify com autenticação OAuth

### API do Discord
- **GET /backend/discord/status**: Retorna o status atual do usuário no Discord
- Utiliza a API do Discord com autenticação via token

### API de Status
- **GET /backend/status**: Retorna o status atual do desenvolvedor com base na hora do dia e nas atividades

## Recursos Técnicos
- **Arquitetura Modular**: Organização em módulos para cada serviço
- **Swagger**: Documentação automática da API
- **CORS**: Configuração para permitir solicitações de origens específicas
- **Autenticação OAuth**: Implementação do fluxo OAuth para o Spotify
- **Cache**: Armazenamento em cache de respostas para reduzir chamadas de API

## Configuração

### Pré-requisitos
- Node.js 18+
- NestJS CLI

### Instalação
```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run start:dev
```

### Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```
# Spotify API Credentials
SPOTIFY_CLIENT_ID=seu_client_id
SPOTIFY_CLIENT_SECRET=seu_client_secret
SPOTIFY_REDIRECT_URI=https://mxxnpage-bff.onrender.com/backend/spotify/auth/callback

# GitHub API Credentials
GITHUB_TOKEN=seu_github_token

# Weather API Credentials
WEATHER_API_KEY=sua_api_key

# Discord API Credentials
DISCORD_CLIENT_ID=seu_discord_client_id
DISCORD_CLIENT_SECRET=seu_discord_client_secret
DISCORD_REDIRECT_URI=https://mxxnpage-bff.onrender.com/backend/discord/auth/callback

# Application Settings
PORT=3000
NODE_ENV=development
```

## Estrutura do Projeto

### Módulos Principais
- **Weather Module**: Gerencia a integração com a API de clima
- **GitHub Module**: Gerencia a integração com a API do GitHub
- **Spotify Module**: Gerencia a integração com a API do Spotify
- **Discord Module**: Gerencia a integração com a API do Discord
- **Status Module**: Gerencia o status do desenvolvedor

### Serviços
- **Weather Service**: Comunicação com a API de clima
- **GitHub Service**: Comunicação com a API do GitHub
- **Spotify Service**: Comunicação com a API do Spotify
- **Discord Service**: Comunicação com a API do Discord
- **Status Service**: Lógica para determinar o status do desenvolvedor
- **Token Storage Service**: Gerenciamento de tokens do Spotify

## Documentação da API
A documentação Swagger está disponível em `/backend/docs` quando o servidor está em execução.

## Configuração CORS
O backend está configurado para permitir solicitações CORS das seguintes origens:
- `https://mxxnpy.github.io` (produção)
- `http://localhost:4202` (desenvolvimento)

## Autenticação do Spotify
O backend implementa o fluxo OAuth 2.0 para autenticação com o Spotify:

1. O usuário é redirecionado para `/backend/spotify/auth/login`
2. Após autorização no Spotify, o usuário é redirecionado para `/backend/spotify/auth/callback`
3. O backend armazena os tokens de acesso e atualização
4. As solicitações subsequentes à API do Spotify usam o token de acesso armazenado
5. O token é atualizado automaticamente quando expira

## Implantação
O backend está configurado para implantação no Render.com:

```yaml
services:
  - type: web
    name: mxxnpage-bff
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm run start:prod
    envVars:
      - key: NODE_ENV
        value: production
      # Outras variáveis de ambiente
```

Consulte o guia de implantação para instruções detalhadas sobre como implantar o backend no Render.com.

## Monitoramento e Logs
Em produção, os logs estão disponíveis no painel do Render.com.

## Solução de Problemas
- **Erro de CORS**: Verifique se a origem está configurada corretamente
- **Erro de Autenticação**: Verifique se as credenciais estão configuradas corretamente
- **Erro de API Externa**: Verifique se os tokens de API são válidos
