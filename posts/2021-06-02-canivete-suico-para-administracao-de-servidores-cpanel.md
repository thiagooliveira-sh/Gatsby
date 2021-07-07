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
Quando iniciei a minha jornada profissional, uma das principais plataformas no qual eu trabalhava e prestava suporte era o cPanel e WHM, uma plataforma voltado para hosting e revenda de hospedagem de sites e e-mails.

Apesar da plataforma disponibilziar uma forma de gerenciamento por meio da interface, alguns momentos a administração por linha de comando acabava por ser a forma mais rápida durante uma auditoria ou resolução de um problema.

Uma forma de automatizarmos muitas das atividades por linha de comando é utilizando as API's do cPanel e WHM, possibilitando a execução de processos por linha de comando que antes só poderiam ser realizados por meio da interface web.

Pensando nisso, durante todo esse tempo trabalhando diretamente com o cPanel, acabei por criar um ambiente em shell script que reune alguns desses atalhos por API e algumas outras ferramentas que agilizaram bastante a minha jornada de trabalho. 

## Menu

Quando carregado o ambiente terá as seguintes opções:

![](/assets/img/captura-de-tela-2021-07-06-às-20.43.13.png)

## Carregar o ambiente

Todo o script ficará disponíivel em meu [github](https://github.com/thiagoalexandria/cpanel) para que possam analisar, para carregar o ambiente no seu servidor basta que sempre que acesse o mesmo carregue da seguinte forma:

```
eval "$(curl -s https://raw.githubusercontent.com/thiagoalexandria/cpanel/master/supas.sh)"
```

Com o ambiente carregado, podemos seguir com a utilização dos comandos para gerenciar o nosso servidor. Na próxima sessão vamos aprender como chamar algumas das principais funções, as demais opções pode ser encontrada no read.me do repositório.

## Principais funções

#### apache_status

Esse comando não precisa de nenhum input, retornará o fullstatus do seu servidor apache, asism como os sockets ocupados e quantidade conexões atuais.

#### restrict_http

Em alguns momentos possivelmente será necessário realizar a restrição de acesso web de um site/usuário cpanel, por exemplo uma conta que teve sua aplicação web comprometida. Para executarmos basta informar o comando acompanhada do nome do usuário cpanel que deseja restringir:

```
restrict_http usuario_cpanel
```

#### enable_spamass

Para uma rápida ativação da condifuguração de SpamAssassin em uma conta cpanel basta que executemos o comando da seguinte forma:

```
enable_spamass usuario_cpanel 
```

#### global_spambox

Algumas configurações são essenciais, entre elas a configuração global da caixa de spam das contas de e-mail, basta que executemos o comando sem nenhum input inserido:

```
global_spambox
```

#### mq

Um dos problemas mais comuns em servidores de revenda e hospedagem é o problema frequente com compromentimento de spam ou usuário realizando envio de e-mails em massa para que possamos ter uma visão geral da fila de e-mails podemos executar o comando `mq`:

```
mq
```

#### delfrozen

Seguindo a ideia com problemas de e-mail, temos uma outra função bastante importante que é a `delfrozen` podendo ser utilizada para deletar os e-mails congelados que por ventura permaneceram na fila de e-mails.

#### cpanel_session

As vezes, quando trabalhamos em servidores gerenciados e só possuimos o acesso shell ao servidor, ficamos limitados em algumas açòes que sao realizadas por meio da interface, pois não temos a senha do user root para login. 

Uma forma muito simples para resolvermos esse problema é gerar uma sessão do WHM de acesso único, dessa forma a API ira gerar um URL temporário, basta executar o comando `cpanel_session`.

#### autossl

Uma parte importante que podemos utilizar é geração de certificados SSL com o autossl repassando apenas a conta cPanel:

```
autossl usuario_cpanel
```

#### servicestatus

Esse comando sera util pois retorna informações referente aos principais serviços do cPanel como tailwatchd, httpd, mysql, exim, sshd, ftpd, crond, imap, pop. Basta executar o comando `servicestatus`.

Bom espero que tenham curtido esse modelo de postagem, e que utilizem do ambiente para trazer mais praticidade no dia a dia de vocês.