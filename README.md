# Damas Clássicas

Jogo de damas brasileiras 8×8 em React + TypeScript + Vite, sem backend obrigatório.

## Rodar localmente

```bash
npm install
npm run dev
```

## Compilar versão web

```bash
npm run build
```

## Funcionalidades

- Modo local para dois jogadores
- IA Minimax com poda alfa-beta e três dificuldades
- Captura obrigatória e regra de maioria
- Damas voadoras, promoção, empate básico, reinício e desfazer
- Layout responsivo para celular e computador

## Atenção

Esta é uma versão inicial ainda sem validação completa das regras oficiais brasileiras. Em particular, caminhos alternativos de captura que chegam à mesma casa são resolvidos automaticamente pela interface; as regras de desempate e condições oficiais de empate exigem testes adicionais. A lógica atual de promoção deve ser auditada em sequências de captura. Não é ainda um executável Windows nem uma publicação Steam. O Lovable precisa importar/conectar o repositório para mostrar uma prévia.
