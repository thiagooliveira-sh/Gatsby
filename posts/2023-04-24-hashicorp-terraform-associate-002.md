---
image: /assets/img/HashiCorp-Terraform-logo.png
title: HashiCorp Terraform Associate 002
description: Passei na HashiCorp Terraform Associate (002) e gostaria de
  compartilhar com vocês muitas experiências e oque eu fiz para chegar até aqui.
date: 2023-04-24
category: devops
background: "#05A6F0"
tags:
  - Terraform
  - certified
  - pass
  - devops
  - iac
categories:
  - Terraform
  - certified
  - pass
  - devops
  - iac
---
## Porque eu decidi fazer a prova? 

Hoje dia 24/04 fiz a prova HashiCorp Terraform Associate (002), já venho trabalhando com Terraform a um bom tempo, ajudando a implantar e criar a cultura de IaC dentro das empresas em que trabalhei e apesar de ja ter vontade de tirar essa certificação antes deixei para depois.

![](/assets/img/terraformassociate.png)

Decidi realizar a prova no inicio do mês de Abril e achei bem simples me preparar para o exame, a HashiCopr possui um guia para que você entenda as competências cobradas pelo exame e disponibiliza também o material de estudos baseado nesse guia.

<https://www.hashicorp.com/certification/terraform-associate>

Bom, nessas tres semanas de preparação acabei realizando um curso na Udemy dos professores [Bryan Krausen](https://www.udemy.com/user/bryan-krausen/) e [Gabe Maentz](https://www.udemy.com/user/gabe-maentz-2/), o curso é dividido de acordo com o guia oficial e possui a todo momento várias aplicações praticas, aproveitei para revisar os conceitos básicos e aprofundar em assuntos que não utilizo no meu dia a dia como Terraform Cloud / Enterprise, assim como pontos mais complexos como manuseio de state files e debug. Os mesmos professores possuem também um curso disponível apenas com Simulados, achei muito importante foi o melhor material de simulado que encontrei disponível e acredito que o nível das questões são bem fieis aos cobrados na prova.

<https://www.udemy.com/course/terraform-hands-on-labs/>
<https://www.udemy.com/course/terraform-associate-practice-exam/>

Falando da prova, se você ja utiliza Terraform na sua empresa e já possui experiencia prtica com a tecnologia, a prova não será difícil. A prova contem entre 57 e 60 questões que podem variar entre múltipla escolha, verdadeiro e falso, mais de uma correta e complete os espaços em branco. Para essa prova é interessante que entenda os principais comandos e flags, assim como declarações de variáveis e tipo de funções intrínsecas.

Na minha opinião a prova foi bem fácil, você ter uma ideia de como as questões são através dos exemplos abaixo:

1)The terraform.tfstate file always matches your currently built infrastructure.

A. True

B. False



2)Which provisioner invokes a process on the resource created by Terraform? 

A. remote-exec

B. null-exec

C. local-exec

D. file



3)What command does Terraform require the first time you run it within a configuration directory? 

A. terraform import

B. terraform init

C. terraform plan

D. terraform workspace



4)Terraform init initializes a sample main.tf file in the current directory.

A. True

B. False



Respostas: 

1.B, 2.A, 3.B, 4.B