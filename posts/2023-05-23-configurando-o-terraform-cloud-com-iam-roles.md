---
image: /assets/img/HashiCorp-Terraform-logo.png
title: Configurando o Terraform Cloud com IAM Roles
description: A configuração do Terraform Cloud com IAM roles permite uma gestão
  segura e simplificada das permissões de acesso aos recursos da AWS.
date: 2023-05-22
category: devops
background: "#05A6F0"
tags:
  - terraform
  - cloud
  - configuracao
  - iam
  - roles
  - aws
  - seguranca
  - terraform-cloud
  - trust-policy
  - policy
categories:
  - terraform
  - cloud
  - configuracao
  - iam
  - roles
  - aws
  - seguranca
  - terraform-cloud
  - trust-policy
  - policy
---
Sabemos, e isso não é novidade, que a segurança de nossa infraestrutura é de extrema importância. Todos os projetos, especialmente na nuvem, devem adotar boas práticas desde o início para evitar futuros problemas.

Quando se trata do Terraform, uma ferramenta de Infraestrutura como Código amplamente adotada no mercado, a segurança é uma questão crucial. É fundamental que nosso Terraform tenha privilégios de acesso mais elevados do que outros usuários, pois ele desempenhará um papel central na criação e gerenciamento de recursos.

Ao integrar o Terraform com a AWS, a concessão de permissões é principalmente realizada por meio do IAM. Portanto, é essencial que aproveitemos o serviço de IAM Roles. Isso é importante porque oferece uma abordagem mais segura e gerenciável.

Em vez de utilizar chaves de acesso estáticas para autenticação, as roles permitem que atribuamos permissões detalhadas a usuários, serviços ou aplicativos por meio de políticas de acesso.

#### **Requisitos Preliminares**

Antes de começarmos este breve laboratório, é fundamental compreender que este tutorial é direcionado a indivíduos que desejam ou já utilizam o Terraform Cloud como plataforma executora de seus códigos de Infraestrutura como Código (IaC).

Portanto, para dar início a este processo, é necessário que você cumpra os seguintes requisitos:

**1. Conta no Terraform Cloud:**

* É essencial criar uma conta no Terraform Cloud. A inscrição é gratuita e permite a gestão de até 500 recursos controlados pelo Terraform.

**2. Conta na AWS:**

* Você deverá possuir uma conta ativa na AWS, a qual será utilizada como base para a integração do Identity and Access Management.

Ao garantir que você atende a esses pré-requisitos, estará preparado para prosseguir com o tutorial, no qual configuraremos a integração entre o Terraform Cloud e o OIDC na AWS. Certifique-se de seguir cada passo com cuidado para assegurar uma configuração segura e funcional.

### Criando uma organização no Terraform Cloud

### Configurando sua conta AWS

### OIDC Provider, Role e Trust Policy

A URL do provider deve ser definida como o endereço do Terraform Cloud por exemplo, https://app.terraform.io, e a audience deve ser definida como aws.workload.identity.

R﻿OLE

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Federated": "OIDC_PROVIDER_ARN"
            },
            "Action": "sts:AssumeRoleWithWebIdentity",
            "Condition": {
                "StringEquals": {
                    "SITE_ADDRESS:aud": "AUDIENCE_VALUE",
                    "SITE_ADDRESS:sub": "organization:ORG_NAME:project:PROJECT_NAME:workspace:WORKSPACE_NAME:run_phase:RUN_PHASE"
                }
            }
        }
    ]
}
```
Claro, aqui estão os itens formatados como uma lista:

- OIDC_PROVIDER_ARN: O ARN do recurso do provedor OIDC criado na etapa anterior.
- SITE_ADDRESS: O endereço do Terraform Cloud com o "https://" removido, por exemplo, app.terraform.io.
- AUDIENCE_VALUE: Isso deve ser definido como aws.workload.identity.
- ORG_NAME: O nome da organização a qual esta política será aplicada.
- PROJECT_NAME: O nome do projeto ao qual esta política será aplicada.
- WORKSPACE_NAME: O nome do espaço de trabalho ao qual esta política será aplicada.
- RUN_PHASE: A fase de execução a qual esta política será aplicada, atualmente uma das seguintes: plan ou apply.

Uma política de permissões precisa ser adicionada à função, definindo quais operações na AWS a função está autorizada a realizar.

### Configurando seus workloads no Terraform Cloud

### Executando plan e apply