# Project Rules

Este projeto é um sistema de gestão diária para motoristas de aplicativo (Uber e 99).

O objetivo do sistema é ajudar o motorista a entender rapidamente:

- quanto ganhou
- quanto gastou
- quanto realmente sobrou
- como está o desempenho do trabalho
- como está a situação do carro

O sistema não é um ERP financeiro complexo.

Ele deve funcionar como um painel simples de controle da operação diária do motorista.

---

# Regra principal do sistema

O fluxo principal é o **fechamento do dia**.

O motorista não deve registrar corrida por corrida.

O sistema deve permitir registrar o dia inteiro com poucos campos.

---

# Estrutura principal do sistema

O sistema deve priorizar estas áreas:

Home  
Fechamento do dia  
Carro  
Contas  
Relatórios  
Ajustes  

---

# Home

A home deve ser simples e rápida de entender.

Ela deve ter:

3 cards principais:

- Resultado da semana
- Dinheiro em caixa
- Média por hora da semana

Abaixo disso deve existir a área para registrar o **fechamento do dia**.

E abaixo disso deve existir **um insight automático curto** baseado nos dados do motorista.

---

# Fechamento do dia

O fechamento do dia deve permitir registrar:

Ganhos:
- Uber
- 99
- Outros

Gastos:
- combustível
- lanche
- pedágio
- lavagem
- manutenção
- outros

Tempo de trabalho:
- hora início
- hora fim

Rodagem:
- km inicial
- km final

Abastecimento (opcional):
- valor abastecido
- litros abastecidos

---

# Dados que o sistema deve calcular

O sistema deve calcular automaticamente:

- total ganho no dia
- total gasto no dia
- lucro do dia
- horas trabalhadas
- km rodados
- média por hora
- lucro por km
- consumo do carro

---

# Carro

O sistema deve permitir acompanhar o carro:

- km atual
- consumo médio
- histórico de abastecimentos
- histórico de manutenções

---

# Relatórios

Relatórios principais:

- lucro por dia
- lucro por semana
- lucro por mês
- km rodados
- média por hora
- lucro por km
- gastos com combustível
- gastos com manutenção

---

# Insights automáticos

O sistema pode gerar pequenos textos automáticos baseados nos dados.

Exemplo:

Meta semanal
Desempenho por hora
Consumo do carro
Lucro por km
Gastos elevados
Arrecadação da semana

Os insights devem ser:

curtos  
claros  
úteis  

No máximo 2 frases.

Mostrar apenas um insight por vez na home.

---

# Linguagem da interface

Usar linguagem simples para motorista.

Exemplos:

Resultado da semana  
Dinheiro em caixa  
Média por hora  
Fechamento do dia  
KM rodados  
Consumo médio  

Evitar termos técnicos ou financeiros complexos.