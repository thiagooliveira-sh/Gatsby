---
image: /assets/img/AWS.png
title: Como me preparei para a AWS DevOps Engineer Professional
description: A certificação AWS Certified DevOps Engineer – Professional é uma
  das mais desafiadoras da AWS, exigindo conhecimento prático e domínio de
  diversos serviços e integrações. Neste artigo, compartilho como foi minha
  preparação, quais tópicos encontrei na prova e os materiais que utilizei para
  estudar.
date: 2025-08-11
category: aws
background: "#FF9900"
tags:
  - COMO_ME_PREPAREI_PARA_A_AWS_DEVOPS_ENGINEER_PROFESSIONAL
  - AWS_DEVOPS_ENGINEER_PROFESSIONAL
  - CERTIFICACAO_AWS_DEVOPS
  - AWS_DEVOPS_ENGINEER_PREPARACAO
  - ESTUDO_PARA_AWS_DEVOPS_ENGINEER
  - GUIA_AWS_DEVOPS_ENGINEER
  - AWS_CERTIFICACAO_PROFESSIONAL
  - AWS_DEVOPS_ENGINEER_TUTORIAL
  - AWS_DEVOPS_ENGINEER_EXAME
  - DICAS_AWS_DEVOPS_ENGINEER
categories:
  - COMO_ME_PREPAREI_PARA_A_AWS_DEVOPS_ENGINEER_PROFESSIONAL
  - AWS_DEVOPS_ENGINEER_PROFESSIONAL
  - CERTIFICACAO_AWS_DEVOPS
  - AWS_DEVOPS_ENGINEER_PREPARACAO
  - ESTUDO_PARA_AWS_DEVOPS_ENGINEER
  - GUIA_AWS_DEVOPS_ENGINEER
  - AWS_CERTIFICACAO_PROFESSIONAL
  - AWS_DEVOPS_ENGINEER_TUTORIAL
  - AWS_DEVOPS_ENGINEER_EXAME
  - DICAS_AWS_DEVOPS_ENGINEER
---
No ultimo dia 08 de Agosto realizei o exame AWS DevOps Engineer Professional e fui parovado! Mas antes de falar sobre como foi minha preparação, é importante entender o que se espera do candidato para essa certificação.

![](/assets/img/devops-engineer-professional.png)

\
A prova avalia a capacidade de implementar e gerenciar sistemas de entrega contínua, automatizar segurança e compliance, monitorar ambientes, projetar soluções resilientes e manter ferramentas de automação.

Esses são os domínios e pesos da prova:

* **Domain 1: SDLC Automation** – 22%
* **Domain 2: Configuration Management and IaC** – 17%
* **Domain 3: Resilient Cloud Solutions** – 15%
* **Domain 4: Monitoring and Logging** – 15%
* **Domain 5: Incident and Event Response** – 14%
* **Domain 6: Security and Compliance** – 17%

A prova é exigente e cobra domínio prático de cada serviço, incluindo detalhes operacionais e de integração entre eles.

### Principais serviços cobrados

Basicamente os serviços que caíram na minha prova foram CodePipeline, CodeBuild, CodeDeploy, CodeArtitifact, Amazon S3, Amazon ECR, AWS Lambda, EC2 Image Builder, Amazon ECS, Fargate, AWS CloudFormation, AWS Systems Manager, AWS Config, AWS Organization, API Gateway, CloudWatch, EventBridge, EFS, ECS, VPC, AWS Secrets Manager, Elastic Beanstalk, Elastic Load Balancers, ASG, Service Catalog, Security Hub, Control Tower, SCPs, IAM and Identity Center (SSO), RDS, Route53, DynamoDB, CloudFront, Kinesis, SNS, SQS, etc.

Entender esses serviços, seus casos de uso específicos, as melhores práticas e como eles se integram para produzir soluções econômicas, escaláveis, resilientes, tolerantes a falhas e seguras é a chave.

Considerando que a AWS domina a participação no mercado de nuvem, e minha experiência prévia com a AWS, escolhi a certificação de DevOps Engineer. Eu queria algo desafiador que tivesse efeito imediato nas minhas operações do dia a dia. Na verdade, estou trabalhando mais com projetos que exigem uma implementação  mais holística envolvendo serviços AWS de forma nativa.Essa foi uma oportunidade para eu embarcar nessa jornada e conquistar minha 7 certificação da AWS.



### Domain 1 – SDLC Automation

Nesse domínio, encontrei diversas questões sobre a **criação e manutenção de pipelines na AWS**, especialmente usando:

* **CodePipeline** com integrações via **CodeConnection**.
* Estruturação de estágios no **CodeBuild**.
* Uso de **CodeDeploy** em cenários com e sem load balancer, com atenção aos hooks:

  * `BeforeInstall`
  * `AfterInstall`
  * `BeforeAllowTraffic`
* Deploys de **Lambda** com estratégias canary, por exemplo `LambdaCanary10Percent5Minutes`.
* Cenários pedindo para comparar abordagens entre **CodeDeploy** e **Step Functions** para orquestração.

O nível de detalhe exigido vai desde a configuração da integração de origem até o comportamento da aplicação durante cada hook do deploy.



### Domain 2 – Configuration Management and IaC

Aqui, a ênfase foi em **gerenciar e provisionar recursos de forma automatizada**, incluindo:

* Configuração de acesso ao **EKS** usando `aws-auth` e **Access Entry**.
* Conceitos mais recentes, como **RCPs (Resource Control Policies)**.
* Estratégias para manter consistência de ambientes com **CloudFormation** e **Terraform**, considerando múltiplas contas.
* Automação de configuração inicial via **SSM Documents**.

Esse domínio exige entender como padronizar e aplicar configurações de maneira repetível e auditável.



### Domain 3 – Resilient Cloud Solutions

Nesse ponto, o foco foi garantir **alta disponibilidade e recuperação automática**:

* Estratégias de **multi-account** e uso de **Landing Zone**.
* Configuração e uso do **Account Factory** no Control Tower.
* Análise de **SCPs** para permitir ou restringir ações entre contas.
* Cenários de **trust relationship** para permitir **assume role** entre contas diferentes.

A prova explora bastante arquitetura resiliente, mas também com atenção à governança e à escalabilidade.

### Domain 4 – Monitoring and Logging

Foi um dos domínios mais práticos na minha prova, com questões como:

* Diagnóstico de atraso no processamento de mensagens por uma aplicação que lê do **SQS** e grava no **DynamoDB** usando Lambda.

  * Identificar se a limitação era **throughput do SQS**, **WCU do DynamoDB** ou concorrência da Lambda.
* Extração de métricas de containers.
* Criação de dashboards a partir de logs no S3 usando **Athena**.
* Configuração de alarmes no **CloudWatch** para detecção rápida de problemas.

Esse domínio não se limita a “como coletar métricas”, mas também cobra **como reagir a elas**.

### Domain 5 – Incident and Event Response

Aqui, o foco foi em **responder rapidamente a falhas ou alertas**:

* Configuração de **event-driven remediation** usando **AWS Config** + **SSM Documents**.
* Adoção de **AWS Systems Manager Patch Manager** para aplicar correções em ambientes híbridos.
* Gestão de inventário e criação de **Resource Groups** para facilitar ações centralizadas.
* Definição de **janelas de manutenção** para minimizar impacto.

As questões normalmente descrevem um cenário de incidente e pedem a **sequência de ações** mais adequada.

### Domain 6 – Security and Compliance

Foi um dos domínios mais carregados na minha prova:

* Configuração de **Security Hub** e **GuardDuty** em um ambiente multi-account, usando contas de administração delegada.
* Estratégia de **descentralização de segurança** em organizações grandes.
* Aplicação de **SCPs** para restrição global de ações.
* Integração de monitoramento de compliance com **AWS Config**.
* Uso de **SSM Automation** para corrigir recursos não conformes.

Esse domínio exige conhecer **práticas recomendadas**, mas também entender como implementá-las em escala.



### Como estudei

Aproveitando que utilizo boa parte dos serviços cobrados na prova no meu dia a dia, levei pouco menos de 2 meses para me preparar para este exame. Minha preparação foi baseada em três pilares:

1. **Curso completo e prático**\
   Usei o curso do Stephane Maarek na Udemy, com muito conteúdo prático voltado para o exame.
2. **Simulados**\
   Fiz simulados do Tutorials Dojo, com questões bem próximas do contexto real da prova.
3. **Laboratórios e documentação oficial**\
   Foquei em workshops da AWS, especialmente sobre segurança, Identity Center e Control Tower, além de whitepapers e guias técnicos.

**Dicas:** Reserve tempo suficiente para aprender os conceitos e praticá-los. Certifique-se de acompanhar, entender por que as coisas funcionam e por que não funcionam. 

Links úteis que utilizei:

* [Workshops de Segurança](https://workshops.aws/categories/Security?tag=IAM%20Identity%20Center)
* [Control Tower Workshop](https://catalog.workshops.aws/control-tower/)
* [Control Design](https://catalog.workshops.aws/control-design)
* [Lab de automação e governança](https://catalog.us-east-1.prod.workshops.aws/workshops/0f031bd6-2a06-4788-b5da-bc887a7a97b9/en-US)
* [CloudWatch Publishing Metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/publishingMetrics.html)
* [CloudWatch put-metric-data CLI](https://docs.aws.amazon.com/cli/latest/reference/cloudwatch/put-metric-data.html)
* [Amazon Kinesis Data Firehose](https://aws.amazon.com/kinesis/firehose/)
* [Amazon Redshift](http://docs.aws.amazon.com/redshift/latest/mgmt/welcome.html)
* [Guia do DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/dynamodb-dg.pdf)

Essa prova não se vence apenas com teoria. Ela exige **vivência prática**, capacidade de analisar cenários e entender as implicações de cada decisão.\
Meu conselho: pratique até que a escolha do serviço e do fluxo de implementação se torne natural.