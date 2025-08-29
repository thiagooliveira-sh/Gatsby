---
image: /assets/img/AWS.png
title: Como arquitetar aplicacoes em producao na AWS Parte 2
description: No último artigo falamos sobre os fundamentos de arquitetura em
  nuvem e como eles servem de base para qualquer aplicação em produção na AWS.
date: 2025-08-28
category: devops
background: "#05A6F0"
tags:
  - DEVOPS
  - ARQUITETURA
  - AWS
  - CLOUDCOMPUTING
  - APLICACOES
  - ESCALABILIDADE
  - SEGURANCA
  - AUTOMACAO
  - INFRAESTRUTURA
  - PRODUCAO
  - SISTEMASDISTRIBUIDOS
  - RESILIENCIA
  - ENGENHARIADECLOUD
  - EC2
  - LAMBDA
  - S3
  - DYNAMODB
  - CLOUDWATCH
  - CLOUDTRAIL
  - VPC
  - CLOUDFRONT
  - IAM
categories:
  - DEVOPS
  - ARQUITETURA
  - AWS
  - CLOUDCOMPUTING
  - APLICACOES
  - ESCALABILIDADE
  - SEGURANCA
  - AUTOMACAO
  - INFRAESTRUTURA
  - PRODUCAO
  - SISTEMASDISTRIBUIDOS
  - RESILIENCIA
  - ENGENHARIADECLOUD
  - EC2
  - LAMBDA
  - S3
  - DYNAMODB
  - CLOUDWATCH
  - CLOUDTRAIL
  - VPC
  - CLOUDFRONT
  - IAM
---
Agora vamos entrar em um estudo de caso prático, trazendo exemplos passo a passo de como projetar e construir uma aplicação pronta para produção, aplicando na prática os princípios do **AWS Well-Architected Framework**.

## Cenário e Blueprint da Arquitetura

O caso que vamos analisar é de uma publicação online fictícia chamada *Cloud Chronicles*. Eles estão lançando um novo site desenvolvido em **WordPress**, que segue o modelo clássico de duas camadas (two-tier).

Os principais requisitos do projeto são:

* **Alta Disponibilidade**: o site precisa continuar online mesmo se uma *Availability Zone (AZ)* ficar fora do ar.
* **Escalabilidade**: a infraestrutura deve aumentar ou reduzir automaticamente para lidar com picos de tráfego, como acontece em grandes eventos de notícias.
* **Segurança**: o banco de dados com artigos e dados de usuários não pode ter acesso direto pela internet pública.

### Diagrama da Arquitetura

Para atender a esses requisitos, vamos construir a seguinte solução:

* Uma **Amazon VPC** cobrindo trs *Availability Zones*.
* Um **Application Load Balancer (ALB)** servindo como ponto de entrada público.
* Um **Auto Scaling Group (ASG)** de instâncias **EC2** em subnets públicas rodando os servidores web com WordPress.
* Um **Amazon RDS for MySQL** configurado em **Multi-AZ** em subnets privadas para hospedar o banco de dados.

Essa estrutura já traz os pilares básicos de disponibilidade, resiliência e segurança que esperamos em uma aplicação de produção.

## Construindo a fundação de rede

Toda boa arquitetura em nuvem começa com uma rede bem planejada. É aqui que garantimos isolamento, organização e flexibilidade para crescer no futuro.

O primeiro passo é criar uma **Virtual Private Cloud (VPC)** customizada. Diferente da *default VPC*, a custom nos dá controle total sobre o ambiente de rede.

### Estratégia de VPC e Subnets

Depois de criada a VPC, dividimos seu espaço de endereços em **subnets**. Cada subnet é um bloco de endereços IP que pode ser usado para agrupar recursos de forma isolada.

Para garantir **alta disponibilidade**, distribuímos as subnets em pelo menos três *Availability Zones*. Dessa forma, mesmo que uma AZ apresente falhas, os serviços continuam funcionando a partir das outras.

### Estruturando a VPC e Subnets

O primeiro passo da implementação é montar a rede. É aqui que garantimos que cada recurso vai estar no lugar certo, com as rotas bem definidas e sem pontos únicos de falha.

#### Criando a VPC

No **VPC Dashboard** do AWS Management Console:

* Clique em **Create VPC**
* Selecione a opção **VPC and more** para usar o assistente
* Configure o **CIDR block** como `10.0.0.0/16` – isso nos dá 65.536 endereços privados, espaço suficiente para crescer a aplicação com segurança
* Defina 3 Availability Zones para garantir resiliência
* Marque a opção 1 NAT Gateway por AZ – o assistente criará automaticamente os NATs, cada um em sua zona, com seus respectivos Elastic IPs
* O Internet Gateway (IGW) e as Route Tables (pública e privadas) também são criados automaticamente, já com as associações corretas para cada subnet

#### Definindo Subnets

Vamos criar **seis subnets**, três públicas e três privadas, distribuídas em **três Availability Zones (AZs)**, garantindo redundância e resiliência mesmo que uma AZ inteira fique indisponível.

| Subnet Name      | Tier | Availability Zone | IPv4 CIDR Block | Route Table Association |
| ---------------- | ---- | ----------------- | --------------- | ----------------------- |
| public-subnet-a  | Web  | us-east-1a        | 10.0.1.0/24     | public-rt               |
| public-subnet-b  | Web  | us-east-1b        | 10.0.2.0/24     | public-rt               |
| public-subnet-c  | Web  | us-east-1c        | 10.0.3.0/24     | public-rt               |
| private-subnet-a | Data | us-east-1a        | 10.0.11.0/24    | private-rt-a            |
| private-subnet-b | Data | us-east-1b        | 10.0.12.0/24    | private-rt-b            |
| private-subnet-c | Data | us-east-1c        | 10.0.13.0/24    | private-rt-c            |

Ou seja, ao invés de criar manualmente IGW, NAT Gateways e tabelas de rotas, podemos deixar o próprio **VPC Wizard** gerar esses componentes de forma automática e consistente, reduzindo riscos de erro e agilizando a criação da infraestrutura.

![vpc-wizard](/assets/img/arquitetura-vpc-1.png "vpc-wizard")

## Implementando o Web Tier

A camada de aplicação que ficará exposta para os usuários será formada por um conjunto de **instâncias EC2** rodando o WordPress. Essas instâncias estarão sob controle de um **Auto Scaling Group (ASG)**, que garante elasticidade e resiliência, e serão acessadas através de um **Application Load Balancer (ALB)**.

### Launch Template

O **Launch Template** funciona como um blueprint das instâncias EC2, garantindo que todas sejam criadas de forma idêntica. Isso facilita atualizações e padroniza o ambiente.

**Passos para criação:**

* No **EC2 Dashboard**, crie um novo **Launch Template**

  ![arquitetura-lounch-template-1](/assets/img/arquitetura-lounch-template-1.png "arquitetura-lounch-template-1")
* Defina a **Amazon Machine Image (AMI)** como *Amazon Linux 2023*
* Selecione o **Instance Type** `t3a.micro`
* Crie e associe um par de chaves para acesso via SSH (embora seja recomendável depois usar o **SSM Session Manager**)

![arquitetura-lounch-template-2](/assets/img/arquitetura-lounch-template-2.png "arquitetura-lounch-template-2")

* Em **Advanced details**, insira o seguinte script em **User Data**:

  ```
  #!/bin/bash
  set -e

  yum update -y
  dnf install -y wget php-mysqlnd httpd php-fpm php-mysqli mariadb105-server php-json php php-devel unzip jq awscli
  systemctl start httpd
  systemctl enable httpd

  # Baixa e instala WordPress
  wget https://wordpress.org/latest.tar.gz -O /tmp/wordpress.tar.gz
  tar -xzf /tmp/wordpress.tar.gz -C /tmp/
  cp -r /tmp/wordpress/* /var/www/html/
  chown -R apache:apache /var/www/html/

  # Nome do secret no Secrets Manager
  SECRET_NAME="wordpress-db-credentials"
  REGION="us-east-1"

  # Recupera secret do AWS Secrets Manager
  SECRET_JSON=$(aws secretsmanager get-secret-value --secret-id "$SECRET_NAME" --region "$REGION" --query SecretString --output text)

  # Extrai valores do JSON
  DB_NAME=$(echo $SECRET_JSON | jq -r '.db_name')
  DB_USER=$(echo $SECRET_JSON | jq -r '.username')
  DB_PASSWORD=$(echo $SECRET_JSON | jq -r '.password')
  DB_HOST=$(echo $SECRET_JSON | jq -r '.host')

  # Copia e configura o wp-config.php
  cd /var/www/html
  cp wp-config-sample.php wp-config.php

  # Substitui placeholders com valores do secret
  sed -i "s/database_name_here/$DB_NAME/" wp-config.php
  sed -i "s/username_here/$DB_USER/" wp-config.php
  sed -i "s/password_here/$DB_PASSWORD/" wp-config.php
  sed -i "s/localhost/$DB_HOST/" wp-config.php

  # Permissões
  chown apache:apache wp-config.php
  chmod 640 wp-config.php

  echo "WordPress instalado e configurado com sucesso."
  ```

  ![arquitetura-lounch-template-3](/assets/img/arquitetura-lounch-template-3.png "arquitetura-lounch-template-3")

Esse script atualiza a instância, instala Apache + PHP, baixa o WordPress e coloca os arquivos no diretório padrão do servidor web.

### Auto Scaling Group (ASG)

O **ASG** garante que sempre teremos a quantidade necessária de instâncias rodando, substitui automaticamente instâncias problemáticas e faz o scale in/out de acordo com a demanda.

**Passos de configuração:**

* Crie um **Auto Scaling Group** usando o Launch Template criado acima
* Distribua as instâncias pelas três subnets públicas: `public-subnet-a`, `public-subnet-b` e `public-subnet-c`

![arquitetura-asg-1](/assets/img/arquitetura-asg-1.png "arquitetura-asg-1")

* Durante a configuração, habilite a opção para criar um **Application Load Balancer (ALB)** junto com o **Target Group**. O ASG irá registrar as instâncias nesse ALB automaticamente, garantindo balanceamento de carga e health checks sem necessidade de configuração manual

![arquitetura-asg-2](/assets/img/arquitetura-asg-2.png "arquitetura-asg-2")

![arquitetura-asg-3](/assets/img/arquitetura-asg-3.png "arquitetura-asg-3")

![arquitetura-asg-4](/assets/img/arquitetura-asg-4.png "arquitetura-asg-4")

* Defina a capacidade do grupo, **Desired capacity:** 3, **Minimum capacity:** 3, **Maximum capacity:** 6. Dessa forma, sempre teremos pelo menos três instâncias (uma por AZ) garantindo redundância, mas conseguimos escalar até seis em momentos de alto tráfego 
* Configure uma **Target Tracking Scaling Policy**, usando como métrica a **Average CPU Utilization** com alvo de 50%. Assim, novas instâncias serão criadas automaticamente quando a média de CPU da frota passar de 50%, e removidas quando cair abaixo disso.

![](/assets/img/arquitetura-asg-6.png)

### Implementando o Data Tier

O **data tier** será responsável por armazenar os dados da aplicação usando o **Amazon RDS** com **MySQL**. O RDS é um serviço totalmente gerenciado que facilita a configuração, operação e escalabilidade de bancos relacionais na nuvem, além de oferecer opções nativas de alta disponibilidade.

#### DB Subnet Group

Antes de criar a instância do banco, precisamos configurar um **DB Subnet Group**. Esse grupo define em quais subnets privadas o RDS poderá rodar, garantindo isolamento e redundância.

**Passos de configuração:**

* No console do RDS, crie um novo **DB Subnet Group**
* Adicione as três subnets privadas: `private-subnet-a`, `private-subnet-b` e `private-subnet-c`
* Dessa forma, o RDS consegue distribuir a instância principal e a réplica em diferentes **Availability Zones**, evitando pontos únicos de falha

![arquitetura-rds-1](/assets/img/arquitetura-rds-1.png "arquitetura-rds-1")

#### Instância Multi-AZ

Para atender o requisito de alta disponibilidade, vamos utilizar o **Multi-AZ deployment**. Nesse modo, o RDS mantém uma réplica síncrona em outra AZ. Em caso de falha de hardware, rede ou zona, o serviço faz o failover automático para a réplica sem necessidade de intervenção manual.

**Passos de configuração:**

* No dashboard do RDS, clique em **Create database**
* Selecione **Standard Create** e escolha **MySQL** como engine
* Defina o template (se possível, use **Free tier** para testes)
* Configure o nome da instância, usuário mestre e senha (armazenando as credenciais de forma segura)
* Em **Availability & durability**, habilite **Multi-AZ deployment** para garantir failover automático
* Em **Connectivity**, escolha a VPC customizada e o **DB Subnet Group** criado anteriormente e para criar um novo security group.

  ![arquitetura-rds-2](/assets/img/arquitetura-rds-2.png "arquitetura-rds-2")
* Defina **Public access = No**. O banco deve ficar restrito à rede privada, sem exposição direta à internet

### Segurança da Arquitetura Two-Tier

Segurança na AWS segue o modelo de **responsabilidade compartilhada**. Dentro do que é responsabilidade do cliente, um dos pontos principais é configurar corretamente os **Security Groups**, que funcionam como firewalls virtuais stateful para controlar tráfego de entrada e saída das instâncias.

#### Security Groups como Firewalls Virtuais

Vamos criar três Security Groups distintos, um para cada camada da arquitetura, seguindo o princípio de **least privilege**.

#### Security Group Chaining

Em vez de liberar portas para faixas amplas de IP, a boa prática é usar **referência entre Security Groups**. Isso garante que, mesmo que novas instâncias sejam criadas (como no caso do ASG), as regras de tráfego continuam válidas automaticamente, sem necessidade de ajuste manual.

| Security Group | Associado a               | Porta | Protocolo | Origem    | Descrição                                       |
| -------------- | ------------------------- | ----- | --------- | --------- | ----------------------------------------------- |
| **alb-sg**     | Application Load Balancer | 80    | TCP       | 0.0.0.0/0 | Permite tráfego HTTP da internet                |
| **alb-sg**     | Application Load Balancer | 443   | TCP       | 0.0.0.0/0 | Permite tráfego HTTPS da internet               |
| **web-sg**     | EC2 (Web Tier)            | 80    | TCP       | alb-sg    | Permite tráfego HTTP apenas do ALB              |
| **db-sg**      | RDS (Database Tier)       | 3306  | TCP       | web-sg    | Permite tráfego MySQL apenas dos servidores web |

Com essa configuração, o fluxo de tráfego fica totalmente controlado:

* A internet acessa apenas o **ALB**
* O **ALB** se comunica apenas com as instâncias web
* Somente as instâncias web conseguem acessar o **banco de dados**

Agora precisamos ajustar o nosso **Launch Template** para que ele utilize o novo *Security Group*.\
Em seguida, devemos editar a nossa **Application Load Balancer (ALB)** para também anexar esse *Security Group* recém-criado, garantindo que tanto as instâncias quanto o balanceador sigam as mesmas regras de segurança.

### Gestão de secrets com Secret Manager

Um ponto essencial em qualquer aplicação em produção é a **gestão segura de credenciais**. No caso do WordPress, por padrão o arquivo `wp-config.php` precisa conter informações sensíveis como nome do banco de dados, usuário, senha e host. Se configurarmos isso manualmente, corremos o risco de expor segredos em repositórios, scripts ou até mesmo em logs.

Para resolver esse problema, utilizamos o **AWS Secrets Manager** como repositório central de credenciais. Essa solução permite armazenar dados de forma criptografada, com rotação automática de segredos e acesso controlado via IAM. No nosso cenário, criamos um secret com a seguinte estrutura em JSON, a sua deve ser baseada no seu output até aqui.

```
{
  "db_name": "wordpressdb",
  "username": "wp_user",
  "password": "SuperSecretPass123!",
  "host": "mydb.cluster-abcdefghijkl.us-east-1.rds.amazonaws.com"
}
```

Antes de permitir que a instância acesse esse segredo, precisamos configurar as permissões corretas no IAM. O fluxo é o seguinte:

* **Criar uma IAM Policy** que concede permissão apenas de leitura ao secret do WordPress:

```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:us-east-1:123456789012:secret:wordpress-db-credentials-*"
    }
  ]
}
```

* Criar uma IAM Role para EC2 e anexar a policy acima. Essa role deve ter como Trusted Entity o serviço ec2.amazonaws.com.
* Adicionar o Instance Profile no Launch Template utilizado para criar a instância EC2. Isso garante que, assim que a instância subir, ela já terá permissão para recuperar os segredos.

Com isso, a instância EC2 que hospeda o WordPress acessa o Secrets Manager em tempo de provisionamento, recupera os valores necessários e preenche automaticamente o arquivo `wp-config.php`.

Com isso, finalizamos a configuração da nossa infraestrutura. Agora temos uma estrutura completa para realizar o **deploy e acesso do WordPress**, utilizando o domínio exposto pela **Application Load Balancer (ALB)**. Através da própria ALB, conseguimos acompanhar a **saúde dos targets** no *Resource Map*, garantindo que nossas instâncias estejam funcionando corretamente e recebendo tráfego de forma balanceada.

![](/assets/img/arquitetura-alb-1.png)

Vale destacar que, além da abordagem que utilizamos, é possível adotar uma solução mais robusta utilizando o **Amazon EFS** para centralizar os arquivos de configuração do WordPress. Dessa forma, conseguimos manter o estado compartilhado entre múltiplas instâncias, permitindo inclusive criar uma **AMI personalizada a partir de um template** e utilizá-la diretamente no **Launch Template**, em vez de depender apenas do *user data* para configurar cada instância no momento do provisionamento.

![](/assets/img/arquitetura-wordpress.png)

### Fechamento

Encerramos aqui esta etapa, mas na próxima semana vamos dar continuidade explorando um modelo de arquitetura **Three-Tier**, entendendo como separar as camadas de aplicação, banco de dados e frontend para obter mais escalabilidade, segurança e organização.