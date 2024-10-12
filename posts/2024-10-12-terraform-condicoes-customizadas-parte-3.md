---
image: /assets/img/HashiCorp-Terraform-logo.png
title: Terraform condicoes customizadas - Parte 3
description: O Terraform possui diversas alternativas para validar variáveis e
  configurações dentro do seu código. Essas validações ajudam a evitar erros e
  seguir boas práticas, assegurando que a infraestrutura seja robusta e
  confiável.
date: 2024-10-12
category: devops
background: "#05A6F0"
tags:
  - terraform
  - devops
  - sre
  - cloud
  - aws
categories:
  - terraform
  - devops
  - sre
  - cloud
  - aws
---
Ao trabalhar com infraestrutura como código no Terraform, garantir que seus recursos sejam criados de maneira previsível e validada é essencial para evitar problemas em ambientes críticos. **Preconditions** e **postconditions** são mecanismos poderosos que ajudam a adicionar validações antes e depois da aplicação de mudanças, garantindo que as condições certas sejam atendidas.

Neste artigo, vamos explorar o que são preconditions e postconditions, como usá-los no Terraform e exemplos práticos de sua aplicação.

## O que são Preconditions e Postconditions?

* **Preconditions**: São validações que ocorrem antes que um recurso seja criado ou modificado. Elas garantem que certos critérios sejam atendidos antes de permitir que o Terraform execute a mudança. Se as preconditions não forem atendidas, o Terraform falha antes de aplicar qualquer alteração.
* **Postconditions**: São condições verificadas após a execução de um recurso. Elas confirmam se o estado final do recurso está de acordo com as expectativas definidas. Caso contrário, o Terraform também interrompe o processo com um erro.

Essas validações podem ser úteis para evitar falhas em ambientes de produção, impor padrões ou garantir que os parâmetros fornecidos estejam corretos.

## Casos de Aplicação Real

### 1. Garantir Limites em Contas Multiambientes

Imagine que você está lidando com múltiplos ambientes no Terraform (`dev`, `uat`, `prd`). É importante que, em cada ambiente, a quantidade de instâncias seja limitada, por exemplo, `dev` com no máximo 2 instâncias, `uat` com no máximo 4 e `prd` com no máximo 10.

Utilizando preconditions, você pode evitar que um erro humano cause a criação de mais instâncias do que o ambiente suporta.

### 2. Validação de Tags Obrigatórias

Em organizações que dependem de tags para a correta categorização e cobrança dos recursos, como o `squad`, `environment`, e `cost-center`, as preconditions podem garantir que essas tags sejam aplicadas corretamente antes de qualquer recurso ser criado.

Por exemplo, garantir que a tag `environment` seja sempre uma entre `dev`, `uat`, ou `prd` pode evitar inconsistências e falhas no processo de deploy.

### 3. Verificação de Estado Após Modificações

Postconditions podem ser usadas para verificar se, após a criação de um bucket S3, o ciclo de vida está configurado corretamente. Isso garante que qualquer alteração ou criação no Terraform siga as políticas definidas para gerenciamento de dados no longo prazo, como a exclusão de objetos após um certo período.

## Exemplos de Implementação

### Exemplo 1: Validando `instance_count` com Precondition

Neste exemplo, validamos que a quantidade de instâncias criada está dentro do permitido para o ambiente.

```hcl
variable "instance_count" {
  type = number
}

variable "environment" {
  type = string
  validation {
    condition = contains(["dev", "uat", "prd"], var.environment)
    error_message = "O environment deve ser 'dev', 'uat', ou 'prd'."
  }
}

resource "aws_instance" "example" {
  count = var.instance_count
  
  precondition {
    condition     = var.instance_count <= (var.environment == "dev" ? 2 : var.environment == "uat" ? 4 : 10)
    error_message = "O número de instâncias não pode exceder o limite do ambiente ${var.environment}."
  }

  ami           = "ami-12345678"
  instance_type = "t2.micro"
}
```

Aqui, validamos se o número de instâncias está adequado ao ambiente antes de permitir a criação.

### Exemplo 2: Garantindo Tags Obrigatórias

Neste caso, usamos uma precondition para garantir que as tags obrigatórias estejam corretas

```hcl
resource "aws_instance" "example" {
  ami           = "ami-12345678"
  instance_type = "t2.micro"
  tags = {
    Name         = "ExampleInstance"
    squad        = var.squad
    environment  = var.environment
    cost-center  = var.cost_center
  }

  precondition {
    condition     = contains(["cloud", "sre", "engenharia"], var.squad) && 
                    contains(["dev", "uat", "prd"], var.environment) && 
                    contains(["core", "business", "marketing"], var.cost_center)
    error_message = "As tags 'squad', 'environment', e 'cost-center' devem conter valores válidos."
  }
}
```

### Exemplo 3: Verificando a Configuração de Ciclo de Vida do S3 com Postcondition

Neste exemplo, verificamos que o bucket S3 foi criado com a política de ciclo de vida correta.

```hcl
resource "aws_s3_bucket" "example" {
  bucket = "example-bucket"
}

resource "aws_s3_bucket_lifecycle_configuration" "example" {
  bucket = aws_s3_bucket.example.bucket

  rule {
    id     = "ExpireOldObjects"
    status = "Enabled"

    expiration {
      days = 30
    }
  }

  postcondition {
    condition     = aws_s3_bucket_lifecycle_configuration.example.rule[0].expiration.days == 30
    error_message = "O ciclo de vida do bucket S3 deve estar configurado para expirar objetos após 30 dias."
  }
}
```

Ao aplicar essas práticas em seus projetos Terraform, você pode reduzir o risco de erros em ambientes de produção e garantir que suas implementações sejam executadas de acordo com as expectativas.