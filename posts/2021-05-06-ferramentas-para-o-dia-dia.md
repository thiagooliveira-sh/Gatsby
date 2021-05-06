---
image: /assets/img/bash.png
title: Ferramentas para o dia dia
description: Além das tecnologias temos algumas ferramentas que podemos utilizar
  para otimizar o nosso trabalho.
date: 2021-05-06
category: devops
background: "#05A6F0"
tags:
  - Devops
categories:
  - Devops
---
Desde que comecei a trabalhar com linux e precisei trazer ao meu dia a dia todas as tecnologias enfrentei algumas dificuldades como, saber trabalhar com Json, Yaml, Shell além de precisar interpretar vários dos comandos unix.

Pensando nisso, vamos abordar alguns sites e ferramentas que com certeza fara parte do seu dia a dia a partir de hoje.

## Explain Shell

Bom, quando eu iniciei a trabalhar com linux, acabava optando por tutoriais mastigados, cheios de comandos para copiar e colar pois não conhecia o sistema bem e acabava sem entender nada do que estava acontecendo. 

Hoje em dia quando preciso de algo, corro para o [Explain Shell](https://explainshell.com), ele contém diversas man pages obtidas no repositório do Ubuntu. Dessa forma temos cobertura para os mais diversos comandos e variações, observe abaixo como é simples utiliza-lo:

![](/assets/img/explain.png)

Ele ira destrinchar todo o comando que foi inserido explicando cada variável, dessa forma temos como saber de fato o que cada comando ira fazer.

## Shell Check

Ainda focado em Shell, temos o [Shell Check](https://www.shellcheck.net) nele teremos a oportunidade de trabalhar a melhor pratica para o desenvolvimento de scripts em shell, alem de fornecer a interface web, temos como realizar uma integração em alguns editores de codigo.

Nele temos como principal funcionalidadde realizar aquele code review a nível de sintaxe e boas práticas assim como: 

* Apontar e esclarecer problemas típicos de sintaxe para iniciantes, que fazem com que um shell emita mensagens de erro enigmáticas.
* Apontar e esclarecer problemas semânticos de nível intermediário típicos que fazem com que um shell se comporte de forma estranha e contra-intuitiva.
* Apontar advertências que podem fazer com que o script falhe em circunstâncias futuras.

Observe como será retornado as indicações e correções:

![](https://github.com/koalaman/shellcheck/raw/master/doc/terminal.png)

Além de indicar, clicando no codigo de erro seremos direcionado para uma página do github que explica o motivo do alerta e como corrigi-lo.

## tldr-pages

Conheci o [tldr-pages](https://github.com/tldr-pages/tldr) a pouco tempo, foi uma indicação de um amigo e que gostei logo de cara. Ela reune várias man pages, pretendendo ser um complemento mais simples e acessível para os man pages tradicionais.

Ou seja, podemos ter acesso a algumas informações sobre as opçoes de um comando e nem sempre o man page dele sera bem estruturado. Dessa forma o ltdr simplifica essa busca retornando de forma objetiva oq precisamos seguido de alguns exemplos.

Diferente dos demais, o tdlr é destinado a utilização em linha de comando, podendo ser instalado facilmente com o npm: 

```
npm install -g tldr
```

A sua utilização é bastante simples, observe:

![](/assets/img/tldr.png)

## Yaml e Json Check

É muito comum que esqueçamos alguma notação ou de formatar o arquivo da forma que deve ser e sabemos que se isso acontecer teremos problemas na nossa execução, para isso temos dois sites que fazem essa análise para nós, são o [Yaml Checker](https://yamlchecker.com) e [JsonChecker](https://jsonchecker.com)

Ambos trabalham da mesma forma, buscam por problemas e repotam os erros para facilitar a sua identifação e correção.

Por hoje é só, espero que tenham curtido, de fato venho utilizando todas essas ferramentas para otimizar o meu trabalho, seja para desenvolver um script melhor estruturado ou para ajudar na hora do aperto.

Até a próxima!