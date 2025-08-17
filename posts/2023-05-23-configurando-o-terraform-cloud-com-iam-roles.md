---
image: /assets/img/HashiCorp-Terraform-logo.png
title: Configurando o Terraform Cloud com IAM Roles
description: A configuração do Terraform Cloud com IAM roles permite uma gestão
  segura e simplificada das permissões de acesso aos recursos da AWS.
date: 2023-09-22
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
![](/assets/img/HashiCorp-Terraform-logo.png)

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

Agora que criamos o OIDC, podemos partir para a criação de políticas e Roles e atribuição de permissões usando uma **Custom Trust Role Policy**. Para este laboratório, usaremos a política administrativa padrão gerenciada pela AWS. Ela garante que o seu ambiente de trabalho siga o princípio do "mínimo de privilégios", ou seja, só concede as permissões estritamente necessárias para a execução das tarefas.

Para criar a Role, você pode seguir direto para a criação no painel do IAM. Basta acessar a seção **Roles** no menu lateral esquerdo e clicar em **Create Role**. Durante o processo de criação, selecione a opção **Custom trust Policy** para que possamos inserir a nossa própria política personalizada:

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

Pronto, criado a Role e anexando a Policy de acesso podemos seguir para configuração do nosso Workspace no Terraform Cloud.

### Configurando seus Workspaces no Terraform Cloud

Para configurar a autenticação com a AWS usando credenciais dinâmicas por meio das Roles, é necessário definir algumas variáveis de ambiente em seu Workspace no Terraform Cloud. Sabendo disso, basta acessar o seu workspace que será possível na tela principal uma opção de **Configure Variables**:

![terraform-cloud-8](/assets/img/terraform-cloud-8.png)

Essas variáveis podem ser configuradas individualmente para o seu espaço de trabalho ou, se preferir compartilhar essa função AWS entre vários espaços de trabalho, você pode usar os Variable Sets, as variáveis a serem configuradas são as seguintes:

* `TFC_AWS_PROVIDER_AUTH` = true
* `TFC_AWS_RUN_ROLE_ARN`  = O ARN da role que será assumida

![terraform-cloud-9](/assets/img/terraform-cloud-9.png)

Além disso, você tem a opção de configurar funções diferentes para cada etapa do Terraform, como o Plan e a apply, por meio das variáveis `TFC_AWS_PLAN_ROLE_ARN` e `TFC_AWS_APPLY_ROLE_ARN`. Isso permite uma granularização ainda maior das permissões para o planejamento e a implantação que o seu Terraform executará.

Essa estrutura de Assume Role é crucial para a aplicação dos princípios de **Least Privilege**. Com ela, você pode criar workspaces com permissões IAM específicas. Por exemplo, espaços de trabalho responsáveis pela gestão de IAM não precisam ter acesso a recursos como EC2, RDS ou CloudWatch. Da mesma forma, projetos que lidam com a criação de three-tier applications não precisam criar usuários IAM, essa abordagem ajuda a garantir a segurança e a eficiência da sua configuração. 

Pronto estamos com o nosso ambiente pronto apra iniciarmos os testes de plan e apply.

### Executando plan e apply

Para o nosso teste de plan e apply vamos criar um código simples. Eu deixarei o link para o [repositório](https://github.com/thiagooliveira-sh/terraform-cloud-example), mas começaremos criando os arquivos a partir do `main.tf`.

```
provider "aws" {
  region = "sa-east-1"
}

terraform {
  backend "remote" {
    organization = "thiagoalexandria-org"

    workspaces {
      name = "terraform-cloud-example"
    }
  }
}
```

Ótimo! Com o nosso backend e o provedor AWS definidos, vamos seguir em frente e começar a criar recursos. Começaremos com a criação de uma instância EC2, apenas para fins de demonstração no arquivo `ec2.tf`.

```
# Defina um data source para obter a AMI do Amazon Linux
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-2.*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Crie uma instância EC2
resource "aws_instance" "example" {
  ami           = data.aws_ami.amazon_linux.id
  instance_type = "t3a.micro"
  tags = {
    Name = "ec2-demo"
  }
}

# Saída do endereço IP público da instância EC2
output "public_ip" {
  value = aws_instance.example.public_ip
}
```

Basta fazer um commit no seu projeto e você verá que uma execução de Plan será iniciada no Terraform Cloud. Abaixo, temos um exemplo de como a etapa de Plan é executada e, em seguida, o Apply é disponibilizado para aprovação:

![terraform-cloud-10](/assets/img/terraform-cloud-10.png)

Neste ponto, você pode revisar as alterações planejadas antes de aprovar a aplicação real das mudanças em sua infraestrutura AWS. Isso ajuda a garantir que você tenha controle total sobre as alterações que serão implementadas.

Este é o modelo mais comum de integração entre o Terraform Cloud e a AWS. Uma abordagem adicional que abordaremos posteriormente é a possibilidade de usar Agentes do Terraform Cloud dentro da sua infraestrutura, permitindo que o Terraform opere em sua rede privada na AWS, como a implantação de lançamentos Helm em um cluster EKS com um endpoint privado.

Espero que tenham gostado deste guia. Foi um trabalho que exigiu um pouco mais de tempo, mas sempre quisemos disponibilizar materiais voltados para o Terraform Cloud. Agora, com o novo modelo de licenciamento, acreditamos que será uma ótima opção, pois a cobrança é baseada em um custo muito baixo de $0.00014 por hora por recurso criado. Isso torna a automação com o Terraform Cloud ainda mais acessível e eficiente.