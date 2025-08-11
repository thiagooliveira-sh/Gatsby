---
image: /assets/img/AWS.png
title: Security as Code Prevenindo Falhas Antes do Deploy
description: Em ambientes de nuvem, a velocidade de deploy é cada vez maior, mas
  isso também significa que erros de configuração podem chegar à produção em
  questão de minutos. Ativar uma instância sem criptografia ou criar um bucket
  S3 público pode parecer inofensivo no início, mas pode gerar impactos
  financeiros, legais e reputacionais sérios.
date: 2025-08-11
category: devops
background: "#05A6F0"
tags:
  - SECURITYASCODE
  - NUVEM
  - CLOUD
  - DEVOPS
  - SECURITY
  - DEVSECOPS
  - TERRAFORM
  - CHECKOV
  - SECURITYAUTOMATION
  - SECURITYPOLICY
  - INFRAASCODE
  - SECURITYBESTPRACTICES
  - AWSSECURITY
categories:
  - SECURITYASCODE
  - NUVEM
  - CLOUD
  - DEVOPS
  - SECURITY
  - DEVSECOPS
  - TERRAFORM
  - CHECKOV
  - SECURITYAUTOMATION
  - SECURITYPOLICY
  - INFRAASCODE
  - SECURITYBESTPRACTICES
  - AWSSECURITY
---
Os times de desenvolvimento e infraestrutura vêm adotando metodologias cada vez mais ágeis, e isso traz um desafio: **a segurança precisa acompanhar a velocidade dos deploys**. Não adianta apenas ter um time de segurança revisando configurações depois que tudo já está em produção, o custo e o risco aumentam exponencialmente.

Com **Security as Code**, a segurança deixa de ser uma barreira no fim do processo e passa a estar **integrada desde o início** do ciclo de desenvolvimento, com verificações automatizadas que impedem que código inseguro seja implantado.



## **O caso do bucket exposto**

Todos os anos vemos casos muito semelhantes, empresas globais sofrendo com exposição de registros hospedados em buckets s3 mal configurados. 

* [mcGraw Hill](https://edscoop.com/mcgraw-hill-amazon-s3-data-exposure-student-emails-grades/)
* [Premier Diagnostics](https://www.hipaajournal.com/unsecured-amazon-s3-buckets-contained-id-card-scans-of-52000-individuals/)
* [Raindeer](https://www.securitymagazine.com/articles/95782-reindeer-leaked-the-sensitive-data-of-more-than-300000-people)

O bucket não estava criptografado, não tinha autenticação adequada e estava acessível publicamente. O pior? Isso poderia ter sido evitado com uma simples verificação automatizada no código Terraform ou através de remediações automáticas através do AWS Config.

Esse tipo de falha não é exclusividade de grandes empresas. **Qualquer organização** que não tenha práticas de segurança automatizadas corre o mesmo risco.\
A diferença entre o desastre e a prevenção está em colocar a segurança no início do ciclo de desenvolvimento**,** e é aí que entra o Security as Code.

## **O que é Security as Code**

Security as Code é a prática de **definir, versionar e automatizar políticas de segurança** no mesmo fluxo de desenvolvimento e entrega de código.\
Ao invés de revisar manualmente configurações depois que o ambiente está no ar, as regras são aplicadas e validadas **antes** do deploy.

### **Objetivos principais**

1. **Prevenção proativa**: evitar que configurações inseguras sejam criadas.
2. **Consistência**: todos os ambientes seguem os mesmos padrões.
3. **Velocidade**: segurança integrada ao pipeline, sem gargalos manuais.
4. **Compliance contínuo**: auditoria facilitada com relatórios e histórico.



### **Security as Code no ciclo DevSecOps**

O DevSecOps coloca a segurança como responsabilidade compartilhada entre **desenvolvedores, operações e segurança**. O Security as Code é o motor dessa abordagem — ele garante que as regras de segurança não fiquem “guardadas” em documentos, mas vivam no código e pipelines.

Fluxo simplificado:

1. Desenvolvedor escreve código de infraestrutura.
2. Pipeline executa verificações de segurança automaticamente.
3. Se violar as regras → pipeline falha.
4. Se passar → deploy autorizado.



### **Ferramentas populares de Security as Code**

| Ferramenta                   | Foco principal                       | Pontos fortes                                                                           |
| ---------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------- |
| **Checkov**                  | IaC (Terraform, CloudFormation, K8s) | Open source, fácil de integrar, centenas de checks prontos.                             |
| **OPA / Rego**               | Políticas genéricas                  | Muito flexível, pode validar qualquer formato de dado, mas requer curva de aprendizado. |
| **Terraform Cloud Sentinel** | Políticas para Terraform             | Integração nativa com Terraform Enterprise/Cloud, mas proprietário.                     |
| **CloudFormation Guard**     | Templates AWS CloudFormation         | Focado em AWS, fácil para quem já usa CloudFormation.                                   |
| **Conftest**                 | Políticas em YAML/JSON               | Simples, versátil, ideal para pipelines leves.                                          |



## **Estratégia do hands-on**

Vamos criar alguns buckets no s3 via Terraform e implementar políticas que bloqueiem qualquer recurso s3 de estarem publicamente acessíveis e validar se outras features como versionamento esta habilitado. Isso será integrado à pipeline localmente, mas a mesma lógica pode ser aplicada no GitHub Actions, GitLab CI, etc.



## **Cenário 1: Bloqueio de buckets públicos na conta**

**Arquivo `block_public_access.tf`**:

```
provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_account_public_access_block" "account_level" {
  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = true
  restrict_public_buckets = true
}

```

V﻿amos agora testar criar um bucket com `public-read`, a tentativa de aplicar `public-read` deve falhar, mostrando que o bloqueio está ativo.

```
aws s3api create-bucket --bucket bucket-teste-publico --region us-east-1
aws s3api put-bucket-acl --bucket bucket-teste-publico --acl public-read
```

## **Cenário 2: Política como código com Checkov**

**Arquivo `insecure.tf:`** (inseguro propositalmente):

```
resource "aws_s3_bucket" "insecure" {
  bucket = "bucket-sem-seguranca-${random_id.suffix.hex}"
}

resource "random_id" "suffix" {
  byte_length = 4
}
```

### **Criando política customizada do Checkov**

**Arquivo `s3_policy.yaml`**:

```
metadata:
  name: "S3 Buckets devem ter versionamento habilitado"
  id: "CUSTOM_AWS_S3_1"
  category: "Security"
scope:
  provider: aws
definition:
  and:
    - cond_type: attribute
      resource_types:
        - aws_s3_bucket
      attribute: versioning
      operator: exists

```

Execute o checkov com a política customizada:

```
checkov -d . --external-checks-dir .
```

Saída esperada:

```
FAILED for resource: aws_s3_bucket.insecure
```



### **Corrigindo**

Atualize o **`insecure.tf`**:

```
resource "aws_s3_bucket" "secure" {
  bucket = "bucket-seguro-${random_id.suffix.hex}"

  versioning {
    enabled = true
  }
}

resource "aws_s3_bucket" "log_bucket" {
  bucket = "bucket-de-logs-${random_id.log_suffix.hex}"
}

resource "random_id" "log_suffix" {
  byte_length = 4
}
```

A﻿gora é só executar o scan novamente e agora ele deve retornar sucesso:

```
checkov -d . --external-checks-dir .
```



Security as Code não é um luxo, é uma necessidade. Colocar a segurança dentro do pipeline garante que erros sejam barrados antes de virar incidentes, reduz custos e protege a reputação da empresa.

O investimento inicial em configurar essas verificações se paga rápido, porque **o custo de corrigir um erro em produção é sempre maior**.

Explore também serviços como AWS Config para criar regras customizadas baseada na necessidade da sua empresa, para facilitar a padronização em ambientes com múltiplas AWS Accounts explore alternativas como Account Factory para Terraform ( AFT ), nele existe uma estrutura de globals-configuration  que são configurações aplicadas para todas as contas AWS que estivem cobertas pelo AFT, facilitando a entrega de guardrails.