---
image: /assets/img/HashiCorp-Terraform-logo.png
title: "Terraform condicoes customizadas - parte 1 "
description: O Terraform possui diversas alternativas para validar variáveis e
  configurações dentro do seu código. Essas validações ajudam a evitar erros e
  seguir boas práticas, assegurando que a infraestrutura seja robusta e
  confiável.
date: 2024-07-22
category: devops
background: "#05A6F0"
tags:
  - terraform
  - devops
  - sre
  - cloud
  - aws
categories:
  - terraform
  - devops
  - sre
  - cloud
  - aws
---
Ao utilizar Terraform para provisionar infraestrutura, é crucial implementar condições customizadas para garantir a integridade e a eficácia da configuração. As diferentes condições customizadas do Terraform são adequadas para diversas situações, e selecionar a melhor opção pode fazer a diferença na qualidade do ambiente gerenciado. Aqui temos quais as são as alternativas disponíveis para implementarmos com o Terraform.

- **Check blocks**: validam sua infraestrutura como um todo. Além disso, os blocos de verificação não impedem ou bloqueiam a execução geral das operações do Terraform.
- **Condições de validação ou pós-condições de saída**: garantem que as entradas e saídas da sua configuração atendam a requisitos específicos.
- **Pré-condições e pós-condições de recursos**: validam que o Terraform produz sua configuração com resultados previsíveis.

N﻿esse primeiro post vamos falar sobre os Check blocks.

## Check blocks

O﻿s `Check Blocks` validam a sua infraestrutura, porém fora do ciclo de vida usual dos recursos. Ou seja, você pode adicionar condições customizadas através do bloco `assert` que são executados ao final das etapas de `plan` e `apply` notificando sempre sobre os possíveis problemas na sua infraestrutura.



