---
image: /assets/img/HashiCorp-Terraform-logo.png
title: Terraform condicoes customizadas - Parte 2
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
Conforme introduzido na primeira parte dessa publicação. Ao utilizar Terraform para provisionar infraestrutura, é crucial implementar condições customizadas para garantir a integridade e a eficácia da configuração. 

V﻿amos falar nessa publicação sobre condições de validações, a forma mais comum referente a essa configuração é a validação de variáveis ​​no Terraform.

###  Por que validar suas variáveis?

Embora a sintaxe e a configuração do seu Terraform possam ser válidas, as variáveis ​​passadas para sua configuração podem não ser válidas ou estar fora de padrões previamente estabelecidos. Passar variáveis ​​inválidas geralmente resulta em erros durante o estágio de implantação, ou pior não atribuir configurações podem gerar problemas de compliance dentro da sua infraestrutura.

Exemplos disso podem ser definir um tamanho de VM inválido, configuração de runtime não permitidos, omissão de tags entre outros.

Além disso, sem validação, a mensagem de erro exibida ao usuário quando uma variável inválida é passada vem diretamente da API da AWS, que às vezes pode ser difícil de ler e pode não informar exatamente o que esta errado. Com a validação no Terraform, você pode especificar a mensagem de erro.





