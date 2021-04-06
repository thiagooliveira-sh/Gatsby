---
image: /assets/img/bash.png
title: Aprenda Cron Job de uma vez por todas
description: O Crontab ou Cron Job é um agendador de tarefas baseado em tempo em sistemas
date: 2021-04-06
category: linux
background: "#EE0000"
tags:
  - Linux
categories:
  - Linux
---
Sempre existirá coisas que você pode fazer com muito mais praticidade. Gerenciar tarefas repetitivas usando um processo automatizado é algo que nós da área de tecnologia buscamos diariamente.

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

![](/assets/img/crontab.png)

Observe que cada `*` significa uma variação para a sua configuração, vamos praticar alguns cenários.

 * Um agendamento para executar um script de backup todo dia as 23h:
```
00 23 * * * /scripts/backup.sh
```
* Um agendamento para executar um script de sincronia a cada 10 minutos:

```
*/10 * * * *  /scripts/sync.sh
```
* Uma rotina para limpar os arquivos de um diretório todo dia primeiro ás 10h 
```
00 10 */1 * * find /home/thiago/logs/* -type f -delete
```

### Permissões Cron
Os dois arquivos possuem um papel importante quando se trata de cron jobs.

* /etc/cron.allow –se o `cron.allow` existe, ele deve contar o nome do usuário para o usuário utilizar cron jobs.
* /etc/cron.deny – se o arquivo `cron.allow` não existe, mas o arquivos cron.deny existe, então para usar cron jobs o usuário não deve estar listado no arquivo cron.deny.


Sabendo disso, podemos começar a automatizar nossas rotinas que hoje necessitam de uma intervenção manual e deixa-las configuradas no crontab.

Valeu! 