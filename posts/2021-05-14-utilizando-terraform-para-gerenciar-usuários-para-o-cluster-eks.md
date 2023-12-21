---
image: /assets/img/HashiCorp-Terraform-logo.png
title: Utilizando Terraform para gerenciar usuários para o cluster EKS
description: Criando um Cluster EKS através do Terraform, em alguns casos,
  torna-se necessário definir também que alguns usuários possam administra-lo.
date: 2023-05-14
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

Para conceder permissão de interagir com o cluster a usuários ou funções adicionais da AWS, e necessário editar o aws-auth ConfigMap no Kubernetes, porém no nosso caso, que ja estamos utilizando o Terraform para criação do cluster, vamos aproveitar para já subir essa configuração na criação do cluster.

### Estrutura

A nossa estrutura basicamente será a seguinte:  

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
Para essa ação não é utilizado o provider da aws, pois quem vai executá-lo será o proprio kubernetes. Dessa forma vamos precisar configurar o provider para o kubernetes, para isso e necessário que tenhamos as seguintes informações:

* `host` O endpoint que sera utilizado para conexão
* `cluster_ca_certificate` O certificado que sera utilizado para autenticação TLS
* `token` O token a ser usado para autenticação no cluster


Bom todas essas informações podem ser obtidas através de outputs configurados no próprio módulo para o master, exeto o token, precisaremos adicionar um data source para obte-lo:

```
data "aws_eks_cluster_auth" "example" {
  name = "example"
}
```

Indico que o data source seja inserido dentro do módulo de criaçao do cluster e com isso externalizado através de um output. Fazendo isso teremos um bloco de provider da seguinte forma:

```
provider "kubernetes" {
  host                   = var.cluster_endpoint
  cluster_ca_certificate = base64decode(var.cluster_certificate)
  token                  = var.cluster_token
}
```

### AWS-AUTH

Nesse bloco, trabalharemos a disposição e a configuração do nosso aws-auth. Para que possamos personalizá-lo é necessário utilizarmos um resource do kubernetes chamado `kubernetes_config_map`.

Ele e composto por dois blocos, o `metadata` e o `data`, em `metadata` informaremos o que sera modificado, no nosso caso sera o `aws-auth` do namespace `kube-system`.

Já em data, repassaremos os dados que serão inputados no nosso `aws-auth`, utilizaremos o `mapRoles` e `mapUsers` para mapear os usuários e roles adicionais que precisam acessar. Uma observação e para que precisamos ajustar a variável para yaml com o `yamlencode`

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

Bom, aqui fica a magica, precisamos montar a estrutura de objeto para receber e mapear as Roles e os Usuários. Para isso precisamos entender primeiro o que e necessário para darmos permissão a um usuário e ou a uma role, entao vamos la.

Para adicionarmos a permissão para uma role vamos precisar das seguintes informações:

* `rolearn`
* `username`
* `groups`

Ja para adicionarmos um usuário o processo e praticamente o mesmo, diferenciando apenas que nesse inves de inserir uma `rolearn` utilizamos o `userarn`:

* `userarn`
* `username`
* `groups`

Sabendo disso, vamos montar a nossa lista de objeto para cada um dos cenários: 

```
variable "map_additional_iam_roles" {
  description = "Additional IAM roles to add to `config-map-aws-auth` ConfigMap"

  type = list(object({
    rolearn  = string
    username = string
    groups   = list(string)
  }))

  default = []
}

variable "map_additional_iam_users" {
  description = "Additional IAM users to add to `config-map-aws-auth` ConfigMap"

  type = list(object({
    userarn  = string
    username = string
    groups   = list(string)
  }))

  default = []
}

variable "cluster_token" {
  description = "Cluster authentication token"
}
variable "cluster_certificate" {
  description = "Amazon EKS CA certificate."
}
variable "cluster_endpoint" {
  description = "Amazon EKS private API server endpoint."
}
```

Bom, espero que tenha ficado claro e que tenham compreendido bem o cenário, recentemente passei por esse problema e tive uma certa dificuldade com a documentação achando apenas alguns fragmentos de explicações.

Até a proxima.
