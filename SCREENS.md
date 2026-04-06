# Screens

Este arquivo define as telas principais do sistema e a função de cada uma.

O objetivo é manter a navegação clara e evitar que funcionalidades sejam misturadas.

O sistema é um painel de gestão diária para motoristas de aplicativo.

---

# 1. HOME

A Home é a primeira tela mostrada após o login.

Ela deve ser simples, rápida de entender e focada em visão geral e ação principal.

## Objetivo da Home
Permitir que o motorista:
- entenda como está sua semana em poucos segundos
- veja o dinheiro disponível
- veja sua produtividade por hora
- registre o fechamento do dia
- leia um insight automático curto

## Estrutura da Home

### Cards principais no topo
- Resultado da semana
- Dinheiro em caixa
- Média por hora da semana

### Abaixo dos cards
- área de Fechamento do dia

### Abaixo do fechamento
- 1 insight automático curto

## O que não colocar em excesso na Home
- muitos gráficos
- tabelas grandes
- muitos relatórios
- blocos técnicos
- excesso de cards

A Home deve parecer um painel simples de leitura rápida.

---

# 2. FECHAMENTO DO DIA

Essa é a tela ou área mais importante do sistema.

Ela representa o fluxo principal do produto.

## Objetivo
Permitir que o motorista registre o resumo do dia inteiro, sem precisar lançar corrida por corrida.

## Campos principais

### Ganhos
- Uber
- 99
- Outros ganhos

### Gastos
- combustível
- lanche
- pedágio
- lavagem
- manutenção
- outros

### Tempo de trabalho
- hora início
- hora fim

### Rodagem
- km inicial
- km final

### Abastecimento opcional
- valor abastecido
- litros abastecidos

## Saída automática
Antes de salvar, mostrar:
- total ganho
- total gasto
- lucro do dia
- horas trabalhadas
- km rodados
- média por hora
- lucro por km
- consumo do dia, se houver

## Regra principal
Não exigir registro de corrida por corrida.

---

# 3. CARRO

Tela dedicada ao acompanhamento do veículo.

## Objetivo
Dar visibilidade ao desempenho e custo do carro.

## Informações principais
- km atual
- consumo médio
- histórico de abastecimentos
- histórico de manutenções
- custo com combustível
- custo com manutenção

## Seções da tela

### Resumo do carro
- km atual
- consumo médio
- gasto com combustível no período
- gasto com manutenção no período

### Abastecimentos
- lista de abastecimentos
- data
- valor
- litros
- preço por litro

### Manutenções
- lista de manutenções
- tipo
- valor
- data
- km do carro no momento da manutenção

## Regra
Essa tela deve ser prática e focada em controle do carro, não em gestão complexa de oficina.

---

# 4. CONTAS

Tela para acompanhar compromissos fixos.

## Objetivo
Permitir que o motorista entenda os custos fixos que precisa cobrir.

## Itens principais
- nome da conta ou credor
- valor
- vencimento

## Indicadores principais
- total de contas do mês
- custo mínimo do dia

## Exemplo de interpretação
Se o total mensal for R$ 2100:
mostrar que o motorista precisa fazer pelo menos R$ 70 por dia para cobrir os custos.

## Regra
Usar linguagem simples.
Evitar termos complexos como passivos ou credores como destaque principal.

---

# 5. RELATÓRIOS

Tela para análises mais detalhadas.

## Objetivo
Permitir acompanhar o desempenho do trabalho e do carro ao longo do tempo.

## Relatórios principais
- lucro por dia
- lucro por semana
- lucro por mês
- média por hora
- lucro por km
- km rodados por período
- gasto com combustível
- gasto com manutenção
- consumo médio do carro

## Regra
Os relatórios devem ser úteis e fáceis de ler.
Não criar excesso de visualizações confusas.

---

# 6. AJUSTES

Tela para configurações do sistema.

## Objetivo
Permitir configurar metas, divisão do dinheiro e preferências do sistema.

## Blocos principais

### Metas
- meta semanal
- meta mensal, se existir
- dias de trabalho

### Dinheiro
- divisão automática do dinheiro, se existir
- carteiras, se existir

### Preferências
- configurações gerais da experiência

## Regra
Ajustes não deve concentrar relatórios, dados do carro ou fechamento do dia.

---

# 7. REGRAS DE NAVEGAÇÃO

A navegação principal do sistema deve priorizar estas telas:

- Home
- Fechamento do dia
- Carro
- Contas
- Relatórios
- Ajustes

Se alguma funcionalidade nova for criada, ela deve ser encaixada na tela correta, sem misturar contextos.

---

# 8. REGRAS DE ORGANIZAÇÃO

## Home
Visão geral e ação principal

## Fechamento do dia
Registro consolidado do dia

## Carro
Controle do veículo

## Contas
Compromissos fixos

## Relatórios
Análise histórica

## Ajustes
Configurações

---

# 9. PRINCÍPIO GERAL

Cada tela deve ter uma função clara.

Evitar misturar:
- lançamento com relatório
- carro com contas
- ajustes com operação diária
- home com excesso de análise

O sistema deve ser simples para um motorista comum.

---

# 10. OBJETIVO FINAL

O sistema deve parecer um painel prático de controle diário do motorista.

Não deve parecer um ERP complicado ou um sistema financeiro difícil de usar.