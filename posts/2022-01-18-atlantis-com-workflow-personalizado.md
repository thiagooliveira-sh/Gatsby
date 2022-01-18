---
image: /assets/img/HashiCorp-Terraform-logo.png
title: Atlantis com workflow personalizado
description: Workflows personalizados podem ser definidos para substituir os
  comandos padrões que o Atlantis executa.
date: 2022-01-18
category: devops
background: "#05A6F0"
tags:
  - devops
  - terraform
  - atlantis
  - gitops
  - ci
  - cd
  - aws
  - ecs
  - fargate
categories:
  - devops
  - terraform
  - atlantis
  - gitops
  - ci
  - cd
  - aws
  - ecs
  - fargate
---
Como mencionado no nosso último post sobre Atlantis, abordamos a possibilidade de criar Workfows personalizados para que o nosso projeto Terraform utilize.


```
repos:
  - id: /.*/
    allow_custom_workflows: true
    allowed_overrides:
      - workflow
    workflow: default

workflows:
  default:
    plan:
      steps:
      - init
      - run: terraform validate -no-color
      - plan
    apply:
      steps:
      - apply
```

Para que possamos utilizar o workflow em questão, vamos precisar carrega-lo no nosso ambiente com Atlantis, para isso será necessário que configuremos dentro no nosso módulo adicionando a diretiva `custom_environment_variables` com a variável de ambiente `ATLANTIS_REPO_CONFIG_JSON`  que receberá o nosso `repos.yaml` como valor:

```
  custom_environment_variables = [
      {
          "name": "ATLANTIS_REPO_CONFIG_JSON",
          "value": jsonencode(yamldecode(file("${path.module}/repos.yaml"))) 
      }
  ]
```