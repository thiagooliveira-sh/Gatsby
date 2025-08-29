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
  yum update -y
  dnf install wget php-mysqlnd httpd php-fpm php-mysqli mariadb105-server php-json php php-devel -y
  systemctl start httpd
  systemctl enable httpd
  wget https://wordpress.org/latest.tar.gz
  tar -xzf latest.tar.gz
  cp -r wordpress/* /var/www/html/
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