---
image: /assets/img/AWS.png
title: Setup WAF classic para bloqueio do LOG4j
description: No final de Novembro de 2021, pesquisadores relataram a descoberta
  de uma falha no Apache Log4j, ferramenta presente em uma infinidade de
  sistemas, que permite execução remota de código e tem nível de gravidade CVSS
  10 de 10.
date: 2022-01-18
category: aws
background: "#FF9900"
tags:
  - cve
  - log4j
  - waf
  - classic
  - aws
  - seguranca
  - sec
  - devops
categories:
  - cve
  - log4j
  - waf
  - classic
  - aws
  - seguranca
  - sec
  - devops
---
Nesse artigo aprenderemos uma forma de mitigar a vulnerabilidade a nível de WAF, para que ele não chegue a nossa aplicação. Dessa forma, vamos utilizar o serviço AWS WAF Classic.

## Criar a condição

Entre no painel de configurações do WAF e dentro do campo ***CONDITION*** vamos selecionar o tipo `String and Regex Matching`:

![condition](/assets/img/waf-1.png)

Feito isso, vamos seguir a seguinte lógica para criar uma lista de regras igual a da lista abaixo:

```
Body contains: "${lower:${lower:jndi}}" after converting to lowercase.
Body contains: "jndi:" after converting to lowercase.
Header 'authorization' contains: "jndi:" after converting to lowercase.
Header 'content-type' contains: "jndi:" after converting to lowercase.
Header 'user-agent' contains: "jndi" after converting to lowercase.
HTTP method contains: "jndi:" after converting to lowercase.
URI contains: "jndi:" after converting to lowercase.
URI contains: "${::-j}ndi:" after converting to lowercase.
URI contains: "${lower:${lower:jndi}}" after converting to lowercase.
URI contains: "${::-j}${::-n}${::-d}${::-i}:" after converting to lowercase.
```

No fim, você terá algo semelhante a essa imagem:

![condition-regex](/assets/img/waf-3.png)

## Regra

Criar uma nova regra, para isso selecione a opção ***RULE*** no menu lateral:

![rule-option](/assets/img/waf-2.png)

Configure associada a ***CONDITION*** que acabamos de criar, configure da seguinte forma:

![rule-condition](/assets/img/waf-4.png)

# Web-ACL

Com a regra criada, basta que configuremos dentro da Web-ACLs utilizada no ambiente e definir a ***ACTION*** como ***BLOCK***, dessa forma vamos bloquear qualquer requisição que de ***match*** com a nossa regra.

![web-acl](/assets/img/waf-5.jpg)

Pronto, com o WAF configurado, teremos uma camada extra de proteção fazendo com que a ação maliciosa seja barrada antes de chegar na nossa aplicação.