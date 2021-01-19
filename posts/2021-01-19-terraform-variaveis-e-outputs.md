---
image: /assets/img/HashiCorp-Terraform-logo.png
title: Terraform Variaveis e Outputs
description: Antes de continuar a ler, quero dizer que este artigo é uma
  continuação do nosso último artigo sobre o Terraform, onde há um exemplo
  prático em que criamos uma instância ec2.
date: 2021-01-19
category: devops
background: "#05A6F0"
tags:
  - terraform
  - devops
categories:
  - terraform
  - devops
---
Antes de continuar a ler, quero dizer que este artigo é uma continuação do nosso último artigo sobre o Terraform, onde há um exemplo prático em que criamos uma instância ec2. Utilizaremos o mesmo código do anterior, portanto, se você ainda não o leu, recomendo fortemente que leia [clicando aqui](https://thiagoalexandria.com.br/criando-uma-instancia-ec2-usando-terraform/).

## Variáveis

Embora nosso código funcione, ele não está limpo. Devemos sempre seguir algumas boas práticas, não apenas para manter o código limpo, mas também para torná-lo fácil de manter.

Imagine o seguinte código em bash:

```
echo "Eu moro em João Pessoa."
echo "João Pessoa é uma cidade litorânea."
echo "João Pessoa é cidade bastante antiga."
echo "Os hoteis de João Pessoa estão lotados."
```

Um código muito simples que imprime apenas algumas strings na tela. Imagine que você precise manter esse código porque sua empresa agora determina que a cidade seja Natal em vez de João Pessoa. Claro, você pode ler e alterar cada linha, linha por linha, mas leva muito mais tempo do que antes. Agora imagine que este sistema tenha centenas de linhas de código. Ou vários arquivos. Mudar tudo se torna cada vez mais complicado e demorado, sem falar que é fácil esquecer um erro. Por outro lado, se nosso código usa uma variável, vamos alterar o valor em apenas um lugar, para que possamos ter certeza absoluta de que está correto em todo o código. Por exemplo:

```
cidade="João Pessoa"

echo "Eu moro em $cidade."
echo "$cidade é uma cidade litorânea."
echo "$cidade é uma cidade bastante antiga."
echo "Os hoteis de $cidade estão lotados."
```

Neste código, quando precisamos alterar o nome da cidade e usar Natal em vez de João Pessoa, precisamos apenas alterar o valor da variável na linha 1.

Assim como usamos variáveis ​​na programação, quando pensamos IaC, devemos pensar da mesma forma, afinal estamos programando a infraestrutura. 

Este é o arquivo main.tf completo do artigo anterior:

```
provider "aws" {
  region  = "us-east-1"
  shared_credentials_file = "/home/thiago/.aws/credentials"
  profile = "default"
}

resource "aws_instance" "Teste" {
  ami = "ami-01d025118d8e760db"
  instance_type = "t2.micro"
  key_name = "Thiago"
  tags = {
    Name = "lab-terraform-tst"
  }
}
```

Vamos então começar a criar algumas variáveis, mas, seguindo as boas práticas do Terraform, criaremos um arquivo separado para nossas variáveis.

Crie um arquivo chamado variables.tf, em inglês, dessa forma quando chamamos uma variável no código, o Terraform saberá onde procurar o valor da variável.

Para cada variável daremos um nome, uma descrição e um valor *default*. Dessa forma o nosso arquivo ficará assim:

```
variable "inst_ami" {
  type = "string"
  description = "ami que será utilizado"
  default = "ami-01d025118d8e760db"
}

variable "inst_type" {
  type = "string"
  description = "Familia da instância"
  default = "t2.micro"
}

variable "inst_key" {
  type = "string"
  description = "Chave que deve ser utilizada"
  default = "Thiago"
}

variable "tags" {
  type        = "map"
  description = "Tags a serem aplicadas à nossa instância."

  default = {
    "Name"     = "lab-terraform-tst"
    "Ambiente" = "Desenvolvimento"
  }
}
```

O que foi feito:

1. Criamos 4 variáveis aqui: inst_ami, inst_type, inst_key, tags;
2. Para cada variável nós declaramos o seu tipo, descrição e valor padrão.
3. Nem sempre é necessário declarar variáveis. Às vezes podemos criar uma variável que não tem nenhum valor atribuído, então o valor será passado durante a execução do código
4. A *description*, ou descrição, é um atributo também opcional, mas ajuda a identificar melhor o que se pretende com aquela variável e costuma ser uma boa prática

Voltando ao nosso arquivo *main.tf,* é necessário alterar um pouco nosso código para que possamos fazer uso destas variáveis, dessa forma observe abaixo o bloco principal:

```
resource "aws_instance" "Teste" {
  ami = var.inst_ami
  instance_type = var.inst_type
  key_name = var.inst_key
  tags = var.tags
 }
```

Ajustado os valores das variáveis, basta seguir com os testes e iniciar o plan do Terraform. 

## Outputs

O output serve para que seja retornado informações para o administrador após o apply, como por exemplo o ip da máquina. Dessa forma comecemos criando um arquivo chamado *outputs.tf* com o seguinte conteúdo:

```
output "ip_address" {
  value = aws_instance.Teste.public_ip
}
```

Feito isso, quando executarmos o plan novamente o Terraform externalizará as informações obtidas no output como no exemplo abaixo:

```
Apply complete! Resources: 2 added, 0 changed, 0 destroyed.

Outputs:

ip_address = 185.199.110.153
```

Em meu próximo post pretendo elevar um pouco o nível e utilizar o Terraform exemplificando a sua utilização com módulos externos e como os chamados em nosso código..