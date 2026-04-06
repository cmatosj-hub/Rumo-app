# System Metrics

Este arquivo define as métricas principais do sistema para motoristas de aplicativo.

O objetivo é manter os cálculos consistentes em toda a aplicação.

---

# Regras gerais

Sempre usar linguagem simples na interface.

As métricas devem ajudar o motorista a entender:

- quanto ganhou
- quanto gastou
- quanto sobrou
- quanto rendeu por hora
- quanto rendeu por km
- como está o consumo do carro

---

# 1. Total ganho no dia

Somar:

- ganhos Uber
- ganhos 99
- outros ganhos

Fórmula:

total_ganho_dia = uber + noventa_nove + outros_ganhos

---

# 2. Total gasto no dia

Somar todos os gastos lançados no fechamento do dia:

- combustível
- lanche
- pedágio
- lavagem
- manutenção
- outros

Fórmula:

total_gasto_dia = combustivel + lanche + pedagio + lavagem + manutencao + outros_gastos

---

# 3. Lucro do dia

Fórmula:

lucro_dia = total_ganho_dia - total_gasto_dia

---

# 4. Horas trabalhadas no dia

Usar:

- hora início
- hora fim

Fórmula:

horas_trabalhadas = hora_fim - hora_inicio

Se o valor for inválido, mostrar erro simples para o usuário.

---

# 5. KM rodados no dia

Usar:

- km inicial
- km final

Fórmula:

km_rodados_dia = km_final - km_inicial

Se o valor for inválido, mostrar erro simples para o usuário.

---

# 6. Média por hora do dia

Fórmula:

media_hora_dia = total_ganho_dia / horas_trabalhadas

Se horas_trabalhadas for zero, não calcular.

---

# 7. Lucro por hora do dia

Fórmula:

lucro_hora_dia = lucro_dia / horas_trabalhadas

Se horas_trabalhadas for zero, não calcular.

---

# 8. Lucro por km do dia

Fórmula:

lucro_km_dia = lucro_dia / km_rodados_dia

Se km_rodados_dia for zero, não calcular.

---

# 9. Consumo do carro no dia

Se o usuário lançar abastecimento com:

- litros abastecidos
- km rodados no dia

Calcular:

consumo_dia = km_rodados_dia / litros_abastecidos

Se não houver litros informados, não calcular.

---

# 10. Resultado da semana

Somar todos os fechamentos do dia da semana atual.

Fórmula:

resultado_semana = soma(total_ganho_dia dos dias da semana)

---

# 11. Gasto da semana

Somar todos os gastos da semana atual.

Fórmula:

gasto_semana = soma(total_gasto_dia dos dias da semana)

---

# 12. Lucro real da semana

Fórmula:

lucro_semana = resultado_semana - gasto_semana

---

# 13. Horas trabalhadas na semana

Somar todas as horas dos fechamentos da semana atual.

Fórmula:

horas_semana = soma(horas_trabalhadas de cada dia)

---

# 14. KM rodados na semana

Somar todos os km dos fechamentos da semana atual.

Fórmula:

km_semana = soma(km_rodados_dia de cada dia)

---

# 15. Média por hora da semana

Fórmula:

media_hora_semana = resultado_semana / horas_semana

Se horas_semana for zero, não calcular.

---

# 16. Lucro por hora da semana

Fórmula:

lucro_hora_semana = lucro_semana / horas_semana

Se horas_semana for zero, não calcular.

---

# 17. Lucro por km da semana

Fórmula:

lucro_km_semana = lucro_semana / km_semana

Se km_semana for zero, não calcular.

---

# 18. Consumo médio da semana

Se houver abastecimentos suficientes na semana:

consumo_semana = km_semana / soma(litros_abastecidos_na_semana)

Se não houver dados suficientes, não calcular.

---

# 19. Dinheiro em caixa

Dinheiro em caixa é o valor realmente disponível para uso.

Se existir lógica de divisão automática no sistema, usar o valor disponível depois das reservas.

Não confundir:

- resultado da semana
com
- dinheiro em caixa

Resultado da semana = quanto entrou  
Dinheiro em caixa = quanto está realmente disponível

---

# 20. Meta da semana

A meta semanal deve vir da configuração do sistema.

Usar para calcular:

- percentual da meta atingido
- quanto falta para bater a meta

Fórmulas:

percentual_meta = resultado_semana / meta_semana

falta_meta = meta_semana - resultado_semana

Se resultado_semana for maior que meta_semana, mostrar meta concluída.

---

# 21. Indicadores principais da home

A home deve priorizar estas métricas:

- Resultado da semana
- Meta da semana
- Dinheiro em caixa
- Média por hora da semana

A home não deve ficar poluída com métricas demais.

---

# 22. Prioridade dos insights automáticos

Os insights devem usar esta prioridade:

1. meta semanal
2. desempenho de arrecadação
3. média por hora
4. lucro por km
5. consumo do carro
6. situação do carro
7. gastos altos

Mostrar apenas um insight por vez.

---

# 23. Regras de interpretação para insights

Exemplos de interpretação:

Se resultado da semana estiver abaixo da meta:
mostrar insight sobre meta

Se média por hora cair comparado ao histórico:
mostrar insight sobre produtividade

Se lucro por km cair:
mostrar insight sobre eficiência

Se consumo do carro piorar:
mostrar insight sobre carro ou combustível

Se gastos subirem demais:
mostrar insight sobre pressão de custos

---

# 24. Texto dos insights

Os insights devem ser:

- curtos
- claros
- úteis
- humanos
- no máximo 2 frases

Evitar linguagem robótica.

---

# 25. Resumo automático do fechamento do dia

Depois que o usuário preencher o fechamento do dia, mostrar:

- total ganho
- total gasto
- lucro do dia
- horas trabalhadas
- km rodados
- média por hora
- lucro por km
- consumo do dia, se houver abastecimento

---

# 26. Erros de cálculo

Sempre validar:

- hora fim maior que hora início
- km final maior que km inicial
- divisões por zero
- campos vazios quando obrigatórios

Mostrar mensagens simples para o usuário.

---

# 27. Objetivo final

Todos os cálculos do sistema devem ajudar o motorista a tomar decisões simples e rápidas no dia a dia.