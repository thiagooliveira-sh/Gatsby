---
image: /assets/img/HashiCorp-Terraform-logo.png
title: Utilizando Terraform para gerenciar usuários para o cluster EKS
description: Criando um Cluster EKS através do Terraform, em alguns casos,
  torna-se necessário definir também que alguns usuários possam administra-lo.
date: 2021-05-14
category: devops
background: "#05A6F0"
tags:
  - Devops
  - eks
  - terraform
  - aws
categories:
  - Devops
  - eks
  - terraform
  - aws
---
Quando você cria um cluster do Amazon EKS, a função ou o usuário da entidade do IAM, que cria o cluster, recebe automaticamente permissões `system:masters` na configuração do RBAC do cluster, no painel de controle.

Para conceder permissao de interagir com o cluster a usuários ou funções adicionais da AWS, e necessario editar o aws-auth ConfigMap no Kubernetes, porem no nosso caso, que ja estamos utilizando o Terraform para criação do cluster, vamos aproveitar para ja subir essa configuração na criação do cluster.

### Estrutura

A nossa estrutura basicamente sera a seguinte:  

```
.
├── main.tf
├── auth.tf
└── variables.tf
```

* `main.tf` Configuração de provider para o kubernetes.
* `auth.tf` Configuração do configmap para o aws-auth.
* `variables.tf` Definiçao das variáveis.

### Provider
Para essa ação não e utilizado o provider da aws, pois quem vai executa-lo sera o proprio kubernetes. Dessa forma vamos precisar configurar o provider para o kubernetes, para isso e necessário que tenhamos as seguintes informações:

* `host` O endpoint que sera utilizado para conexão
* `cluster_ca_certificate` O certificado que sera utilizado para autenticação TLS
* `token` O token a ser usado para autenticação no cluster


Bom todas essas informações podem ser obtidas através de outputs configurados no próprio módulo para o master, exeto o token, precisaremos adicionar um data source para obte-lo:

```
data "aws_eks_cluster_auth" "example" {
  name = "example"
}
```

Indico que o data source seja inserido dentro do módulo de criaçao do cluster e com isso externalizado atravez de um output. Fazendo isso teremos um bloco de provider da seguinte forma:

```
provider "kubernetes" {
  host                   = var.cluster_endpoint
  cluster_ca_certificate = base64decode(var.cluster_certificate)
  token                  = var.cluster_token
}
```

### AWS-AUTH


```
resource "kubernetes_config_map" "aws_auth" {

  metadata {
    name      = "aws-auth"
    namespace = "kube-system"
  }

  data = {
    mapRoles = yamlencode(var.map_additional_iam_roles)
    mapUsers = yamlencode(var.map_additional_iam_users)
  }
}
```

### Variáveis



