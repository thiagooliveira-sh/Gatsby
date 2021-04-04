---
image: /assets/img/bash.png
title: Aprenda Cron Job de uma vez por todas
description: O Crontab ou Cron Job é um agendador de tarefas baseado em tempo em sistemas
date: 2021-03-20
category: linux
background: "#EE0000"
tags:
  - Linux
categories:
  - Linux
---
Sempre existem mais coisas que você pode fazer com muito mais praticidade. Gerenciar tarefas repetitivas usando um processo automatizado é algo que nós da área de tecnologia buscamos diariamente.

### O que é um cron job?

Então, um cron job é uma atividade que será executada pelo cron seguindo a forma com que foi agendado. 

### Conheça os comandos

Para começar a editar o arquivo crontab do usuário atual, digite o seguinte comando no seu terminal:

```
crontab -e
```

Para listar as tarefas cron você pode utilizar o comando `-l`

```
crontab -l
```

Para interagir com o crontab de um outro usuário, basta informar a opção `-u` informar o usuário e em seguida a variação que deseja, por exemplo para editar:

```
crontab -u username -e
```

Sabendo como interagir com o cron vamos então aprender a sintaxe para realizarmos os seus agendamentos.

### Agendamento

A sintaxe de um agendamento no crontab é bem simples, para entendermos melhor a sua disposição observe abaixo a imagem:



![]()