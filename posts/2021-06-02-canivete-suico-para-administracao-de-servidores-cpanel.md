---
image: /assets/img/bash.png
title: Canivete suíço para administração de servidores cPanel
description: O cPanel & WHM possui um API para gerenciamento por linha de comando.
date: 2021-06-01
category: linux
background: "#EE0000"
tags:
  - linux
---
Quando iniciei a minha jornada proficional, uma das principais plataformas no qual eu trabalhava e prestava suporte era o cPanel e WHM, uma plataforma voltado para hosting e revenda de hospedagem de sites e e-mails.

Apesar da plataforma disponibilziar uma forma de gerenciamento por meio da interface, alguns momentos a administracao por linha de comando acabava por ser a forma mais rapida durante uma auditoria ou resoluçao de um problema.

Uma forma de automatizarmos muitas das atividades por linha de comando e utilizando as APIs do cPanel e WHM, possibilitando que executemos processos que antes so poderiam ser realizados por meio da interface diretamente por linha de comando.

Pensando nisso, durante todo esse tempo trabalhando diretamente com essa plataforma de hospedagem, acabei por criar um ambiente em shell script que reunia alguns desses atalhos por API e algumas outras ferramentas que agilizaram bastante a minha jornada de trabalho. 

## Menu

Quando carregado o ambiente tera as seguintes opçoes:

![](/assets/img/captura-de-tela-2021-07-06-às-20.43.13.png)

## Carregar o ambiente

Todo o script ficara disponiivel em meu github para acesso direto, para carregar o ambiente no seu servidor basta que sempre que acesse o mesmo carregue da seguinte forma:

```
eval "$(curl -s https://raw.githubusercontent.com/thiagoalexandria/cpanel/master/supas.sh)"
```

Com o ambiente carregado, podemos seguir com a utilizaçao dos comandos para gerenciar o nosso servidor, na proxima sessao vamos aprender como chamar algumas das principais funçoes as demais opçoes pode ser encontrada no read.me do repositorio.

## Principais funções

#### apache_status
Esse comando nao precisa de nenhum input, retornara o fullstatus do seu servidor apache, asism como os sockets ocupados e quantidade conexoes atuais.

#### restrict_http
Em alguns momentos possivelmente sera necessario realizar a restriçao de acesso web de um site/usuario cpanel, por exemplo uma conta que teve sua aplicaco web comprometida. Para a sua utilizacao basta informar o comando e em seguinte o nome do usuario cpanel que deseja restringir:

```
restrict_http usuario_cpanel
```

#### enable_spamass
Para uma rapida ativacao da condifuguracao de SpamAssassin em uma conta cpanel basta que executemos o comando da seguinte forma:

```
enable_spamass usuario_cpanel 
```

#### global_spambox
Algumas configuracoes sao essenciais, entre elas e a configuracao global da caixa de spam das contas de e-mail, basta que executemos o comando sem nenhum input inserido:

```
global_spambox
```

#### mq
Um dos problemas mais comuns em servidores de revenda e hospedagem e o problema frequente com compromentimento de spam ou usuario realizando envio de e-mails em massa para que possamos ter uma visao geral da fila de e-mails podemos executar o comando `mq`:

```
mq
```

#### delfrozen
Seguindo a ideia com problemas de e-mail, temos uma outra funcao bastante importante que e a `delfrozen` podendo ser utilizada para deletar os e-mails congelados que por ventura permanecem na fila de e-mails.

#### cpanel_session
As vezes, quando trabalhamos em servidores gerenciados e so possuimos o acesso shell ao mesmo nao temos como logar pela interface por nao sabermos da senha. 

Uma forma muito simples para resolvermos esse problema e gerar uma sessao do WHM para acesso unico, dessa forma a API ira gerar um URL temporario, para executar o comando `cpanel_session`.

#### autossl
Uma parte importante que podemos utilizar e geracao de certificados SSL com o autossl repassando apenas a conta cPanel:

```
autossl usuario_cpanel
```


#### servicestatus
Esse comando sera util pois retorna informacoes referente aos principais serviços do cPanel como tailwatchd, httpd, mysql, exim, sshd, ftpd, crond, imap, pop. Basta executar o comando `servicestatus`.

Bom espero que tenham curtido esse modelo de postagem, e que utilizem do ambiente para trazer mais praticidade no dia a dia de voces.

