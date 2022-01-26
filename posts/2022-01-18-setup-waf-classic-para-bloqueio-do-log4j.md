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

Entre no painel de configurações do WAF e dentro do campo CONDITION vamos selecionar o tipo String and Regex Matching:

```
FOTO 1
```

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

```
FOTO 2
```

## Regra

Criar uma nova RULE e a configure associada a CONDITION que acabamos de criar, configure da seguinte forma:

```
FOTO 3
```


# Web-ACL

Com a regra criada, basta que configuremos dentro da Web-ACLs utilizada no ambiente e definir o default ACTION como
BLOCK, dessa forma vamos bloquear qualquer requisição que de match com a nossa regra.


Pronto, com o WAF configurado, teremos uma camada extra de proteção fazendo com que a ação maliciosa seja barrada antes de chegar na nossa aplicação.