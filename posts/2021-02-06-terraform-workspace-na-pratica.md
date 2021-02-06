---
image: /assets/img/HashiCorp-Terraform-logo.png
title: Terraform workspace na pratica
description: Os dados persistentes armazenados no backend pertencem a um
  workspace. Inicialmente, o backend tem apenas um workspace, o "default" e,
  portanto, há apenas um state associado a essa configuração.
date: 2021-02-05
category: devops
background: "#05A6F0"
tags:
  - Terraform
  - Linux
categories:
  - Terraform
  - Linux
---
O Terraform inicia com apenas um workspace, o "default". Esse workspace é especial pois é o principal e porque não pode ser deletado. Se você nunca definir de forma explicita a configuração do workspace, então você estará trabalhando apenas com o "default"

Os Workspace são gerenciados pelo comando `terraform workspace`. Para criar um novo workspace e trocar por ele, você pode utilizar o comando `terraform workspace new`, para acessá-lo basta utilizar o comando `terraform workspace select"

````
$ terraform workspace new Teste
Created and switched to workspace "Teste"!

You're now on a new, empty workspace. Workspaces isolate their state,
so if you run "terraform plan" Terraform will not see any existing state
for this configuration.
````