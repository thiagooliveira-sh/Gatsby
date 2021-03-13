---
image: /assets/img/HashiCorp-Terraform-logo.png
title: "Terraform: Criando módulos"
description: A possibilidade de utilizar módulos em nosso código Terraform faz
  com que possamos ter a reutilização de código, evitando a repetições bem como
  nos dando flexibilidade para criarmos dezenas de recursos similares porém com
  suas respectivas particularidades utilizando-se da mesma base de código.
date: 2021-01-28
category: devops
background: "#05A6F0"
tags:
  - Devops
  - Terraform
categories:
  - Devops
  - Terraform
---
Daremos continuidade aos estudos de Terraform, configurando o nosso primeiro módulo, podendo assim reutilizar em vários momentos. Teremos como base o mesmo código que escrevemos no nosso ultimo artigo sobre Terraform: Variáveis de Outputs, portanto se você não o leu, recomendo fortemente que o faça [clicando aqui](https://thiagoalexandria.com.br/terraform-variaveis-e-outputs/).

Um módulo é um contêiner para vários recursos usados ​​juntos. Os módulos podem ser usados ​​para criar abstrações leves, para que você possa descrever sua infraestrutura em termos de arquitetura, em vez de diretamente em termos de objetos físicos.

Os arquivos `.tf` em seu diretório de trabalho formam juntos o módulo raiz. Esse módulo pode chamar outros módulos e conectá-los, passando os valores de saída (outputs) de um para os valores de entrada (inputs) de outro.

## Estrutura de um Módulo

Módulos reutilizáveis ​​são definidos usando todos os mesmos conceitos de linguagem de configuração que usamos nos módulos raiz. Mais comumente, os módulos usam:

* Input  aceitam valores do módulo chamado.
* Output para retornar resultados, que ele pode usar para preencher argumentos em outro lugar.
* Resources para definir um ou mais objetos de infraestrutura que o módulo gerenciará.

Para definir um módulo, basta criar um novo diretório para ele e coloque um ou mais arquivos `.tf` dentro, da mesma forma que faria em um `root module`. O Terraform pode carregar módulos de forma local ou de repositórios remotos. Se um módulo for reutilizado por várias configurações, você pode colocá-lo em seu próprio repositório de controle de versão.

## Criando nosso próprio Módulo

Após entender como funciona e qual a estrutura de um módulo, iremos configurar o nosso [projeto anterior](https://thiagoalexandria.com.br/terraform-variaveis-e-outputs/) em um módulo. Dessa forma iremos criar um diretório chamado "modules" dentro do nosso projeto e iremos criar os seguintes arquivos:

```
├── modules
|   └─── Ec2
│       ├── main.tf
│       └── variables.tf
└── main.tf
```

Para construir o nosso módulo, precisamos ajusta-lo para trabalhar de forma genérica, então repassaremos todos os parâmetros em forma de variável. O nosso `Ec2/main.tf` ficará da seguinte forma:

```
resource "aws_instance" "Teste" {
  ami = var.inst_ami
  instance_type = var.inst_type
  key_name = var.inst_key
  tags = var.tags
 }
```

O nosso arquivo `variables.tf` terá a declaração das variáveis porém sem nenhuma configuração pré ajustada:

```
variable "inst_ami" {
  type = "string"
}

variable "inst_type" {
  type = "string"
}

variable "inst_key" {
  type = "string"
}

variable "tags" {
  type        = "map"
}
```

Feito isso, já temos o nosso módulo em branco para receber as variáveis como input através do carregamento do módulo. Nosso arquivo `main.tf` na raiz do projeto deverá carregar o módulo e repassar as variáveis:

```
provider "aws" {
  region  = "us-east-1"
  shared_credentials_file = "/home/thiago/.aws/credentials"
  profile = "default"
}

module "server" {
  source          = "./modules/Ec2"
  inst_ami        = "ami-01d025118d8e760db"
  inst_type       = "t2.micro"
  inst_key     = "Thiago"
  tags = {"Name" = "lab-terraform-tst", "Ambiente" = "Desenvolvimento"}
}
```

Dessa forma, iremos carregar o módulo Ec2 e repassaremos os valores das variáveis que o módulo espera receber, com isso conseguimos reutilizar a mesma estrutura e chamar o módulo várias vezes para aplicações diferentes, por exemplo, subir duas máquinas com configurações diferentes:

```
provider "aws" {
  region  = "us-east-1"
  shared_credentials_file = "/home/thiago/.aws/credentials"
  profile = "default"
}

module "server" {
  source          = "./modules/Ec2"
  inst_ami        = "ami-01d025118d8e760db"
  inst_type       = "t2.micro"
  inst_key     = "Thiago"
  tags = {"Name" = "lab-terraform-tst", "Ambiente" = "Desenvolvimento"}
}

module "server2" {
  source          = "./modules/Ec2"
  inst_ami        = "ami-u40jymjdk5040h8f"
  inst_type       = "t2.2xlarge"
  inst_key     = "Thiago2"
  tags = {"Name" = "lab-terraform-prd", "Ambiente" = "Produção"}
}
```

Bom, esse foi um pouco de como criar e trabalhar com módulos em projetos com Terraform, espero que tenham curtido, em breve falaremos sobre gerenciamento de versões e backends valeu!