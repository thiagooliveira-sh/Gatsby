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
1 - Entrar no painel de configurações do WAF e criar uma CONDITION do tipo String and Regex Matching

2 - Criar uma lista de regras igual a da imagem abaixo:

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

3- Criar uma RULE e associar a CONDITION criada anteriormente.

4 - Incluir a Rule dentro da Web-ACLs utilizada no ambiente e colocar a ACTION como
BLOCK.
