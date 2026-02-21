---
image: /assets/img/AWS.png
title: Governanca de Tags na Nuvem Como Automatizar e Validar Padroes
description: Em ambientes de nuvem, a velocidade com que criamos recursos é ao
  mesmo tempo uma vantagem e um risco. É comum que, no meio da correria para
  atender uma demanda urgente, recursos sejam criados sem qualquer padrão de
  nomenclatura ou identificação.
date: 2025-08-19
category: devops
background: "#05A6F0"
status: draft
tags:
  - TAGS
  - NUVEM
  - CLOUD
  - DEVOPS
  - FINOPS
  - TERRAFORM
  - AWS
  - AWSCLI
  - AWSCONFIG
  - GOVERNANÇA
  - TAGGING
  - ORGANIZAÇÃO
  - INFRAASCODE
  - SECURITYASCODE
categories:
  - TAGS
  - NUVEM
  - CLOUD
  - DEVOPS
  - FINOPS
  - TERRAFORM
  - AWS
  - AWSCLI
  - AWSCONFIG
  - GOVERNANÇA
  - TAGGING
  - ORGANIZAÇÃO
  - INFRAASCODE
  - SECURITYASCODE
---
Sem um controle sobre **tags**, você perde visibilidade de quem criou o quê, qual projeto está consumindo recursos e, pior ainda, quais custos são realmente necessários. Isso abre a porta para desperdício financeiro, insegurança operacional e dores de cabeça em auditorias, vamos aprender:

* Por que **tags** são cruciais para governança.
* Como criar um **padrão replicável** de tags.
* Como aplicar automaticamente tags em todos os recursos usando **Terraform**.
* Como validar, via **AWS Config**, que todos os recursos estão em conformidade.

No final, você terá um ambiente que **se autorregula**, identificando rapidamente qualquer recurso fora do padrão.

### **O papel das tags na governança em nuvem**

Se você já tentou responder à pergunta **"Quanto custa esse projeto?"** ou **"Quem criou esse recurso?"** sem tags, sabe o quanto isso é difícil.

Tags são metadados aplicados a recursos cloud que servem para:

1. **Controle de custos (FinOps)**

   * Filtrar gastos por projeto, squad, centro de custo ou cliente.
   * Ajudar a justificar investimentos e cortes de orçamento.
2. **Automação e operações**

   * Rodar scripts ou pipelines apenas em recursos específicos.
   * Ex.: Encerrar instâncias “de laboratório” fora do horário comercial automaticamente.
3. **Segurança e compliance**

   * Garantir que recursos críticos estejam criptografados.
   * Validar que ambientes de produção têm backups habilitados.
4. **Organização e troubleshooting**

   * Localizar rapidamente recursos em ambientes grandes.
   * Criar relatórios ou dashboards segmentados.

Sem uma estratégia, cada equipe cria tags da própria forma:

* `Environment: Prod`, `environment: production`, `env: prod` — tudo significa a mesma coisa, mas para o sistema são chaves diferentes.

### **Definindo um padrão de tags**

Antes de sair aplicando regras, precisamos definir um **padrão claro e aceito** por todos.

| Tag           | Valores permitidos        | Obrigatória | Observações                 |
| ------------- | ------------------------- | ----------- | --------------------------- |
| `squad`       | cloud, sre, engenharia    | ✅           | Nome da equipe responsável  |
| `environment` | dev, hml, prd             | ✅           | Ambiente do recurso         |
| `cost-center` | core, business, marketing | ✅           | Centro de custo oficial     |
| `owner`       | e-mail corporativo        | ✅           | Pessoa ou grupo responsável |

**Boas práticas**:

* Sempre usar **letras minúsculas**.
* Não usar espaços nem caracteres especiais.
* Revisar a lista a cada 6 meses.

### **Como vamos implementar**

Vamos usar dois pilares:

1. **Automação com Terraform** → para garantir que os recursos já nasçam com as tags certas.
2. **Validação com AWS Config** → para garantir que, mesmo que alguém crie algo manualmente, ele será identificado se estiver fora do padrão.

## **Hands-on: Criando e validando tags na AWS**

![](/assets/img/tags-auto.png)

### **1. Pré-requisitos**

* Conta AWS com permissões para criar recursos, IAM roles e AWS Config.
* **Terraform** instalado ([download aqui](<>)).
* **AWS CLI** configurado (`aws configure`).

### **2. Estrutura Terraform: criando um bucket S3 com tags obrigatórias**

**Arquivo `main.tf`**:

```
provider "aws" {
  region = "us-east-1"
}

variable "tags" {
  type = map(string)
  default = {
    squad        = "cloud"
    environment  = "dev"
    cost-center  = "core"
    owner        = "thiago.alexandria"
  }
}

resource "random_id" "suffix" {
  byte_length = 4
}

resource "aws_s3_bucket" "example" {
  bucket = "governanca-tags-exemplo-${random_id.suffix.hex}"
  tags   = var.tags
}
```

### **3. Criando a regra de compliance no AWS Config**

**Arquivo `config.tf`**:

```
resource "aws_iam_role" "config_role" {
  name = "AWSConfigRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = { Service = "config.amazonaws.com" }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "config_policy" {
  role       = aws_iam_role.config_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSConfigRole"
}

resource "aws_s3_bucket" "config_logs" {
  bucket = "config-logs-${random_id.config_logs.hex}"
}

resource "random_id" "config_logs" {
  byte_length = 4
}

resource "aws_config_configuration_recorder" "recorder" {
  name     = "config-recorder"
  role_arn = aws_iam_role.config_role.arn
}

resource "aws_config_delivery_channel" "channel" {
  name           = "config-channel"
  s3_bucket_name = aws_s3_bucket.config_logs.bucket
  depends_on     = [aws_config_configuration_recorder.recorder]
}

resource "aws_config_config_rule" "required_tags" {
  name = "required-tags"
  source {
    owner             = "AWS"
    source_identifier = "REQUIRED_TAGS"
  }
  input_parameters = jsonencode({
    tag1Key = "squad"
    tag2Key = "environment"
    tag3Key = "cost-center"
    tag4Key = "owner"
  })
}
```

### **4. Executando o deploy**

Isso cria o bucket S3 com as tags e ativa o AWS Config para monitorar.

```
terraform init
terraform apply -auto-approve
```

### **5. Testando a governança**

Remova uma tag do bucket no console ou via CLI:

```
aws s3api delete-bucket-tagging --bucket <nome-do-bucket>
```

Aguarde alguns minutos e vá em **AWS Config → Rules → required-tags**, você verá o recurso marcado como **NON_COMPLIANT.**

\[﻿FOTO 1]

### **6. Corrigindo**

Adicione novamente as tags:

```
aws s3api put-bucket-tagging --bucket <nome-do-bucket> --tagging 'TagSet=[{Key=squad,Value=cloud},{Key=environment,Value=dev},{Key=cost-center,Value=core},{Key=owner,Value=thiago.alexandria'
```

Em alguns minutos, o status voltará para **COMPLIANT**.

## **Modo avançado: validando valores de tags**

A regra `REQUIRED_TAGS` valida apenas a existência das tags, não seus valores.\
Se você quiser validar valores específicos, precisará criar uma **Custom Config Rule** usando Lambda.

Exemplo de lógica em Python para validar `environment`:

```
if tag['Key'] == 'environment' and tag['Value'] not in ['dev', 'hml', 'prd']:
    non_compliant.append(resourceId)
```

Isso garante que ninguém crie, por exemplo, `Environment=Testinho`.

## **Erros comuns**

* **Não iniciar o Configuration Recorder** → sem ele, o AWS Config não funciona.
* **Demora para atualização** → avaliações podem levar até 15 minutos.
* **Valores inconsistentes** → padronize lowercase e listas controladas.

Ao unir **Terraform** para aplicar tags automaticamente e **AWS Config** para validar compliance, você cria uma camada de governança que funciona de forma contínua e automática.

O resultado?

* Mais controle sobre custos.
* Menos retrabalho operacional.
* Maior facilidade em auditorias.

**Próximos passos:**

* Criar validação de valores permitidos com Custom Config Rules.
* Integrar validação de tags nos pipelines CI/CD.
* Criar dashboards de custos filtrados por tags.
