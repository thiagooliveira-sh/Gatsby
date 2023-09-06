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

Após a criação da sua conta no Terraform Cloud, você será redirecionado para um menu no qual poderá escolher como configurar o seu Workflow. Uma das opções disponíveis e a que selecionaremos é "Criar uma nova organização".

![terraform-cloud-1](/assets/img/terraform-cloud-1.png)

O processo de criação é bastante simples. Você só precisa fornecer o nome da organização, que deve ser exclusivo e conter apenas letras, números, sublinhados e hífens, além de um endereço de e-mail que será responsável por receber e-mails, notificações e informações de faturamento.

![terraform-cloud-2](/assets/img/terraform-cloud-2.png)

Após a criação da organização, é hora de criar um novo Workspace. A configuração é simples e a opção mais comum é escolher um controle de versão baseado no Git.

![terraform-cloud-3](/assets/img/terraform-cloud-3.png)

O Terraform Cloud é compatível com os principais sistemas de controle de versão, como GitHub, GitLab e Bitbucket. No nosso caso, escolheremos o GitHub. A autorização é realizada por meio do OAuth e você pode obter detalhes adicionais na documentação, acessível por meio da [documentação](https://developer.hashicorp.com/terraform/cloud-docs/vcs/github).

![terraform-cloud-4](/assets/img/terraform-cloud-4.png)

Basta selecionar o seu repositório e, em seguida, o seu workspace estará  pronto para uso:

![terraform-cloud-5](/assets/img/terraform-cloud-5.png)

### Configurando sua conta AWS

É necessário configurar a nossa conta AWS para permitir que o Terraform Cloud realize a ação **Assume Role** dentro da nossa conta. Essa estrutura é estabelecida por meio do OpenID Connect, onde configuramos a audiência e confiamos que o Terraform poderá utilizar essas permissões. Além disso, é necessário criar uma **Role** com uma política de confiança personalizada que permita apenas a ação **Assume Role** originada do OIDC, concedendo as permissões necessárias para que o nosso Terraform externo possa operar de forma eficiente.

### OIDC Provider, Role e Trust Policy

Primeiramente, vamos criar o OIDC. Para fazer isso, acesse o painel de **IAM** no console da AWS. Após o acesso, você encontrará a opção **Identity providers** no menu lateral esquerdo.

![terraform-cloud-6](/assets/img/terraform-cloud-6.png)

Após abrir a seção de **Identity providers**, clique na opção **Add Provider**. Em seguida, selecione a opção **OpenID Connect**. No campo **Provider URL**, defina o endereço do Terraform Cloud, por exemplo, **https://app.terraform.io**. Na seção **Audience**, defina como **aws.workload.identity**. Após a configuração, seu OIDC ficará semelhante ao mostrado na imagem abaixo:

![terraform-cloud-7](/assets/img/terraform-cloud-7.png)

Agora que criamos o OIDC, podemos partir para a criação de políticas e funções (roles) e atribuição de permissões usando uma **Custom Trust Role Policy**. Para este laboratório, usaremos a política administrativa padrão gerenciada pela AWS. Ela garante que o seu ambiente de trabalho siga o princípio do "mínimo de privilégios", ou seja, só concede as permissões estritamente necessárias para a execução das tarefas.

Para criar a função, você pode seguir direto para a criação no painel do IAM. Basta acessar a seção **Roles** no menu lateral esquerdo e clicar em **Create Role**. Durante o processo de criação, selecione a opção **Custom trust Policy** para que possamos inserir a nossa própria política personalizada:

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

* SOIDC_PROVIDER_ARN: O ARN do recurso do provedor OIDC criado na etapa anterior.
* SITE_ADDRESS: O endereço do Terraform Cloud com o "https://" removido, por exemplo, app.terraform.io.
* AUDIENCE_VALUE: Isso deve ser definido como aws.workload.identity.
* ORG_NAME: O nome da organização a qual esta política será aplicada.
* PROJECT_NAME: O nome do projeto ao qual esta política será aplicada.
* WORKSPACE_NAME: O nome do espaço de trabalho ao qual esta política será aplicada.
* RUN_PHASE: A fase de execução a qual esta política será aplicada, atualmente uma das seguintes: plan ou apply.

Uma política de permissões precisa ser adicionada à função, definindo quais operações na AWS a função está autorizada a realizar.

### Configurando seus Workspaces no Terraform Cloud

Para configurar a autenticação com a AWS usando credenciais dinâmicas através das roles, é necessário definir algumas variáveis de ambiente no nosso workspace no Terraform Cloud.

Essas variáveis podem ser configuradas como variáveis individualizadas para o seu workspace ou se preferir compartilhar essa função AWS entre vários workspaces, é possível através dos variables sets.

As variaveis são :

* `TFC_AWS_PROVIDER_AUTH` = true
* `TFC_AWS_RUN_ROLE_ARN`  = O ARN da role que será assumida

Além disso, é possível configurar funções diferentes para cada etapa do Terraform, como o plan e apply, por meio das variáveis `TFC_AWS_PLAN_ROLE_ARN` e `TFC_AWS_APPLY_ROLE_ARN`. Isso possibilita uma granularização ainda maior das permissões para o planejamento e a implantação que o seu Terraform executará.

Essa estrutura de "assume role" é fundamental para a implementação dos princípios de "least privilege" (princípio do menor privilégio). Dessa forma, é possível criar workspaces com permissões IAM específicas. Por exemplo, workspaces responsáveis pela gestão de IAM não precisam ter acesso a recursos como EC2, RDS ou CloudWatch. Da mesma forma, projetos que lidam com a criação de aplicativos em camadas (three-tier applications) não precisam criar usuários IAM.

### Executando plan e apply