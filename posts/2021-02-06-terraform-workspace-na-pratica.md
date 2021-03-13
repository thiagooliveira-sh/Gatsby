---
image: /assets/img/HashiCorp-Terraform-logo.png
title: Terraform Workspace na prática
description: Os dados persistentes armazenados no backend pertencem a um
  workspace. Inicialmente, o backend tem apenas um workspace, o "default" e,
  portanto, há apenas um state associado a essa configuração.
date: 2021-03-04
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

Os Workspace são gerenciados pelo comando `terraform workspace`. Para criar um novo workspace e trocar por ele, você pode utilizar o comando `terraform workspace new`, para acessá-lo basta utilizar o comando `terraform workspace select".

Quando criamos novos workspaces isolamos o nosso arquivo de estado para que cada ambiente de trabalho tenha o seu tfstate de forma única sem tenhamos interferências. Criaremos um workspace para testes, observe:

```
$ terraform workspace new Teste
Created and switched to workspace "Teste"!

You're now on a new, empty workspace. Workspaces isolate their state,
so if you run "terraform plan" Terraform will not see any existing state
for this configuration.
```

A utilização de múltiplos ambientes de trabalho pode ser amplamente utilizada, como por exemplo testar a criação do ambiente em outras zonas ou ambientes de testes. Nesse cenário, podemos utilizar algumas formas de declaração de variável mais maleável, aplicando condicionais simples em nosso código Terraform. 

Seguindo a ideia de termos um workspace de Teste, aplicaremos algumas regras para alterar a chave privada, AMI e tipo da instancia. Utilizaremos como base o nosso main.tf Criado anteriormente no nosso artigo sobre [Módulos](https://thiagoalexandria.com.br/terraform-criando-módulos/).

```
provider "aws" {
  region  = "us-east-1"
  shared_credentials_file = "/home/thiago/.aws/credentials"
  profile = "default"
}

module "server" {
  source          = "./modules/Ec2"
  inst_ami        = "ami-01d025118d8e760db"
  inst_type       = "t2.large"
  inst_key     = "Thiago"
  tags = {"Name" = "lab-terraform", "Ambiente" = "Desenvolvimento"}
}
```

Definiremos que quando estivermos no nosso workspace `Teste` a nossa instancia será `t2.micro`, utilizaremos outra AMI e a chave privada será outra, teremos algo próximo a isso:

```
module "server" {
  source          = "./modules/Ec2"
  inst_ami        = terraform.workspace == "Teste" ? "ami-01d025118d8e760db" : "ami-70ctopa4mfwdxqd3j"
  inst_type       = terraform.workspace == "Teste" ? "t2.micro" : "t2.large"
  inst_key        = terraform.workspace == "Teste" ? "Thiago" : "Thiago2"
  tags = {"Name" = "${terraform.workspace == "Teste" ? "lab-terraform-tst" : "lab-terraform""}, "Ambiente = "${terraform.workspace == "Teste" ? "Teste" : "Desenvolvimento""}}
}
```

Com o nosso ambiente já configurado para tratar a utilização dos workspace, vamos entender a lógica por trás disso:

```
terraform.workspace == "WOKSPACE_NAME" ? "ARG_1" : "ARG_2"
```

* WORKSPACE_NAME = Nome do workspace que queremos tomar como base.
* ARG_1 = Valor que será utilizado caso o workspace seja o definido em WOKSPACE_NAME.
* ARG_2 = Valor que será utilizado caso o workspace seja diferente do definido em WOKSPACE_NAME.

Bom, a ideia é bem simples, temos vários cenários cujo essa estratégia pode ser adotada. Com esse artigo, chegamos ao fim dessa trilha de artigos introdutórios sobre Terraform, pretendo trazer futuramente alguns pontos mais complexos, assim como outras tecnologias.

Até a próxima!