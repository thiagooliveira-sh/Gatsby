---
image: /assets/img/HashiCorp-Terraform-logo.png
title: Criar uma playlist no Spotify com Terraform
description: Além de gerencia a infraestrutura em cloud, como AWS, Azure e GCP.
  O Terraform também pode gerenciar recursos em centenas de outros serviços,
  incluindo o serviço de música Spotify.
date: 2021-07-31
category: devops
background: "#05A6F0"
tags:
  - Terraform
  - Spotify
categories:
  - terraform
---
### Antes de começar precisamos de:
* Terraform 1.0.+
* Docker
* [Conta no Spotify com acesso desenvolvedor](https://developer.spotify.com/dashboard/login)


### 1. Criar um aplicativo no painel de desenvolvimento do Spotify

Antes de usar o Terraform com o Spotify, você precisa criar um aplicativo de desenvolvedor do Spotify e executar o servidor proxy de autorização. Para isso, acesse o [site](https://developer.spotify.com/dashboard/login) e quando realizar o login clique no botao verde escrito "Create an app".
