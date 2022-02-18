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
Antes de começarmos é interessante que leia um pouco sobre a nossa [ultima publicação](https://thiagoalexandria.com.br/introdu%C3%A7%C3%A3o-a-terraform-com-atlantis/) e como nós o configuramos utilizando o Terraform e AWS.

Por padrão, o fluxo do Atlantis é com o básico do Terraform com o ***plan*** e ***apply***. Como mencionado no nosso último post sobre Atlantis, abordamos a possibilidade de criar ***Workfows*** personalizados para que possamos ajustar o processo de integração da forma que melhor atende nossas necessidades.

Criaremos um arquivo chamado `repos.yaml` para que possamos desenvolver o nosso próprio ***[Workflow](https://www.runatlantis.io/docs/custom-workflows.html)***, durante a `stage` de ***plan*** será feito a inclusão de uma ação de ***validate***:

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

Para que possamos utilizar o ***Workflow*** em questão, vamos precisar carrega-lo no nosso ambiente com Atlantis, para isso será necessário que configuremos dentro no nosso módulo adicionando a diretiva `custom_environment_variables` com a variável de ambiente `ATLANTIS_REPO_CONFIG_JSON`  que receberá o nosso `repos.yaml` como valor:

```
  custom_environment_variables = [
      {
          "name": "ATLANTIS_REPO_CONFIG_JSON",
          "value": jsonencode(yamldecode(file("${path.module}/repos.yaml"))) 
      }
  ]
```

Após aplicar a mudança dentro da nossa infraestrutura, basta que a gente realize o teste, vamos editar o projeto e ver se a nossa mudança é aplicada dentro do nosso `merge`:

