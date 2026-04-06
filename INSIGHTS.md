# Insights

Este arquivo define como o sistema gera insights automáticos para o motorista.

Insights são pequenas mensagens que ajudam o motorista a entender seu desempenho.

Eles aparecem principalmente na Home.

---

# Regras gerais

Insights devem ser:

- curtos
- claros
- úteis
- no máximo 2 frases
- escritos em linguagem simples

Mostrar apenas **1 insight por vez** na Home.

Nunca mostrar muitos insights juntos.

---

# Prioridade dos insights

Quando o sistema escolher qual insight mostrar, usar esta prioridade:

1. Meta da semana
2. Desempenho de arrecadação
3. Média por hora
4. Lucro por km
5. Consumo do carro
6. Situação do carro
7. Gastos elevados

O sistema deve sempre mostrar o insight mais relevante.

---

# 1. Insight de meta semanal

Se o motorista ainda não atingiu a meta:

Exemplo:

"Você já atingiu {percentual}% da meta semanal.  
Faltam R$ {valor} para concluir."

---

Se estiver atrasado na meta:

Exemplo:

"Você está abaixo da meta da semana.  
Talvez seja necessário aumentar a arrecadação nos próximos dias."

---

Se a meta já foi batida:

Exemplo:

"Parabéns, sua meta semanal já foi atingida.  
O que entrar agora aumenta seu ganho."

---

# 2. Insight de arrecadação

Se a arrecadação da semana estiver forte:

Exemplo:

"Sua arrecadação está acima da média recente.  
A semana está com bom desempenho."

---

Se estiver baixa:

Exemplo:

"Sua arrecadação caiu em relação aos últimos dias.  
Vale acompanhar se isso é pontual."

---

# 3. Insight de produtividade por hora

Se a média por hora estiver melhorando:

Exemplo:

"Sua média por hora aumentou nesta semana.  
Seu tempo de trabalho está rendendo mais."

---

Se estiver caindo:

Exemplo:

"Sua média por hora caiu nesta semana.  
Pode valer revisar horários ou dias de trabalho."

---

# 4. Insight de lucro por km

Se o lucro por km estiver bom:

Exemplo:

"Seu lucro por km está saudável nesta semana.  
A operação está eficiente."

---

Se estiver baixo:

Exemplo:

"Seu lucro por km caiu nesta semana.  
Seus custos podem estar pressionando o resultado."

---

# 5. Insight de consumo do carro

Se o consumo piorar:

Exemplo:

"O consumo do carro caiu nesta semana.  
Pode indicar trânsito pesado ou necessidade de revisão."

---

Se melhorar:

Exemplo:

"O consumo do carro melhorou nesta semana.  
A eficiência do veículo está melhor."

---

# 6. Insight de situação do carro

Se houver manutenção recente:

Exemplo:

"Você teve custo recente com manutenção.  
Observe o impacto disso no lucro da semana."

---

Se houver possível problema detectado:

Exemplo:

"Os dados do carro indicam possível perda de eficiência.  
Pode valer revisar o veículo."

---

# 7. Insight de gastos elevados

Se gastos estiverem altos em relação ao ganho:

Exemplo:

"Seus gastos estão altos em relação à arrecadação.  
Isso reduz seu lucro real."

---

Se combustível estiver pesando muito:

Exemplo:

"O combustível está consumindo uma parte grande da arrecadação."

---

# 8. Insight positivo

Quando o desempenho estiver bom:

Exemplo:

"A semana está com bom desempenho.  
Seu rendimento está consistente."

---

# Regras de exibição

Mostrar insights:

- na Home
- após fechamento do dia
- quando houver mudança relevante nos dados

Nunca mostrar insights genéricos sem base nos dados.

---

# Objetivo final

Os insights devem ajudar o motorista a entender rapidamente:

- como está seu desempenho
- se está perto da meta
- se o carro está eficiente
- se os gastos estão altos

Insights devem sempre ajudar o motorista a tomar decisões melhores no dia a dia.