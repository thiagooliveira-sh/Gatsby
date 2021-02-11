---
image: /assets/img/HashiCorp-Terraform-logo.png
title: "Terraform: Gerenciamento de versões e backends"
description: É muito importante que as versões e backends compatíveis com o
  projeto desenvolvido seja definida, evitando conflitos ou fala de
  compatibilidade.
date: 2021-02-03
category: devops
background: "#05A6F0"
tags:
  - Devops
  - Terraform
categories:
  - Devops
  - Terraform
---
No Terraform temos a possibilidade de definirmos algumas regras para o nosso projeto, como onde o seu backend deve ser armazenado e quais as versões de providers e terraform são compatíveis com os nossos módulos.

# Backends

Cada projeto Terraform pode especificar um backend, que define onde e como e onde os arquivos de estado são armazenados etc.

Existem alguns tipos de backends, remoto e local. Se você estiver aprendendo a utilizar o Terraform agora, é indicado que utilize o backend local, que não necessita de nenhuma configuração. Caso tenha pretensão de utiliza-lo de forma profissional, vamos abordar a configuração de um backend remoto.  

## Inicialização

Sempre que o backend de uma configuração muda, você deve executar o `terraform init` novamente para validar e configurar o backend antes de executar qualquer outra operação de plan ou apply.

Ao alterar o backend, o Terraform alertará sobre a possibilidade de migrar seu tfstate para o novo backend. Isso permite que você adote backends sem perder nenhum tfstate existente.

## Backend Remoto

A configuração de um backend remoto se dá através de um bloco de backend dentro do nosso projeto terraform. Abaixo temos como exemplo a configuração de um backend remoto utilizando o s3 na AWS.

```
terraform {
  backend "s3" {
    bucket  = "tfstate-backend"
    key     = "terraform-teste.tfstate"
    region  = "us-east-1"
    encrypt = true
  }
}
```

Acima, estamos referenciando algumas informações referente ao nosso beckend:

* `bucket` = Nome do nosso bucket já criado no s3
* `key`    = Nome dado ao nosso arquivo de estado
* `region` = Região do bucket
* `encrypt` = Habilitar criptografia no bucket

# Versões

É muito importante que seja determinado as versões que são compatíveis com o nosso projeto. Amarrar esse tipo de configuração no Terraform faz com que nós tenhamos certeza de que o projeto não quebre quando outras pessoas precisarem utiliza-lo. 

O comum nesse caso, para configuração de versões, é criado um arquivo chamado `versions.tf` e nele podemos definir as versões que devem ser utilizadas:

````
terraform {

  required_version = "~> 0.14"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
  }
}
````

Acima definimos a versão necessária do nosso Terraform e do nosso provider. A expressão `~>` define que apenas as minor releases são aceitas. Por exemplo, caso já esteja disponível a versão 3.0.6 a mesma encontra-se apta para utilização no nosso projeto.

É isso pessoal, espero que tenham entendido a ideia referente a utilização de beckends e configurações de versões. Em nosso próximo artigo abordaremos a configuração de workspaces. 