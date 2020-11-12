---
image: /assets/img/Exim.png
title: Gerenciamento de servidor de e-mail com Exim
description: >-
  O Exim é um MTA open source responsável por receber, rotear e entregar
  mensagens de e-mail presente nas principais plataformas de hospedagens, como o
  cPanel.  
date: '2020-11-10'
category: linux
background: '#EE0000'
tags:
  - Exim
  - cPanel
---
O serviço de e-mail Exim esta presente nos painéis de hospedagens mais famosos do mercado, como é o exemplo do cPanel. Dessa forma é de extrema importância que saibamos gerenciar e administrar as suas funcionalidades. 

O gerenciamento do Exim por sí só é bem tranquilo, é fácil identificar os usuários que enviam e-mails em massa e também as filas de e-mails. Dessa forma reuni alguns comandos que podem facilitar o seu gerenciamento de e-mail e detecção de spam. 

Vamos começar com a parte mais simples, visualização e remoção de e e-mails que estão presos na fila de e-mail:

```
# Visualizar toda a fila de e-mail, quantidade por remetente
exim -bp | grep "<*>" | awk {'print $4'} | sort | uniq -c | sort -n
```

Para remoção de e-mail da fila existe alguns comandos que podem ser utilizados, remoção de e-mails congelados, que estão na fila a muito tempo, e até por remetente:

```
# Remove as mensagens na fila com mais de 24 horas.
exiqgrep -o 86400 -i | xargs exim -Mrm

# Apagar todos os e-mails congelados
exiqgrep -z -i | xargs exim -Mrm

# Apaga email congelado e sem remetente
exim -bpu | grep "<>" | awk '{print $3}' | xargs exim -Mrm

# Apagar emails de uma conta de email
exiqgrep -i -f teste@teste.com.br | xargs exim -Mrm
```

Se algum usuário estiver com bastante e-mails na fila, é interessante analisarmos mais informações sobre os e-mails enviados, podemos estar lidando com uma newsletter ou com um comprometimento da conta, para analisar isso, nós precisamos filtrar todas as mensagens da conta:

```
exim -bp | grep "teste@teste.com.br"
```

Dessa forma teremos um output semelhante ao da imagem abaixo:

![Exim queue](/assets/img/2.jpg "Exim queue")



Observe que cada mensagem possui um identificador como por exemplo "1WfnSO-004UX-9d" esse é o id da mensagem para que possamos rastreá-la caso necessário, existem três formas de fazermos isso, podemos verificar o seu cabeçalho, corpo e fluxo de envio/recebimento no log de e-mail:

```
# Verifica os cabeçalhos de uma mensagem
exim -Mvh <id-da-mensagem>

# Verifica o corpo de uma mensagem
exim -Mvb <id-da-mensagem>

# Verifica o log de e-mail  
exiqgrep <id-da-mensagem> /var/log/exim_mainlog
```



Para
