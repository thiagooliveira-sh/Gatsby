---
image: /assets/img/HashiCorp-Terraform-logo.png
title: Introdução a Terraform com Atlantis
description: O Atlantis é uma aplicação que, através de Pull Requests, permite
  fazer GitOps para Terraform.
date: 2022-01-12
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
Ele funciona ouvindo Webhooks de plataformas de Git como: Github, Gitlab ou do Bitbucket e retorna o output dos comandos `terraform plan` e `terraform apply` através de comentários.

De uma forma mais simples, o Atlantis atua como uma "ponte" entre o Terraform e a plataforma de Git, tornando os plans e applies muito mais colaborativos. Mas por quê?  Infraestrutura como código é uma abordagem de automação de infraestrutura baseada em princípios de desenvolvimento de software, com reviews, testes, CI/CD.

# Antes de iniciar

A partir do momento que o Atlantis é adotado, é ele quem define qual versão do Terraform está rodando e é ele quem conhece as secrets e keys dos provedores de cloud, serviços.

É sempre bom acompanhar as releases do projeto para ver se a versão mais recente do Terraform já possui suporte pelo Atlantis. E não necessariamente usar a versão mais recente do Atlantis exige atualizar seus projetos, por exemplo é possível usar a versão mais recente do Atlantis e para cada repositório/projeto usar uma versão diferente do Terraform.

Qualquer que seja a estrutura utilizada, o Atlantis vai rodar sem problemas. É possível utilizar:

* Monorepo com vários projetos
* Único repo com um único projeto
* Monorepo com vários projetos e + módulos
* Multirepo (basta ter um webhook para cada um deles)
* É possível também utilizar Workspaces.

# Configuração

Para subir o ambiente com Atlantis, vamos utilizar a AWS para hospeda-lo e o Terraform para criar toda a stack necessária para a utilização do Atlantis.

Utilizaremos o módulo oficial do Atlantis para Terraform, para ter mais informações sobre como o módulo funciona ou como personaliza-lo você pode acessar o [link](https://registry.terraform.io/modules/terraform-aws-modules/atlantis/aws/latest).

## 1- Módulo

Primeiramente precisamos ter configurado em nosso ambiente as chaves que tenham permissão suficientes na AWS para realização das seguintes ações:

* Criação de Cluster ECS com Fargate
* Acesso ao Route53 para criação de entradas DNS
* EC2 para criação de target groups e ALB
* ACM

Vamos lá, partiremos de um ponto onde entendemos que você irá utiliza-lo em sua infra existente no qual não será necessário cria infraestrutura de rede, como VPC, subnet, etc...

Em nosso arquivo `main.tf` será onde realizaremos a declaração do módulo Atlantis, teremos algumas definições

OBS: As subnets públicas e privadas precisam pertencer a mesma AZ para que a ALB seja criada e possua targets em sua configuração.
Exemplo, uma subnet privada e uma publica na us-east-1a, outra privada e publica na us-east-1b e assim por diante.

```
# VPC 
vpc_id             = Id da VPC que utilizaremos
private_subnet_ids = Lista de IDS de subnets privadas
public_subnet_ids  = Lista de IDS de subnets publicas

# DNS
route53_zone_name = Domínio no R53 para criação das entradas

# Atlantis
atlantis_github_user       = Seu usuário do Github
atlantis_github_user_token = Um token para acesso ao Github
atlantis_repo_allowlist    = ["github.com/USER/*"]
atlantis_allowed_repo_names = Lista de nomes de repositórios
```

Para criar o token para o Github basta seguir a orientação do [site oficial](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token). Sabendo o que precisamos compor, segue abaixo a estrutura que deve ser aplicada:

```
module "atlantis" {
  source  = "terraform-aws-modules/atlantis/aws"
  version = "~> 3.0"

  name = "atlantis"

  # VPC
  vpc_id             = "vpc-faa24787"
  private_subnet_ids = ["subnet-448b4125","	subnet-2f3dfc0e"]
  public_subnet_ids  = ["subnet-448b4125","	subnet-2f3dfc0e"]
  ecs_service_assign_public_ip = true

  # DNS (without trailing dot)
  route53_zone_name = "thiago.click"

  # Atlantis
  atlantis_github_user       = "thiagoalexandria"
  atlantis_github_user_token = var.git_token
  atlantis_repo_allowlist    = ["github.com/thiagoalexandria/*"]
  atlantis_allowed_repo_names = ["terraform_atlantis"]

  allow_unauthenticated_access = true
  allow_github_webhooks        = true

  policies_arn = [
      "arn:aws:iam::aws:policy/AdministratorAccess",
      "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
  ]
}
```

Um ponto de atenção é que se atentem a configuração de `policies_arn` nela foi inseria uma politica de acesso total apenas para o LAB, é indicado que crie uma policy com restrição para que o ECS utilize com o Terraform, aplicando deny explicito para funções que você não quer que o terraform execute.

## Webhook

Com a primeira parte pronta, vamos agora criar o bloco no Terraform para criar o nosso webhook de forma automática,dessa forma basta que configuremos da seguinte forma:

```
module "github_webhook"{
   source  = "terraform-aws-modules/atlantis/aws//modules/github-repository-webhook"
   version = "~> 3.0"

   github_owner = "thiagoalexandria"
   github_token = var.git_token

   atlantis_allowed_repo_names = module.atlantis.atlantis_allowed_repo_names

   webhook_url = module.atlantis.atlantis_url_events
   webhook_secret = module.atlantis.webhook_secret

}
```

Pronto, agora podemos rodar o nosso `terraform plan` e `terraform apply` para criar toda a stack necessária para o nosso ambiente Atlantis.

## Utilização

Com tudo configurado, já estaremos prontos para utilizar o Atlantis em nossos repositórios configurados, o Atlantis vai intermediar dentro de pull/merge requests e nele nos retorna-rá o plan e poderemos realizar ou não o apply.

