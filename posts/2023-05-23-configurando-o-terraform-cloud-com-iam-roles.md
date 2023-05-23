---
image: /assets/img/HashiCorp-Terraform-logo.png
title: Configurando o Terraform Cloud com IAM Roles
description: A configuração do Terraform Cloud com IAM roles permite uma gestão
  segura e simplificada das permissões de acesso aos recursos da AWS.
date: 2023-05-22
category: devops
background: "#05A6F0"
tags:
  - terraform
  - cloud
  - configuracao
  - iam
  - roles
  - aws
  - seguranca
  - terraform-cloud
  - trust-policy
  - policy
categories:
  - terraform
  - cloud
  - configuracao
  - iam
  - roles
  - aws
  - seguranca
  - terraform-cloud
  - trust-policy
  - policy
---
Sabemos, e não é de hoje, que a se preocupar com a segurança da nossa infraestrutura é algo primordial e que todos os projetos que nasçam, principalmente na cloud, precisam seguir algumas boas práticas para que não tenhamos nenhum pesadelo la no futuro.

Falando do Terraform, sabemos que é uma ferramenta de IaC amplamente difundida no mercado e que por se tratar de infraestrutura como código temos ai algumas batalhas para travar quando o assunto é segurança. É imprescindível que o nosso Terraform tenha um poder de acesso mais elevado que os demais usuários, até porque ele será o nosso principal caminho administrativo quando falamos na criação e gerenciamento de recursos.

Nessa integração com a AWS, a principal forma de concessão de permissão é através do IAM, dessa forma é essencial que a utilizemos o serviço de IAM Roles, é importante porque oferece uma abordagem mais segura e gerenciável para essa finalidade. Em vez de usar chaves de acesso estáticas para autenticação, as roles permitem que você atribua permissões granulares aos usuários, serviços ou aplicativos por meio de políticas de acesso.