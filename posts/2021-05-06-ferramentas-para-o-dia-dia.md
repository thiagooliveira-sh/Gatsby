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
Desde que comecei a trabalhar com linux e precisei trazer ao meu dia a dia todas as tecnologias enfrentei algumas dificuldades como saber trabalhar com Json, Yaml, Shell alem de interpretar varios dos comandos unix.

Pensando nisso, vamos abordar alguns sites e ferramentas que com certeza fara parte do seu dia a dia a partir de hoje.

## Explain Shell

Bom, quando eu iniciei a trabalhar com linux, acabava optando por tutoriais mastigados, cheios de comandos para copiar e colar e sem entender nada do que estava acontecendo. 

O [Explain Shell](https://explainshell.com) contem diversas man pages obtidas no repositório do Ubuntu. Dessa forma temos cobertura para os mais diversos comandos e variacoes, observe abaixo como e simples utilizado:

![](/assets/img/explain.png)

Ele ira destrinchar todo o comando que foi inserido explicando cada variavel, dessa forma temos como saber de fato o que cada comando ira fazer.

## Shell Check

Ainda focado em Shell, temos o [Shell Check](https://www.shellcheck.net) nele teremos a oportunidade de trabalhar a melhor pratica para o desenvolvimento de scripts em shell, alem de fornecer a interface web, temos como realizar uma integração em alguns editores de codigo.

Nele temos como principal funcionalidadde realizar aquele code review a nivel de sintaxe, boas praticas assim como: 

* Apontar e esclarecer problemas típicos de sintaxe para iniciantes, que fazem com que um shell emita mensagens de erro enigmáticas.

* Apontar e esclarecer problemas semânticos de nível intermediário típicos que fazem com que um shell se comporte de forma estranha e contra-intuitiva.

* Apontar advertências que podem fazer com que o script falhe em circunstâncias futuras.

Observe como sera retornado as indicações e correções:

![](https://github.com/koalaman/shellcheck/raw/master/doc/terminal.png)

## tldr-pages

O tldr-pages reune, assim como o Explain Shell, varias man pages, pretendendo ser um complemento mais simples e acessível para os man pages tradicionais.

Ou seja, podemos ter acesso a algumas informacoes sobre as opçoes de um comando e nem sempre o man page dele sera bem estruturado ou teremos que realizar toda uma filtragem para chegarmos onde precisamos. Dessa forma o ltdr simplifica essa busca retornando de forma objetiva oq precisamos.

Diferente dos demais, o tdlr e destinado a utilizaçao em linha de comando, podendo ser instalado facilmente com o comando 

```
npm install -g tldr
```

A sua utilizaçao e bastante simples, observe:



## Yaml e Json Check

Bom, e muito comum que esquecamos alguma notaçao ou de formatar o arquivo da forma que deve ser e sabemos que se isso acontecer teremos problemas na nossa execuçao, para isso temos dois sites que fazem essa analise para nos, sao o [Yaml Checker](https://yamlchecker.com) e [JsonChecker](https://jsonchecker.com)

Ambos trabalham da mesma forma, buscam por problemas e repotam os erros para facilitar a identifaçao do problema e sua correçao.

Espero que tenham curtido, de fato venho utilizando essas ferramentas para otimizar o meu trabalho, seja para desenvolver scripts melhor estruturado e otimizado ou para ajudar na hora de matar alguns problemas com sintaxes. 

