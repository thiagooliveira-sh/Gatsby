---
title: IPTables compreensão básica
description: >-
  Será visto o fluxo de funcionamento do IPTables e seus comandos de forma
  básica.
date: '2020-01-27 05:16:28'
category: linux
background: '#EE0000'
---
Em máquinas Linux, é possível a utilização do IPTables como interface de firewall. Ele esta disponível em praticamente todas (se não todas) as distribuições Linux. O Linux em si possui um módulo que controla esse fluxo de pacotes chamado de Netfilter. O Iptables não é nada mais, nada menos, do que um front-end para o Netfilter.

Desta forma, sabendo administrar o Iptables, você conseguirá trabalhar em qualquer distribuição Linux.

## Conceitos

O mais confuso para quem começa a estudar sobre Iptables são as criações de regras, para isso é necessário compreender bem a sua divisão e como as suas tabelas e chains funcionam

## Table

Note que, toda e qualquer regra do Iptables será aplicada em uma table, que é simplesmente o contexto geral da nossa regra. Por exemplo, as regras direcionadas ao servidor em questão serão tratadas na table padrão filter, outra table bastante comum é a nat para realização de Network Address Translation (basicamente, converter IP privado em IP público).

## Chain

Depois, temos a chain, que é o que vem depois da table. No nosso caso, a table filter possui as chains INPUT, FORWARD e OUTPUT. Já a table nat, possui as chains PREROUTING, INPUT, OUTPUT e POSTROUTING. Nesse artigo, por se tratar de um artigo para entendimento básico, iremos abordar apenas a table filter, tratando as requisições recebidas na máquina/servidor.

* Input: Regras para pacotes que estão sendo recebidos pela máquina.
* Output: Regras para pacotes que estão saindo da máquina.
* Foward: Regras para pacotes que estão entrando em nossa máquina e que está sendo redirecionada para outro ponto.

## Special Value

O special value é a ação que a máquina irá tomar quando uma determinada regra for atingida. Neste caso, temos o ACCEPT, DROP e REJECT.

* ACCEPT: O pacote será aceito.
* DROP: O pacote será dropado.
* REJECT: O pacote será rejeitado, isso é, será enviado um sinal para o cliente de que o pacote foi rejeitado.

## Prática

### Listar regras existentes, quando a tabela não é especificada é utilizada a filter como padrão

```bash
iptables -L # Listar todas as regras
iptables -L -n # Lista sem resolução de nomes
iptables -t filter -L -n # Lista todas as regras da tabela filter
iptables -t nat -L -n # Lista todas as regras da tabela nat
iptables -L INPUT -n --line-numbers # Exibe numero de linhas nas listagens
iptables -F # Limpa todas as regras
```

Uma coisa importante para sabermos é que as regras são lidas de cima para baixo. Então, a primeira condição que bater, será aplicada. Antes de seguir com a aplicação de algumas regras é interessante ter em mente algumas informações:

* Quais os serviços esse servidor irá executar e quais portas serão utilizadas
* Determinar quais são os destinos/remetentes confiáveis.
* Determinar qual politica adotar, Accept ou Drop.

No cenário em questão, supomos que máquina será um servidor web e necessita das portas 80 e 443 liberadas para que o acesso ao serviço seja possível, para isso teremos de executar o seguinte comando:

```bash
iptables -I INPUT -p tcp --dport 80 -j ACCEPT
iptables -I INPUT -p tcp --dport 443 -j ACCEPT
```

Como não determinamos a tabela, fica implícito ao IPTables que a table utilizada é a filter, o ***\-I*** determina a chain que será utilizada, nesse caso será a INPUT, como a requisição será tratada na máquina, o ***\-p tcp*** determina que o protocolo utilizado será o TCP, podendo ser alterado pada ***\-p udp*** quando UDP. O trecho ***\--dport*** informa a porta que será atingida pelo pacote, nesse caso determinamos as portas 80 e 443, portas padrões para servidores web, o ***\-j*** irá determinar o special value, nesse caso a máquina deverá aceitar.

## Alterando a politica padrão 

O padrão determinado pelo IPTables é a politica de ***ACCEPT***, na maioria dos casos é necessário o bloqueio total e ir realizando a liberação de acordo com a necessidade de cada serviço ou ambiente. Para mudar a politica padrão de uma tabela, basta seguir da seguinte forma:

```bash
iptables -P INPUT DROP
iptables -P OUTPUT DROP
iptables -P FORWARD DROP
```

Com a politica ajustada para negar as conexões basta seguir com a liberação do acesso para os endereços que julga confiáveis ou que devem ter acesso a máquina, bata utilizar o seguinte modelo para

```bash
iptables -t filter -I INPUT -s IPORIGEM -p tcp --dport PORTA -j ACCEPT
```

É comum que seja adotado a adição de comentários, para que possa saber o motivo da adição qual ou mais informações sobre o procedimento, para adicionar um comentário na regra adicionada, basta seguir da seguinte forma:

```bash
iptables -t fitler -I OUTPUT -s IPORIGEM -p tcp --dport 10050 -m comment --comment "Teste" -J ACCEPT
```

## Remoção e salvando regras

Sabendo o funcionamento das tabelas, precisamos também como remover regras, caso não necessário ou por adição de forma equivocada, para remover a regra, o ideal é que antes liste as tabelas listando o numero das linhas:

```bash
iptables -L INPUT -n --line-numbers
```

Com o numero da linha, basta seguir com a remoção da regra usando o parâmetro ***-D***

```bash
iptables -D INPUT 5
```

Feito todos os procedimentos, basta salvar, lembrando que sempre que realizar uma edição das regras é necessário salvar para que o firewall da máquina saibas quais regras iniciar em caso de reinicialização da máquina ou do serviço:

```bash
service iptables save 
```

Bom, esse foi um artigo bem curto e direto, o IPTables é um mundo de possibilidade, futuramente voltaremos com mais artigos aprofundando mais nas regras para NAT.
