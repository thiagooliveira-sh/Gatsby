---
image: /assets/img/AWS.png
title: AWS IAM Identity Center Pipeline
description: O AWS IAM Identity Center, sucessor do AWS Single Sign-On, ajuda
  você a criar ou conectar com segurança suas identidades de força de trabalho e
  gerenciar seu acesso centralmente em contas e aplicativos da AWS
date: 2025-08-01
category: aws
background: "#FF9900"
tags:
  - AWS
  - IAM
  - SECURITY
  - PIPELINE
  - TERRAFORM
  - SSO
  - DEVOPS
categories:
  - AWS
  - IAM
  - SECURITY
  - PIPELINE
  - TERRAFORM
  - SSO
  - DEVOPS
---
O IAM Identity Center é a abordagem recomendada para autenticação e autorização da força de trabalho na AWS, ideal para organizações de qualquer porte. Ele permite integrar identidades de fontes externas, como o Microsoft Active Directory, e atribuí-las a contas AWS com permissões refinadas.

Com o AWS Identity Center, você tem uma experiência centralizada para definir, personalizar e distribuir acessos de forma granular.

Este padrão de automação permite gerenciar permissões no AWS IAM Identity Center como infraestrutura como código, oferecendo as seguintes capacidades:

* Criar, atualizar e remover Permission Sets
* Gerenciar assignments associando Permission Sets a contas da AWS ou OUs com usuários e grupos federados
* Criar, atualizar e deletar grupos no Identity Center



### Projeto base

A equipe da AWS desenvolveu a solução **aws-iam-identity-center-pipeline**, que utiliza serviços como **AWS CodePipeline**, **CodeBuild** e **CodeCommit** para orquestrar esse processo de forma automatizada. A pipeline é acionada por commits no repositório ou eventos do AWS Organizations (como movimentação de contas entre OUs), com regras do **EventBridge** e funções **Lambda**.

### O fork que amplia a solução

Originalmente, a pipeline apenas criava Permission Sets e atribuía a grupos já existentes. Para estender essa capacidade, realizei um [fork do projeto](https://github.com/thiagoalexandria/aws-iam-identity-center-pipeline/tree/feature/groups-terraform-support) com suporte à criação de grupos como parte do fluxo, tornando a solução **100% autônoma** e ainda mais prática para ambientes multi-conta.

### P﻿ré-requisitos

* Um ambiente com múltiplas contas gerenciado como uma organização no AWS Organizations.
* IAM Identity Center, ativado e configurado com uma fonte de identidade.
* Uma conta-membro registrada como administradora delegada.

  * IAM Identity Center – Para instruções, consulte [Registrar uma conta-membro](https://docs.aws.amazon.com/singlesignon/latest/userguide/delegated-admin.html#delegated-admin-how-to-register) na documentação do IAM Identity Center.
  * AWS Organizations – Para instruções, consulte [Administrador delegado para o AWS Organizations](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_delegate_policies.html). Essa conta deve ter permissões para listar e descrever contas e Unidades Organizacionais (OUs).
* Permissões para implantar stacks do AWS CloudFormation na conta administradora delegada do IAM Identity Center e na conta de gerenciamento da organização.
* Um bucket do Amazon Simple Storage Service (Amazon S3) na conta administradora delegada do IAM Identity Center. Você fará o upload do código dos artefatos nesse bucket.
* O ID da conta de gerenciamento da organização.
* Um repositório git que pode ser, Github ou Gitlab

### D﻿esenho da solução

![iam-identity-center-solution](/assets/img/iam-identity-center-1.png "iam-identity-center-solution")

### D﻿eploy

No projeto, utilizamos o template **`iam-identitycenter-pipeline.yaml`** do AWS CloudFormation para realizar o deploy da pipeline. Esse template exige o preenchimento dos seguintes parâmetros:

* **`nameConvention`**: Prefixo utilizado para nomear os recursos desta stack na conta administradora delegada do AWS IAM Identity Center (por exemplo, roles, eventos, pipeline).
* **`s3NameConvention`**: Prefixo utilizado para nomear os buckets S3. Recomenda-se refletir o valor de `nameConvention`, mas **deve obrigatoriamente estar em letras minúsculas**.
* **`mgmtAccountId`**: ID da conta de gerenciamento da organização (exemplo: `123456789123`).
* **`cwLGRetentionInDays`**: Período de retenção (em dias) dos logs nos grupos de logs do CloudWatch.
* **`codeBuildErrorEmailAddress`** *(opcional)*: Caso deseje receber notificações por e-mail em caso de falha no CodeBuild, informe um e-mail válido e aceite a inscrição no tópico SNS (exemplo: `usuario@dominio.com`).
* **`fullRepositoryId`**: ID completo do repositório no formato `usuario/nome_do_repositorio`.
* **`providerType`**: Tipo de provedor do repositório. Exemplos válidos: `Bitbucket`, `GitHub`, `GitHubEnterpriseServer`, `GitLab`, `GitLabSelfManage`.

Com o deploy concluído, a configuração da solução estará praticamente finalizada, restando apenas validar a **Connection** com seu VCS em **AWS Developer Tools > Settings > Connections**.

Após essa etapa, a integração com o repositório estará ativa e sua pipeline já contará com um gatilho automático, acionado sempre que um commit for realizado na branch `master`.

### Utilização da pipeline

O processo de criação envolve a manipulação de arquivos localizados nos diretórios `templates/assignments` e `templates/permissionsets`.

Todas as Permission Sets devem ser criadas no diretório `templates/permissionsets`, seguindo o formato de arquivos `.json`. Por exemplo:\
`templates/permissionsets/ps-infraestrutura.json`.

Você pode consultar exemplos de Permission Sets no diretório `exemplos`, que servem como referência para a criação dos seus próprios arquivos.

#### Templates PermissionSets

Este template é utilizado para gerenciar **Permission Sets** no **AWS IAM Identity Center**. Cada arquivo `.json` representa um Permission Set individual e deve estar localizado no diretório `templates/permissionsets`.

```json
{
    "Name": "ProductionAccess",
    "Description": "Production access in AWS",
    "SessionDuration": "PT4H",
    "ManagedPolicies": [
        "arn:aws:iam::aws:policy/job-function/ViewOnlyAccess"
    ],
    "CustomerManagedPolicies": [
        "myManagedPolicy",
        "anotherMangedPolicy"
    ],
    "PermissionBoundary": {
        "PolicyType": "AWS",
        "Policy": "arn:aws:iam::aws:policy/AdministratorAccess"
    },   
    "CustomPolicy": {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "ProductionAllowAccess",
                "Effect": "Allow",
                "Action": [
                    "ec2:*",
                ],
                "Resource": "*"
            }
        ]
    }
}
```

Segue o que  é necessário e aceito no template 

| Parametro               | Tipo          | Pode ser Alterado depois do deploy | Descrição                                                                                                                  |
| ----------------------- | ------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Name                    | String        | No                                 | Nome do PermissionSet no AWS IAM Identity Center. Uma vez feito deploy, esse campo não pode ser alterado e deve ser único. |
| Description             | String        | Yes                                | \[OPCIONAL] Descrição do PermissionSet no AWS IAM Identity Center                                                          |
| SessionDuration         | String        | Yes                                | Duração da sessão no formato ISO-8601                                                                                      |
| ManagedPolicies         | List (String) | Yes                                | \[OPCIONAL] Lista do ARN das AWS Managed Policies para serem adicionadas no PermissionSet.                                 |
| CustomerManagedPolicies | List (String) | Yes                                | \[OPCIONAL] Lista do NOME da Customer Managed Policies para serem adicionadas no PermissionSet.                            |
| PermissionBoundary      |               | Yes                                | \[OPCIONAL] Permission Boundary atribuído ao PermissionSet.                                                                |
| CustomPolicy            | String (JSON) | Yes                                | \[OPCIONAL] Inline Policy que será adicionada ao PermissionSet.                                                            |

#### Templates Assignments

O arquivo `templates/assignments/iam-identitycenter-assignments.json` é utilizado para gerenciar a relação entre **principals**, **contas da AWS** e **Permission Sets** no **AWS IAM Identity Center**.

```json
{
    "Assignments": [
        {
            "SID": "Assingment01",
            "Target": [
                "demo-account:123456789123"
            ],
            "PrincipalType": "GROUP",
            "PrincipalId": "LAB-NetworkAdministrator@domain.internal",
            "PermissionSetName": "NetworkAdministrator"
        }
    ]
}
```

Segue o que  é necessário e aceito no template

| Parametro         | Tipo          | Pode ser Alterado depois do deploy | Descrição                                                                                                                                                                                                                                                                                                                                                 |
| ----------------- | ------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SID               | String        | No                                 | Identificador do Assignment. Deve ser único e não pode ser alterado.                                                                                                                                                                                                                                                                                      |
| Target            | String        | Yes                                | Destino onde o principal terá acesso com o PermissionSet especificado. Os seguintes valores são suportados e devem ser especificados nos formatos abaixo:<br><br>Account ID: {{account_name}}:{{account_id}}<br><br>OU ID: {{ou_name}}:{{ou_id}}. Ou {{ou_name}}:{{ou_id}}:* para atribuir recursivamente as OUs filhas.<br><br>Root ID: root:{{root_id}} |
| PrincipalType     | String        | Yes                                | Tipo do principal que recebrá esse Assignment. Dois valores são permitidos:<br><br>GROUP<br><br>USER                                                                                                                                                                                                                                                      |
| PrincipalId       | List (String) | Yes                                | Nome do usuário no IdentityStore que receberá esse Assignment.                                                                                                                                                                                                                                                                                            |
| PermissionSetName | String        | Yes                                | Nome do PermissionSet.                                                                                                                                                                                                                                                                                                                                    |
| Exception         | List (String) | Yes                                | \[OPCIONAL] Insira o AccountID da(s) conta(s) AWS que não devem ser associadas nesse Assignment.                                                                                                                                                                                                                                                          |

#### Criação de Grupos

O arquivo `templates/groups/iam-identitycenter-groups.json` é utilizado para definir os grupos que serão criados e gerenciados automaticamente pela pipeline.

```
[
    {
        "DisplayName": "idc-infra-admin",
        "Description": "Grupo Staff"
    },
    {
        "DisplayName": "idc-readonly",
        "Description": "Grupo readonly"
    }
]
```

Segue o que  é necessário e aceito no template

| Parametro   | Tipo   | Obrigatório | Descrição                                                     |
| ----------- | ------ | ----------- | ------------------------------------------------------------- |
| DisplayName | String | Sim         | Nome visível do grupo no IAM Identity Center. Deve ser único. |
| Description | String | Sim         | Descrição do grupo, usada apenas para referência interna.     |

### Prática

Na prática, o processo envolve a criação de três arquivos em diretórios específicos dentro do projeto. A seguir, um exemplo completo com um Permission Set de acesso somente leitura.

#### Criar o Permission Set

Crie um arquivo chamado `./templates/permissionsets/ps-exemplo.json` com o conteúdo:

```json
{
    "Name": "ps-exemplo",
    "Description": "Permissionset de exemplo readonly",
    "SessionDuration": "PT4H",
    "ManagedPolicies": [
        "arn:aws:iam::aws:policy/ReadOnlyAccess"
    ],
    "CustomerManagedPolicies": []
}
```

#### Criar o Grupo

Edite o arquivo `./templates/groups/iam-identitycenter-groups.json` para incluir o grupo que receberá a permissão:

```json
[
    {
        "DisplayName": "group-teste-readonly",
        "Description": "Grupo readonly"
    }
]
```

#### Criar o Assignment

Por fim, edite o arquivo `./templates/assignments/iam-identitycenter-assignments.json` com a associação entre grupo, conta e permission set.\
O campo `Target` deve seguir o formato `nome-da-conta:id-da-conta` e os nomes do grupo (`PrincipalId`) e do permission set (`PermissionSetName`) **devem ser exatamente iguais aos definidos anteriormente**.

```json
{
    "Assignments": [
        {
            "SID": "ExemploSID",
            "Target": [
                "minha-conta:123456789012"
            ],
            "PrincipalType": "GROUP",
            "PrincipalId": "group-teste-readonly",
            "PermissionSetName": "ps-exemplo"
        }
    ]
}
```

Envie todas as alterações para o seu repositório git e vamos acompanhar a execução  do CodePipeline:

![iam-idc-1](/assets/img/idc-pipeline-1.png "iam-idc-1")

A﻿o observar o fluxo da pipeline vemos que ela  é a composto por três etapas principais, todas executadas com sucesso, conforme mostrado na imagem:

1. **Source**\
   A pipeline é acionada a partir de um commit no repositório GitLab.
2. **TemplateValidation**\
   Nesta etapa, os templates `.json` localizados nos diretórios `templates/permissionsets`, `templates/groups` e `templates/assignments` são validados automaticamente por um job do **AWS CodeBuild**. O objetivo é garantir que os arquivos estejam estruturados corretamente antes de prosseguir para o deploy.
3. **Deploy**\
   Após a validação, a etapa de deploy ocorre em três fases sequenciais:

   * **PermissionSet**: Criação ou atualização dos Permission Sets definidos nos templates.
   * **Groups**: Criação dos grupos no IAM Identity Center.
   * **Assignments**: Associação entre grupos, Permission Sets e contas AWS.

![iam-idc-2](/assets/img/idc-pipeline-2.png "iam-idc-2")

A﻿o finalizar a execução da pipeline teremos todos os componentes criados na nossa cloud e o assignment realizado.

![](/assets/img/idc-pipeline-3.png)

### Fechamento

Espero que este fork contribua para que mais pessoas desenvolvam automações mais robustas e confiáveis na entrega de **Permission Sets**, **grupos** e **assignments** dentro do **AWS IAM Identity Center**.

A ideia é facilitar o gerenciamento de acessos em ambientes com múltiplas contas, tornando o processo mais escalável, auditável e alinhado com boas práticas de infraestrutura como código.