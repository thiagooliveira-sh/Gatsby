---
image: /assets/img/AWS.png
title: Security as Code Prevenindo Falhas Antes do Deploy
description: "Em ambientes de nuvem, a velocidade dos deploys cresce
  continuamente. A cada sprint, releases se tornam mais frequentes,
  automatizadas e distribuídas. No entanto, essa agilidade traz um efeito
  colateral perigoso: erros de configuração podem ir para produção em minutos,
  abrindo portas para incidentes de segurança que poderiam ter sido evitados."
date: 2025-08-15
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
Times de desenvolvimento e infraestrutura operam hoje em modelos altamente ágeis: CI/CD, infra como código, microserviços.\
Mas a segurança nem sempre acompanha esse ritmo.

Modelos tradicionais dependem de revisões manuais no final do ciclo, quando tudo já está pronto ou até mesmo em produção. E aí surgem dois problemas:

* **Custo de correção mais alto**
* **Risco de incidentes devido a erros que poderiam ter sido barrados antes**

Security as Code resolve esse gargalo ao trazer a segurança para o início do ciclo, automatizando verificações e prevenindo erros antes mesmo de chegar ao deploy.

## **O caso do bucket exposto**

Todos os anos, vemos incidentes praticamente idênticos envolvendo buckets S3 públicos ou mal configurados. Alguns exemplos conhecidos: 

* [mcGraw Hill](https://edscoop.com/mcgraw-hill-amazon-s3-data-exposure-student-emails-grades/) – milhões de registros de estudantes expostos
* [Premier Diagnostics](https://www.hipaajournal.com/unsecured-amazon-s3-buckets-contained-id-card-scans-of-52000-individuals/) – dados sensíveis acessíveis publicamente
* [Raindeer](https://www.securitymagazine.com/articles/95782-reindeer-leaked-the-sensitive-data-of-more-than-300000-people) – informações pessoais deixadas em buckets sem proteção

O bucket não estava criptografado, não tinha autenticação adequada e estava acessível publicamente. O pior? Isso poderia ter sido evitado com uma simples verificação automatizada no código Terraform ou através de remediações automáticas através do AWS Config.

Esse tipo de falha não é exclusividade de grandes empresas. **Qualquer organização** que não tenha práticas de segurança automatizadas corre o mesmo risco. A diferença entre o desastre e a prevenção está em colocar a segurança no início do ciclo de desenvolvimento e é aí que entra o Security as Code.

## **O que é Security as Code**

Security as Code é a prática de **definir, versionar e automatizar políticas de segurança** no mesmo fluxo de desenvolvimento e entrega de código.\
Ao invés de revisar manualmente configurações depois que o ambiente está no ar, as regras são aplicadas e validadas **antes** do deploy.

### **Objetivos principais**

1. **Prevenção proativa**: evitar que configurações inseguras sejam criadas.
2. **Consistência**: todos os ambientes seguem os mesmos padrões.
3. **Velocidade**: segurança integrada ao pipeline, sem gargalos manuais.
4. **Compliance contínuo**: auditoria facilitada com relatórios e histórico.

### **Security as Code no ciclo DevSecOps**

O DevSecOps coloca a segurança como responsabilidade compartilhada entre **desenvolvedores, operações e segurança**. O Security as Code é o motor dessa abordagem, ele garante que as regras de segurança não fiquem “guardadas” em documentos, mas vivam no código e pipelines.

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

### Auto-remediação com AWS Config

Em ambientes dinâmicos, com múltiplas contas, times diferentes e centenas de recursos sendo criados diariamente, um risco adicional surge: **o drift**, quando um recurso muda depois do deploy e foge dos padrões aprovados.

É aqui que entra o **AWS Config**, um dos serviços mais poderosos da AWS para quem deseja segurança contínua e governança automatizada, ele permite:

* Monitorar recursos em tempo real
* Registrar todo o histórico de alterações
* Avaliar se cada recurso está em conformidade com as regras da empresa
* Gerar alertas
* Principalmente, aplicar **auto-remediação** quando algo estiver fora do padrão

Ou seja:

> **Se um desvio acontecer, ele será corrigido automaticamente sem intervenção humana.**

Isso reduz risco operacional, diminui o tempo de exposição e aumenta a maturidade de segurança da organização.

#### Como funciona o ciclo de auto-remediação

1. 1. **Regra do AWS Config** monitora um recurso e avalia se ele está em conformidade.
2. 2. Se a avaliação for **NON_COMPLIANT**, a regra pode acionar:

   * Um **SSM Automation Runbook**, ou
   * Uma **Lambda Function**
3. 3. O runbook/função executa a correção e retorna o recurso ao estado desejado.
4. 4. AWS Config reavalia o recurso e confirma a conformidade.

### Garantir que grupos de segurança não permitam tráfego *0.0.0.0/0* na porta 22

Mesmo em ambientes maduros, um dos problemas mais recorrentes é a abertura acidental de portas perigosas para a internet especialmente **SSH**. Isso representa risco de ataques de força bruta e exposição desnecessária do servidor.

#### Objetivo da auto-remediação

* Detectar automaticamente qualquer Security Group que permita acesso SSH de **qualquer origem pública**.
* Executar uma ação de correção removendo a regra insegura.

#### **1. Regra do AWS Config**

Usamos a regra gerenciada: **`INCOMING_SSH_DISABLED`** Ela verifica se existe alguma regra de inbound SSH aberta para 0.0.0.0/0.

#### **2. Ação de remediação**

Podemos anexar um **SSM Automation Runbook** que remove automaticamente a regra insegura.

Exemplo de runbook pronto da AWS: **`AWS-DisablePublicAccessForSecurityGroup`** ele:

* localiza regras de entrada perigosas
* remove apenas aquelas que estão fora da conformidade
* mantém outras regras intactas

#### Fluxo da auto-remediação

1. 1. Alguém cria ou altera um Security Group e adiciona a regra:

   * **Inbound**
   * Porta: `22`
   * Origem: `0.0.0.0/0`
2. 2. AWS Config detecta a regra e marca como **NON_COMPLIANT**
3. 3. O runbook é acionado automaticamente
4. 4. A regra insegura é removida em segundos
5. 5. O recurso volta ao estado **COMPLIANT**

Security as Code não é um luxo e nem uma tendência: é um **pilar obrigatório** para empresas que querem operar em nuvem com segurança e velocidade.