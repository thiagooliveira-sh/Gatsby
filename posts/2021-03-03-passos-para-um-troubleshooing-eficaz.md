---
image: /assets/img/bash.png
title: "Passos para um troubleshooing eficaz  "
description: Troubleshooting nada mais é do que seguir uma logica de análise
  para resolução de um problema especifico.
date: 2021-03-03
category: linux
background: "#EE0000"
tags:
  - Linux
  - Troubleshooting
categories:
  - Linux
---
Não precisamos nos desesperar e sair correndo atrás de ajuda sem nem entender o que se passa, antes de começar uma análise de  troubleshooting é interessante partirmos de alguns princípios básicos:

* Entenda o problema e o serviço/aplicação
* Interprete e reproduza
* Leia os logs 

Seguindo esse fluxo, a compreensão e resolução dos problemas serão sempre muito simples. Entender o problema, compreender o funcionamento do serviço 



No momento que você entende realmente o problema, tuuuudo fica mais fácil.\
\
REGRA 2: Agora que você já sabe e entende o problema, basta definir as possíveis causas que você acredita que possam ter causado isso...\
\
Load Balancer caiu? Regra de firewall? Subnet? Roteamento? Versão do Kernel? Módulo?\
\
Defina todas elas.\
\
REGRA 3: Teste cada uma delas de forma separada e lógica. De preferência da mais fácil para mais difícil e vá afunilando cada vez mais.\
\
Vai chegar um momento que você vai encontrar a causa raíz do problema.\
\
Basta aplicar a solução.\
\
De preferência, documente isso depois. Assim você poupa tempo dos seus colegas :)