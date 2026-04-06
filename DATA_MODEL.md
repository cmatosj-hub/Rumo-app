# Data Model

Este arquivo define a estrutura principal dos dados do sistema.

O objetivo é manter o projeto organizado e evitar que novas funcionalidades sejam criadas de forma bagunçada.

O sistema é um painel de gestão diária para motoristas de aplicativo.

---

# Regra geral

Os dados do sistema devem representar a rotina real do motorista.

O sistema não deve ser estruturado em torno de corrida por corrida.

A entidade principal do sistema é o **fechamento do dia**.

---

# 1. USER

Representa o usuário do sistema.

Campos principais:

- id
- nome
- email
- data_criacao

Observação:
Autenticação e cadastro já existem e não devem ser reescritos sem necessidade.

---

# 2. DAILY_CLOSURE

Representa o fechamento de um dia de trabalho.

Essa é a entidade mais importante do sistema.

Cada fechamento do dia pertence a um usuário.

Campos sugeridos:

- id
- user_id
- data
- uber_valor
- noventa_nove_valor
- outros_ganhos
- combustivel_valor
- lanche_valor
- pedagio_valor
- lavagem_valor
- manutencao_valor
- outros_gastos_valor
- hora_inicio
- hora_fim
- km_inicial
- km_final
- abastecimento_valor (opcional)
- abastecimento_litros (opcional)
- observacoes (opcional)
- criado_em
- atualizado_em

Campos calculados que podem ser exibidos ou derivados:
- total_ganho_dia
- total_gasto_dia
- lucro_dia
- horas_trabalhadas
- km_rodados
- media_hora_dia
- lucro_km_dia
- consumo_dia

Regra:
Preferir calcular esses valores a partir dos campos base sempre que possível.

---

# 3. DAILY_EXPENSE

Opcional, usar apenas se o projeto precisar separar melhor os gastos.

Serve para permitir múltiplos gastos no mesmo dia.

Campos sugeridos:

- id
- user_id
- daily_closure_id
- categoria
- valor
- descricao (opcional)
- criado_em

Categorias sugeridas:
- combustivel
- lanche
- pedagio
- lavagem
- manutencao
- outros

Regra:
Se o sistema já estiver funcionando bem com gastos agregados em DAILY_CLOSURE, não é obrigatório criar essa tabela agora.

---

# 4. FUEL_LOG

Representa abastecimentos do carro.

Pode vir do fechamento do dia ou de lançamentos próprios da tela Carro.

Campos sugeridos:

- id
- user_id
- daily_closure_id (opcional)
- data
- valor_total
- litros
- preco_por_litro (opcional, pode ser calculado)
- km_odometro (opcional)
- posto_nome (opcional)
- observacoes (opcional)
- criado_em

Regra:
Essa entidade permite relatórios melhores de consumo e histórico de abastecimento.

---

# 5. MAINTENANCE_LOG

Representa manutenções do carro.

Campos sugeridos:

- id
- user_id
- data
- tipo_manutencao
- valor
- km_odometro
- descricao (opcional)
- criado_em

Tipos comuns:
- troca_oleo
- pneus
- freios
- alinhamento
- balanceamento
- revisao
- lavagem
- outro

Regra:
Essa entidade alimenta a tela Carro e relatórios de custo do veículo.

---

# 6. VEHICLE_PROFILE

Representa os dados principais do carro do motorista.

Campos sugeridos:

- id
- user_id
- marca
- modelo
- ano
- placa (opcional)
- combustivel_tipo (opcional)
- km_atual (opcional)
- criado_em
- atualizado_em

Regra:
Assumir um motorista com um carro principal, a menos que o sistema precise suportar múltiplos veículos no futuro.

---

# 7. WEEKLY_GOAL

Representa a meta semanal do motorista.

Campos sugeridos:

- id
- user_id
- valor_meta_semana
- ativo
- criado_em
- atualizado_em

Regra:
Se o sistema já guarda metas em outro lugar, manter a lógica atual e adaptar com cuidado.

---

# 8. MONEY_SPLIT_SETTINGS

Representa a divisão automática do dinheiro, se essa função existir no sistema.

Campos sugeridos:

- id
- user_id
- percentual_para_rodar
- percentual_fundo_seguranca
- percentual_disponivel_usuario
- ativo
- criado_em
- atualizado_em

Regra:
A soma dos percentuais deve ser 100.

---

# 9. FIXED_ACCOUNT

Representa contas fixas do motorista.

Campos sugeridos:

- id
- user_id
- nome
- valor
- vencimento_dia
- ativo
- categoria (opcional)
- criado_em
- atualizado_em

Exemplos:
- aluguel do carro
- financiamento
- seguro
- parcela
- internet
- plano celular

Regra:
Essa entidade alimenta a tela Contas e o cálculo de custo mínimo do dia.

---

# 10. WALLET

Representa onde o dinheiro está.

Usar apenas se o sistema realmente trabalha com carteiras separadas.

Campos sugeridos:

- id
- user_id
- nome
- tipo
- saldo_atual
- ativo
- criado_em
- atualizado_em

Tipos comuns:
- dinheiro
- banco
- aplicativo
- pix

Regra:
Se a função de carteiras já existe, manter a estrutura atual e adaptar sem quebrar.

---

# 11. WEEKLY_METRICS

Representa métricas semanais consolidadas.

Essa entidade pode ser calculada em tempo real ou salva em cache para melhorar desempenho.

Campos sugeridos:

- user_id
- semana_referencia
- resultado_semana
- gasto_semana
- lucro_semana
- horas_semana
- km_semana
- media_hora_semana
- lucro_hora_semana
- lucro_km_semana
- consumo_semana
- percentual_meta
- falta_meta

Regra:
Se possível, calcular a partir dos fechamentos diários.
Salvar apenas se houver necessidade de performance.

---

# 12. INSIGHT_LOG

Opcional.

Serve para registrar insights gerados para o usuário.

Campos sugeridos:

- id
- user_id
- data_referencia
- tipo_insight
- mensagem
- nivel_prioridade
- criado_em

Tipos possíveis:
- meta
- arrecadacao
- produtividade
- lucro_km
- combustivel
- carro
- gastos

Regra:
Não é obrigatório salvar insight em banco se ele puder ser gerado dinamicamente.

---

# Relações principais

## USER
Pode ter muitos:
- daily_closure
- fuel_log
- maintenance_log
- fixed_account
- wallet

## DAILY_CLOSURE
Pertence a:
- user

Pode se relacionar com:
- fuel_log
- daily_expense

## VEHICLE_PROFILE
Pertence a:
- user

## WEEKLY_GOAL
Pertence a:
- user

## MONEY_SPLIT_SETTINGS
Pertence a:
- user

---

# Ordem de prioridade para implementação

Se o projeto ainda estiver em fase inicial, priorizar estas entidades:

1. USER
2. DAILY_CLOSURE
3. WEEKLY_GOAL
4. FIXED_ACCOUNT
5. VEHICLE_PROFILE
6. FUEL_LOG
7. MAINTENANCE_LOG

As demais podem ser adicionadas depois, se necessário.

---

# Regra de simplicidade

Sempre preferir a modelagem mais simples que resolva o problema.

Não criar tabelas demais sem necessidade.

Se um dado puder ser derivado de forma segura, evitar duplicação.

---

# Regra de crescimento futuro

A estrutura deve permitir crescer para:

- melhores relatórios
- insights automáticos
- acompanhamento do carro
- análise de consumo
- comparação entre semanas

Mas sem complicar o MVP.

---

# Objetivo final

O modelo de dados deve refletir a rotina real de um motorista de aplicativo:

- fechamento do dia
- gastos
- horas trabalhadas
- km rodados
- abastecimento
- manutenção
- contas fixas
- metas
- desempenho semanal